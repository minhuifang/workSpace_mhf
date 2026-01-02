//1 4 7 8 2 6 5 3
//宏2 6
//微 8

const obj = {
  name: "Tom",
  age: 20,
  info: {
    hobby: ["code", "music"],
  },
};

obj.self = obj;
// 请对上面的对象实现深拷贝

const deepClone = function (obj,hash) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  let copyObj = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
        console.log('[key  ] >', key)
      copyObj[key] = typeof obj === "object" ? deepClone(obj[key]) : obj[key];
    }

  }
  return copyObj
};
const copyObj = deepClone(obj)
console.log('[ copyObj ] >', copyObj)