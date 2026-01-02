/**
 * Promise 的三种状态常量
 * PENDING: 初始状态，既不是成功也不是失败
 * RESOLVED: 操作成功完成
 * REJECTED: 操作失败
 */
const PENDING = "pending";
const RESOLVED = "resolved";
const REJECTED = "rejected";

/**
 * MyPromise 构造函数
 * @param {Function} fn - 执行器函数，接收 resolve 和 reject 两个参数
 * 
 * 实现原理：
 * 1. Promise 是一个状态机，有三种状态：pending、resolved、rejected
 * 2. 状态只能从 pending 转变为 resolved 或 rejected，且状态一旦改变就不可逆
 * 3. 通过回调函数数组来存储 then 方法注册的回调，在状态改变时依次执行
 */
function MyPromise(fn) {
  // 保存 this 指向，避免在内部函数中 this 指向丢失
  const self = this;

  // 初始化状态为 pending
  this.state = PENDING;

  // 用于保存 resolve 或 reject 传入的值
  this.value = null;

  // 用于保存成功状态的回调函数队列（支持多次调用 then）
  this.resolvedCallbacks = [];

  // 用于保存失败状态的回调函数队列（支持多次调用 then）
  this.rejectedCallbacks = [];

  /**
   * resolve 函数：将 Promise 状态从 pending 转变为 resolved
   * @param {*} value - 成功的结果值
   * 
   * 关键点：
   * 1. 如果 value 是 Promise，需要等待该 Promise 完成
   * 2. 使用 setTimeout 确保异步执行（模拟微任务）
   * 3. 状态只能改变一次（通过检查 PENDING 状态实现）
   */
  function resolve(value) {
    // 如果传入的值是 Promise 实例，则递归解析
    // 这样可以处理 resolve(anotherPromise) 的情况
    if (value instanceof MyPromise) {
      return value.then(resolve, reject);
    }

    // 使用 setTimeout 模拟异步执行（实际 Promise 使用微任务队列）
    // 这确保 then 方法中的回调在当前执行栈清空后执行
    setTimeout(() => {
      // 只有在 pending 状态时才能转变状态（状态凝固原则）
      if (self.state === PENDING) {
        // 修改状态为 resolved
        self.state = RESOLVED;

        // 保存成功的结果值
        self.value = value;

        // 依次执行所有通过 then 注册的成功回调
        self.resolvedCallbacks.forEach(callback => {
          callback(value);
        });
      }
    }, 0);
  }

  /**
   * reject 函数：将 Promise 状态从 pending 转变为 rejected
   * @param {*} value - 失败的原因（通常是 Error 对象）
   * 
   * 关键点：
   * 1. 使用 setTimeout 确保异步执行
   * 2. 状态只能改变一次
   */
  function reject(value) {
    // 使用 setTimeout 模拟异步执行
    setTimeout(() => {
      // 只有在 pending 状态时才能转变状态
      if (self.state === PENDING) {
        // 修改状态为 rejected
        self.state = REJECTED;

        // 保存失败的原因
        self.value = value;

        // 依次执行所有通过 then 注册的失败回调
        self.rejectedCallbacks.forEach(callback => {
          callback(value);
        });
      }
    }, 0);
  }

  // 立即执行传入的执行器函数，并传入 resolve 和 reject
  // 使用 try-catch 捕获执行器函数中的同步错误
  try {
    fn(resolve, reject);
  } catch (e) {
    // 如果执行器函数抛出错误，则将 Promise 状态转为 rejected
    reject(e);
  }
}

/**
 * then 方法：注册 Promise 状态改变时的回调函数
 * @param {Function} onResolved - Promise 成功时的回调函数
 * @param {Function} onRejected - Promise 失败时的回调函数
 * 
 * 实现原理：
 * 1. 参数可选，如果不是函数则提供默认实现
 * 2. 根据当前状态决定是立即执行回调还是加入队列
 * 3. 支持值穿透（当参数不是函数时）
 * 
 * 注意：这是简化版实现，标准 Promise 的 then 方法应该返回新的 Promise 以支持链式调用
 */
MyPromise.prototype.then = function(onResolved, onRejected) {
  // 参数校验：确保 onResolved 和 onRejected 是函数
  // 如果不是函数，提供默认实现以支持值穿透
  // 值穿透示例：Promise.resolve(1).then().then(v => console.log(v)) // 输出 1
  onResolved =
    typeof onResolved === "function"
      ? onResolved
      : function(value) {
          return value; // 默认返回接收到的值
        };

  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : function(error) {
          throw error; // 默认抛出接收到的错误
        };

  // 情况1：如果当前状态是 pending，说明异步操作还未完成
  // 将回调函数加入对应的队列，等待状态改变时执行
  if (this.state === PENDING) {
    this.resolvedCallbacks.push(onResolved);
    this.rejectedCallbacks.push(onRejected);
  }

  // 情况2：如果状态已经是 resolved，立即执行成功回调
  if (this.state === RESOLVED) {
    onResolved(this.value);
  }

  // 情况3：如果状态已经是 rejected，立即执行失败回调
  if (this.state === REJECTED) {
    onRejected(this.value);
  }
};

/**
 * ============ 使用示例 ============
 * 
 * // 基本使用
 * const promise = new MyPromise((resolve, reject) => {
 *   setTimeout(() => {
 *     resolve('成功');
 *   }, 1000);
 * });
 * 
 * promise.then(
 *   value => console.log(value),  // 输出：成功
 *   error => console.log(error)
 * );
 * 
 * // 多次调用 then
 * promise.then(value => console.log('第一次:', value));
 * promise.then(value => console.log('第二次:', value));
 * 
 * ============ 实现说明 ============
 * 
 * 这是一个简化版的 Promise 实现，主要包含以下特性：
 * 1. ✅ 状态管理（pending、resolved、rejected）
 * 2. ✅ 状态凝固（状态只能改变一次）
 * 3. ✅ 异步执行（使用 setTimeout 模拟）
 * 4. ✅ 回调队列（支持多次调用 then）
 * 5. ✅ 值穿透（then 参数可选）
 * 6. ✅ Promise 解析（resolve 可以接收 Promise）
 * 7. ✅ 错误捕获（执行器函数中的同步错误）
 * 
 * 未实现的标准特性（可进一步优化）：
 * 1. ❌ then 方法链式调用（需要返回新的 Promise）
 * 2. ❌ catch 方法
 * 3. ❌ finally 方法
 * 4. ❌ Promise.resolve / Promise.reject 静态方法
 * 5. ❌ Promise.all / Promise.race 等静态方法
 * 6. ❌ 微任务队列（当前使用宏任务 setTimeout）
 */