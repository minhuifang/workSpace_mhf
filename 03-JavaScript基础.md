# JavaScript 基础

> JavaScript 核心概念：事件循环、数组方法、闭包、原型链等

## 目录

- [事件循环机制](#事件循环机制)
- [数组方法详解](#数组方法详解)
- [数组操作性能对比](#数组操作性能对比)
- [闭包应用场景](#闭包应用场景)
- [原型链机制](#原型链机制)
- [跨标签页通信](#跨标签页通信)

---

## 事件循环机制

### 同步任务、异步任务的机制

#### 事件循环（Event Loop）

**执行顺序：**

1. 执行同步代码
2. 执行微任务（Promise.then）
3. 执行宏任务（setTimeout）
4. 重复 2-3

**任务分类：**
- **宏任务**：setTimeout、setInterval、I/O、script
- **微任务**：Promise.then、async/await、MutationObserver

**示例：**


console.log('1');           // 同步

setTimeout(() => {
  console.log('2');         // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3');         // 微任务
});

console.log('4');           // 同步

// 输出：1 → 4 → 3 → 2


---

## 数组方法详解

### 数组有哪些方法？map 和 forEach 的区别

#### 🔴 改变原数组的方法（Mutating Methods）

**1. 添加/删除元素**
- `push()` - 在末尾添加元素
- `pop()` - 删除末尾元素
- `unshift()` - 在开头添加元素
- `shift()` - 删除开头元素
- `splice()` - 添加/删除/替换元素

**2. 排序/反转**
- `sort()` - 排序数组
- `reverse()` - 反转数组

**3. 填充**
- `fill()` - 填充数组
- `copyWithin()` - 复制数组的一部分到另一位置

#### 🟢 不改变原数组的方法（Non-Mutating Methods）

**1. 遍历方法**
- `forEach()` - 遍历数组
- `map()` - 映射新数组
- `filter()` - 过滤数组
- `reduce()` / `reduceRight()` - 累加器
- `every()` - 检查是否所有元素满足条件
- `some()` - 检查是否有元素满足条件
- `find()` / `findIndex()` - 查找元素/索引
- `findLast()` / `findLastIndex()` - 从后查找（ES2023）

**2. 查找/检测**
- `indexOf()` / `lastIndexOf()` - 查找索引
- `includes()` - 是否包含某元素

**3. 连接/切片**
- `concat()` - 连接数组
- `slice()` - 切片数组
- `join()` - 转换为字符串

**4. ES6+ 新增**
- `flat()` - 扁平化数组
- `flatMap()` - map + flat
- `toSorted()` - 返回排序后的新数组（ES2023）
- `toReversed()` - 返回反转后的新数组（ES2023）
- `toSpliced()` - 返回splice后的新数组（ES2023）
- `with()` - 返回替换指定索引后的新数组（ES2023）
- `at()` - 获取指定索引元素（支持负索引）

**5. 其他**
- `toString()` / `toLocaleString()` - 转换为字符串
- `entries()` / `keys()` / `values()` - 返回迭代器

#### 示例代码


// ❌ 改变原数组
const arr1 = [1, 2, 3];
arr1.push(4);        // arr1 = [1, 2, 3, 4]
arr1.pop();          // arr1 = [1, 2, 3]
arr1.sort();         // arr1 被排序
arr1.reverse();      // arr1 被反转
arr1.splice(1, 1);   // arr1 = [1, 3]

// ✅ 不改变原数组
const arr2 = [1, 2, 3];
const newArr1 = arr2.map(x => x * 2);    // arr2 不变，newArr1 = [2, 4, 6]
const newArr2 = arr2.filter(x => x > 1); // arr2 不变，newArr2 = [2, 3]
const newArr3 = arr2.concat([4, 5]);     // arr2 不变，newArr3 = [1, 2, 3, 4, 5]
const newArr4 = arr2.slice(1, 2);        // arr2 不变，newArr4 = [2]

// ES2023 新增的不改变原数组的方法
const arr3 = [3, 1, 2];
const sorted = arr3.toSorted();          // arr3 不变，sorted = [1, 2, 3]
const reversed = arr3.toReversed();      // arr3 不变，reversed = [2, 1, 3]
const spliced = arr3.toSpliced(1, 1);    // arr3 不变，spliced = [3, 2]
const replaced = arr3.with(0, 99);       // arr3 不变，replaced = [99, 1, 2]


#### map vs forEach

| 特性 | forEach | map |
|------|---------|-----|
| **返回值** | undefined | 新数组 |
| **链式调用** | 不支持 | 支持 |
| **使用场景** | 遍历、执行副作用 | 转换数组 |
| **性能** | 略快（无返回值） | 略慢（创建新数组） |

**示例：**


const arr = [1, 2, 3];

// forEach：无返回值
arr.forEach(item => console.log(item));

// map：返回新数组
const doubled = arr.map(item => item * 2); // [2, 4, 6]


---

## 数组操作性能对比

### map、forEach、for 循环的区别，以及性能对比

#### 对比表格

| 特性 | for 循环 | forEach | map |
|------|---------|---------|-----|
| **性能** | 最快 | 中等 | 最慢 |
| **可读性** | 较差 | 好 | 最好 |
| **中断循环** | 支持（break/continue） | 不支持 | 不支持 |
| **返回值** | 无 | undefined | 新数组 |
| **使用场景** | 性能要求高 | 简单遍历 | 数据转换 |

#### 性能对比


const arr = new Array(1000000).fill(1);

// 1. for 循环 - 最快
console.time('for');
for (let i = 0; i < arr.length; i++) {
  arr[i] * 2;
}
console.timeEnd('for'); // ~3ms

// 2. forEach - 中等
console.time('forEach');
arr.forEach(item => item * 2);
console.timeEnd('forEach'); // ~15ms

// 3. map - 最慢（需要创建新数组）
console.time('map');
arr.map(item => item * 2);
console.timeEnd('map'); // ~30ms


#### 性能排序

**for 循环 > forEach > map**

**原因：**
- `for` 循环：直接操作索引，无函数调用开销
- `forEach`：每次迭代都要调用回调函数
- `map`：不仅要调用回调，还要创建新数组

#### 使用建议

- **需要高性能**：使用 `for` 循环
- **需要中断循环**：使用 `for` 循环（break/continue）
- **简单遍历**：使用 `forEach`
- **数据转换**：使用 `map`

---

### 一个数组从前面删除一个元素性能好，还是从后面删除一个元素性能好？

#### 答案：从后面删除性能更好

#### 原因分析

**从后面删除（pop）：**


const arr = [1, 2, 3, 4, 5];
arr.pop(); // [1, 2, 3, 4]
// 时间复杂度：O(1)


- 只需要删除最后一个元素
- 不需要移动其他元素
- 直接修改数组长度

**从前面删除（shift）：**


const arr = [1, 2, 3, 4, 5];
arr.shift(); // [2, 3, 4, 5]
// 时间复杂度：O(n)


- 删除第一个元素后
- 需要将所有后续元素向前移动一位
- 涉及大量内存操作

#### 性能对比


// 测试数组
const arr1 = new Array(100000).fill(1);
const arr2 = [...arr1];

// 从后面删除
console.time('pop');
for (let i = 0; i < 10000; i++) {
  arr1.pop();
}
console.timeEnd('pop'); // ~1ms

// 从前面删除
console.time('shift');
for (let i = 0; i < 10000; i++) {
  arr2.shift();
}
console.timeEnd('shift'); // ~500ms


#### 性能排序

**pop（从后删除）>> shift（从前删除）**

**差距可达 500 倍以上！**

#### 优化建议

如果需要频繁从前面删除元素，考虑：
1. 使用链表数据结构
2. 使用队列（Queue）
3. 反转数组，从后面删除

---

## 闭包应用场景

### 闭包的作用，实际开发使用到的一些场景

#### 什么是闭包？

**闭包**：函数能够访问其外部作用域的变量，即使外部函数已经执行完毕。


function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  };
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3


#### 闭包的作用

1. **数据私有化**：创建私有变量
2. **保持状态**：在函数调用之间保持数据
3. **模块化**：创建独立的作用域
4. **延长变量生命周期**

#### 实际开发场景

**1. 数据私有化和封装**


function createPerson(name) {
  let _age = 0; // 私有变量
  
  return {
    getName() {
      return name;
    },
    getAge() {
      return _age;
    },
    setAge(age) {
      if (age > 0 && age < 150) {
        _age = age;
      }
    }
  };
}

const person = createPerson('张三');
person.setAge(25);
console.log(person.getAge()); // 25
console.log(person._age); // undefined - 无法直接访问


**2. 防抖和节流**


// 防抖
function debounce(fn, delay) {
  let timer = null; // 闭包保存 timer
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 使用
const handleSearch = debounce((keyword) => {
  console.log('搜索:', keyword);
}, 500);


**3. 柯里化函数**


function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// 使用
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6


**4. 单例模式**


const Singleton = (function() {
  let instance = null; // 闭包保存实例
  
  return function() {
    if (!instance) {
      instance = {
        name: 'Singleton',
        getData() {
          return this.name;
        }
      };
    }
    return instance;
  };
})();

const s1 = new Singleton();
const s2 = new Singleton();
console.log(s1 === s2); // true


**5. 计数器和缓存**


// 计数器
function createCounter() {
  let count = 0;
  
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

// 缓存
function memoize(fn) {
  const cache = {}; // 闭包保存缓存
  
  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      return cache[key];
    }
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}


**6. React Hooks 中的闭包**


function Counter() {
  const [count, setCount] = useState(0);
  
  // 闭包：handleClick 捕获了 count 的值
  const handleClick = () => {
    console.log('当前 count:', count);
    setCount(count + 1);
  };
  
  return <button onClick={handleClick}>{count}</button>;
}


**7. 事件监听器**


function setupButtons() {
  const buttons = document.querySelectorAll('button');
  
  buttons.forEach((button, index) => {
    // 闭包：每个按钮都保存了自己的 index
    button.addEventListener('click', () => {
      console.log(`按钮 ${index} 被点击`);
    });
  });
}


#### 闭包的注意事项

**1. 内存泄漏**


// ❌ 可能导致内存泄漏
function createLeak() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    console.log(largeData[0]); // 持有大数组的引用
  };
}

// ✅ 及时清理
function createNoLeak() {
  let largeData = new Array(1000000).fill('data');
  const firstItem = largeData[0];
  largeData = null; // 释放引用
  
  return function() {
    console.log(firstItem);
  };
}


**2. 循环中的闭包陷阱**


// ❌ 错误：所有函数共享同一个 i
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 3, 3, 3
  }, 100);
}

// ✅ 方案1：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 0, 1, 2
  }, 100);
}

