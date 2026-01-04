# React 相关

> React Hooks、组件生命周期、性能优化等核心知识点

## 目录

- [React Hooks 详解](#react-hooks-详解)
- [组件生命周期管理](#组件生命周期管理)
- [性能优化技巧](#性能优化技巧)

---

## React Hooks 详解

### React Hooks 有哪些？useState 和 useRef 的区别，useEffect 的作用

#### 常用 Hooks

- `useState`：状态管理
- `useEffect`：副作用处理
- `useContext`：上下文
- `useRef`：引用对象
- `useMemo`：缓存计算结果
- `useCallback`：缓存函数
- `useReducer`：复杂状态管理
- `useLayoutEffect`：同步副作用

#### useState vs useRef

| 特性 | useState | useRef |
|------|----------|--------|
| **触发渲染** | 是 | 否 |
| **使用场景** | 需要显示的状态 | DOM 引用、定时器 ID |
| **更新方式** | `setState` | 直接修改 `.current` |
| **值的持久性** | 重渲染时保持 | 组件生命周期内保持 |

**useRef 的特性：**
- `useRef` 返回的对象在组件整个生命周期中保持同一引用
- 修改 `ref.current` 不会触发重渲染
- 闭包中访问 `ref.current` 总是获取最新值

**示例：**


// useState：更新会重新渲染
const [count, setCount] = useState(0);
setCount(count + 1); // 触发渲染

// useRef：更新不会重新渲染
const countRef = useRef(0);
countRef.current += 1; // 不触发渲染


#### useEffect 的作用

**处理副作用：**
- 数据获取（API 调用）
- 订阅/取消订阅
- 定时器
- DOM 操作

**三种用法：**


// 1. 每次渲染都执行
useEffect(() => {
  console.log('每次渲染都执行');
});

// 2. 只执行一次（挂载时）
useEffect(() => {
  console.log('只在挂载时执行');
}, []);

// 3. 依赖变化时执行
useEffect(() => {
  console.log('count 变化时执行');
}, [count]);


---

## 组件生命周期管理

### 组件卸载时关闭定时器怎么做？

#### 使用 useEffect 的清理函数


function Timer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // 启动定时器
    const timer = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);
    
    // 返回清理函数（组件卸载时执行）
    return () => {
      clearInterval(timer);
      console.log('定时器已清理');
    };
  }, []); // 空数组：只在挂载和卸载时执行
  
  return <div>{count}</div>;
}


**关键点：**
- `useEffect` 返回一个函数
- 这个函数在组件卸载时执行
- 第二个参数传空数组 `[]`，表示只在挂载和卸载时执行

#### 其他清理场景


// 事件监听
useEffect(() => {
  const handleResize = () => console.log('resize');
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// WebSocket
useEffect(() => {
  const ws = new WebSocket('ws://...');
  
  return () => {
    ws.close();
  };
}, []);

// 取消请求
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(data => console.log(data));
  
  return () => {
    controller.abort(); // 取消请求
  };
}, []);


---

## 性能优化技巧

### useCallback 和 useMemo 的区别

#### 对比

| 特性 | useCallback | useMemo |
|------|-------------|---------|
| **缓存内容** | 函数 | 计算结果（值） |
| **返回值** | 函数本身 | 函数执行结果 |
| **使用场景** | 避免子组件重复渲染 | 避免重复计算 |

#### 示例


// useCallback：缓存函数
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);

// useMemo：缓存计算结果
const expensiveValue = useMemo(() => {
  return count * 2; // 返回计算结果
}, [count]);


#### 记忆技巧


// useCallback(fn, deps) 等价于 useMemo(() => fn, deps)
const callback1 = useCallback(() => {
  console.log('hello');
}, []);

const callback2 = useMemo(() => {
  return () => console.log('hello');
}, []);

// callback1 === callback2


#### 使用场景

**useCallback：**


function Parent() {
  const [count, setCount] = useState(0);
  
  // 缓存函数，避免 Child 重复渲染
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <Child onClick={handleClick} />;
}

const Child = React.memo(({ onClick }) => {
  console.log('Child 渲染');
  return <button onClick={onClick}>点击</button>;
});


