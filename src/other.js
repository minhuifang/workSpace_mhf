// ==================== 对象扁平化（Object Flatten）====================

/**
 * 【题目描述】
 * 将嵌套对象转换为扁平化对象，用点号连接路径
 * 
 * 输入：
 * {
 *   a: {
 *     b: {
 *       c: {
 *         dd: 'abcdd'
 *       }
 *     },
 *     d: {
 *       xx: 'adxx'
 *     },
 *     e: 'ae'
 *   }
 * }
 * 
 * 输出：
 * {
 *   'a.b.c.dd': 'abcdd',
 *   'a.d.xx': 'adxx',
 *   'a.e': 'ae'
 * }
 */

// 测试数据
var input = {
  a: {
    b: {
      c: {
        dd: 'abcdd'
      }
    },
    d: {
      xx: 'adxx'
    },
    e: 'ae'
  }
};

/**
 * 方法1：递归实现（深度优先遍历）
 * 
 * 【核心思想】
 * 1. 遍历对象的每个属性
 * 2. 如果值是对象，递归处理
 * 3. 如果值不是对象，将路径和值存入结果
 * 
 * @param {Object} obj - 需要扁平化的对象
 * @param {string} prefix - 当前路径前缀
 * @param {Object} result - 结果对象
 * @returns {Object} 扁平化后的对象
 * 
 * 时间复杂度：O(n)，n 是对象中所有键值对的总数
 * 空间复杂度：O(d)，d 是对象的最大嵌套深度（递归调用栈）
 */
function flattenObject(obj, prefix = '', result = {}) {
  // 遍历对象的每个属性
  for (let key in obj) {
    // 只处理对象自身的属性（不包括原型链上的）
    if (obj.hasOwnProperty(key)) {
      // 构建当前的完整路径
      // 如果有前缀，用点号连接；否则直接使用 key
      const fullPath = prefix ? `${prefix}.${key}` : key;
      
      // 判断当前值是否为对象（且不为 null）
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // 如果是对象，递归处理
        flattenObject(obj[key], fullPath, result);
      } else {
        // 如果不是对象，直接存入结果
        result[fullPath] = obj[key];
      }
    }
  }
  
  return result;
}

console.log('方法1 - 递归实现：');
console.log(flattenObject(input));

/**
 * 方法2：迭代实现（使用栈）
 * 
 * 【核心思想】
 * 使用栈来模拟递归过程，避免递归调用栈溢出
 * 
 * @param {Object} obj - 需要扁平化的对象
 * @returns {Object} 扁平化后的对象
 */
function flattenObject2(obj) {
  const result = {};
  // 栈中存储 [当前对象, 路径前缀]
  const stack = [[obj, '']];
  
  while (stack.length > 0) {
    const [currentObj, prefix] = stack.pop();
    
    for (let key in currentObj) {
      if (currentObj.hasOwnProperty(key)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        const value = currentObj[key];
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // 是对象，压入栈中继续处理
          stack.push([value, fullPath]);
        } else {
          // 不是对象，直接存入结果
          result[fullPath] = value;
        }
      }
    }
  }
  
  return result;
}

console.log('\n方法2 - 迭代实现：');
console.log(flattenObject2(input));

/**
 * 方法3：使用 reduce 实现（函数式编程风格）
 * 
 * @param {Object} obj - 需要扁平化的对象
 * @param {string} prefix - 当前路径前缀
 * @returns {Object} 扁平化后的对象
 */
function flattenObject3(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 递归处理对象，合并结果
      return { ...acc, ...flattenObject3(value, fullPath) };
    } else {
      // 直接添加到结果中
      return { ...acc, [fullPath]: value };
    }
  }, {});
}

console.log('\n方法3 - reduce 实现：');
console.log(flattenObject3(input));

// ==================== 详细执行过程图解 ====================

/**
 * 【执行过程图解】
 * 以 input 对象为例，展示递归过程
 * 
 * 初始调用：flattenObject(input, '', {})
 * 
 * ========== 第1层递归 ==========
 * 当前对象：{ a: { b: {...}, d: {...}, e: 'ae' } }
 * prefix: ''
 * 
 * 遍历 key = 'a'：
 *   fullPath = 'a'
 *   value = { b: {...}, d: {...}, e: 'ae' }
 *   是对象 → 递归调用 flattenObject(value, 'a', result)
 * 
 * 
 * ========== 第2层递归 ==========
 * 当前对象：{ b: { c: {...} }, d: { xx: 'adxx' }, e: 'ae' }
 * prefix: 'a'
 * 
 * 遍历 key = 'b'：
 *   fullPath = 'a.b'
 *   value = { c: { dd: 'abcdd' } }
 *   是对象 → 递归调用 flattenObject(value, 'a.b', result)
 * 
 * 遍历 key = 'd'：
 *   fullPath = 'a.d'
 *   value = { xx: 'adxx' }
 *   是对象 → 递归调用 flattenObject(value, 'a.d', result)
 * 
 * 遍历 key = 'e'：
 *   fullPath = 'a.e'
 *   value = 'ae'
 *   不是对象 → result['a.e'] = 'ae' ✓
 * 
 * 
 * ========== 第3层递归（处理 b）==========
 * 当前对象：{ c: { dd: 'abcdd' } }
 * prefix: 'a.b'
 * 
 * 遍历 key = 'c'：
 *   fullPath = 'a.b.c'
 *   value = { dd: 'abcdd' }
 *   是对象 → 递归调用 flattenObject(value, 'a.b.c', result)
 * 
 * 
 * ========== 第4层递归（处理 c）==========
 * 当前对象：{ dd: 'abcdd' }
 * prefix: 'a.b.c'
 * 
 * 遍历 key = 'dd'：
 *   fullPath = 'a.b.c.dd'
 *   value = 'abcdd'
 *   不是对象 → result['a.b.c.dd'] = 'abcdd' ✓
 * 
 * 
 * ========== 第3层递归（处理 d）==========
 * 当前对象：{ xx: 'adxx' }
 * prefix: 'a.d'
 * 
 * 遍历 key = 'xx'：
 *   fullPath = 'a.d.xx'
 *   value = 'adxx'
 *   不是对象 → result['a.d.xx'] = 'adxx' ✓
 * 
 * 
 * ========== 最终结果 ==========
 * {
 *   'a.b.c.dd': 'abcdd',
 *   'a.d.xx': 'adxx',
 *   'a.e': 'ae'
 * }
 */

