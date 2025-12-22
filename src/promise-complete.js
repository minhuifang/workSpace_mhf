/**
 * ========================================
 * 手写 Promise 完整版 - 完整实现
 * ========================================
 * 
 * 📚 实现功能：
 * ✅ 支持异步操作（回调队列）
 * ✅ 支持链式调用（then 返回新 Promise）
 * ✅ 状态保护（防止重复转换）
 * ✅ 值穿透（参数非函数处理）
 * ✅ 微任务机制（queueMicrotask）
 * ✅ Promise 解决过程（resolvePromise）
 * ✅ catch、finally 方法
 * ✅ 静态方法（resolve、reject、all、race、allSettled）
 */

// ============================================================
// 第一部分：状态定义
// ============================================================

const PENDING = Symbol('pending');
const FULFILLED = Symbol('fulfilled');
const REJECTED = Symbol('rejected');

// ============================================================
// 第二部分：完整版 Promise 实现
// ============================================================

class MyPromise {
  constructor(executor) {
    // 🔑 初始化状态和值
    this.state = PENDING;
    this.value = undefined;
    
    // 🔑 初始化回调队列（关键：支持异步）
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    /**
     * resolve 函数
     * 🔑 关键点：
     * 1. 状态保护（只能从 PENDING 转换）
     * 2. 改变状态为 FULFILLED
     * 3. 保存值
     * 4. 执行所有成功回调
     */
    const resolve = (value) => {
      // 🔑 状态保护：只有 PENDING 状态才能转换
      if (this.state !== PENDING) return;

      // 改变状态
      this.state = FULFILLED;
      this.value = value;

      // 🔑 执行回调队列中的所有回调
      this.onFulfilledCallbacks.forEach(fn => fn());
    };

    /**
     * reject 函数
     * 🔑 关键点：
     * 1. 状态保护
     * 2. 改变状态为 REJECTED
     * 3. 保存原因
     * 4. 执行所有失败回调
     */
    const reject = (reason) => {
      // 🔑 状态保护
      if (this.state !== PENDING) return;

      // 改变状态
      this.state = REJECTED;
      this.value = reason;

      // 🔑 执行回调队列中的所有回调
      this.onRejectedCallbacks.forEach(fn => fn());
    };

    // 🔑 立即执行 executor，捕获异常
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * then 方法（核心难点）
   * 
   * 🔑 关键实现：
   * 1. 值穿透：处理非函数参数
   * 2. 返回新 Promise：支持链式调用
   * 3. 处理三种状态：FULFILLED、REJECTED、PENDING
   * 4. 微任务：queueMicrotask 包裹回调执行
   * 5. resolvePromise：处理回调返回值
   */
  then(onFulfilled, onRejected) {
    // 🔑 1. 值穿透：如果参数不是函数，提供默认函数
    onFulfilled = typeof onFulfilled === 'function' 
      ? onFulfilled 
      : value => value;  // 默认：直接返回值
    
    onRejected = typeof onRejected === 'function'
      ? onRejected
      : reason => { throw reason };  // 默认：抛出错误

    // 🔑 2. 返回新的 Promise（支持链式调用）
    const promise2 = new MyPromise((resolve, reject) => {
      
      // 🔑 3a. 处理 FULFILLED 状态（已经成功）
      if (this.state === FULFILLED) {
        // 🔑 使用微任务（异步执行）
        queueMicrotask(() => {
          try {
            // 执行成功回调，获取返回值
            const x = onFulfilled(this.value);
            // 🔑 处理返回值（可能是 Promise、thenable 或普通值）
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            // 回调执行出错，reject
            reject(error);
          }
        });
      }
      
      // 🔑 3b. 处理 REJECTED 状态（已经失败）
      else if (this.state === REJECTED) {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }
      
      // 🔑 3c. 处理 PENDING 状态（异步情况）
      else if (this.state === PENDING) {
        // 🔑 将回调加入队列，等待状态改变时执行
        this.onFulfilledCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onRejected(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise2;
  }

  /**
   * catch 方法
   * 💡 本质：then(null, onRejected)
   */
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  /**
   * finally 方法
   * 💡 特点：
   * 1. 无论成功失败都执行
   * 2. 不改变原有的值或原因
   * 3. 返回新的 Promise
   */
  finally(onFinally) {
    return this.then(
      // 成功时：执行 onFinally，但保持原值
      value => MyPromise.resolve(onFinally()).then(() => value),
      // 失败时：执行 onFinally，但保持原因
      reason => MyPromise.resolve(onFinally()).then(() => { throw reason })
    );
  }

  // ============================================================
  // 静态方法
  // ============================================================

  /**
   * Promise.resolve
   * 💡 返回一个 fulfilled 状态的 Promise
   */
  static resolve(value) {
    // 如果已经是 Promise 实例，直接返回
    if (value instanceof MyPromise) {
      return value;
    }
    // 否则创建新的 fulfilled Promise
    return new MyPromise(resolve => resolve(value));
  }

  /**
   * Promise.reject
   * 💡 返回一个 rejected 状态的 Promise
   */
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  /**
   * Promise.all
   * 💡 特点：
   * 1. 所有 Promise 都成功才成功
   * 2. 任何一个失败就立即失败
   * 3. 返回结果数组，顺序与输入一致
   */
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let completedCount = 0;
      const total = promises.length;

      // 空数组直接 resolve
      if (total === 0) {
        resolve(results);
        return;
      }

      promises.forEach((promise, index) => {
        // 🔑 使用 resolve 包裹，处理非 Promise 值
        MyPromise.resolve(promise).then(
          value => {
            // 保存结果到对应位置
            results[index] = value;
            completedCount++;
            
            // 🔑 所有 Promise 都完成时，resolve
            if (completedCount === total) {
              resolve(results);
            }
          },
          reason => {
            // 🔑 任何一个失败，立即 reject
            reject(reason);
          }
        );
      });
    });
  }

  /**
   * Promise.race
   * 💡 特点：
   * 1. 第一个 settle（成功或失败）的结果就是最终结果
   * 2. 其他 Promise 的结果会被忽略
   */
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        // 🔑 第一个 settle 的 Promise 决定结果
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }

  /**
   * Promise.allSettled
   * 💡 特点：
   * 1. 等待所有 Promise settle（成功或失败）
   * 2. 返回所有结果，格式：
   *    - 成功：{ status: 'fulfilled', value: ... }
   *    - 失败：{ status: 'rejected', reason: ... }
   */
  static allSettled(promises) {
    return new MyPromise((resolve) => {
      const results = [];
      let completedCount = 0;
      const total = promises.length;

      if (total === 0) {
        resolve(results);
        return;
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = { status: 'fulfilled', value };
            completedCount++;
            if (completedCount === total) {
              resolve(results);
            }
          },
          reason => {
            results[index] = { status: 'rejected', reason };
            completedCount++;
            if (completedCount === total) {
              resolve(results);
            }
          }
        );
      });
    });
  }

  /**
   * Promise.any（额外实现）
   * 💡 特点：
   * 1. 任何一个成功就成功
   * 2. 所有都失败才失败
   * 3. 与 all 相反
   */
  static any(promises) {
    return new MyPromise((resolve, reject) => {
      const errors = [];
      let rejectedCount = 0;
      const total = promises.length;

      if (total === 0) {
        reject(new AggregateError([], 'All promises were rejected'));
        return;
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            // 任何一个成功，立即 resolve
            resolve(value);
          },
          reason => {
            errors[index] = reason;
            rejectedCount++;
            // 所有都失败，才 reject
            if (rejectedCount === total) {
              reject(new AggregateError(errors, 'All promises were rejected'));
            }
          }
        );
      });
    });
  }
}

