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




