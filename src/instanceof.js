/**
 * 手写实现 instanceof 运算符
 * 
 * instanceof 原理：
 * 检查构造函数的 prototype 是否出现在实例对象的原型链上
 * 
 * 算法思路：
 * 1. 获取构造函数的 prototype 属性
 * 2. 获取实例对象的原型（__proto__）
 * 3. 沿着原型链向上查找，直到找到匹配的 prototype 或到达原型链顶端（null）
 * 
 * 时间复杂度：O(n)，n 为原型链的长度
 * 空间复杂度：O(1)
 * 
 * @param {*} left - 需要检测的实例对象
 * @param {Function} right - 构造函数
 * @return {boolean} - 如果 left 是 right 的实例返回 true，否则返回 false
 * 
 * @example
 * myInstanceOf([], Array)        // true
 * myInstanceOf({}, Object)       // true
 * myInstanceOf([], Object)       // true (因为 Array.prototype 的原型是 Object.prototype)
 * myInstanceOf('', String)       // false (原始类型)
 * myInstanceOf(new String(''), String) // true (包装对象)
 */
function myInstanceOf(left, right) {
  // 获取构造函数的 prototype 属性
  let prototype = right.prototype;
  
  // 获取实例对象的原型（__proto__）
  left = left.__proto__;
  
  // 沿着原型链向上查找
  while(true) {
    // 到达原型链顶端（null），未找到匹配的 prototype
    if (!left) return false;
    
    // 找到匹配的 prototype，说明 left 是 right 的实例
    if (left == prototype) return true;
    
    // 继续向上查找原型链
    left = left.__proto__;
  }
}

// 测试用例
console.log('=== 基础测试 ===');
console.log(myInstanceOf([], Array));           // true
console.log(myInstanceOf([], Object));          // true
console.log(myInstanceOf({}, Object));          // true
console.log(myInstanceOf({}, Array));           // false

console.log('\n=== 原始类型测试 ===');
console.log(myInstanceOf('', String));          // false (原始类型)
console.log(myInstanceOf(123, Number));         // false (原始类型)
console.log(myInstanceOf(true, Boolean));       // false (原始类型)

console.log('\n=== 包装对象测试 ===');
console.log(myInstanceOf(new String(''), String));  // true
console.log(myInstanceOf(new Number(123), Number)); // true
console.log(myInstanceOf(new Boolean(true), Boolean)); // true

console.log('\n=== 自定义构造函数测试 ===');
function Person(name) {
  this.name = name;
}
const person = new Person('张三');
console.log(myInstanceOf(person, Person));      // true
console.log(myInstanceOf(person, Object));      // true
console.log(myInstanceOf(person, Array));       // false

console.log('\n=== 继承测试 ===');
function Student(name, grade) {
  Person.call(this, name);
  this.grade = grade;
}
Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;

const student = new Student('李四', 3);
console.log(myInstanceOf(student, Student));    // true
console.log(myInstanceOf(student, Person));     // true
console.log(myInstanceOf(student, Object));     // true

module.exports = myInstanceOf;