// ✅ 方案2：使用 IIFE
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => {
      console.log(j); // 0, 1, 2
    }, 100);
  })(i);
}


---

## 原型链机制

### 原型链的使用

#### 原型链基础


function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log('Hello, ' + this.name);
};

const p = new Person('张三');


#### 原型链关系图


p (实例)
  ↓ __proto__
Person.prototype (原型对象)
  ↓ __proto__
Object.prototype (顶层原型)
  ↓ __proto__
null


#### 原型链访问方式


// 1. 实例的原型
p.__proto__                    // Person.prototype
Object.getPrototypeOf(p)       // Person.prototype (推荐)

// 2. 原型的原型
Person.prototype.__proto__     // Object.prototype
p.__proto__.__proto__          // Object.prototype

// 3. 构造函数
p.__proto__.constructor        // Person
Person.prototype.constructor   // Person
p.constructor                  // Person

// 4. 构造函数的原型
p.__proto__.constructor.prototype                    // Person.prototype
Person.prototype.constructor.prototype               // Person.prototype
p.__proto__.constructor.prototype.__proto__          // Object.prototype
Person.prototype.constructor.prototype.__proto__     // Object.prototype

// 5. 顶层
Object.prototype.__proto__     // null


#### 原型链查找规则


function Person(name) {
  this.name = name;
}

