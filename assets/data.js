/* ====================================================================
 *  网址数据 — 修改这里就能更新整个站点
 *  字段说明：
 *    icon  : 字符（emoji）或 https 图标 URL
 *    color : 卡片图标背景色（icon 是字符时使用）
 *    hot   : 数字徽章（可选）
 * ==================================================================== */
window.SITE_CONFIG = {
  title: "AzusaWebList",
  subtitle: "桜の下で出会う",
  startDate: "2024-01-01",

  // ====== 外观 ======
  themeColor: "#ff6fa3",      // 樱花粉
  density: "normal",
  showClock: true,
  showGreeting: true,
  enableAnimations: true,
  glassmorphism: true,
  petals: true,                // 🌸 樱花飘落特效

  // ====== 壁纸 ======
  wallpaperMode: "rotate",
  wallpaperInterval: 0,
  wallpapers: [
    "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=85",
    "https://images.unsplash.com/photo-1554189097-ffe88e998a2b?w=1920&q=85",
    "https://images.unsplash.com/photo-1490375923857-c4c481b7ad2f?w=1920&q=85",
    "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1920&q=85",
    "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=1920&q=85",
    "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?w=1920&q=85",
    "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1920&q=85",
    "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1920&q=85",
  ],

  heroButtons: [
    { icon: "🎲", label: "随机一个", action: "random" },
    { icon: "🌸", label: "撒花",     action: "petals-burst" },
    { icon: "🌗", label: "切换主题", action: "theme" },
    { icon: "⚙",  label: "后台",     action: "url", url: "admin.html" },
  ],
};

