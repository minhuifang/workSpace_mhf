# Promise 完整版实现 - 学习指南

## 📁 文件说明

| 文件 | 说明 | 用途 |
|------|------|------|
| `promise-practice-complete.js` | 练习版（只有提示） | 自己动手实践 |
| `promise-complete-answer.js` | 答案版（完整实现） | 参考学习 |
| `promise-complete.js` | 精简版（无注释） | 生产使用 |

## 🎯 核心实现要点

### 1. 回调队列（支持异步）

**问题：** 简化版不支持异步操作


// 简化版的问题
new MyPromise((resolve) => {
  setTimeout(() => resolve('done'), 100);
}).then(console.log);  // ✗ 不会执行


**解决方案：** 添加回调队列


class MyPromise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    
    // 🔑 添加回调队列
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    const resolve = (value) => {
      if (this.state !== PENDING) return;
      this.state = FULFILLED;
      this.value = value;
      
      // 🔑 执行队列中的所有回调
      this.onFulfilledCallbacks.forEach(fn => fn());
    };
    
    // ...
  }
  
  then(onFulfilled, onRejected) {
    // ...
    
    // 🔑 如果状态是 PENDING，将回调加入队列
    if (this.state === PENDING) {
      this.onFulfilledCallbacks.push(() => {
        // 回调逻辑
      });
    }
  }
}


**原理图解：**


1. then 执行时，状态是 PENDING
   → 将回调加入队列

2. setTimeout 执行，调用 resolve
   → 改变状态为 FULFILLED
   → 执行队列中的所有回调

3. 回调执行
   → console.log('done')


### 2. 状态保护（防止重复转换）

**问题：** 简化版可以重复调用 resolve/reject


new MyPromise((resolve, reject) => {
  resolve('first');
  reject('second');  // ✗ 会覆盖 first
});


**解决方案：** 添加状态检查


const resolve = (value) => {
  // 🔑 状态保护：只有 PENDING 才能转换
  if (this.state !== PENDING) return;
  
  this.state = FULFILLED;
  this.value = value;
  this.onFulfilledCallbacks.forEach(fn => fn());
};

const reject = (reason) => {
  // 🔑 状态保护
  if (this.state !== PENDING) return;
  
  this.state = REJECTED;
  this.value = reason;
  this.onRejectedCallbacks.forEach(fn => fn());
};


### 3. then 返回新 Promise（链式调用）

**问题：** 简化版不支持链式调用


// 简化版的问题
promise.then(...).then(...)  // ✗ 报错：Cannot read property 'then' of undefined


**解决方案：** then 返回新的 Promise


