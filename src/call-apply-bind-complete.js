/**
 * ========================================
 * call、apply、bind 完整实现与详解
 * ========================================
 * 
 * 目录：
 * 1. call 实现
 * 2. apply 实现
 * 3. bind 实现（简化版 + 完整版）
 * 4. 三者对比
 * 5. 实战测试
 */

console.log('========================================');
console.log('  call、apply、bind 完整实现与详解');
console.log('========================================\n');

// ============================================================
// 第一部分：call 实现
// ============================================================

console.log('【1. call 实现】\n');

/**
 * call 方法思路：
 * 1. 将函数设为对象的方法
 * 2. 执行该方法
 * 3. 删除该方法
 * 4. 返回结果
 */
Function.prototype.myCall = function (context, ...rest) {
    // 如果 context 为 null/undefined，指向全局对象
    context = context || globalThis;
    
    // 使用 Symbol 避免属性名冲突
    const fn = Symbol('fn');
    
    // 将函数设为对象的方法
    context[fn] = this;
    
    // 执行该方法
    const result = context[fn](...rest);
    
    // 删除该方法
    delete context[fn];
    
    return result;
};

// 测试 call
console.log('--- call 测试 ---');
const callObj = { name: 'jack' };
function callTest(arg1, arg2, arg3) {
    console.log(`  this.name: ${this.name}`);
    console.log(`  参数: ${arg1}, ${arg2}, ${arg3}`);
    return `${this.name} received ${arg1}`;
}
const callResult = callTest.myCall(callObj, 1, 2, 3);
console.log(`  返回值: ${callResult}\n`);

// ============================================================
// 第二部分：apply 实现
// ============================================================

console.log('【2. apply 实现】\n');

/**
 * apply 方法思路：
 * 1. 将函数设为对象的方法
 * 2. 调用该方法，并传入参数数组
 * 3. 删除该方法
 * 4. 返回结果
 * 
 * 与 call 的区别：第二个参数是数组
 */
Function.prototype.myApply = function (context, args) {
    // 如果 context 为 null/undefined，指向全局对象
    context = context || globalThis;
    
    // 使用 Symbol 避免属性名冲突
    const fn = Symbol('fn');
    
    // 将函数设为对象的方法
    context[fn] = this;
    
    // 执行该方法
    let result;
    if (!args) {
        result = context[fn]();
    } else {
        result = context[fn](...args);
    }
    
    // 删除该方法
    delete context[fn];
    
    return result;
};

// 测试 apply
console.log('--- apply 测试 ---');
const applyObj = { name: 'tom' };
function applyTest(arg1, arg2, arg3) {
    console.log(`  this.name: ${this.name}`);
    console.log(`  参数: ${arg1}, ${arg2}, ${arg3}`);
    return `${this.name} received [${arg1}, ${arg2}, ${arg3}]`;
}
const applyResult = applyTest.myApply(applyObj, [4, 5, 6]);
console.log(`  返回值: ${applyResult}\n`);

// ============================================================
// 第三部分：bind 实现
// ============================================================

console.log('【3. bind 实现】\n');

/**
 * bind 方法思路：
 * 1. 返回一个函数
 * 2. 函数执行时，将函数设为对象的方法并执行
 * 3. 如果返回的函数被 new 调用，this 应该指向新创建的实例，而不是绑定的 context
 */

// --- 3.1 简化版本（不支持 new 调用）---
console.log('--- 3.1 简化版 bind（不支持 new）---\n');

Function.prototype.myBindSimple = function (context, ...args) {
    // 使用箭头函数，简洁但不支持 new
    return (...newArgs) => this.apply(context, [...args, ...newArgs]);
};

const simpleObj = { name: 'simple' };
function simpleFunc(prefix, suffix) {
    return `${prefix} ${this.name} ${suffix}`;
}
const simpleBound = simpleFunc.myBindSimple(simpleObj, 'Hello');
console.log(`  普通调用: ${simpleBound('!')}`);  // Hello simple !

