# Azusa's 收藏夹

一个简洁优雅的纯静态网址导航 / 个人收藏夹，灵感来自「墨鱼手记」风格。

## ✨ 特性

- 🎨 极简卡片式 UI，左侧分类导航 + 顶部搜索
- 🌗 自动跟随系统的浅色 / 深色主题，可手动切换
- 🔍 实时搜索（按 `/` 快速聚焦，`Esc` 清空）
- 📊 支持按热度 / 名称排序
- 🔥 卡片热度徽章
- 🎲 「随机一个」按钮
- 📅 自动显示「已稳定运行 X 天」
- 📱 响应式，移动端友好（带汉堡菜单）
- 🚀 纯 HTML/CSS/JS，零依赖，可直接部署到 GitHub Pages / Netlify / Vercel

## 📁 目录结构

```
.
├── index.html          # 主页面
├── assets/
│   ├── style.css       # 样式
│   ├── data.js         # 网站数据（你只需要改这个文件）
│   └── app.js          # 渲染逻辑
└── README.md
```

## 🛠 自定义你的收藏

只需要编辑 `assets/data.js` 即可：

```js
window.SITE_CONFIG = {
  title: "你的标题",
  startDate: "2024-01-01",   // 用于显示运行天数
};

window.CATEGORIES = [
  {
    id: "rec",                // 唯一 id（英文）
    name: "我的推荐",           // 分类显示名
    icon: "💡",                // 分类图标（emoji）
    sites: [
      {
        name: "网站名",
        desc: "网站描述",
        url:  "https://example.com",
        icon: "🌐",            // 也可以填入 https://xxx/icon.png
        color: "#3a86ff",      // icon 是 emoji 时作为背景
        hot:  999              // 可选，显示热度徽章
      },
      // ...
    ]
  },
  // ...
];
```

## 🚀 部署

### GitHub Pages

1. 把这个仓库 push 到 GitHub
2. Settings → Pages → Source 选 `main` 分支根目录
3. 几分钟后访问 `https://<用户名>.github.io/<仓库名>/`

### 本地预览

直接双击 `index.html` 即可，或用任意静态服务器：

```bash
python -m http.server 8080
# 然后访问 http://localhost:8080
```

## 📜 License

MIT
