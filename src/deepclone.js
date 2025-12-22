/**
 * =====================================================
 * 深拷贝 vs 浅拷贝
 * =====================================================
 * 
 * 【区别】
 * 1. 浅拷贝（Shallow Copy）：
 *    - 只复制对象的第一层属性
 *    - 如果属性值是基本类型，拷贝的是值
 *    - 如果属性值是引用类型，拷贝的是内存地址（引用）
 *    - 修改新对象的引用类型属性会影响原对象
 * 
 * 2. 深拷贝（Deep Copy）：
 *    - 递归复制对象的所有层级
 *    - 完全独立的新对象，不共享任何引用
 *    - 修改新对象不会影响原对象
 * 
 * 【示例】
 * const obj = { a: 1, b: { c: 2 } };
 * 
 * // 浅拷贝
 * const shallowCopy = { ...obj };
 * shallowCopy.b.c = 3;  // 原对象 obj.b.c 也变成 3
 * 
 * // 深拷贝
 * const deepCopy = deepClone(obj);
 * deepCopy.b.c = 3;  // 原对象 obj.b.c 仍然是 2
 */

/**
 * =====================================================
 * 浅拷贝的实现方式
 * =====================================================
 */

/**
 * 方式1：Object.assign()
 * 将所有可枚举属性从一个或多个源对象复制到目标对象
 */
function shallowCopy1(obj) {
  return Object.assign({}, obj);
}

/**
 * 方式2：展开运算符（Spread Operator）
 * ES6 语法，最简洁的浅拷贝方式
 */
function shallowCopy2(obj) {
  return { ...obj };
}

/**
 * 方式3：Array.prototype.slice()
 * 适用于数组的浅拷贝
 */
function shallowCopyArray1(arr) {
  return arr.slice();
}

/**
 * 方式4：Array.prototype.concat()
 * 适用于数组的浅拷贝
 */
function shallowCopyArray2(arr) {
  return arr.concat();
}

/**
 * 方式5：手动遍历
 * 只复制对象的第一层属性
 */
function shallowCopy3(obj) {
  const copy = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = obj[key];
    }
  }
  return copy;
}

/**
 * =====================================================
 * 深拷贝的实现方式
 * =====================================================
 */

/**
 * 方式1：JSON.parse(JSON.stringify())
 * 
 * 优点：
 * - 简单易用，一行代码搞定
 * - 适合处理纯 JSON 数据
 * 
 * 缺点：
 * - 无法处理函数（会被忽略）
 * - 无法处理 undefined（会被忽略）
 * - 无法处理 Symbol（会被忽略）
 * - 无法处理循环引用（会报错）
 * - 无法处理 Date 对象（会转成字符串）
 * - 无法处理 RegExp 对象（会转成空对象）
 * - 无法处理 Map、Set 等特殊对象
 * - 会丢失对象的 constructor（所有对象都变成 Object）
 * 
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 深拷贝后的新对象
 */