window.CATEGORIES = [
  {
    id: "daily",
    name: "日常入口",
    icon: "⭐",
    sites: [
      { name: "Google", desc: "通用搜索与账号服务", url: "https://www.google.com/", icon: "G", color: "#4285f4" },
      { name: "Bing", desc: "微软搜索，适合图片和英文资料", url: "https://www.bing.com/", icon: "B", color: "#0078d4" },
      { name: "DuckDuckGo", desc: "注重隐私的搜索引擎", url: "https://duckduckgo.com/", icon: "D", color: "#de5833" },
      { name: "YouTube", desc: "视频、教程与频道订阅", url: "https://www.youtube.com/", icon: "▶", color: "#ff0033" },
      { name: "Wikipedia", desc: "百科资料与背景查询", url: "https://www.wikipedia.org/", icon: "W", color: "#54595d" },
      { name: "Internet Archive", desc: "网页存档、书籍、音视频资料", url: "https://archive.org/", icon: "🏛", color: "#444444" },
    ],
  },
  {
    id: "ai",
    name: "AI 助手",
    icon: "✨",
    sites: [
      { name: "ChatGPT", desc: "写作、编程、分析与创意助手", url: "https://chatgpt.com/", icon: "◎", color: "#10a37f" },
      { name: "Claude", desc: "长文档阅读、写作和代码辅助", url: "https://claude.com/", icon: "C", color: "#d97757" },
      { name: "Gemini", desc: "Google 的多模态 AI 助手", url: "https://gemini.google.com/", icon: "✦", color: "#1a73e8" },
      { name: "Perplexity", desc: "带来源的 AI 搜索与研究", url: "https://www.perplexity.ai/", icon: "P", color: "#20b8cd" },
      { name: "Poe", desc: "集中体验多种 AI 模型", url: "https://poe.com/", icon: "P", color: "#5b5bd6" },
      { name: "Hugging Face", desc: "模型、数据集与 AI 应用社区", url: "https://huggingface.co/", icon: "🤗", color: "#ffcc4d" },
    ],
  },
  {
    id: "dev",
    name: "开发文档",
    icon: "💻",
    sites: [
      { name: "GitHub", desc: "代码托管、开源项目与协作", url: "https://github.com/", icon: "GH", color: "#24292f" },
      { name: "MDN Web Docs", desc: "Web 标准、HTML/CSS/JS 文档", url: "https://developer.mozilla.org/", icon: "MDN", color: "#111111" },
      { name: "Can I use", desc: "浏览器兼容性查询", url: "https://caniuse.com/", icon: "✓", color: "#d98b2b" },
      { name: "Stack Overflow", desc: "编程问答与问题排查", url: "https://stackoverflow.com/", icon: "SO", color: "#f48024" },
      { name: "DevDocs", desc: "离线友好的多语言 API 文档", url: "https://devdocs.io/", icon: "D", color: "#2e6da4" },
      { name: "Regex101", desc: "正则表达式调试与解释", url: "https://regex101.com/", icon: ".*", color: "#2f6f44" },
    ],
  },
  {
    id: "design",
    name: "设计素材",
    icon: "🎨",
    sites: [
      { name: "Figma", desc: "界面设计、原型和协作", url: "https://www.figma.com/", icon: "F", color: "#a259ff" },
      { name: "Excalidraw", desc: "手绘风白板与流程图", url: "https://excalidraw.com/", icon: "✎", color: "#6965db" },
      { name: "Coolors", desc: "配色生成与调色板灵感", url: "https://coolors.co/", icon: "C", color: "#00a6fb" },
      { name: "Unsplash", desc: "高质量免费摄影图片", url: "https://unsplash.com/", icon: "U", color: "#111111" },
      { name: "Pexels", desc: "免费图片与视频素材", url: "https://www.pexels.com/", icon: "P", color: "#05a081" },
      { name: "Lucide", desc: "简洁一致的开源图标库", url: "https://lucide.dev/", icon: "◇", color: "#f56565" },
    ],
  },
  {
    id: "productivity",
    name: "效率工具",
    icon: "⚡",
    sites: [
      { name: "Notion", desc: "笔记、知识库与项目空间", url: "https://www.notion.com/", icon: "N", color: "#111111" },
      { name: "Todoist", desc: "任务清单与日程管理", url: "https://www.todoist.com/", icon: "T", color: "#e44332" },
      { name: "Raindrop.io", desc: "跨设备书签收藏与整理", url: "https://raindrop.io/", icon: "R", color: "#0b78e3" },
      { name: "DeepL", desc: "高质量翻译与写作辅助", url: "https://www.deepl.com/translator", icon: "D", color: "#0f2b46" },
      { name: "Smallpdf", desc: "PDF 压缩、转换与合并", url: "https://smallpdf.com/", icon: "PDF", color: "#e5322d" },
      { name: "Photopea", desc: "浏览器里的图片编辑器", url: "https://www.photopea.com/", icon: "P", color: "#1d4ed8" },
    ],
  },
  {
    id: "learning",
    name: "学习阅读",
    icon: "📚",
    sites: [
      { name: "Coursera", desc: "大学课程与职业证书", url: "https://www.coursera.org/", icon: "C", color: "#0056d2" },
      { name: "edX", desc: "高校公开课与在线学习", url: "https://www.edx.org/", icon: "edX", color: "#02262b" },
      { name: "Khan Academy", desc: "数学、科学与基础课程", url: "https://www.khanacademy.org/", icon: "K", color: "#14bf96" },
      { name: "freeCodeCamp", desc: "免费编程课程与练习", url: "https://www.freecodecamp.org/", icon: "FCC", color: "#0a0a23" },
      { name: "The Odin Project", desc: "系统化 Web 开发路径", url: "https://www.theodinproject.com/", icon: "O", color: "#a9792b" },
      { name: "MIT OpenCourseWare", desc: "MIT 免费课程资料", url: "https://ocw.mit.edu/", icon: "MIT", color: "#a31f34" },
    ],
  },
  {
    id: "tech-news",
    name: "科技资讯",
    icon: "📰",
    sites: [
      { name: "Hacker News", desc: "技术、创业与工程讨论", url: "https://news.ycombinator.com/", icon: "HN", color: "#ff6600" },
      { name: "Product Hunt", desc: "发现新产品和独立工具", url: "https://www.producthunt.com/", icon: "P", color: "#da552f" },
      { name: "AlternativeTo", desc: "查找软件替代品", url: "https://alternativeto.net/", icon: "A", color: "#0b74de" },
      { name: "The Verge", desc: "科技产品与数字文化报道", url: "https://www.theverge.com/", icon: "V", color: "#e2127a" },
      { name: "Ars Technica", desc: "深度科技新闻与分析", url: "https://arstechnica.com/", icon: "A", color: "#ff4e00" },
      { name: "Wired", desc: "科技、商业与未来趋势", url: "https://www.wired.com/", icon: "W", color: "#111111" },
    ],
  },
  {
    id: "cloud",
    name: "云与部署",
    icon: "☁️",
    sites: [
      { name: "Vercel", desc: "前端应用部署与托管", url: "https://vercel.com/", icon: "▲", color: "#111111" },
      { name: "Netlify", desc: "静态站点与边缘函数部署", url: "https://www.netlify.com/", icon: "N", color: "#00ad9f" },
      { name: "Cloudflare", desc: "DNS、CDN、安全与 Workers", url: "https://www.cloudflare.com/", icon: "☁", color: "#f38020" },
      { name: "Firebase", desc: "应用后端、托管与数据库", url: "https://firebase.google.com/", icon: "F", color: "#ffca28" },
      { name: "Supabase", desc: "开源数据库与后端服务", url: "https://supabase.com/", icon: "S", color: "#3ecf8e" },
      { name: "Railway", desc: "快速部署应用和数据库", url: "https://railway.com/", icon: "R", color: "#6c47ff" },
    ],
  },
  {
    id: "utilities",
    name: "实用查询",
    icon: "🛠️",
    sites: [
      { name: "Speedtest", desc: "网络速度测试", url: "https://www.speedtest.net/", icon: "⚡", color: "#141526" },
      { name: "Fast.com", desc: "快速测网速", url: "https://fast.com/", icon: "F", color: "#e50914" },
      { name: "VirusTotal", desc: "链接和文件安全检测", url: "https://www.virustotal.com/", icon: "VT", color: "#394eff" },
      { name: "Have I Been Pwned", desc: "检查邮箱是否泄露", url: "https://haveibeenpwned.com/", icon: "!", color: "#2a6379" },
      { name: "Down For Everyone", desc: "检测网站是否宕机", url: "https://downforeveryoneorjustme.com/", icon: "?", color: "#6d28d9" },
      { name: "World Time Buddy", desc: "跨时区会议时间换算", url: "https://www.worldtimebuddy.com/", icon: "⏱", color: "#2580c3" },
    ],
  },
];

