// 将对象的值替换到字符串模板中,支持嵌套对象

/**
 * 使用正则表达式替换 ${key} 格式的模板
 * 支持嵌套对象访问，如 ${user.name}
 */
function renderTemplate(template, data) {
  /**
   * 正则表达式详解: /\$\{([^}]+)\}/g
   * 
   * \$     - 匹配 $ 符号（需要转义，因为 $ 在正则中是特殊字符，表示字符串结尾）
   * \{     - 匹配左花括号 { （需要转义）
   * (      - 开始捕获组（用于提取匹配的内容）
   * [^}]   - 字符集，匹配除了 } 之外的任意字符
   *          ^ 在 [] 中表示"非"，即排除
   * +      - 量词，表示前面的模式至少出现 1 次
   * )      - 结束捕获组
   * \}     - 匹配右花括号 } （需要转义）
   * g      - 全局标志，匹配所有符合条件的内容，而不是只匹配第一个
   * 
   * 示例匹配:
   * '${name}'           -> 捕获组得到 'name'
   * '${user.address}'   -> 捕获组得到 'user.address'
   * '${age}'            -> 捕获组得到 'age'
   */
  
  
  /**
   * String.prototype.replace() 方法详解
   * 
   * 语法: string.replace(regexp|substr, newSubstr|function)
   * 
   * 参数1: 正则表达式或字符串
   * 参数2: 替换的内容，可以是字符串或函数
   * 
   * 当参数2是函数时:
   * function(match, group1, group2, ..., offset, string)
   * - match: 匹配到的完整字符串，如 '${name}'
   * - group1: 第1个捕获组的内容，如 'name'
   * - group2: 第2个捕获组的内容（如果有）
   * - offset: 匹配到的位置索引
   * - string: 原始字符串
   * 
   * 函数返回值将替换匹配到的内容
   */
  return template.replace(/\$\{([^}]+)\}/g, (match, key) => {
    // match: 完整匹配，如 '${name}'
    // key: 捕获组内容，如 'name' 或 'user.address'
    
    // 处理嵌套对象: 'user.address' -> ['user', 'address']
    const keys = key.trim().split('.');
    let value = data;
    
    // 逐层访问对象属性
    for (const k of keys) {
      value = value?.[k]; // 可选链，防止访问 undefined 的属性
      if (value === undefined) break;
    }
    
    // 如果找到值就返回，否则保持原样
    return value !== undefined ? value : match;
  });
}

// 测试用例
const obj = {
  name: '张三',
  age: 25,
  city: '北京',
  user: {
    address: {
      province: '广东',
      city: '深圳'
    }
  }
};

console.log(renderTemplate('我叫${name}，今年${age}岁，来自${city}', obj));
// 输出: 我叫张三，今年25岁，来自北京

console.log(renderTemplate('地址: ${user.address.province}省${user.address.city}市', obj));
// 输出: 地址: 广东省深圳市

console.log(renderTemplate('姓名: ${name}, 公司: ${company}', obj));
// 输出: 姓名: 张三, 公司: ${company} (未定义的保持原样)