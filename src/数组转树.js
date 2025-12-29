// 数组转树结构

/**
 * 数组转树（最优解）
 * 使用对象 Map 在两次遍历中完成树的构建
 * 
 * 算法思路：
 * 1. 第一次遍历：创建所有节点的映射，初始化 children 数组
 * 2. 第二次遍历：根据 parentId 建立父子关系
 * 3. 清理空的 children 数组
 * 
 * 时间复杂度：O(n)
 * 空间复杂度：O(n)
 * 
 * @param {Array} arr - 扁平数组，每个元素包含 id, parentId 等字段
 * @return {Array} - 树形结构数组（根节点数组）
 */
function arrayToTree(arr) {
  if (!arr || arr.length === 0) return [];

  const map = {};
  const result = [];

  // 第一次遍历：初始化所有节点
  arr.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });

  // 第二次遍历：建立父子关系
  arr.forEach(item => {
    const node = map[item.id];
    
    if (item.parentId !== null && item.parentId !== undefined && item.parentId !== 0) {
      // 有父节点
      if (map[item.parentId]) {
        map[item.parentId].children.push(node);
      } else {
        // 父节点不存在，作为根节点
        result.push(node);
      }
    } else {
      // 根节点
      result.push(node);
    }
  });

  // 清理空 children
  const cleanTree = (nodes) => {
    nodes.forEach(node => {
      if (node.children.length === 0) {
        delete node.children;
      } else {
        cleanTree(node.children);
      }
    });
  };

  cleanTree(result);

  return result;
}

/**
 * 树转数组（最优解）
 * 使用递归深度优先遍历将树结构扁平化
 * 
 * 时间复杂度：O(n)
 * 空间复杂度：O(n)
 * 
 * @param {Array} tree - 树形结构数组
 * @param {number|null} parentId - 父节点 ID
 * @return {Array} - 扁平数组
 */
function treeToArray(tree, parentId = null) {
  if (!tree || tree.length === 0) return [];

  const result = [];

  tree.forEach(node => {
    // 添加当前节点
    const item = { ...node, parentId };
    delete item.children;
    result.push(item);

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      result.push(...treeToArray(node.children, node.id));
    }
  });

  return result;
}


/**
 * 辅助函数：打印树结构
 * @param {Array} tree - 树形结构
 * @param {number} level - 当前层级
 */
function printTree(tree, level = 0) {
  tree.forEach(node => {
    const indent = '  '.repeat(level);
    console.log(`${indent}├─ ${node.name || node.id} (id: ${node.id})`);
    
    if (node.children && node.children.length > 0) {
      printTree(node.children, level + 1);
    }
  });
}

// 测试数据
const flatArray = [
  { id: 1, name: '部门1', parentId: null },
  { id: 2, name: '部门1-1', parentId: 1 },
  { id: 3, name: '部门1-2', parentId: 1 },
  { id: 4, name: '部门1-1-1', parentId: 2 },
  { id: 5, name: '部门1-1-2', parentId: 2 },
  { id: 6, name: '部门2', parentId: null },
  { id: 7, name: '部门2-1', parentId: 6 },
  { id: 8, name: '部门2-1-1', parentId: 7 },
  { id: 9, name: '部门3', parentId: null }
];

console.log('=== 测试数组转树 ===\n');

const tree = arrayToTree(flatArray);
console.log('树形结构：');
console.log(JSON.stringify(tree, null, 2));
console.log('\n树形可视化：');
printTree(tree);

console.log('\n' + '='.repeat(50) + '\n');

console.log('=== 测试树转数组 ===\n');
const backToArray = treeToArray(tree);
console.log('扁平化后的数组：');
console.log(backToArray);

console.log('\n' + '='.repeat(50) + '\n');

// 测试边界情况
console.log('=== 测试边界情况 ===\n');

console.log('1. 空数组:', arrayToTree([]));
console.log('2. 单个节点:', arrayToTree([{ id: 1, name: '根节点', parentId: null }]));

// 乱序数组（子节点在父节点前面）
const unorderedArray = [
  { id: 4, name: '部门1-1-1', parentId: 2 },
  { id: 2, name: '部门1-1', parentId: 1 },
  { id: 1, name: '部门1', parentId: null },
  { id: 3, name: '部门1-2', parentId: 1 }
];
console.log('3. 乱序数组:');
console.log(JSON.stringify(arrayToTree(unorderedArray), null, 2));

module.exports = {
  arrayToTree,
  treeToArray,
  printTree
};