// 给每个 site 自动补 url 字段（如未提供则使用搜索）
window.CATEGORIES.forEach(cat => {
  cat.sites.forEach(s => {
    if (!s.url) s.url = "https://www.google.com/search?q=" + encodeURIComponent(s.name);
  });
});

// ---- 保存默认副本，供后台 "重置" 使用 ----
window.DEFAULT_CATEGORIES  = JSON.parse(JSON.stringify(window.CATEGORIES));
window.DEFAULT_SITE_CONFIG = JSON.parse(JSON.stringify(window.SITE_CONFIG));

// ---- 优先使用 localStorage 中的覆盖数据（由后台编辑） ----
try {
  const DATA_VERSION = "2026-05-28-useful-links";
  if (localStorage.getItem("azusa.dataVersion") !== DATA_VERSION) {
    localStorage.removeItem("azusa.categories");
    localStorage.setItem("azusa.dataVersion", DATA_VERSION);
  }

  const savedCats = localStorage.getItem("azusa.categories");
  const savedCfg  = localStorage.getItem("azusa.config");
  if (savedCats) {
    const parsed = JSON.parse(savedCats);
    // 仅在解析为非空数组时才覆盖；否则视为脏数据，清理掉
    if (Array.isArray(parsed) && parsed.length > 0) {
      window.CATEGORIES = parsed;
    } else {
      localStorage.removeItem("azusa.categories");
    }
  }
  if (savedCfg) {
    const parsedCfg = JSON.parse(savedCfg);
    if (parsedCfg && typeof parsedCfg === "object") {
      window.SITE_CONFIG = { ...window.SITE_CONFIG, ...parsedCfg };
    }
  }
} catch (e) {
  // 损坏的数据：清理掉以免下次再炸
  localStorage.removeItem("azusa.categories");
  localStorage.removeItem("azusa.config");
}
