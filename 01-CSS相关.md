# CSS 相关知识

> CSS 样式隔离、Service Worker 等相关知识点

## 目录

- [样式隔离方案](#样式隔离方案)
- [Service Worker](#service-worker)

---

## 样式隔离方案

### 除了 CSS Modules，还可以用什么做样式隔离？

#### 样式隔离方案对比

**1. CSS-in-JS**（styled-components、emotion）


const Button = styled.button`
  background: blue;
  color: white;
`;


**2. Scoped CSS**（Vue 的 scoped）


<style scoped>
.button { color: red; }
</style>


**3. BEM 命名规范**


.button {}
.button__icon {}
.button--primary {}


**4. Shadow DOM**（Web Components）

**5. Tailwind CSS**（原子化 CSS）


<button className="bg-blue-500 text-white px-4 py-2">


---

## Service Worker

### Service Worker 的作用

- **离线缓存**：让网页离线可用（PWA）
- **拦截请求**：可以拦截和修改网络请求
- **推送通知**：接收服务器推送消息

### Service Worker 缓存示例


// service-worker.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 缓存命中,返回缓存
      if (response) {
        return response;
      }
      
      // 缓存未命中,请求网络
      return fetch(event.request).then((response) => {
        // 缓存响应
        return caches.open('v1').then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});


---

## 浏览器缓存

### 强缓存和协商缓存

#### 缓存机制概述

**浏览器缓存流程:**


1. 请求资源
   ↓
2. 检查强缓存
   ↓ 未过期          ↓ 过期
   直接使用缓存      检查协商缓存
                     ↓
                     向服务器验证
                     ↓
                     304(使用缓存) / 200(重新下载)


### 强缓存(Strong Cache)

**特点:**
- 不需要向服务器发送请求
- 直接从本地缓存读取
- 状态码: `200 (from disk cache)` 或 `200 (from memory cache)`

#### 1. Expires(HTTP/1.0)


# 服务器响应头
Expires: Wed, 21 Oct 2026 07:28:00 GMT


**缺点:**
- 使用绝对时间,依赖客户端时间
- 如果客户端时间不准确,会导致缓存失效

#### 2. Cache-Control(HTTP/1.1,优先级更高)


# 服务器响应头
Cache-Control: max-age=3600  # 缓存 1 小时


**常用指令:**


# 不使用缓存
Cache-Control: no-store

# 使用缓存前必须验证
Cache-Control: no-cache

# 缓存 1 年(常用于静态资源)
Cache-Control: max-age=31536000

# 只能被浏览器缓存,不能被代理服务器缓存
Cache-Control: private

# 可以被代理服务器缓存
Cache-Control: public

# 缓存过期后必须重新验证
Cache-Control: must-revalidate


### 协商缓存(Negotiation Cache)

**特点:**
- 需要向服务器发送请求验证
- 如果资源未修改,返回 304 Not Modified
- 如果资源已修改,返回 200 和新资源

#### 1. Last-Modified / If-Modified-Since

**工作流程:**


# 1. 首次请求,服务器返回
HTTP/1.1 200 OK
Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT
Content-Type: text/html

# 2. 再次请求,浏览器发送
GET /index.html HTTP/1.1
If-Modified-Since: Wed, 21 Oct 2025 07:28:00 GMT

# 3. 服务器响应
# 未修改:
HTTP/1.1 304 Not Modified

# 已修改:
HTTP/1.1 200 OK
Last-Modified: Wed, 21 Oct 2025 08:00:00 GMT


**缺点:**
- 只能精确到秒级
- 如果文件在 1 秒内多次修改,无法识别
- 如果文件内容未变但修改时间变了,会重新下载

#### 2. ETag / If-None-Match(优先级更高)

**工作流程:**


# 1. 首次请求,服务器返回
HTTP/1.1 200 OK
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Content-Type: text/html

# 2. 再次请求,浏览器发送
GET /index.html HTTP/1.1
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"

# 3. 服务器响应
# 未修改:
HTTP/1.1 304 Not Modified

# 已修改:
HTTP/1.1 200 OK
ETag: "new-hash-value"


**优点:**
- 基于文件内容的哈希值
- 更精确,内容不变 ETag 就不变
- 不受时间影响

### 缓存策略对比

| 缓存类型 | 是否请求服务器 | 状态码 | 优先级 |
|---------|--------------|--------|--------|
| **强缓存** | 否 | 200 (from cache) | 高 |
| **协商缓存** | 是(验证) | 304 / 200 | 低 |

### 缓存优先级


Cache-Control > Expires
ETag > Last-Modified


### 实际应用场景

#### 1. 静态资源(HTML/CSS/JS/图片)


// webpack 配置:文件名带 hash
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js'
  }
};

// 服务器配置:强缓存 1 年
app.use('/static', express.static('public', {
  maxAge: '1y',
  immutable: true
}));


**策略:**
- 文件名带 hash,内容变化时文件名变化
- 设置强缓存 1 年
- HTML 文件设置协商缓存或不缓存

#### 2. HTML 文件


// 不使用强缓存,使用协商缓存
app.get('*.html', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(filePath);
});


**策略:**
- 不使用强缓存(no-cache)
- 使用 ETag 协商缓存
- 确保用户能及时获取最新版本

#### 3. API 接口


// 不缓存
app.get('/api/*', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(data);
});

// 短时间缓存
app.get('/api/config', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60'); // 缓存 1 分钟
  res.json(config);
});


**策略:**
- 动态数据:不缓存(no-store)
- 不常变化的配置:短时间强缓存

### 最佳实践

**根据资源类型设置缓存**


const cacheConfig = {
  // 静态资源(带 hash):强缓存 1 年
  static: 'public, max-age=31536000, immutable',
  
  // HTML:协商缓存
  html: 'no-cache',
  
  // API:不缓存
  api: 'no-store',
  
  // 不常变化的资源:短时间缓存
  config: 'public, max-age=3600'
};


### 总结

**核心原则:**
1. **静态资源(带 hash)**:强缓存 1 年
2. **HTML 文件**:协商缓存或不缓存
3. **API 接口**:不缓存或短时间缓存
4. **使用 ETag 优于 Last-Modified**
5. **使用 Cache-Control 优于 Expires**

**记忆口诀:**
- 强缓存:不问服务器,直接用
- 协商缓存:问服务器,304 用,200 下载
- 静态资源:强缓存 + hash
- HTML:协商缓存
- API:不缓存
