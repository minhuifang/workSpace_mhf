/**
 * 方法1: 双层循环 + splice
 * 时间复杂度: O(n²)
 * 空间复杂度: O(1)
 * 注意: 会修改原数组
 *
 * @param {(number | string)[]} array
 * @returns {(number | string)[]}
 */
function unique1(array) {
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if (array[j] === array[i]) {
        array.splice(j, 1);
        j--;
      }
    }
  }
  return array;
}

/**
 * 方法2: ES6 Set
 * 时间复杂度: O(n)
 * 空间复杂度: O(n)
 * 最简洁高效的方式
 *
 * @param {(number | string)[]} array
 * @returns {(number | string)[]}
 */
function unique2(array) {
  return [...new Set(array)];
}

/**
 * 方法3: filter + indexOf
 * 时间复杂度: O(n²)
 * 空间复杂度: O(n)
 * 保留第一次出现的元素
 *
 * @param {(number | string)[]} array
 * @returns {(number | string)[]}
 */
function unique3(array) {
  return array.filter((item, index) => {
    return array.indexOf(item) === index;
  });
}

/**
 * 方法4: reduce + includes
 * 时间复杂度: O(n²)
 * 空间复杂度: O(n)
 * 使用累加器收集不重复的元素
 *
 * @param {(number | string)[]} array
 * @returns {(number | string)[]}
 */
function unique4(array) {
  return array.reduce((acc, item) => {
    if (!acc.includes(item)) {
      acc.push(item);
    }
    return acc;
  }, []);
}

/**
 * 方法5: Map
 * 时间复杂度: O(n)
 * 空间复杂度: O(n)
 * 利用 Map 的键唯一性
 *
 * @param {(number | string)[]} array
 * @returns {(number | string)[]}
 */
function unique5(array) {
  const map = new Map();
  array.forEach(item => {
    map.set(item, true);
  });
  return Array.from(map.keys());
}

/**
 * 方法6: 对象属性
 * 时间复杂度: O(n)
 * 空间复杂度: O(n)
 * 利用对象键的唯一性，需要注意类型转换问题
 *
 * @param {(number | string)[]} array
 * @returns {(number | string)[]}
 */
function unique6(array) {
  const obj = {};
  const result = [];
  array.forEach(item => {
    // 使用 typeof 区分数字和字符串，避免 1 和 '1' 被认为是同一个
    const key = typeof item + item;
    if (!obj[key]) {
      obj[key] = true;
      result.push(item);
    }
  });
  return result;
}

// 导出所有方法
module.exports = {
  unique1,
  unique2,
  unique3,
  unique4,
  unique5,
  unique6
};

 