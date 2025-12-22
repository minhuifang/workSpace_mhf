mhf/**
 * =====================================================
 * 防抖（Debounce）vs 节流（Throttle）
 * =====================================================
 * 
 * 【核心区别】
 * 
 * 1. 防抖（Debounce）：
 *    - 触发事件后，在 n 秒内函数只能执行一次
 *    - 如果在 n 秒内又触发了事件，则会重新计算函数执行时间
 *    - 效果：连续触发只执行最后一次
 *    - 场景：搜索框输入、窗口 resize、表单验证
 * 
 * 2. 节流（Throttle）：
 *    - 连续触发事件，但在 n 秒内只执行一次函数
 *    - 即使持续触发，也会按固定频率执行
 *    - 效果：稀释函数执行频率
 *    - 场景：滚动加载、鼠标移动、按钮点击
 * 
 * 【形象比喻】
 * - 防抖：电梯等人，有人进来就重新等待 10 秒，直到 10 秒内没人进来才关门
 * - 节流：地铁发车，每 10 分钟发一班，不管人多人少都按时发车
 */

/**
 * 防抖函数
 * 
 * 功能：
 * - 事件触发后，延迟 n 秒执行回调
 * - 如果在 n 秒内再次触发，则重新计时
 * - 只有在停止触发 n 秒后才会执行
 * 
 * 应用场景：
 * - 搜索框输入：用户停止输入后才发送请求
 * - 窗口 resize：窗口调整完成后才重新计算布局
 * - 文本编辑器自动保存：停止编辑后才保存
 * 
 * @param {Function} fn - 需要防抖的函数
 * @param {number} wait - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 * 
 * @example
 * const handleSearch = debounce((value) => {
 *   console.log('发送搜索请求:', value);
 * }, 500);
 */
function debounce(fn, wait) {
  // 定时器变量，用于存储 setTimeout 的返回值
  let timeout = null;
  
  // 返回一个新函数，这个函数会替代原函数被调用
  return function() {
    // 保存 this 上下文，因为 setTimeout 中的 this 指向 window
    let context = this;
    // 保存参数列表
    let args = arguments;
    
    // 如果已经设置了定时器，则清除之前的定时器
    // 这是防抖的核心：每次触发都重新计时
    if (timeout) clearTimeout(timeout);
    
    // 设置新的定时器
    timeout = setTimeout(() => {
      // 在指定时间后执行函数，使用 apply 绑定 this 和参数
      fn.apply(context, args);
    }, wait);
  }
}

/**
 * 节流函数
 * 
 * 功能：
 * - 通过时间戳判断是否已过等待时间
 * - 第一次触发会立即执行
 * - 持续触发时按固定间隔执行
 * 
 * 应用场景：
 * - 滚动加载：滚动时按固定频率检查是否到底部
 * - 鼠标移动：实时显示鼠标位置
 * - 拖拽操作：限制拖拽事件的触发频率
 * 
 * @param {Function} fn - 需要节流的函数
 * @param {number} wait - 时间间隔（毫秒）
 * @returns {Function} 节流后的函数
 * 
 * @example
 * window.addEventListener('scroll', throttle(() => {
 *   console.log('滚动位置:', window.scrollY);
 * }, 200));
 */
function throttle(fn, wait) {
  // 记录上一次执行的时间戳
  let pre = new Date();
  
  return function() {
    const context = this;
    const args = arguments;
    // 获取当前时间戳
    const now = new Date();
    
    // 如果当前时间与上次执行时间的差值大于等于等待时间
    // 则执行函数并更新上次执行时间
    if (now - pre >= wait) {
      fn.apply(context, args);
      pre = now;
    }
  }
}

/**
 * =====================================================
 * 使用示例
 * =====================================================
 */

// 示例1：搜索框防抖
// const handleSearch = debounce((keyword) => {
//   console.log('搜索关键词:', keyword);
// }, 500);
// searchInput.addEventListener('input', (e) => handleSearch(e.target.value));

// 示例2：滚动加载节流
// const handleScroll = throttle(() => {
//   console.log('滚动位置:', window.scrollY);
// }, 200);
// window.addEventListener('scroll', handleScroll);

module.exports = {
  debounce,
  throttle
};