//使用reduce方法实现myMap方法的polyfil
Array.prototype.myMap = function(callback, thisArg) {
  return this.reduce((acc, cur, index, arr) => {
    acc.push(callback.call(thisArg, cur, index, arr));
    return acc;
  }, []);
};
//测试myMap方法
const arr = [1, 2, 3, 4, 5];
const mappedArr = arr.myMap((item) => item * 2);
console.log(mappedArr); // [2, 4, 6, 8, 10]