//call方法
const MyCall = function (context, ...args) {
  // 处理 null/undefined，使用 globalThis 兼容浏览器和 Node.js
  if (context == null) {
    context = globalThis;
  } else {
    // 将原始类型转换为对象
    context = Object(context);
  }
  
  // 使用 Symbol 避免属性名冲突
  const fn = Symbol("fn");
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

//传参是数组
const MyApply = function (context, args) {
  // 处理 null/undefined，使用 globalThis 兼容浏览器和 Node.js
  if (context == null) {
    context = globalThis;
  } else {
    // 将原始类型转换为对象
    context = Object(context);
  }
  
  // 使用 Symbol 避免属性名冲突
  const fn = Symbol("fn");
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
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
  return new MyPromise((resolve, reject) => {
    const result = [];
    let completeLength = 0;
    const total = promises.length;
    if (total === 0) {
      resolve(result); 
      return;
    }
    promises?.forEach((promise, index) => {
      MyPromise.resolve(promise).then(
        (value) => {
          completeLength++;
          result[index] = value;
          if (completeLength === total) {
            resolve(result);
          }
        },
        (err) => {
          reject(err);
        }
      );
    });
  });
};

MyPromise.race = function (promises) {
  return new MyPromise((resolve, reject) => {
    promises.forEach((promise) => {
      MyPromise.resolve(promise).then(
        (value) => {
          resolve(value);
        },
        (err) => {
          reject(err);
        }
      );
    });
  });
};

MyPromise.allSettled = function (promises) {
  return new MyPromise((resolve, reject) => {
    let results = [];
    let completeLength = 0;
    const total = promises.length;
    
    if (total === 0) {
      resolve(results);
      return;
    }
    
    promises.forEach((promise, index) => {
      MyPromise.resolve(promise).then(
        (value) => {
          completeLength++;
          results[index] = {
            status: "fulfilled",
            value: value,
          };
          if (completeLength === total) {
            resolve(results);
          }
        },
        (err) => {
          completeLength++;
          results[index] = {
            status: "rejected",
            reason: err,
          };
          if (completeLength === total) {
            resolve(results);
          }
        }
      );
    });
  });
};

const curry = function (targetFn) {
  const argLength = targetFn.length;
  return function fn(...args) {
    // 如果参数不够，继续返回函数收集参数
    if (args.length < argLength) {
      return function (...newArgs) {
        return fn(...args, ...newArgs);
      };
    } else {
      // 参数够了，执行原函数
      return targetFn(...args);
    }
  };
};

const unCurry = function (fn) {
  return function (context, ...rest) {
    return fn.apply(context, rest);
  };
};

const deepClone = function (obj, hash = new WeakMap()) {
  // 处理 null 和非对象类型
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 处理正则对象
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  let copyObj = Array.isArray(obj) ? [] : {};
  
  // 将当前对象添加到 hash 中，防止循环引用
  hash.set(obj, copyObj);
  
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      copyObj[key] =
        typeof obj[key] === "object" ? deepClone(obj[key], hash) : obj[key];
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