// --- 3.2 完整版本（支持 new 调用）---
console.log('\n--- 3.2 完整版 bind（支持 new）---\n');

Function.prototype.myBind = function (context, ...args) {
    // 保存原始函数
    const self = this;
    
    // 返回的绑定函数（不能用箭头函数）
    const fBound = function (...newArgs) {
        // 🔑 关键：判断是否通过 new 调用
        // 如果 this 是 fBound 的实例，说明是 new 调用，this 指向新实例
        // 否则，this 指向绑定的 context
        return self.apply(
            this instanceof fBound ? this : context,
            [...args, ...newArgs]
        );
    };
    
    // 🔑 关键：维护原型链
    // 让 fBound.prototype 继承自原函数的 prototype
    // 这样 new fBound() 创建的实例可以访问原函数原型上的方法
    if (self.prototype) {
        // 使用 Object.create 避免直接修改原函数的 prototype
        fBound.prototype = Object.create(self.prototype);
    }
    
    return fBound;
};

// 测试完整版 bind
function Person(name, age) {
    this.name = name;
    this.age = age;
}

Person.prototype.sayHello = function() {
    return `Hello, 我是 ${this.name}, ${this.age}岁`;
};

// 测试普通调用
const bindObj = { name: 'bind-context', age: 0 };
const BoundPerson1 = Person.myBind(bindObj, '张三');
console.log('  普通调用:');
BoundPerson1(25);
console.log(`    bindObj 被修改: ${JSON.stringify(bindObj)}\n`);

// 测试 new 调用
const BoundPerson2 = Person.myBind({ name: 'ignored' }, '李四');
console.log('  new 调用:');
const person = new BoundPerson2(30);
console.log(`    person.name: ${person.name}`);
console.log(`    person.age: ${person.age}`);
console.log(`    person instanceof Person: ${person instanceof Person}`);
console.log(`    person.sayHello(): ${person.sayHello()}\n`);

// ============================================================
// 第四部分：三者对比
// ============================================================

console.log('【4. call、apply、bind 对比】\n');

const compareObj = { value: 100 };

function compareFunc(a, b, c) {
    console.log(`    this.value: ${this.value}`);
    console.log(`    参数: a=${a}, b=${b}, c=${c}`);
    return this.value + a + b + c;
}

console.log('  4.1 call - 立即执行，参数列表:');
const r1 = compareFunc.myCall(compareObj, 1, 2, 3);
console.log(`    返回值: ${r1}\n`);

console.log('  4.2 apply - 立即执行，参数数组:');
const r2 = compareFunc.myApply(compareObj, [1, 2, 3]);
console.log(`    返回值: ${r2}\n`);

console.log('  4.3 bind - 返回函数，支持柯里化:');
const boundFunc = compareFunc.myBind(compareObj, 1);
const r3 = boundFunc(2, 3);
console.log(`    返回值: ${r3}\n`);

// ============================================================
// 第五部分：实战测试
// ============================================================

console.log('【5. 实战测试】\n');

// --- 5.1 bind 的 new 调用详解 ---
console.log('--- 5.1 bind 的 new 调用：为什么 context 会被忽略？---\n');

function Animal(name, type) {
    console.log(`  → 执行 Animal 构造函数`);
    console.log(`  → this 是什么？`, this.constructor.name);
    this.name = name;
    this.type = type;
}

Animal.prototype.speak = function() {
    return `${this.name} (${this.type}) 说话了`;
};

const contextObj = { name: 'ignored', type: 'ignored' };

console.log('  情况1: 普通调用 - context 生效');
const BoundAnimal1 = Animal.myBind(contextObj, '小狗');
BoundAnimal1('狗');
console.log(`  contextObj 被修改: ${JSON.stringify(contextObj)}\n`);