Person.prototype.age = 18;
Object.prototype.gender = 'male';

const p = new Person('张三');

console.log(p.name);    // '张三' - 在实例上找到
console.log(p.age);     // 18 - 在 Person.prototype 上找到
console.log(p.gender);  // 'male' - 在 Object.prototype 上找到
console.log(p.hobby);   // undefined - 整个原型链都没找到


**查找顺序：**
1. 实例本身
2. 实例的原型（`Person.prototype`）
3. 原型的原型（`Object.prototype`）
4. 返回 `undefined`

#### 实际应用

**1. 继承**


// 父类
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(this.name + ' is eating');
};

// 子类
function Dog(name, breed) {
  Animal.call(this, name); // 继承属性
  this.breed = breed;
}

// 继承方法
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log('Woof!');
};

const dog = new Dog('旺财', '哈士奇');
dog.eat();  // '旺财 is eating'
dog.bark(); // 'Woof!'


**2. 方法共享**


// ❌ 每个实例都创建新函数（浪费内存）
function Person(name) {
  this.name = name;
  this.sayHello = function() {
    console.log('Hello, ' + this.name);
  };
}

// ✅ 所有实例共享同一个函数
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log('Hello, ' + this.name);
};


**3. 判断原型关系**


// instanceof
p instanceof Person        // true
p instanceof Object        // true

