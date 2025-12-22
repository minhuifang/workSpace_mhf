/**
 * ========================================
 * 手写 Promise 实现（简化版）
 * ========================================
 * 
 * 📚 知识要点：
 * 1. Promise 的三种状态：pending、fulfilled、rejected
 * 2. 状态只能从 pending 转换为 fulfilled 或 rejected，且不可逆
 * 3. Promise 构造函数接收一个执行器函数（executor）
 * 4. 执行器函数立即同步执行
 * 5. then 方法用于注册回调函数
 * 
 * ⚠️ 本实现的局限性：
 * - 不支持异步操作（没有回调队列）
 * - then 不支持链式调用
 * - 没有实现 catch、finally 等方法
 * - 没有处理 thenable 对象
 * - 没有实现微任务机制
 */

// ============================================================
// 第一部分：Promise 状态定义
// ============================================================

/**
 * 使用 Symbol 定义三种状态，确保状态值唯一且不可被外部修改
 * 
 * 💡 为什么用 Symbol？
 * - 保证状态值的唯一性
 * - 防止外部代码意外修改状态
 * - 更符合 ES6+ 的最佳实践
 */
const PENDING = Symbol('pending');        // 等待态：初始状态
const REJECTED = Symbol('rejected');      // 拒绝态：操作失败
const FULFILLED = Symbol('fulfilled');    // 完成态：操作成功

// ============================================================
// 第二部分：Promise 构造函数
// ============================================================

/**
 * MyPromise 构造函数
 * 
 * @param {Function} executor - 执行器函数，接收 resolve 和 reject 两个参数
 * 
 * 📝 执行流程：
 * 1. 初始化状态为 PENDING
 * 2. 初始化 value 为空字符串（用于存储结果或错误）
 * 3. 定义 resolve 和 reject 函数
 * 4. 立即执行 executor 函数
 * 5. 捕获 executor 执行过程中的异常
 */
const MyPromise = function(executor) {
  // 🔑 关键属性1：状态
  // 初始状态为 PENDING，只能转换一次
  this.state = PENDING;
  
  // 🔑 关键属性2：值
  // 存储成功的结果或失败的原因
  this.value = '';

  /**
   * resolve 函数：将 Promise 状态从 pending 改为 fulfilled
   * 
   * @param {*} value - 成功的结果值
   * 
   * 💡 注意：使用箭头函数确保 this 指向 Promise 实例
   */
  const resolve = (value) => {
    // ⚠️ 简化版问题：没有判断当前状态，应该只在 PENDING 时才能转换
    // 完整版应该加上：if (this.state !== PENDING) return;
    
    this.state = FULFILLED;
    this.value = value;
  };

  /**
   * reject 函数：将 Promise 状态从 pending 改为 rejected
   * 
   * @param {*} error - 失败的原因
   * 
   * 💡 注意：使用箭头函数确保 this 指向 Promise 实例
   */
  const reject = (error) => {
    // ⚠️ 简化版问题：没有判断当前状态，应该只在 PENDING 时才能转换
    // 完整版应该加上：if (this.state !== PENDING) return;
    
    this.state = REJECTED;
    this.value = error;
  };

  /**
   * then 方法：注册成功和失败的回调函数
   * 
   * @param {Function} onFulfilled - 成功时的回调函数
   * @param {Function} onRejected - 失败时的回调函数
   * 
   * ⚠️ 简化版问题：
   * 1. 只支持同步操作，不支持异步
   * 2. 不返回新的 Promise，无法链式调用
   * 3. 没有处理回调函数不是函数的情况
   */
  this.then = (onFulfilled, onRejected) => {
    if (this.state === FULFILLED) {
      // 状态已经是 fulfilled，直接执行成功回调
      onFulfilled(this.value);
    } else if (this.state === REJECTED) {
      // 状态已经是 rejected，直接执行失败回调
      onRejected(this.value);
    }
    // ⚠️ 简化版问题：如果状态还是 PENDING（异步情况），回调不会执行
    // 完整版需要维护一个回调队列，在状态改变时执行
  };

  /**
   * 执行器函数的执行
   * 
   * 📝 执行逻辑：
   * 1. 立即同步执行 executor 函数
   * 2. 传入 resolve 和 reject 函数
   * 3. 捕获执行过程中的异常，自动 reject
   */
  try {
    // 🔑 关键：executor 立即执行（同步）
    executor(resolve, reject);
  } catch(error) {
    // 如果 executor 执行出错，自动 reject
    reject(error);
  }
};

// ============================================================
// 第三部分：基础测试
// ============================================================

console.log('========================================');
console.log('  Promise 简化版实现测试');
console.log('========================================\n');

console.log('【测试1：同步 resolve】');
let p1 = new MyPromise((resolve, reject) => {
  console.log('  → 执行器函数立即执行');
  resolve('hello');
  console.log('  → resolve 调用完成');
});

p1.then(
  res => {
    console.log(`  ✓ 成功回调: ${res}`);  // hello
  },
  err => {
    console.log(`  ✗ 失败回调: ${err}`);
  }
);

