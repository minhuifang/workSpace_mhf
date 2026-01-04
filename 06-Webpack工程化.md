# Webpack 工程化

> Webpack 性能优化策略、Loader 配置等工程化知识

## 目录

- [性能优化策略](#性能优化策略)
- [Loader 配置](#loader-配置)

---

## 性能优化策略

### Webpack 调优和 Loader

#### Webpack 性能优化

**1. 构建速度优化**


module.exports = {
  // 缩小文件搜索范围
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  // 使用缓存
  cache: {
    type: 'filesystem'
  },
  
  // 多线程打包
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'thread-loader',
          'babel-loader'
        ]
      }
    ]
  },
  
  // 排除不需要处理的文件
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};


**2. 打包体积优化**


module.exports = {
  // 代码分割
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        }
      }
    }
  },
  
  // 压缩
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true, // 多线程压缩
        terserOptions: {
          compress: {
            drop_console: true // 删除 console
          }
        }
      }),
      new CssMinimizerPlugin()
    ]
  },
  
  // Tree Shaking
  mode: 'production', // 自动启用
  
  // 外部化依赖
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};


**3. 其他优化**

- **Tree Shaking**：去除未使用代码
- **懒加载**：`import()` 动态导入
- **CDN**：外部库使用 CDN
- **图片压缩**：使用 `image-webpack-loader`
- **DllPlugin**：预编译第三方库
- **HardSourceWebpackPlugin**：缓存中间结果

---

## Loader 配置

### 常用 Loader

**1. 样式相关**


{
  test: /\.css$/,
  use: ['style-loader', 'css-loader']
}

{
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'sass-loader']
}

{
  test: /\.less$/,
  use: ['style-loader', 'css-loader', 'less-loader']
}


**2. 文件相关**


// Webpack 5 使用 Asset Modules
{
  test: /\.(png|jpg|gif)$/,
  type: 'asset/resource'
}

{
  test: /\.(woff|woff2|eot|ttf)$/,
  type: 'asset/resource'
}

// 小文件转 base64
{
  test: /\.(png|jpg|gif)$/,
  type: 'asset',
  parser: {
    dataUrlCondition: {
      maxSize: 8 * 1024 // 8kb
    }
  }
}


**3. JavaScript 相关**


{
  test: /\.js$/,
  use: 'babel-loader',
  exclude: /node_modules/
}

{
  test: /\.ts$/,
  use: 'ts-loader'
}


**4. 其他 Loader**


// Vue
{
  test: /\.vue$/,
  use: 'vue-loader'
}

// Markdown
{
  test: /\.md$/,
  use: 'markdown-loader'
}

// YAML
{
  test: /\.ya?ml$/,
  use: 'yaml-loader'
}


#### Loader 执行顺序

**从右到左，从下到上**


{
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'sass-loader']
}

// 执行顺序：
// 1. sass-loader：将 SCSS 编译为 CSS
// 2. css-loader：处理 CSS 中的 @import 和 url()
// 3. style-loader：将 CSS 注入到 DOM


---

## Webpack 打包优化详解

### 1. 构建速度优化

#### 1.1 缩小文件搜索范围


module.exports = {
  resolve: {
    // 指定模块搜索目录
    modules: ['node_modules'],
    
    // 减少文件后缀尝试
    extensions: ['.js', '.jsx', '.json'],
    
    // 配置别名，减少搜索
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components')
    }
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        // 排除 node_modules
        exclude: /node_modules/,
        // 或指定包含目录
        include: path.resolve(__dirname, 'src')
      }
    ]
  }
};


#### 1.2 使用缓存


module.exports = {
  // Webpack 5 持久化缓存
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack_cache')
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              // Babel 缓存
              cacheDirectory: true
            }
          }
        ]
      }
    ]
  }
};


#### 1.3 多线程打包


module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 3 // 开启 3 个线程
            }
          },
          'babel-loader'
        ]
      }
    ]
  }
};