// isPrototypeOf
Person.prototype.isPrototypeOf(p)  // true
Object.prototype.isPrototypeOf(p)  // true

// hasOwnProperty
p.hasOwnProperty('name')   // true
p.hasOwnProperty('age')    // false


---

## 跨标签页通信

### 不同 Tab 页面之间实现交互的方式

在浏览器中，不同的标签页（Tab）之间可以通过多种方式进行通信和数据交互。以下是常用的几种方式：

#### 1. LocalStorage + storage 事件

**原理：** 当一个标签页修改 `localStorage` 时，其他标签页会触发 `storage` 事件。

**特点：**
- ✅ 简单易用，兼容性好
- ✅ 同源策略下可用
- ❌ 只能传递字符串（需要序列化）
- ❌ 修改页面本身不会触发 storage 事件

**示例代码：**

```javascript
// 标签页 A：发送消息
localStorage.setItem('message', JSON.stringify({
  type: 'greeting',
  data: 'Hello from Tab A',
  timestamp: Date.now()
}));

// 标签页 B：接收消息
window.addEventListener('storage', (e) => {
  if (e.key === 'message') {
    const message = JSON.parse(e.newValue);
    console.log('收到消息:', message);
  }
});
```

#### 2. BroadcastChannel API

**原理：** 创建一个命名频道，所有订阅该频道的标签页都能收到消息。

**特点：**
- ✅ 专为跨标签页通信设计
- ✅ API 简洁，支持任意类型数据
- ✅ 同源策略下可用
- ❌ 兼容性较差（IE 不支持）

**示例代码：**

```javascript
// 标签页 A：创建频道并发送消息
const channel = new BroadcastChannel('my_channel');
channel.postMessage({
  type: 'greeting',
  data: 'Hello from Tab A'
});

// 标签页 B：监听消息
const channel = new BroadcastChannel('my_channel');
channel.onmessage = (e) => {
  console.log('收到消息:', e.data);
};

// 关闭频道
channel.close();
```

#### 3. SharedWorker

**原理：** 创建一个共享的 Worker 线程，多个标签页可以连接到同一个 Worker。