console.log('\n【测试2：同步 reject】');
let p2 = new MyPromise((resolve, reject) => {
  reject('error occurred');
});

p2.then(
  res => {
    console.log(`  ✓ 成功回调: ${res}`);
  },
  err => {
    console.log(`  ✗ 失败回调: ${err}`);  // error occurred
  }
);

console.log('\n【测试3：executor 抛出异常】');
let p3 = new MyPromise((resolve, reject) => {
  throw new Error('executor error');
});

p3.then(
  res => {
    console.log(`  ✓ 成功回调: ${res}`);
  },
  err => {
    console.log(`  ✗ 失败回调: ${err.message}`);  // executor error
  }
);

console.log('\n【测试4：状态不可逆】');
let p4 = new MyPromise((resolve, reject) => {
  resolve('first');
  resolve('second');  // 这个应该被忽略（但简化版没有实现）
  reject('error');    // 这个也应该被忽略
});

p4.then(
  res => {
    console.log(`  ✓ 成功回调: ${res}`);  // 期望: first, 实际: error（简化版问题）
  },
  err => {
    console.log(`  ✗ 失败回调: ${err}`);
  }
);

// ============================================================
// 第四部分：简化版的局限性演示
// ============================================================

console.log('\n========================================');
console.log('  简化版的局限性');
console.log('========================================\n');

console.log('【局限性1：不支持异步操作】');
let p5 = new MyPromise((resolve, reject) => {
  console.log('  → 设置异步 resolve');
  setTimeout(() => {
    resolve('async result');
  }, 100);
});

p5.then(
  res => {
    console.log(`  ✓ 成功回调: ${res}`);
  },
  err => {
    console.log(`  ✗ 失败回调: ${err}`);
  }
);
console.log('  ⚠️ 回调不会执行，因为 then 执行时状态还是 PENDING\n');

console.log('【局限性2：不支持链式调用】');
// let p6 = new MyPromise((resolve) => resolve(1))
//   .then(res => res + 1)
//   .then(res => console.log(res));
// ⚠️ 会报错：Cannot read property 'then' of undefined
console.log('  ⚠️ then 方法没有返回新的 Promise，无法链式调用\n');

// ============================================================
// 第五部分：知识总结
// ============================================================

console.log('========================================');
console.log('  知识总结');
console.log('========================================\n');

console.log('【Promise 核心概念】\n');

console.log('1. 三种状态：');
console.log('   - pending: 初始状态，既不是成功也不是失败');
console.log('   - fulfilled: 操作成功完成');
console.log('   - rejected: 操作失败\n');

console.log('2. 状态转换规则：');
console.log('   - pending → fulfilled（通过 resolve）');
console.log('   - pending → rejected（通过 reject）');
console.log('   - 状态一旦改变，就不会再变\n');

console.log('3. 执行器函数（executor）：');
console.log('   - 立即同步执行');
console.log('   - 接收 resolve 和 reject 两个参数');
console.log('   - 执行过程中的异常会被捕获并 reject\n');

console.log('4. then 方法：');
console.log('   - 接收两个回调函数：onFulfilled 和 onRejected');
console.log('   - 根据状态执行对应的回调');
console.log('   - 应该返回新的 Promise（链式调用）\n');

console.log('【简化版 vs 完整版】\n');

console.log('简化版缺少的功能：');
console.log('  ✗ 异步支持（回调队列）');
console.log('  ✗ 链式调用（返回新 Promise）');
console.log('  ✗ 状态保护（防止重复转换）');
console.log('  ✗ 值穿透（then 参数非函数的处理）');
console.log('  ✗ 微任务机制（queueMicrotask）');
console.log('  ✗ Promise 解决过程（处理 thenable）');
console.log('  ✗ catch、finally 等方法');
console.log('  ✗ Promise.all、Promise.race 等静态方法\n');

console.log('完整版需要实现：');
console.log('  ✓ 回调队列（onFulfilledCallbacks、onRejectedCallbacks）');
console.log('  ✓ then 返回新 Promise');
console.log('  ✓ 状态保护（if (this.state !== PENDING) return）');
console.log('  ✓ 微任务调度（queueMicrotask 或 setTimeout）');
console.log('  ✓ Promise 解决过程（resolvePromise 函数）');
console.log('  ✓ 其他实例方法和静态方法\n');

console.log('【实现要点】\n');

console.log('1. 为什么用 Symbol 定义状态？');
console.log('   → 保证状态值唯一，防止外部修改\n');

console.log('2. 为什么 resolve/reject 用箭头函数？');
console.log('   → 确保 this 始终指向 Promise 实例\n');

console.log('3. 为什么 executor 要用 try-catch 包裹？');
console.log('   → 捕获同步异常，自动 reject\n');

console.log('4. 异步支持的关键是什么？');
console.log('   → 维护回调队列，在状态改变时执行队列中的回调\n');

console.log('5. 链式调用的关键是什么？');
console.log('   → then 方法返回新的 Promise\n');

console.log('========================================');
console.log('  测试完成！');
console.log('========================================');