#### 1.4 DLL 预编译（不常变化的库）


// webpack.dll.config.js
module.exports = {
  entry: {
    vendor: ['react', 'react-dom', 'lodash']
  },
  output: {
    filename: '[name].dll.js',
    library: '[name]_library'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_library',
      path: path.join(__dirname, 'dll', '[name].manifest.json')
    })
  ]
};

// webpack.config.js
module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./dll/vendor.manifest.json')
    })
  ]
};


### 2. 打包体积优化

#### 2.1 代码分割（Code Splitting）


module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 第三方库单独打包
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        // 公共代码单独打包
        common: {
          minChunks: 2,
          name: 'common',
          priority: 5
        }
      }
    }
  }
};


#### 2.2 Tree Shaking（去除无用代码）


module.exports = {
  mode: 'production', // 生产模式自动开启
  optimization: {
    usedExports: true, // 标记未使用的导出
    minimize: true     // 压缩代码
  }
};

// package.json
{
  "sideEffects": false  // 声明所有文件都没有副作用
  // 或指定有副作用的文件
  "sideEffects": ["*.css", "*.scss"]
}


#### 2.3 压缩代码


const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      // JS 压缩
      new TerserPlugin({
        parallel: true,        // 多线程
        terserOptions: {
          compress: {
            drop_console: true // 删除 console
          }
        }
      }),
      // CSS 压缩
      new CssMinimizerPlugin()
    ]
  }
};


#### 2.4 按需加载（懒加载）


// 动态 import
const Home = () => import(/* webpackChunkName: "home" */ './pages/Home');
const About = () => import(/* webpackChunkName: "about" */ './pages/About');

// React 路由懒加载
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  );
}


#### 2.5 外部化依赖（CDN）


module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    lodash: '_'
  }
};

// HTML 中引入 CDN
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>


### 3. 运行时性能优化

#### 3.1 长期缓存


module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },
  optimization: {
    // 提取 runtime 代码
    runtimeChunk: 'single',
    // 模块 ID 稳定化
    moduleIds: 'deterministic'
  }
};


#### 3.2 Prefetch / Preload


// Prefetch：空闲时加载
import(/* webpackPrefetch: true */ './utils');

// Preload：立即加载
import(/* webpackPreload: true */ './critical');


#### 3.3 图片优化


module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 小于 10KB 转 base64
          }
        }
      }
    ]
  },
  plugins: [
    // 图片压缩
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminMinify,
        options: {
          plugins: [
            ['gifsicle', { interlaced: true }],
            ['jpegtran', { progressive: true }],
            ['optipng', { optimizationLevel: 5 }]
          ]
        }
      }
    })
  ]
};


### 4. 分析工具


const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    // 打包分析
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ]
};


### 优化效果对比

| 优化项 | 优化前 | 优化后 | 提升 |
|--------|--------|--------|------|
| 构建时间 | 60s | 15s | 75% |
| 首屏加载 | 3.5s | 1.2s | 66% |
| 包体积 | 2.5MB | 800KB | 68% |

### 优化检查清单

- ✅ 开启生产模式
- ✅ 配置缓存（持久化缓存）
- ✅ 代码分割（splitChunks）
- ✅ Tree Shaking
- ✅ 压缩代码（JS、CSS、图片）
- ✅ 按需加载
- ✅ CDN 外部化
- ✅ 长期缓存（contenthash）
- ✅ 多线程打包
- ✅ 缩小搜索范围

---

## 总结

**Webpack 核心优化:**
1. **构建速度**：缓存、多线程、缩小搜索范围
2. **打包体积**：代码分割、Tree Shaking、压缩
3. **运行时性能**：长期缓存、懒加载、CDN

**记忆技巧:**
- 速度优化：缓存、多线程、减少搜索
- 体积优化：分割、压缩、外部化
- Loader 顺序：从右到左，从下到上