console.log('  情况2: new 调用 - context 被忽略');
const BoundAnimal2 = Animal.myBind({ name: 'will-be-ignored' }, '小猫');
const cat = new BoundAnimal2('猫');
console.log(`  cat.name: ${cat.name}`);
console.log(`  cat.type: ${cat.type}`);
console.log(`  cat instanceof Animal: ${cat instanceof Animal}`);
console.log(`  cat.speak(): ${cat.speak()}\n`);

// --- 5.2 bind 柯里化应用 ---
console.log('--- 5.2 bind 柯里化应用：工厂模式 ---\n');

function Product(category, name, price) {
    this.category = category;
    this.name = name;
    this.price = price;
}

Product.prototype.getInfo = function() {
    return `[${this.category}] ${this.name}: ¥${this.price}`;
};

// 创建图书工厂
const BookFactory = Product.myBind(null, '图书');
const book1 = new BookFactory('JavaScript高级程序设计', 99);
const book2 = new BookFactory('你不知道的JavaScript', 79);

console.log(`  ${book1.getInfo()}`);
console.log(`  ${book2.getInfo()}`);
console.log(`  book1 instanceof Product: ${book1 instanceof Product}\n`);

// --- 5.3 简化版 vs 完整版 ---
console.log('--- 5.3 简化版 vs 完整版对比 ---\n');

function TestFunc(value) {
    this.value = value;
}

TestFunc.prototype.getValue = function() {
    return this.value;
};

console.log('  简化版（箭头函数）:');
const SimpleBound = TestFunc.myBindSimple(null, 'simple');
try {
    const obj1 = new SimpleBound();
    console.log(`    obj1.value: ${obj1.value}`);
    console.log(`    obj1 instanceof TestFunc: ${obj1 instanceof TestFunc}`);
    console.log(`    obj1.getValue(): ${obj1.getValue()}`);
} catch (e) {
    console.log(`    ✗ 错误: ${e.message}`);
}

console.log('\n  完整版（function）:');
const CompleteBound = TestFunc.myBind(null, 'complete');
const obj2 = new CompleteBound();
console.log(`    obj2.value: ${obj2.value}`);
console.log(`    obj2 instanceof TestFunc: ${obj2 instanceof TestFunc}`);
console.log(`    obj2.getValue(): ${obj2.getValue()}\n`);

// ============================================================
// 第六部分：总结
// ============================================================

console.log('【6. 总结】\n');

console.log('┌─────────┬──────────┬──────────┬────────────┬──────────┐');
console.log('│  方法   │ 执行时机 │ 参数形式 │ 支持柯里化 │ 支持 new │');
console.log('├─────────┼──────────┼──────────┼────────────┼──────────┤');
console.log('│  call   │  立即    │  列表    │     ✗      │    ✗     │');
console.log('│  apply  │  立即    │  数组    │     ✗      │    ✗     │');
console.log('│  bind   │  延迟    │  列表    │     ✓      │    ✓     │');
console.log('└─────────┴──────────┴──────────┴────────────┴──────────┘\n');

console.log('【核心要点】\n');
console.log('1. call/apply: 改变 this 并立即执行');
console.log('   - call: fn.call(obj, arg1, arg2)');
console.log('   - apply: fn.apply(obj, [arg1, arg2])\n');

console.log('2. bind: 返回新函数，延迟执行');
console.log('   - 支持柯里化: fn.bind(obj, arg1)(arg2)');
console.log('   - 支持 new: new (fn.bind(obj, arg1))\n');

console.log('3. bind 的 new 调用特性:');
console.log('   - new 调用时，绑定的 context 被忽略');
console.log('   - this 指向新创建的实例');
console.log('   - 预设的参数仍然有效（柯里化）');
console.log('   - 原型链正确继承\n');

console.log('4. 实现要点:');
console.log('   - call/apply: 临时属性法改变 this');
console.log('   - bind 简化版: 箭头函数（不支持 new）');
console.log('   - bind 完整版: function + instanceof 判断 + 原型链继承\n');

console.log('========================================');
console.log('           测试完成！');
console.log('========================================');