**特点：**
- ✅ 可以实现复杂的通信逻辑
- ✅ 支持双向通信
- ✅ 同源策略下可用
- ❌ 兼容性差（Safari 不支持）
- ❌ 调试困难

**示例代码：**

```javascript
// shared-worker.js
const connections = [];

onconnect = (e) => {
  const port = e.ports[0];
  connections.push(port);
  
  port.onmessage = (e) => {
    // 广播给所有连接
    connections.forEach(conn => {
      conn.postMessage(e.data);
    });
  };
};

// 标签页 A 和 B：连接到 SharedWorker
const worker = new SharedWorker('shared-worker.js');

// 发送消息
worker.port.postMessage('Hello');

// 接收消息
worker.port.onmessage = (e) => {
  console.log('收到消息:', e.data);
};

worker.port.start();
```

#### 4. Service Worker + postMessage

**原理：** 利用 Service Worker 作为中间层，转发不同标签页之间的消息。

**特点：**
- ✅ 功能强大，可以实现离线缓存等功能
- ✅ 支持复杂的通信场景
- ❌ 需要 HTTPS 环境
- ❌ 配置复杂

**示例代码：**

```javascript
// service-worker.js
self.addEventListener('message', (e) => {
  // 广播给所有客户端
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(e.data);
    });
  });
});

// 标签页：注册 Service Worker
navigator.serviceWorker.register('/sw.js');

// 发送消息
navigator.serviceWorker.controller.postMessage('Hello');

// 接收消息
navigator.serviceWorker.addEventListener('message', (e) => {
  console.log('收到消息:', e.data);
});
```

#### 5. WebSocket

**原理：** 通过服务器中转，实现不同标签页之间的通信。

**特点：**
- ✅ 支持跨域通信
- ✅ 实时性强
- ✅ 支持服务器主动推送
- ❌ 需要服务器支持
- ❌ 维护成本高

**示例代码：**

```javascript
// 标签页 A 和 B：连接到 WebSocket 服务器
const ws = new WebSocket('ws://localhost:8080');

// 发送消息
ws.send(JSON.stringify({
  type: 'message',
  data: 'Hello'
}));

// 接收消息
ws.onmessage = (e) => {
  const message = JSON.parse(e.data);
  console.log('收到消息:', message);
};
```

#### 6. Cookie + 轮询

**原理：** 一个标签页修改 Cookie，其他标签页通过定时轮询检测 Cookie 变化。

**特点：**
- ✅ 兼容性极好
- ❌ 性能差（需要轮询）
- ❌ 数据大小受限（4KB）
- ❌ 不推荐使用

**示例代码：**

```javascript
// 标签页 A：写入 Cookie
document.cookie = `message=${JSON.stringify({ data: 'Hello' })}`;

// 标签页 B：轮询检测
let lastMessage = '';
setInterval(() => {
  const message = document.cookie
    .split('; ')
    .find(row => row.startsWith('message='))
    ?.split('=')[1];
  
  if (message && message !== lastMessage) {
    lastMessage = message;
    console.log('收到消息:', JSON.parse(message));
  }
}, 1000);
```

#### 7. window.open + postMessage

**原理：** 通过 `window.open` 打开的窗口可以通过 `postMessage` 进行通信。

**特点：**
- ✅ 支持跨域通信
- ✅ 安全性高（需要显式指定目标源）
- ❌ 只能用于有父子关系的窗口
- ❌ 需要获取窗口引用

**示例代码：**

```javascript
// 父窗口：打开子窗口
const childWindow = window.open('https://example.com');

// 发送消息给子窗口
childWindow.postMessage('Hello', 'https://example.com');

// 接收子窗口消息
window.addEventListener('message', (e) => {
  if (e.origin === 'https://example.com') {
    console.log('收到消息:', e.data);
  }
});

// 子窗口：发送消息给父窗口
window.opener.postMessage('Hello Parent', 'https://parent.com');
```

#### 8. IndexedDB + 轮询

**原理：** 类似于 Cookie 轮询，但使用 IndexedDB 存储更大的数据。