// ==================== 处理特殊情况 ====================

/**
 * 方法4：增强版 - 处理数组、null、undefined 等特殊情况
 * 
 * @param {Object} obj - 需要扁平化的对象
 * @param {string} prefix - 当前路径前缀
 * @param {Object} result - 结果对象
 * @returns {Object} 扁平化后的对象
 */
function flattenObjectAdvanced(obj, prefix = '', result = {}) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      
      // 处理 null
      if (value === null) {
        result[fullPath] = null;
      }
      // 处理 undefined
      else if (value === undefined) {
        result[fullPath] = undefined;
      }
      // 处理数组
      else if (Array.isArray(value)) {
        // 可以选择保留数组，或者继续展开数组
        result[fullPath] = value;
        // 如果要展开数组，可以这样：
        // value.forEach((item, index) => {
        //   flattenObjectAdvanced({ [index]: item }, fullPath, result);
        // });
      }
      // 处理对象
      else if (typeof value === 'object') {
        flattenObjectAdvanced(value, fullPath, result);
      }
      // 处理基本类型
      else {
        result[fullPath] = value;
      }
    }
  }
  
  return result;
}

console.log('\n方法4 - 处理特殊情况：');
const complexInput = {
  a: {
    b: 'ab',
    c: null,
    d: undefined,
    e: [1, 2, 3],
    f: {
      g: 'afg'
    }
  },
  x: 123,
  y: true
};
console.log(flattenObjectAdvanced(complexInput));

// ==================== 反向操作：将扁平化对象还原 ====================

/**
 * 反向操作：将扁平化的对象还原为嵌套对象
 * 
 * @param {Object} flatObj - 扁平化的对象
 * @returns {Object} 嵌套对象
 */
function unflattenObject(flatObj) {
  const result = {};
  
  for (let key in flatObj) {
    if (flatObj.hasOwnProperty(key)) {
      const keys = key.split('.');
      let current = result;
      
      // 遍历路径，创建嵌套结构
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!current[k]) {
          current[k] = {};
        }
        current = current[k];
      }
      
      // 设置最终的值
      current[keys[keys.length - 1]] = flatObj[key];
    }
  }
  
  return result;
}

console.log('\n反向操作 - 还原嵌套对象：');
const flattened = flattenObject(input);
console.log('扁平化：', flattened);
const restored = unflattenObject(flattened);
console.log('还原：', restored);

// ==================== 测试用例 ====================

console.log('\n========== 测试用例 ==========');

const testCases = [
  {
    name: '简单嵌套',
    input: { a: { b: 'ab' } },
    expected: { 'a.b': 'ab' }
  },
  {
    name: '多层嵌套',
    input: { a: { b: { c: { d: 'abcd' } } } },
    expected: { 'a.b.c.d': 'abcd' }
  },
  {
    name: '同级多个属性',
    input: { a: { b: 'ab', c: 'ac' }, d: 'ad' },
    expected: { 'a.b': 'ab', 'a.c': 'ac', 'd': 'ad' }
  },
  {
    name: '包含数字',
    input: { a: { b: 123 } },
    expected: { 'a.b': 123 }
  },
  {
    name: '包含布尔值',
    input: { a: { b: true, c: false } },
    expected: { 'a.b': true, 'a.c': false }
  }
];

testCases.forEach(({ name, input, expected }) => {
  const result = flattenObject(input);
  const passed = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`${passed ? '✓' : '✗'} ${name}:`, result);
});

// ==================== 应用场景 ====================

/**
 * 【应用场景】
 * 
 * 1. 表单数据处理
 *    - 将嵌套的表单数据转换为扁平结构，方便提交
 * 
 * 2. 配置文件处理
 *    - 将层级配置转换为点号路径，方便访问
 * 
 * 3. 数据库查询
 *    - MongoDB 的查询条件需要使用点号路径
 * 
 * 4. 日志记录
 *    - 将复杂对象扁平化，方便日志分析
 * 
 * 5. API 数据转换
 *    - 前后端数据格式转换
 * 
 * 6. 对象比较
 *    - 扁平化后更容易比较两个对象的差异
 */

/**
 * 【复杂度分析】
 * 
 * 时间复杂度：O(n)
 * - n 是对象中所有键值对的总数
 * - 需要遍历每个键值对一次
 * 
 * 空间复杂度：O(d + n)
 * - d 是对象的最大嵌套深度（递归调用栈）
 * - n 是结果对象的大小
 * 
 * 迭代版本的空间复杂度：O(n)
 * - 不需要递归调用栈
 * - 只需要结果对象和工作栈
 */
