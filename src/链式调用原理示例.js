// ============ 链式调用原理详解 ============

// 1. 非链式调用（普通写法）
class CalculatorNormal {
  constructor(value) {
    this.value = value;
  }

  add(num) {
    this.value += num;
    // 没有返回值，默认返回 undefined
  }

  min(num) {
    this.value -= num;
  }
}

// 使用非链式调用
const calc1 = new CalculatorNormal(0);
calc1.add(1);      // 返回 undefined
calc1.min(2);      // 返回 undefined
console.log('非链式结果:', calc1.value); // -1

// 无法链式调用，因为返回的是 undefined
// calc1.add(1).min(2); // ❌ 报错：Cannot read property 'min' of undefined


// 2. 链式调用（返回 this）
class CalculatorChain {
  constructor(value) {
    this.value = value;
  }

  add(num) {
    this.value += num;
    return this; // ✅ 关键：返回当前对象实例
  }

  min(num) {
    this.value -= num;
    return this; // ✅ 关键：返回当前对象实例
  }

  number() {
    return this.value; // 返回最终结果值
  }
}

// 使用链式调用
const calc2 = new CalculatorChain(0);
const result = calc2.add(1).min(2).number();
console.log('链式结果:', result); // -1

// 执行过程分析：
// calc2.add(1)      → 返回 calc2 对象（this）
// calc2.min(2)      → 返回 calc2 对象（this）
// calc2.number()    → 返回 -1（最终值）


// 3. 链式调用的执行流程图解
console.log('\n========== 执行流程图解 ==========');

class Calculator {
  constructor(value) {
    this.value = value;
    console.log(`1. 创建实例，初始值: ${value}`);
  }

  add(num) {
    console.log(`2. 执行 add(${num})，当前值: ${this.value} + ${num} = ${this.value + num}`);
    this.value += num;
    console.log(`   返回 this (当前对象)`);
    return this;
  }

  min(num) {
    console.log(`3. 执行 min(${num})，当前值: ${this.value} - ${num} = ${this.value - num}`);
    this.value -= num;
    console.log(`   返回 this (当前对象)`);
    return this;
  }

  mul(num) {
    console.log(`4. 执行 mul(${num})，当前值: ${this.value} * ${num} = ${this.value * num}`);
    this.value *= num;
    console.log(`   返回 this (当前对象)`);
    return this;
  }

  number() {
    console.log(`5. 执行 number()，返回最终值: ${this.value}`);
    return this.value;
  }
}

function calcu(value) {
  return new Calculator(value);
}

const finalResult = calcu(10).add(5).min(3).mul(2).number();
console.log(`\n最终结果: ${finalResult}\n`);


// 4. 链式调用的本质
console.log('========== 链式调用本质 ==========');

// 等价于：
const obj = calcu(10);    // 创建对象
const step1 = obj.add(5);  // step1 === obj (因为返回了 this)
const step2 = step1.min(3); // step2 === obj (因为返回了 this)
const step3 = step2.mul(2); // step3 === obj (因为返回了 this)
const final = step3.number(); // final 是最终的数值

console.log('obj === step1:', obj === step1); // true
console.log('step1 === step2:', step1 === step2); // true
console.log('step2 === step3:', step2 === step3); // true
console.log('最终值:', final); // 24


// 5. 常见的链式调用场景
console.log('\n========== 常见应用场景 ==========');

// jQuery 风格
class jQuery {
  constructor(selector) {
    this.elements = document.querySelectorAll(selector);
  }

  css(prop, value) {
    this.elements.forEach(el => el.style[prop] = value);
    return this; // 返回 this 支持链式调用
  }

  addClass(className) {
    this.elements.forEach(el => el.classList.add(className));
    return this; // 返回 this 支持链式调用
  }

  on(event, handler) {
    this.elements.forEach(el => el.addEventListener(event, handler));
    return this; // 返回 this 支持链式调用
  }
}

// 使用示例（伪代码）
// $('.button')
//   .css('color', 'red')
//   .addClass('active')
//   .on('click', handleClick);


// Promise 链式调用
console.log('\nPromise 链式调用:');
Promise.resolve(1)
  .then(val => {
    console.log('第一步:', val);
    return val + 1; // 返回新的 Promise
  })
  .then(val => {
    console.log('第二步:', val);
    return val * 2; // 返回新的 Promise
  })
  .then(val => {
    console.log('第三步:', val);
  });


// 数组链式调用
console.log('\n数组链式调用:');
const arr = [1, 2, 3, 4, 5];
const arrayResult = arr
  .filter(x => x > 2)    // 返回新数组
  .map(x => x * 2)       // 返回新数组
  .reduce((a, b) => a + b, 0); // 返回最终值

console.log('数组链式结果:', arrayResult); // 24


// 6. 链式调用的优缺点
console.log('\n========== 优缺点总结 ==========');
console.log(`
优点：
  ✅ 代码简洁优雅，可读性好
  ✅ 减少中间变量
  ✅ 符合流式编程风格

缺点：
  ❌ 调试困难（不容易打断点查看中间状态）
  ❌ 错误处理复杂
  ❌ 过长的链式调用影响可读性
`);