function deepCloneJSON(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 方式2：递归实现（基础版）
 * 
 * 功能：
 * - 递归遍历对象的所有属性
 * - 对于基本类型直接复制
 * - 对于引用类型递归调用深拷贝
 * 
 * 优点：
 * - 原理简单易懂
 * - 可以处理多层嵌套对象
 * 
 * 缺点：
 * - 无法处理循环引用
 * - 无法处理特殊对象（Date、RegExp、Map、Set 等）
 * - 无法处理 Symbol 类型的 key
 * - 无法处理函数、undefined 等特殊值
 * 
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 深拷贝后的新对象
 */
function deepClone(obj) {
  // 先判断是对象还是数组
  let copy = obj instanceof Array ? [] : {};
  
  // 遍历对象的所有属性
  for (let key in obj) {
    // 判断是否是对象自身的属性，而不是原型链上的属性
    if (obj.hasOwnProperty(key)) {
      // 如果属性值是对象类型，递归调用深拷贝
      // 如果是基本类型，直接赋值
      copy[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key];
    }
  }
  
  return copy;
}

/**
 * 方式3：递归实现（完善版）
 * 
 * 功能：
 * - 处理 null 和 undefined
 * - 处理基本类型
 * - 处理数组和普通对象
 * - 处理 Date 对象
 * - 处理 RegExp 对象
 * - 处理循环引用（使用 WeakMap）
 * - 处理 Symbol 类型的 key
 * 
 * 优点：
 * - 功能完善，能处理大部分场景
 * - 可以处理循环引用
 * - 可以处理特殊对象
 * 
 * 缺点：
 * - 代码较复杂
 * - 性能相对较低
 * 
 * @param {*} obj - 要拷贝的对象
 * @param {WeakMap} hash - 用于存储已拷贝的对象，解决循环引用问题
 * @returns {*} 深拷贝后的新对象
 */
function deepCloneAdvanced(obj, hash = new WeakMap()) {
  // 处理 null 的情况（typeof null === 'object'）
  if (obj === null) return obj;
  
  // 处理基本类型（string, number, boolean, undefined, symbol, bigint）
  if (typeof obj !== 'object') return obj;
  
  // 处理 Date 对象
  if (obj instanceof Date) return new Date(obj);
  
  // 处理 RegExp 对象
  if (obj instanceof RegExp) return new RegExp(obj);
  
  // 处理循环引用：如果已经拷贝过该对象，直接返回
  if (hash.has(obj)) return hash.get(obj);
  
  // 根据原对象的构造函数创建新对象，保持原型链
  // 这样可以正确处理数组、对象等不同类型
  const cloneObj = new obj.constructor();
  
  // 将当前对象添加到 hash 中，用于处理循环引用
  hash.set(obj, cloneObj);
  
  // 遍历对象的所有自有属性（包括 Symbol 类型的 key）
  Reflect.ownKeys(obj).forEach(key => {
    // 递归拷贝每个属性
    cloneObj[key] = deepCloneAdvanced(obj[key], hash);
  });
  
  return cloneObj;
}

/**
 * 方式4：使用 structuredClone()（浏览器原生 API）
 * 
 * 功能：
 * - Node.js 17+ 和现代浏览器支持
 * - 可以处理循环引用
 * - 可以处理大部分内置类型（Date、RegExp、Map、Set、ArrayBuffer 等）
 * 
 * 优点：
 * - 原生实现，性能好
 * - 功能强大，支持的类型多
 * 
 * 缺点：
 * - 无法处理函数（会报错）
 * - 无法处理 Symbol（会被忽略）
 * - 兼容性要求较高
 * 
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 深拷贝后的新对象
 */
function deepCloneStructured(obj) {
  // 检查是否支持 structuredClone
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  throw new Error('structuredClone is not supported in this environment');
}

/**
 * 方式5：使用第三方库
 * 
 * 1. Lodash 的 _.cloneDeep()
 *    - 功能最完善，处理各种边界情况
 *    - 性能优化好
 *    - 使用：const _ = require('lodash'); _.cloneDeep(obj);
 * 
 * 2. jQuery 的 $.extend(true, {}, obj)
 *    - 适合已经使用 jQuery 的项目
 *    - 第一个参数 true 表示深拷贝
 * 
 * 3. Ramda 的 R.clone()
 *    - 函数式编程风格
 *    - 使用：const R = require('ramda'); R.clone(obj);
 */

/**
 * =====================================================
 * 测试用例
 * =====================================================
 */

// 测试基础深拷贝
const obj1 = { name: 'jack', birth: { year: '1997', month: '10' } };
const clone1 = deepClone(obj1);
console.log('基础深拷贝:', clone1);
clone1.birth.year = '2000';
console.log('修改后原对象:', obj1.birth.year); // '1997'
console.log('修改后新对象:', clone1.birth.year); // '2000'

// 测试完善版深拷贝
const obj2 = {
  string: 'hello',
  number: 123,
  boolean: true,
  null: null,
  undefined: undefined,
  date: new Date(),
  regexp: /test/gi,
  array: [1, 2, { a: 3 }],
  nested: { a: { b: { c: 1 } } },
  [Symbol('key')]: 'symbol value'
};
// // 添加循环引用
obj2.self = obj2;
const clone2 = deepCloneAdvanced(obj2);
console.log('完善版深拷贝:', clone2);
console.log('循环引用处理:', clone2.self === clone2); // true

// 测试浅拷贝
const obj3 = { a: 1, b: { c: 2 } };
const shallow = shallowCopy2(obj3);
shallow.b.c = 3;
console.log('浅拷贝影响原对象:', obj3.b.c); // 3
