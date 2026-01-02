/**
 * Object.assign 的 Polyfill 实现
 * 
 * Object.assign() 方法用于将所有可枚举属性的值从一个或多个源对象复制到目标对象
 * 它将返回目标对象
 * 
 * 语法：Object.assign(target, ...sources)
 * @param {Object} target - 目标对象，接收源对象属性的对象，也是修改后的返回值
 * @param {...Object} sources - 源对象，包含将被合并的属性
 * @returns {Object} 目标对象
 * 
 * 核心特性：
 * 1. 浅拷贝：只复制属性值本身（引用类型复制引用）
 * 2. 可枚举属性：只复制源对象自身的可枚举属性（不包括原型链上的属性）
 * 3. 后面的源对象属性会覆盖前面的
 * 4. String 和 Symbol 类型的属性都会被复制
 * 5. 如果目标对象是 null 或 undefined，会抛出 TypeError
 */

function myObjectAssign(target, ...sources) {
  // 1. 参数校验：target 不能是 null 或 undefined
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  // 2. 将 target 转换为对象
  // 如果 target 是原始类型（如 string、number），会被包装成对象
  const to = Object(target);

  // 3. 遍历所有源对象
  for (let i = 0; i < sources.length; i++) {
    const nextSource = sources[i];

    // 跳过 null 和 undefined 的源对象
    if (nextSource != null) {
      // 4. 遍历源对象的所有可枚举属性（包括 Symbol）
      // for...in 只能遍历字符串属性，所以需要额外处理 Symbol
      
      // 4.1 复制字符串类型的属性
      for (const key in nextSource) {
        // hasOwnProperty 确保只复制对象自身的属性，不包括原型链上的
        if (Object.prototype.hasOwnProperty.call(nextSource, key)) {
          to[key] = nextSource[key];
        }
      }

      // 4.2 复制 Symbol 类型的属性
      // Object.getOwnPropertySymbols 返回对象自身的所有 Symbol 属性
      const symbols = Object.getOwnPropertySymbols(nextSource);
      for (let j = 0; j < symbols.length; j++) {
        const symbol = symbols[j];
        // 只复制可枚举的 Symbol 属性
        if (Object.prototype.propertyIsEnumerable.call(nextSource, symbol)) {
          to[symbol] = nextSource[symbol];
        }
      }
    }
  }

  // 5. 返回修改后的目标对象
  return to;
}

/**
 * ============ 使用示例 ============
 */

// 示例 1：基本使用
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };
const result1 = myObjectAssign({}, obj1, obj2);
console.log(result1); // { a: 1, b: 3, c: 4 }
console.log(obj1);    // { a: 1, b: 2 } - 原对象不变

// 示例 2：属性覆盖
const target = { a: 1, b: 2 };
const source = { b: 4, c: 5 };
const returnedTarget = myObjectAssign(target, source);
console.log(target);         // { a: 1, b: 4, c: 5 } - target 被修改
console.log(returnedTarget === target); // true - 返回的就是 target

// 示例 3：合并多个对象
const o1 = { a: 1 };
const o2 = { b: 2 };
const o3 = { c: 3 };
const obj = myObjectAssign(o1, o2, o3);
console.log(obj);  // { a: 1, b: 2, c: 3 }
console.log(o1);   // { a: 1, b: 2, c: 3 } - o1 被修改

// 示例 4：浅拷贝（引用类型）
const obj3 = { a: { b: 1 } };
const copy = myObjectAssign({}, obj3);
console.log(copy);        // { a: { b: 1 } }
copy.a.b = 2;
console.log(obj3.a.b);    // 2 - 浅拷贝，引用被共享

// 示例 5：Symbol 属性
const sym = Symbol('test');
const objWithSymbol = { [sym]: 'symbol value', normal: 'normal value' };
const copied = myObjectAssign({}, objWithSymbol);
console.log(copied[sym]);    // 'symbol value'
console.log(copied.normal);  // 'normal value'

// 示例 6：原始类型作为 target
const v1 = 'abc';
const v2 = true;
const v3 = 10;
const objFromString = myObjectAssign({}, v1, null, v2, undefined, v3);
console.log(objFromString); // { "0": "a", "1": "b", "2": "c" }
// 只有字符串的包装对象有可枚举属性

// 示例 7：不会复制原型链上的属性
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function() {
  console.log('Hello');
};
const person = new Person('Alice');
const copiedPerson = myObjectAssign({}, person);
console.log(copiedPerson.name);      // 'Alice'
console.log(copiedPerson.sayHello);  // undefined - 原型方法不会被复制

/**
 * ============ 实现要点 ============
 * 
 * 1. 参数处理：
 *    - target 为 null/undefined 时抛出 TypeError
 *    - 源对象为 null/undefined 时跳过
 *    - 原始类型会被包装成对象
 * 
 * 2. 属性复制：
 *    - 只复制自身属性（hasOwnProperty）
 *    - 只复制可枚举属性
 *    - 支持字符串和 Symbol 类型的属性
 * 
 * 3. 浅拷贝特性：
 *    - 只复制属性值本身
 *    - 引用类型复制的是引用
 *    - 不会递归复制嵌套对象
 * 
 * 4. 覆盖规则：
 *    - 后面的源对象属性会覆盖前面的
 *    - 直接赋值，不会合并嵌套对象
 * 
 * ============ 与深拷贝的区别 ============
 * 
 * Object.assign（浅拷贝）：
 * const obj = { a: { b: 1 } };
 * const copy = Object.assign({}, obj);
 * copy.a.b = 2;
 * console.log(obj.a.b); // 2 - 影响原对象
 * 
 * 深拷贝：
 * const obj = { a: { b: 1 } };
 * const copy = JSON.parse(JSON.stringify(obj));
 * copy.a.b = 2;
 * console.log(obj.a.b); // 1 - 不影响原对象
 * 
 * ============ 常见应用场景 ============
 * 
 * 1. 合并配置对象：
 *    const defaultConfig = { timeout: 1000, retries: 3 };
 *    const userConfig = { timeout: 5000 };
 *    const config = Object.assign({}, defaultConfig, userConfig);
 * 
 * 2. 浅拷贝对象：
 *    const original = { a: 1, b: 2 };
 *    const copy = Object.assign({}, original);
 * 
 * 3. 合并多个对象：
 *    const merged = Object.assign({}, obj1, obj2, obj3);
 * 
 * 4. 为对象添加属性：
 *    Object.assign(obj, { newProp: 'value' });
 */

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = myObjectAssign;
}

/**
 * ============ 兼容性说明 ============
 * 
 * Object.assign 是 ES6 (ES2015) 引入的特性
 * 如果需要在旧浏览器中使用，可以添加 polyfill：
 * 
 * if (typeof Object.assign !== 'function') {
 *   Object.assign = myObjectAssign;
 * }
 * 
 * 支持的浏览器版本：
 * - Chrome 45+
 * - Firefox 34+
 * - Safari 9+
 * - Edge 12+
 * - IE: 不支持（需要 polyfill）
 */