**useMemo：**


function ExpensiveComponent({ items }) {
  // 缓存计算结果，避免重复计算
  const total = useMemo(() => {
    console.log('计算总和');
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);
  
  return <div>总价：{total}</div>;
}


---

### useMemo 和 React.memo 的区别

#### 对比表格

| 特性 | useMemo | React.memo |
|------|---------|------------|
| **类型** | Hook | 高阶组件(HOC) |
| **作用对象** | 值/计算结果 | 组件 |
| **使用位置** | 组件内部 | 组件外部(包裹组件) |
| **优化目标** | 避免重复计算 | 避免组件重复渲染 |
| **返回值** | 缓存的值 | 缓存的组件 |

#### 详细说明

**useMemo:**
- 是一个 React Hook
- 用于缓存**计算结果**
- 在组件内部使用
- 避免每次渲染都重新计算昂贵的值


function Component({ a, b }) {
  // 缓存计算结果
  const result = useMemo(() => {
    console.log('计算中...');
    return a + b;
  }, [a, b]); // 只有 a 或 b 变化时才重新计算
  
  return <div>{result}</div>;
}


**React.memo:**
- 是一个高阶组件(HOC)
- 用于缓存**整个组件**
- 包裹在组件外部
- 避免 props 未变化时的重复渲染


// 用 React.memo 包裹组件
const Child = React.memo(function Child({ name, age }) {
  console.log('Child 渲染');
  return <div>{name} - {age}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      {/* count 变化时，Child 不会重新渲染(props 未变化) */}
      <Child name="张三" age={18} />
    </>
  );
}


#### 结合使用

两者经常配合使用，达到最佳性能:


function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // useMemo 缓存对象，避免引用变化
  const user = useMemo(() => ({
    name: '张三',
    age: 18
  }), []); // 空依赖，user 引用永远不变
  
  // useCallback 缓存函数
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      {/* 即使 Parent 重新渲染，Child 也不会重新渲染 */}
      <Child user={user} onClick={handleClick} />
    </>
  );
}

// React.memo 包裹组件
const Child = React.memo(({ user, onClick }) => {
  console.log('Child 渲染');
  return (
    <div>
      <p>{user.name} - {user.age}</p>
      <button onClick={onClick}>点击</button>
    </div>
  );
});


#### 自定义比较函数

React.memo 可以接受第二个参数，自定义比较逻辑:


const Child = React.memo(
  ({ user }) => {
    return <div>{user.name}</div>;
  },
  // 自定义比较函数
  (prevProps, nextProps) => {
    // 返回 true 表示不重新渲染
    // 返回 false 表示重新渲染
    return prevProps.user.name === nextProps.user.name;
  }
);


#### 使用场景

**useMemo:**
- 计算开销大的值
- 避免在每次渲染时重新创建对象/数组
- 作为其他 Hook 的依赖项


const expensiveValue = useMemo(() => {
  // 复杂计算
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);


**React.memo:**
- 纯展示组件
- props 很少变化的组件
- 渲染开销大的组件


const ExpensiveComponent = React.memo(({ data }) => {
  // 复杂的渲染逻辑
  return <div>{/* ... */}</div>;
});


#### 注意事项

**不要过度优化:**


// ❌ 不必要的优化
const simpleValue = useMemo(() => a + b, [a, b]); // 简单计算不需要

// ❌ 不必要的优化
const SimpleComponent = React.memo(({ text }) => {
  return <div>{text}</div>; // 简单组件不需要
});

// ✅ 必要的优化
const complexValue = useMemo(() => {
  // 复杂计算，如排序、过滤大数组
  return items.sort().filter(item => item.active);
}, [items]);


---

## 总结

**React 核心知识点:**
1. **Hooks**：useState、useEffect、useRef、useMemo、useCallback
2. **生命周期**：useEffect 的清理函数
3. **性能优化**：React.memo、useMemo、useCallback

**记忆技巧:**
- useState：触发渲染，useRef：不触发渲染
- useCallback：缓存函数，useMemo：缓存值
- React.memo：缓存组件，useMemo：缓存计算结果
- useEffect 返回清理函数：组件卸载时执行
