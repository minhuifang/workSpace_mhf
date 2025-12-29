// 找出字符串中的最长子串返回长度（无重复字符）

/**
 * 方法一：滑动窗口 + 哈希表
 * 找出字符串中最长的无重复字符子串的长度
 *
 * 算法思路：
 * 1. 使用滑动窗口，维护一个不包含重复字符的窗口
 * 2. 使用 Map 记录每个字符最后出现的位置
 * 3. 当遇到重复字符时，移动左指针到重复字符上次出现位置的下一位
 * 4. 不断更新最大长度
 *
 * 时间复杂度：O(n)，n 为字符串长度
 * 空间复杂度：O(min(m, n))，m 为字符集大小
 *
 * @param {string} s - 输入字符串
 * @return {number} - 最长无重复字符子串的长度
 */
function lengthOfLongestSubstring(s) {
  // 边界情况
  if (!s || s.length === 0) return 0;
  if (s.length === 1) return 1;

  // 使用 Map 存储字符及其最后出现的索引位置
  const charMap = new Map();

  let maxLength = 0; // 记录最长子串长度
  let left = 0; // 滑动窗口左指针

  // 遍历字符串，right 为滑动窗口右指针
  for (let right = 0; right < s.length; right++) {
    const currentChar = s[right];

    // 如果当前字符已经在窗口中出现过
    if (charMap.has(currentChar)) {
      // 移动左指针到重复字符上次出现位置的下一位
      // 注意：left 只能向右移动，不能回退
      left = Math.max(left, charMap.get(currentChar) + 1);
    }

    // 更新当前字符的最新位置
    charMap.set(currentChar, right);

    // 更新最大长度
    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}

/**
 * 方法二：滑动窗口 + Set
 * 使用 Set 来检查字符是否重复
 *
 * 时间复杂度：O(n)
 * 空间复杂度：O(min(m, n))
 *
 * @param {string} s - 输入字符串
 * @return {number} - 最长无重复字符子串的长度
 */
function lengthOfLongestSubstringV2(s) {
  if (!s || s.length === 0) return 0;

  const charSet = new Set();
  let maxLength = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const currentChar = s[right];

    // 如果遇到重复字符，移动左指针并删除字符
    while (charSet.has(currentChar)) {
      charSet.delete(s[left]);
      left++;
    }

    // 添加当前字符到集合
    charSet.add(currentChar);

    // 更新最大长度
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}

/**
 * 方法三：暴力解法（用于对比）
 * 检查所有子串，找出最长的无重复字符子串
 *
 * 时间复杂度：O(n³)
 * 空间复杂度：O(min(m, n))
 *
 * @param {string} s - 输入字符串
 * @return {number} - 最长无重复字符子串的长度
 */
function lengthOfLongestSubstringBruteForce(s) {
  if (!s || s.length === 0) return 0;

  let maxLength = 0;

  // 遍历所有可能的起始位置
  for (let i = 0; i < s.length; i++) {
    // 遍历所有可能的结束位置
    for (let j = i; j < s.length; j++) {
      // 检查子串 s[i...j] 是否包含重复字符
      if (hasUniqueChars(s, i, j)) {
        maxLength = Math.max(maxLength, j - i + 1);
      }
    }
  }

  return maxLength;
}

/**
 * 辅助函数：检查字符串的某个区间是否包含重复字符
 * @param {string} s - 字符串
 * @param {number} start - 起始索引
 * @param {number} end - 结束索引
 * @return {boolean} - 是否所有字符都唯一
 */
function hasUniqueChars(s, start, end) {
  const charSet = new Set();
  for (let i = start; i <= end; i++) {
    if (charSet.has(s[i])) {
      return false;
    }
    charSet.add(s[i]);
  }
  return true;
}

/**
 * 扩展：返回最长无重复字符子串本身（不只是长度）
 * @param {string} s - 输入字符串
 * @return {string} - 最长无重复字符子串
 */
function getLongestSubstring(s) {
  if (!s || s.length === 0) return "";

  const charMap = new Map();
  let maxLength = 0;
  let maxStart = 0; // 记录最长子串的起始位置
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const currentChar = s[right];

    if (charMap.has(currentChar)) {
      left = Math.max(left, charMap.get(currentChar) + 1);
    }

    charMap.set(currentChar, right);

    // 如果当前窗口更长，更新最大长度和起始位置
    if (right - left + 1 > maxLength) {
      maxLength = right - left + 1;
      maxStart = left;
    }
  }

  // 返回最长子串
  return s.substring(maxStart, maxStart + maxLength);
}

// 测试用例
console.log("=== 测试找出字符串中的最长无重复字符子串 ===\n");

// 测试用例 1: 包含重复字符
const test1 = "abcabcbb";
console.log(`测试 1: "${test1}"`);
console.log("方法一结果:", lengthOfLongestSubstring(test1));
console.log("方法二结果:", lengthOfLongestSubstringV2(test1));
console.log("最长子串:", getLongestSubstring(test1));
console.log('预期结果: 3 (子串 "abc")\n');

// 测试用例 2: 所有字符相同
const test2 = "bbbbb";
console.log(`测试 2: "${test2}"`);
console.log("方法一结果:", lengthOfLongestSubstring(test2));
console.log("方法二结果:", lengthOfLongestSubstringV2(test2));
console.log("最长子串:", getLongestSubstring(test2));
console.log('预期结果: 1 (子串 "b")\n');

// 测试用例 3: 无重复字符
const test3 = "pwwkew";
console.log(`测试 3: "${test3}"`);
console.log("方法一结果:", lengthOfLongestSubstring(test3));
console.log("方法二结果:", lengthOfLongestSubstringV2(test3));
console.log("最长子串:", getLongestSubstring(test3));
console.log('预期结果: 3 (子串 "wke")\n');

// 测试用例 4: 空字符串
const test4 = "";
console.log(`测试 4: "${test4}"`);
console.log("方法一结果:", lengthOfLongestSubstring(test4));
console.log("方法二结果:", lengthOfLongestSubstringV2(test4));
console.log("预期结果: 0\n");

// 测试用例 5: 单个字符
const test5 = "a";
console.log(`测试 5: "${test5}"`);
console.log("方法一结果:", lengthOfLongestSubstring(test5));
console.log("方法二结果:", lengthOfLongestSubstringV2(test5));
console.log("预期结果: 1\n");

// 测试用例 6: 复杂情况
const test6 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
console.log(`测试 6: "${test6}"`);
console.log("方法一结果:", lengthOfLongestSubstring(test6));
console.log("方法二结果:", lengthOfLongestSubstringV2(test6));
console.log("预期结果: 62 (整个字符串)\n");

// 测试用例 7: 包含空格和特殊字符
const test7 = "a b c a b c";
console.log(`测试 7: "${test7}"`);
console.log("方法一结果:", lengthOfLongestSubstring(test7));
console.log("方法二结果:", lengthOfLongestSubstringV2(test7));
console.log("最长子串:", `"${getLongestSubstring(test7)}"`);
console.log('预期结果: 3 (子串 "a b" 或 "b c")\n');

// 性能对比测试（可选）
console.log("=== 性能对比 ===");
const longString = "abcdefghijklmnopqrstuvwxyz".repeat(100);

console.time("方法一（Map）");
lengthOfLongestSubstring(longString);
console.timeEnd("方法一（Map）");

console.time("方法二（Set）");
lengthOfLongestSubstringV2(longString);
console.timeEnd("方法二（Set）");

module.exports = {
  lengthOfLongestSubstring,
  lengthOfLongestSubstringV2,
  lengthOfLongestSubstringBruteForce,
  getLongestSubstring,
};