/**
 * ============================================================
 * Promise 解决过程（最难的部分）
 * ============================================================
 * 
 * 💡 这是 Promises/A+ 规范的核心部分
 * 
 * 处理 then 回调返回值的各种情况：
 * 1. 循环引用 → reject TypeError
 * 2. Promise 实例 → 采用其状态
 * 3. thenable 对象 → 尝试调用 then
 * 4. 普通值 → 直接 resolve
 */
function resolvePromise(promise2, x, resolve, reject) {
  // 🔑 1. 处理循环引用
  // 例如：const p = promise.then(() => p)
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  // 🔑 2. 处理 Promise 实例
  if (x instanceof MyPromise) {
    // 采用 x 的状态
    x.then(resolve, reject);
    return;
  }

  // 🔑 3. 处理 thenable 对象或函数
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false; // 防止多次调用
    
    try {
      // 获取 then 方法
      const then = x.then;
      
      if (typeof then === 'function') {
        // 是 thenable 对象，调用 then 方法
        then.call(
          x,
          // 成功回调
          y => {
            if (called) return;
            called = true;
            // 🔑 递归处理（y 可能也是 Promise 或 thenable）
            resolvePromise(promise2, y, resolve, reject);
          },
          // 失败回调
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // 不是 thenable，是普通对象或函数
        resolve(x);
      }
    } catch (error) {
      // 获取 then 或调用 then 出错
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // 🔑 4. 处理普通值（number、string、boolean、null、undefined）
    resolve(x);
  }
}

// ============================================================
// 第三部分：详细测试用例
// ============================================================

console.log('========================================');
console.log('  Promise 完整版实现测试');
console.log('========================================\n');

// 测试1：基础功能
console.log('【测试1：基础 resolve 和 then】');
new MyPromise((resolve) => {
  resolve('success');
}).then(res => {
  console.log(`  ✓ ${res}`);
});

// 测试2：异步支持
console.log('\n【测试2：异步操作】');
new MyPromise((resolve) => {
  setTimeout(() => {
    resolve('async success');
  }, 100);
}).then(res => {
  console.log(`  ✓ ${res}`);
});

// 测试3：链式调用
console.log('\n【测试3：链式调用】');
MyPromise.resolve(1)
  .then(res => {
    console.log(`  → 第一个 then: ${res}`);
    return res + 1;
  })
  .then(res => {
    console.log(`  → 第二个 then: ${res}`);
    return res + 1;
  })
  .then(res => {
    console.log(`  ✓ 第三个 then: ${res}`);
  });

// 测试4：值穿透
console.log('\n【测试4：值穿透】');
MyPromise.resolve(1)
  .then()  // 没有传回调
  .then()
  .then(res => {
    console.log(`  ✓ 值穿透结果: ${res}`);
  });

// 测试5：catch 方法
console.log('\n【测试5：catch 方法】');
MyPromise.reject('error')
  .catch(err => {
    console.log(`  ✓ catch 捕获: ${err}`);
    return 'recovered';
  })
  .then(res => {
    console.log(`  ✓ catch 后继续: ${res}`);
  });

// 测试6：finally 方法
console.log('\n【测试6：finally 方法】');
MyPromise.resolve('done')
  .finally(() => {
    console.log('  → finally 执行');
  })
  .then(res => {
    console.log(`  ✓ finally 后的值: ${res}`);
  });

// 测试7：Promise.all
console.log('\n【测试7：Promise.all】');
MyPromise.all([
  MyPromise.resolve(1),
  MyPromise.resolve(2),
  MyPromise.resolve(3)
]).then(results => {
  console.log(`  ✓ Promise.all 结果: [${results}]`);
});

// 测试8：Promise.all 失败情况
console.log('\n【测试8：Promise.all 失败】');
MyPromise.all([
  MyPromise.resolve(1),
  MyPromise.reject('error'),
  MyPromise.resolve(3)
]).catch(err => {
  console.log(`  ✓ Promise.all 捕获错误: ${err}`);
});

// 测试9：Promise.race
console.log('\n【测试9：Promise.race】');
MyPromise.race([
  new MyPromise(resolve => setTimeout(() => resolve('slow'), 200)),
  new MyPromise(resolve => setTimeout(() => resolve('fast'), 100))
]).then(result => {
  console.log(`  ✓ Promise.race 结果: ${result}`);
});

// 测试10：Promise.allSettled
console.log('\n【测试10：Promise.allSettled】');
MyPromise.allSettled([
  MyPromise.resolve(1),
  MyPromise.reject('error'),
  MyPromise.resolve(3)
]).then(results => {
  console.log('  ✓ Promise.allSettled 结果:');
  results.forEach((result, index) => {
    console.log(`    [${index}] ${result.status}: ${result.value || result.reason}`);
  });
});

// 测试11：返回 Promise 的链式调用
console.log('\n【测试11：返回 Promise 的链式调用】');
MyPromise.resolve(1)
  .then(res => {
    console.log(`  → 第一步: ${res}`);
    return MyPromise.resolve(res + 1);
  })
  .then(res => {
    console.log(`  ✓ 第二步: ${res}`);
  });

// 测试12：状态保护
console.log('\n【测试12：状态保护】');
new MyPromise((resolve, reject) => {
  resolve('first');
  resolve('second');  // 应该被忽略
  reject('error');    // 应该被忽略
}).then(res => {
  console.log(`  ✓ 状态保护测试: ${res}`);  // 应该输出 first
});

// 延迟输出总结
setTimeout(() => {
  console.log('\n========================================');
  console.log('  核心实现要点总结');
  console.log('========================================\n');

  console.log('【1. 回调队列（支持异步）】');
  console.log('  this.onFulfilledCallbacks = []');
  console.log('  this.onRejectedCallbacks = []\n');

  console.log('【2. 状态保护（防止重复转换）】');
  console.log('  if (this.state !== PENDING) return\n');

  console.log('【3. then 返回新 Promise（链式调用）】');
  console.log('  return new MyPromise((resolve, reject) => {...})\n');

  console.log('【4. 值穿透（处理非函数参数）】');
  console.log('  onFulfilled = typeof onFulfilled === "function"');
  console.log('    ? onFulfilled : value => value\n');

  console.log('【5. 微任务（异步执行）】');
  console.log('  queueMicrotask(() => {...})\n');

  console.log('【6. resolvePromise（处理返回值）】');
  console.log('  - 循环引用 → reject TypeError');
  console.log('  - Promise 实例 → 采用其状态');
  console.log('  - thenable 对象 → 调用 then');
  console.log('  - 普通值 → 直接 resolve\n');

  console.log('========================================');
  console.log('  测试完成！');
  console.log('========================================');
}, 500);
