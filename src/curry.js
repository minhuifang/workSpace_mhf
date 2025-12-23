/**
 * 通用的柯里化函数
 * 柯里化是一种将使用多个参数的函数转换成一系列使用一个参数的函数的技术
 * 
 * @param {Function} targetfn - 需要被柯里化的目标函数
 * @returns {Function} 返回柯里化后的函数
 * 
 * @example
 * function sum(a, b, c) { return a + b + c; }
 * const curriedSum = curry(sum);
 * curriedSum(1)(2)(3) // 6
 * curriedSum(1, 2)(3) // 6
 * curriedSum(1, 2, 3) // 6
 */
function curry(targetfn) {
  // 获取目标函数的参数个数（形参数量）
  var numOfArgs = targetfn.length;
  
  // 返回一个闭包函数，用于收集参数
  return function fn() {
    // 如果当前传入的参数个数小于目标函数需要的参数个数
    if (arguments.length < numOfArgs) {
      // 使用 bind 返回一个新函数，将已传入的参数预置
      // 这样可以继续收集剩余参数，形成链式调用
      return fn.bind(null, ...arguments);
    } else {
      // 参数收集完毕，执行目标函数并返回结果
      return targetfn.apply(null, arguments);
    }
  }
}

// 测试示例
function sum(a, b, c) {
  return a + b + c;
}

const curried = curry(sum);
console.log(curried(1)(2)(3)) // 6
console.log(curried(1,2)(3)) // 6

/**
 * 不定参数的柯里化函数（累加器模式）
 * 这个版本支持不定数量的参数，通过空调用 () 来触发最终计算
 * 
 * @param {...number} args1 - 初始传入的参数列表
 * @returns {Function} 返回一个可以继续接收参数的函数
 * 
 * @example
 * sum2(1, 2, 3)(4)(5)() // 15
 * sum2(1)(2)(3)() // 6
 * 
 * 工作原理：
 * 1. 每次调用都会累加当前参数
 * 2. 返回一个新函数等待下一次调用
 * 3. 当调用时不传参数（空括号）时，返回累加结果
 */
function sum2(...args1) {
  // 计算当前传入的所有参数的总和
  let x = args1.reduce((prev, next) => {return prev+next;})
  
  // 返回一个新函数，可以继续接收参数
  return function(...args2) {
    // 如果没有传入新参数（空调用），则返回累加结果
    if (args2.length == 0) return x;
    
    // 计算新传入参数的总和
    let y = args2.reduce((prev, next) => {return prev+next;})
    
    // 递归调用 sum2，将之前的累加值和新值相加
    // 这样可以持续累加，直到遇到空调用
    return sum2(x+y)
  }
}

console.log(sum2(1,2,2,5)(7)()) // 17







