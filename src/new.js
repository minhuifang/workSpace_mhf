/**
 * 手写实现 new 运算符
 *
 * new 运算符的作用：
 * 创建一个用户定义的对象类型的实例或具有构造函数的内置对象的实例
 *
 * new 运算符的执行步骤：
 * 1. 创建一个空的简单 JavaScript 对象（即 {}）
 * 2. 将新对象的 __proto__ 指向构造函数的 prototype（建立原型链）
 * 3. 将构造函数的 this 绑定到新对象上，并执行构造函数
 * 4. 如果构造函数返回对象类型，则返回该对象；否则返回新创建的对象
 *
 * 时间复杂度：O(1)
 * 空间复杂度：O(1)
 *
 * @param {Function} fun - 构造函数
 * @param {...*} args - 传递给构造函数的参数
 * @return {Object} - 返回新创建的实例对象
 *
 * @example
 * function Person(name, age) {
 *   this.name = name;
 *   this.age = age;
 * }
 * const person = myNew(Person, '张三', 25);
 * console.log(person.name);  // '张三'
 * console.log(person instanceof Person);  // true
 */
function myNew(constructor, ...args) {
  if (typeof constructor !== "function") {
    throw new TypeError("Constructor must be a function");
  }

  // 步骤1：创建一个空对象
  // 步骤2：将新对象的原型指向构造函数的 prototype
  // 这样新对象就可以访问构造函数原型上的属性和方法
  const obj = Object.create(constructor.prototype);

  // 步骤3：将构造函数的 this 绑定到新对象，并执行构造函数
  // 这样构造函数内部的 this 就指向新创建的对象
  const result = constructor.apply(obj, args);

  // 步骤4：判断构造函数的返回值
  // 如果构造函数返回了一个对象，则返回该对象
  // 否则返回新创建的对象（obj）
  return result !== null &&
    (typeof result === "object" || typeof result === "function")
    ? result
    : obj;
}

// ===== 测试用例 =====

console.log("=== 测试1：基础构造函数 ===");
function Animal(name) {
  this.name = name;
}

let animal = myNew(Animal, "dog");
console.log(animal.name); // dog
console.log(animal instanceof Animal); // true

console.log("\n=== 测试2：带多个参数的构造函数 ===");
function Person(name, age, city) {
  this.name = name;
  this.age = age;
  this.city = city;
}

Person.prototype.sayHello = function () {
  console.log(`你好，我是${this.name}，今年${this.age}岁，来自${this.city}`);
};

const person = myNew(Person, "张三", 25, "北京");
console.log(person.name); // 张三
console.log(person.age); // 25
console.log(person.city); // 北京
person.sayHello(); // 你好，我是张三，今年25岁，来自北京
console.log(person instanceof Person); // true

console.log("\n=== 测试3：构造函数返回对象 ===");
function Car(brand) {
  this.brand = brand;
  // 构造函数显式返回一个对象
  return {
    brand: brand,
    type: "custom",
  };
}

const car = myNew(Car, "Tesla");
console.log(car.brand); // Tesla
console.log(car.type); // custom
console.log(car instanceof Car); // false（因为返回的是自定义对象）

console.log("\n=== 测试4：构造函数返回原始类型 ===");
function Phone(brand) {
  this.brand = brand;
  // 构造函数返回原始类型，会被忽略
  return "ignored";
}

const phone = myNew(Phone, "iPhone");
console.log(phone.brand); // iPhone
console.log(phone instanceof Phone); // true

console.log("\n=== 测试5：原型链测试 ===");
function Parent() {
  this.parentProp = "parent";
}

Parent.prototype.getParentProp = function () {
  return this.parentProp;
};

const parent = myNew(Parent);
console.log(parent.parentProp); // parent
console.log(parent.getParentProp()); // parent
console.log(parent instanceof Parent); // true
console.log(parent instanceof Object); // true

console.log("\n=== 测试6：与原生 new 对比 ===");
function Book(title, author) {
  this.title = title;
  this.author = author;
}

Book.prototype.getInfo = function () {
  return `《${this.title}》 - ${this.author}`;
};

const book1 = myNew(Book, "红楼梦", "曹雪芹");
const book2 = new Book("西游记", "吴承恩");

console.log("myNew 创建的对象:", book1.getInfo());
console.log("原生 new 创建的对象:", book2.getInfo());
console.log("myNew instanceof 检测:", book1 instanceof Book);
console.log("原生 new instanceof 检测:", book2 instanceof Book);

module.exports = myNew;
