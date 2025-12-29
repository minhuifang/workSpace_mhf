// 删除链表的倒数第二个节点

/**
 * 链表节点定义
 */
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * 删除链表的倒数第二个节点
 * 思路：使用双指针（快慢指针）法
 * 1. 创建虚拟头节点，处理边界情况
 * 2. 快指针先走 n 步（这里 n=2，即倒数第二个）
 * 3. 快慢指针同时移动，直到快指针到达末尾
 * 4. 此时慢指针指向待删除节点的前一个节点
 * 5. 删除目标节点
 * 
 * @param {ListNode} head - 链表头节点
 * @return {ListNode} - 删除节点后的链表头节点
 */
function removeSecondToLast(head) {
  // 边界情况：空链表或只有一个节点
  if (!head || !head.next) {
    return head;
  }

  // 创建虚拟头节点，简化边界处理
  const dummy = new ListNode(0);
  dummy.next = head;

  // 初始化快慢指针
  let slow = dummy;
  let fast = dummy;

  // 快指针先走 2 步（倒数第二个节点）
  // 实际上需要走 n+1 步才能让 slow 指向待删除节点的前一个节点
  for (let i = 0; i < 3; i++) {
    if (fast) {
      fast = fast.next;
    }
  }

  // 如果 fast 为 null，说明链表长度小于 2
  if (!fast) {
    return head;
  }

  // 快慢指针同时移动，直到 fast 到达末尾
  while (fast) {
    slow = slow.next;
    fast = fast.next;
  }

  // 删除倒数第二个节点
  // slow.next 是倒数第二个节点
  if (slow.next) {
    slow.next = slow.next.next;
  }

  return dummy.next;
}

/**
 * 方法二：先计算链表长度，再删除
 * @param {ListNode} head - 链表头节点
 * @return {ListNode} - 删除节点后的链表头节点
 */
function removeSecondToLastV2(head) {
  // 边界情况
  if (!head || !head.next) {
    return head;
  }

  // 计算链表长度
  let length = 0;
  let current = head;
  while (current) {
    length++;
    current = current.next;
  }

  // 如果链表长度小于 2，无法删除倒数第二个
  if (length < 2) {
    return head;
  }

  // 创建虚拟头节点
  const dummy = new ListNode(0);
  dummy.next = head;

  // 找到倒数第二个节点的前一个节点
  // 倒数第二个节点是正数第 length - 1 个节点
  // 需要移动到第 length - 2 个节点
  current = dummy;
  for (let i = 0; i < length - 2; i++) {
    current = current.next;
  }

  // 删除倒数第二个节点
  if (current.next) {
    current.next = current.next.next;
  }

  return dummy.next;
}

/**
 * 辅助函数：创建链表
 * @param {Array} arr - 数组
 * @return {ListNode} - 链表头节点
 */
function createLinkedList(arr) {
  if (!arr || arr.length === 0) return null;
  
  const dummy = new ListNode(0);
  let current = dummy;
  
  for (const val of arr) {
    current.next = new ListNode(val);
    current = current.next;
  }
  
  return dummy.next;
}

/**
 * 辅助函数：打印链表
 * @param {ListNode} head - 链表头节点
 * @return {Array} - 链表值数组
 */
function printLinkedList(head) {
  const result = [];
  let current = head;
  
  while (current) {
    result.push(current.val);
    current = current.next;
  }
  
  return result;
}

// 测试用例
console.log('=== 测试删除链表的倒数第二个节点 ===\n');

// 测试用例 1: 正常情况
const list1 = createLinkedList([1, 2, 3, 4, 5]);
console.log('测试 1 - 原链表:', printLinkedList(list1));
const result1 = removeSecondToLast(list1);
console.log('删除倒数第二个节点后:', printLinkedList(result1));
console.log('预期结果: [1, 2, 3, 5]\n');

// 测试用例 2: 只有两个节点
const list2 = createLinkedList([1, 2]);
console.log('测试 2 - 原链表:', printLinkedList(list2));
const result2 = removeSecondToLast(list2);
console.log('删除倒数第二个节点后:', printLinkedList(result2));
console.log('预期结果: [2]\n');

// 测试用例 3: 只有一个节点
const list3 = createLinkedList([1]);
console.log('测试 3 - 原链表:', printLinkedList(list3));
const result3 = removeSecondToLast(list3);
console.log('删除倒数第二个节点后:', printLinkedList(result3));
console.log('预期结果: [1]\n');

// 测试用例 4: 三个节点
const list4 = createLinkedList([1, 2, 3]);
console.log('测试 4 - 原链表:', printLinkedList(list4));
const result4 = removeSecondToLast(list4);
console.log('删除倒数第二个节点后:', printLinkedList(result4));
console.log('预期结果: [1, 3]\n');

// 测试方法二
console.log('=== 测试方法二（先计算长度）===\n');
const list5 = createLinkedList([1, 2, 3, 4, 5]);
console.log('原链表:', printLinkedList(list5));
const result5 = removeSecondToLastV2(list5);
console.log('删除倒数第二个节点后:', printLinkedList(result5));
console.log('预期结果: [1, 2, 3, 5]');

module.exports = {
  ListNode,
  removeSecondToLast,
  removeSecondToLastV2,
  createLinkedList,
  printLinkedList
};