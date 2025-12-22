# resolvePromise 函数详解

## 🎯 核心问题：为什么需要 resolvePromise？

当我们在 `then` 的回调中返回不同类型的值时，需要不同的处理方式。

### 场景示例


// 场景1：返回普通值
Promise.resolve(1)
  .then(res => res + 1)  // 返回 2
  .then(res => console.log(res))  // 输出 2 ✓

// 场景2：返回 Promise
Promise.resolve(1)
  .then(res => Promise.resolve(res + 1))  // 返回 Promise 对象
  .then(res => console.log(res))  // 应该输出 2，而不是 Promise 对象！

// 场景3：返回自己（循环引用）
const p = promise.then(() => p)  // 返回 p 自己
// 应该报错：TypeError: Chaining cycle detected

// 场景4：返回 thenable 对象
Promise.resolve(1)
  .then(res => ({
    then: (resolve) => resolve(res + 1)
  }))
  .then(res => console.log(res))  // 应该输出 2


**resolvePromise 的作用：** 统一处理这些不同情况！

---

## 📋 resolvePromise 需要处理的 4 种情况


┌─────────────────────────────────────────────────────┐
│  情况1：循环引用（x === promise2）                 │
│  → reject(TypeError)                                │
├─────────────────────────────────────────────────────┤
│  情况2：Promise 实例（x instanceof MyPromise）     │
│  → 采用 x 的状态：x.then(resolve, reject)          │
├─────────────────────────────────────────────────────┤
│  情况3：thenable 对象（x.then 是函数）             │
│  → 调用 x.then，递归处理结果                       │
├─────────────────────────────────────────────────────┤
│  情况4：普通值（number、string 等）                │
│  → 直接 resolve(x)                                  │
└─────────────────────────────────────────────────────┘


---

## 🔍 情况1：循环引用

### 什么是循环引用？


const p = promise.then(() => p)  // then 的回调返回了 p 自己


### 为什么要检测？

如果允许循环引用，会导致无限递归！


// 如果不检测，会发生什么？
p.then(() => p)
  .then(() => p)  // 递归调用
  .then(() => p)  // 无限递归
  // ... 栈溢出！


### 如何处理？


function resolvePromise(promise2, x, resolve, reject) {
  // 🔑 检测循环引用
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }
  // ...
}


### 实际例子


const p = new Promise(resolve => resolve(1));
const p2 = p.then(() => p2);  // 返回自己

p2.catch(err => {
  console.log(err.message);  // Chaining cycle detected for promise
});


---

## 🔍 情况2：Promise 实例

### 什么是 Promise 实例？


.then(() => Promise.resolve(2))  // 返回的 x 是 Promise 对象


### 如何处理？


function resolvePromise(promise2, x, resolve, reject) {
  // ...
  
  // 🔑 处理 Promise 实例
  if (x instanceof MyPromise) {
    x.then(resolve, reject);  // 采用 x 的状态
    return;
  }
  
  // ...
}


### 原理图解


Promise.resolve(1)
  .then(res => Promise.resolve(res + 1))
  │
  ├─ 执行回调：res => Promise.resolve(res + 1)
  │  返回值 x = Promise { value: 2 }
  │
  ├─ 调用 resolvePromise(promise2, x, resolve, reject)
  │  检测到 x 是 Promise 实例
  │
  ├─ 执行 x.then(resolve, reject)
  │  等待 x 的状态改变
  │
  └─ x 成功，值为 2
     调用 resolve(2)
     promise2 的值变为 2


### 实际例子


Promise.resolve(1)
  .then(res => {
    console.log('第一个 then:', res);  // 1
    return Promise.resolve(res + 1);   // 返回 Promise
  })
  .then(res => {
    console.log('第二个 then:', res);  // 2（不是 Promise 对象！）
  });


---

## 🔍 情况3：thenable 对象（最复杂！）

### 什么是 thenable？

任何有 `then` 方法的对象或函数。


const thenable = {
  then: function(resolve, reject) {
    resolve(42);
  }
};


### 为什么要处理 thenable？

为了兼容其他 Promise 实现（jQuery、Bluebird 等）。

### 完整代码


