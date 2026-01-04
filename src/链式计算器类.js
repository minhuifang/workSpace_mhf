//链式计算器类
//  calcu(0).add(1).min(2).number() // -1

class Calculator {
  constructor(value) {
    this.value = value;
  }

  add(num) {
    this.value += num;
    return this; // 返回this实现链式调用
  }

  min(num) {
    this.value -= num;
    return this; // 返回this实现链式调用
  }

  mul(num) {
    this.value *= num;
    return this; // 返回this实现链式调用
  }

  div(num) {
    this.value /= num;
    return this; // 返回this实现链式调用
  }

  number() {
    return this.value; // 返回最终结果
  }
}

function calcu(value) {
  return new Calculator(value);
}

// 测试
console.log(calcu(0).add(1).min(2).number()); // -1
console.log(calcu(10).add(5).mul(2).div(3).number()); // 10