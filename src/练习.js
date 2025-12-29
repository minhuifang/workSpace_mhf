//call方法
const MyCall = function (context, ...args) {
  context = context || window;
  context.fn = this;
  const result = context.fn(...args);
  delete context.fn;
  return result;
};

//传参是数组
const MyApply = function (context, args) {
  context = context || window;
  context.fn = this;
  const result = context.fn(...args);
  delete context.fn;
  return result;
};

const MyBind = function (context, ...args) {
  const self = this;
  const fn = function (...newArgs) {
    return self.apply(this instanceof fn ? this : context, [
      ...args,
      ...newArgs,
    ]);
  };
  if (self.prototype) {
    fn.prototype = Object.create(self.prototype);
  }
  return fn;
};

const MyPromise = function () {};

MyPromise.all = function (promises) {
   
};

MyPromise.race = function (promises) {};

MyPromise.allSettled = function (promises) {};

const curry = function (targetFn) {
  const argLength = targetFn.length;
  return function fn() {
    if (arguments.length < argLength) {
      return fn.bind(null, ...arguments);
    } else {
      return targetFn.apply(null, arguments);
    }
  };
};

const unCurry = function (fn) {
  return fn.apply(context, [...rest]);
};

const deepClone = function (obj) {
  let copyObj = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = typeof obj[key] === "object" ? deepClone(obj[key]) : obj[key];
    }
  }
  return copyObj;
};

const debounce = function (fn, time) {
  let timer = null;
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn.apply(this, args), time);
  };
};

const throttle = function (fn, time) {
  let old = new Date();
  return function (...args) {
    let now = new Date();
    if (now - old >= time) {
      fn.apply(this, args);
      old = now;
    }
  };
};

const unique = function (arr) {
  return [...new Set(arr)];
};