function resolvePromise(promise2, x, resolve, reject) {
  // ...
  
  // 🔑 处理 thenable 对象
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false;  // 🔑 防止多次调用
    
    try {
      const then = x.then;  // 获取 then 方法
      
      if (typeof then === 'function') {
        // 是 thenable，调用 then
        then.call(x,
          y => {  // 成功回调
            if (called) return;  // 防止重复调用
            called = true;
            resolvePromise(promise2, y, resolve, reject);  // 🔑 递归
          },
          r => {  // 失败回调
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // 不是 thenable，是普通对象
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  }
  
  // ...
}


### 为什么需要 `called` 标志？

防止恶意的 thenable 多次调用 resolve/reject：


const badThenable = {
  then: (resolve, reject) => {
    resolve(1);
    resolve(2);      // 🔴 恶意：再次调用
    reject('error'); // 🔴 恶意：又调用 reject
  }
};

// 使用 called 标志后：
// 第一次 resolve(1) → 执行
// 第二次 resolve(2) → 被忽略（called = true）
// 第三次 reject → 被忽略


### 为什么要递归？

处理嵌套的 thenable：


.then(() => {
  return {  // thenable1
    then: (resolve) => {
      resolve({  // thenable2
        then: (resolve) => {
          resolve(42);  // 最终值
        }
      });
    }
  };
});

// 执行流程：
// 1. resolvePromise(promise2, thenable1, resolve, reject)
// 2. 调用 thenable1.then，返回 thenable2
// 3. 递归：resolvePromise(promise2, thenable2, resolve, reject)
// 4. 调用 thenable2.then，返回 42
// 5. 递归：resolvePromise(promise2, 42, resolve, reject)
// 6. 42 是普通值，调用 resolve(42)
// 7. promise2 的值为 42


### 实际例子


Promise.resolve()
  .then(() => {
    return {
      then: (resolve) => {
        setTimeout(() => resolve(42), 100);
      }
    };
  })
  .then(res => {
    console.log(res);  // 42
  });


---

## 🔍 情况4：普通值

### 什么是普通值？

`number`、`string`、`boolean`、`null`、`undefined`

### 如何处理？


function resolvePromise(promise2, x, resolve, reject) {
  // ...
  
  // 🔑 处理普通值
  else {
    resolve(x);  // 直接 resolve
  }
}


### 实际例子


Promise.resolve()
  .then(() => 123)       // 返回数字
  .then(res => console.log(res));  // 123

Promise.resolve()
  .then(() => 'hello')   // 返回字符串
  .then(res => console.log(res));  // hello


---

## 📊 完整流程图


                resolvePromise(promise2, x, resolve, reject)
                             │
                             ▼
                     x === promise2 ?
                    ╱                ╲
                 是                   否
                 │                    │
                 ▼                    ▼
       reject(TypeError)    x instanceof MyPromise ?
                                  ╱            ╲
                               是               否
                               │                │
                               ▼                ▼
                     x.then(resolve, reject)   x 是对象或函数 ?
                                                 ╱          ╲
                                              是             否
                                              │              │
                                              ▼              ▼
                                     x.then 是函数 ?     resolve(x)
                                       ╱         ╲
                                    是            否
                                    │             │
                                    ▼             ▼
                         调用 x.then      resolve(x)
                         递归处理结果


---

## 💡 测试用例解析

### 测试1：异步支持


new MyPromise((resolve) => {
  setTimeout(() => {
    resolve('async success');
  }, 100);
}).then((res) => {
  console.log(`✓ ${res}`);
});


**执行流程：**


1. 创建 Promise，执行 executor
2. 设置 setTimeout（异步）
3. 执行 then，此时状态是 PENDING
4. 将回调加入 onFulfilledCallbacks 队列
5. 100ms 后，setTimeout 执行
6. 调用 resolve('async success')
7. 改变状态为 FULFILLED
8. 执行队列中的回调
9. 输出：✓ async success


### 测试2：链式调用


MyPromise.resolve(1)
  .then(res => {
    console.log(`→ 第一个 then: ${res}`);
    return res + 1;
  })
  .then(res => {
    console.log(`→ 第二个 then: ${res}`);
    return res + 1;
  })
  .then(res => {
    console.log(`✓ 第三个 then: ${res}`);
  });


**执行流程：**


1. MyPromise.resolve(1) 创建 promise1，值为 1

2. 第一个 then：
   - 执行回调：res => res + 1
   - 返回值 x = 2
   - 调用 resolvePromise(promise2, 2, resolve, reject)
   - 2 是普通值，调用 resolve(2)
   - promise2 的值为 2
   - 输出：→ 第一个 then: 1

3. 第二个 then：
   - 执行回调：res => res + 1
   - 返回值 x = 3
   - promise3 的值为 3
   - 输出：→ 第二个 then: 2

4. 第三个 then：
   - 执行回调：console.log
   - 输出：✓ 第三个 then: 3


---

## 📝 总结

### resolvePromise 的核心作用

统一处理 `then` 回调的各种返回值类型。

### 4 种情况的处理优先级

1. **循环引用** → `reject(TypeError)`
2. **Promise 实例** → 采用其状态 `x.then(resolve, reject)`
3. **thenable 对象** → 调用 `then`（递归）
4. **普通值** → 直接 `resolve(x)`

### 关键技术点

- ✅ `called` 标志 → 防止多次调用
- ✅ 递归调用 → 处理嵌套 Promise/thenable
- ✅ `try-catch` → 捕获异常
- ✅ 类型检查 → 区分不同情况

### 记忆口诀


循环引用要拒绝，
Promise 实例取状态，
thenable 递归调，
普通值直接过。


---

## 🎓 练习建议

1. **先理解概念** - 阅读本文档，理解 4 种情况
2. **看完整实现** - 查看 `promise-complete-answer.js`
3. **自己实现** - 在 `promise-practice-complete.js` 中填写代码
4. **运行测试** - 验证你的实现是否正确
5. **对比答案** - 理解每个细节

---

**希望这个详细的解释能帮助你理解 resolvePromise！** 🚀