then(onFulfilled, onRejected) {
  // 🔑 返回新的 Promise
  const promise2 = new MyPromise((resolve, reject) => {
    
    if (this.state === FULFILLED) {
      queueMicrotask(() => {
        try {
          // 执行回调，获取返回值
          const x = onFulfilled(this.value);
          
          // 🔑 处理返回值（可能是 Promise、thenable 或普通值）
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    }
    
    // ... 处理其他状态
  });
  
  return promise2;
}


**链式调用原理：**


MyPromise.resolve(1)
  .then(res => res + 1)  // 返回 promise2，值为 2
  .then(res => res + 1)  // 返回 promise3，值为 3
  .then(console.log);    // 输出 3

// 执行流程：
// 1. resolve(1) → promise1 的值为 1
// 2. then 返回 promise2，执行 res => res + 1，返回 2
// 3. resolvePromise 处理返回值 2，resolve(2)
// 4. promise2 的值为 2
// 5. 重复步骤 2-4


### 4. 值穿透（处理非函数参数）

**问题：** 如果 then 参数不是函数，会报错


Promise.resolve(1)
  .then()  // ✗ 参数不是函数
  .then(console.log);


**解决方案：** 提供默认函数


then(onFulfilled, onRejected) {
  // 🔑 值穿透：如果不是函数，提供默认函数
  onFulfilled = typeof onFulfilled === 'function'
    ? onFulfilled
    : value => value;  // 默认：直接返回值
  
  onRejected = typeof onRejected === 'function'
    ? onRejected
    : reason => { throw reason };  // 默认：抛出错误
  
  // ...
}


**值穿透原理：**


Promise.resolve(1)
  .then()  // 等价于 .then(value => value)
  .then()  // 等价于 .then(value => value)
  .then(console.log);  // 输出 1

// 值 1 通过默认函数一路传递下来


### 5. 微任务（异步执行）

**问题：** 回调应该异步执行，符合规范


console.log(1);
Promise.resolve().then(() => console.log(2));
console.log(3);

// 期望输出：1, 3, 2（异步）
// 简化版输出：1, 2, 3（同步）


**解决方案：** 使用 queueMicrotask


then(onFulfilled, onRejected) {
  const promise2 = new MyPromise((resolve, reject) => {
    
    if (this.state === FULFILLED) {
      // 🔑 使用微任务包裹
      queueMicrotask(() => {
        try {
          const x = onFulfilled(this.value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    }
    
    // ...
  });
  
  return promise2;
}


**微任务原理：**


执行栈：
1. console.log(1) → 输出 1
2. Promise.resolve().then(...) → 将回调加入微任务队列
3. console.log(3) → 输出 3
4. 执行栈清空

微任务队列：
5. 执行 () => console.log(2) → 输出 2


### 6. resolvePromise（处理返回值）

**最难的部分！** 需要处理各种返回值类型。


function resolvePromise(promise2, x, resolve, reject) {
  // 🔑 1. 处理循环引用
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected'));
  }

  // 🔑 2. 处理 Promise 实例
  if (x instanceof MyPromise) {
    x.then(resolve, reject);
    return;
  }

  // 🔑 3. 处理 thenable 对象
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false;
    
    try {
      const then = x.then;
      
      if (typeof then === 'function') {
        then.call(x,
          y => {
            if (called) return;
            called = true;
            // 🔑 递归处理
            resolvePromise(promise2, y, resolve, reject);
          },
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // 🔑 4. 处理普通值
    resolve(x);
  }
}


**处理的情况：**


// 情况1：返回普通值
.then(() => 1)  // x = 1 → resolve(1)

// 情况2：返回 Promise
.then(() => Promise.resolve(2))  // x 是 Promise → x.then(resolve, reject)

// 情况3：返回 thenable
.then(() => ({
  then: (resolve) => resolve(3)
}))  // x 有 then 方法 → 调用 x.then

// 情况4：循环引用
const p = promise.then(() => p)  // x === promise2 → reject TypeError

// 情况5：递归处理
.then(() => Promise.resolve(Promise.resolve(4)))
// 第一次：x 是 Promise → x.then(resolve, reject)
// 第二次：y 也是 Promise → 递归调用 resolvePromise
// 最终：resolve(4)


## 📊 完整实现流程图


new MyPromise(executor)
    ↓
初始化状态：PENDING
初始化回调队列：[]
    ↓
执行 executor(resolve, reject)
    ↓
    ├─ 同步调用 resolve/reject
    │      ↓
    │  改变状态 + 执行回调队列
    │
    └─ 异步调用 resolve/reject
           ↓
       then 执行时状态是 PENDING
           ↓
       将回调加入队列
           ↓
       resolve/reject 执行
           ↓
       改变状态 + 执行回调队列


## 🔍 调试技巧

### 1. 打印状态变化


const resolve = (value) => {
  console.log(`[DEBUG] resolve 调用，当前状态: ${this.state.description}`);
  
  if (this.state !== PENDING) {
    console.log(`[DEBUG] 状态已改变，忽略`);
    return;
  }
  
  console.log(`[DEBUG] 改变状态为 FULFILLED，值: ${value}`);
  this.state = FULFILLED;
  this.value = value;
  
  console.log(`[DEBUG] 执行 ${this.onFulfilledCallbacks.length} 个回调`);
  this.onFulfilledCallbacks.forEach(fn => fn());
};


### 2. 测试用例


// 测试异步
new MyPromise((resolve) => {
  console.log('1. executor 执行');
  setTimeout(() => {
    console.log('3. resolve 执行');
    resolve('done');
  }, 100);
}).then(res => {
  console.log('4. then 回调执行:', res);
});
console.log('2. then 执行');

// 期望输出：
// 1. executor 执行
// 2. then 执行
// 3. resolve 执行
// 4. then 回调执行: done


### 3. 对比原生 Promise


// 测试你的实现
new MyPromise(resolve => setTimeout(() => resolve(1), 100))
  .then(console.log);

// 对比原生
new Promise(resolve => setTimeout(() => resolve(1), 100))
  .then(console.log);

// 输出应该一致


## 📚 学习建议

### 第一步：理解核心概念（30分钟）

1. 阅读 `promise-complete-answer.js`
2. 理解 6 个核心要点
3. 运行测试，观察输出

### 第二步：逐个实现功能（3-5小时）

1. **基础功能**（30分钟）
   - 状态定义
   - 构造函数
   - 基础 resolve/reject

2. **回调队列**（1小时）
   - 添加队列
   - 在 resolve/reject 中执行队列
   - 在 then 中将回调加入队列

3. **链式调用**（1-2小时）
   - then 返回新 Promise
   - 实现 resolvePromise（最难）

4. **完善细节**（1小时）
   - 状态保护
   - 值穿透
   - 微任务

5. **其他方法**（30分钟）
   - catch、finally
   - 静态方法

### 第三步：测试验证（30分钟）


# 运行测试
node src/promise-complete-answer.js

# 所有测试应该通过


## 💡 常见问题

### Q1: 为什么需要 called 标志？

**A:** 防止 thenable 对象多次调用 resolve/reject


const thenable = {
  then: (resolve, reject) => {
    resolve(1);
    resolve(2);  // 应该被忽略
  }
};

// 使用 called 标志
let called = false;
then.call(x,
  y => {
    if (called) return;  // 第二次调用被忽略
    called = true;
    resolve(y);
  }
);


### Q2: 为什么要递归调用 resolvePromise？

**A:** 处理嵌套的 Promise


.then(() => Promise.resolve(Promise.resolve(1)))

// 执行流程：
// 1. x = Promise.resolve(Promise.resolve(1))
// 2. x.then(y => resolvePromise(promise2, y, resolve, reject))
// 3. y = Promise.resolve(1)
// 4. resolvePromise 递归调用
// 5. y.then(z => resolvePromise(promise2, z, resolve, reject))
// 6. z = 1
// 7. resolve(1)


### Q3: 为什么要用 queueMicrotask？

**A:** 符合 Promise/A+ 规范，回调应该异步执行


// 原生 Promise 的行为
console.log(1);
Promise.resolve().then(() => console.log(2));
console.log(3);
// 输出：1, 3, 2

// 如果不用微任务
console.log(1);
new MyPromise(resolve => resolve()).then(() => console.log(2));
console.log(3);
// 输出：1, 2, 3（错误）


## 🎓 进阶挑战

完成基础实现后，可以尝试：

1. **通过 Promises/A+ 测试**
   
   npm install promises-aplus-tests
   

2. **性能优化**
   - 减少闭包
   - 优化回调队列

3. **TypeScript 版本**
   
   class MyPromise<T> {
     then<U>(
       onFulfilled?: (value: T) => U | Promise<U>,
       onRejected?: (reason: any) => U | Promise<U>
     ): MyPromise<U>
   }
   

---

**祝你学习顺利！完整实现已在 `promise-complete-answer.js` 中。** 🚀