**特点：**
- ✅ 可以存储大量数据
- ✅ 支持复杂数据类型
- ❌ 性能差（需要轮询）
- ❌ API 复杂

#### 方案对比

| 方案 | 实时性 | 兼容性 | 复杂度 | 推荐度 | 使用场景 |
|------|--------|--------|--------|--------|----------|
| **LocalStorage + storage** | 高 | ⭐⭐⭐⭐⭐ | 低 | ⭐⭐⭐⭐⭐ | 简单的同源通信 |
| **BroadcastChannel** | 高 | ⭐⭐⭐ | 低 | ⭐⭐⭐⭐⭐ | 现代浏览器同源通信 |
| **SharedWorker** | 高 | ⭐⭐ | 中 | ⭐⭐⭐ | 复杂的同源通信 |
| **Service Worker** | 高 | ⭐⭐⭐⭐ | 高 | ⭐⭐⭐ | PWA 应用 |
| **WebSocket** | 高 | ⭐⭐⭐⭐⭐ | 高 | ⭐⭐⭐⭐ | 跨域实时通信 |
| **Cookie + 轮询** | 低 | ⭐⭐⭐⭐⭐ | 低 | ⭐ | 不推荐 |
| **window.open + postMessage** | 高 | ⭐⭐⭐⭐⭐ | 低 | ⭐⭐⭐⭐ | 跨域父子窗口通信 |
| **IndexedDB + 轮询** | 低 | ⭐⭐⭐⭐ | 高 | ⭐ | 不推荐 |

#### 最佳实践

**1. 同源通信（推荐方案）：**
- 首选：`BroadcastChannel`（现代浏览器）
- 备选：`LocalStorage + storage 事件`（兼容性好）

**2. 跨域通信（推荐方案）：**
- 首选：`WebSocket`（需要服务器支持）
- 备选：`window.open + postMessage`（父子窗口）

**3. 实际应用示例：**

```javascript
// 封装一个通用的跨标签页通信工具
class TabMessenger {
  constructor() {
    // 优先使用 BroadcastChannel
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('tab_messenger');
      this.channel.onmessage = (e) => this.handleMessage(e.data);
    } else {
      // 降级到 localStorage
      window.addEventListener('storage', (e) => {
        if (e.key === 'tab_message') {
          this.handleMessage(JSON.parse(e.newValue));
        }
      });
    }
    
    this.listeners = [];
  }
  
  // 发送消息
  send(message) {
    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      localStorage.setItem('tab_message', JSON.stringify(message));
      // 立即清除，避免重复触发
      localStorage.removeItem('tab_message');
    }
  }
  
  // 监听消息
  on(callback) {
    this.listeners.push(callback);
  }
  
  // 处理消息
  handleMessage(message) {
    this.listeners.forEach(callback => callback(message));
  }
  
  // 销毁
  destroy() {
    if (this.channel) {
      this.channel.close();
    }
  }
}

// 使用示例
const messenger = new TabMessenger();

// 发送消息
messenger.send({ type: 'greeting', data: 'Hello' });

// 接收消息
messenger.on((message) => {
  console.log('收到消息:', message);
});
```

---

## 总结

**JavaScript 核心知识点:**
1. **事件循环**：同步 → 微任务 → 宏任务
2. **数组方法**：改变原数组 vs 不改变原数组
3. **性能对比**：for > forEach > map，pop >> shift
4. **闭包**：数据私有化、状态保持、模块化
5. **原型链**：继承机制、方法共享
6. **跨标签页通信**：BroadcastChannel、LocalStorage、WebSocket 等

**记忆技巧:**
- 事件循环：同步先行，微任务优先，宏任务殿后
- 数组操作：从后操作快，从前操作慢
- 闭包：内部函数访问外部变量
- 原型链：实例 → 原型 → Object.prototype → null
- 跨标签页通信：同源用 BroadcastChannel，跨域用 WebSocket


