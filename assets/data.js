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
    id: "promo",
    name: "プロモーション",
    icon: "📣",
    sites: [
      { name: "京东618红包",  desc: "今日可领",            icon: "🧧", color: "#e63946", hot: 9999 },
      { name: "自用 IPLC 机场", desc: "IEPL 优质线路，5G 流量…", icon: "⚡", color: "#1d3557", hot: 1888 },
      { name: "TG 万能搜",    desc: "新世纪寻资源/影视神器",   icon: "🔎", color: "#3a86ff", hot: 1666 },
    ],
  },
  {
    id: "rec",
    name: "资源推荐",
    icon: "💡",
    sites: [
      { name: "Cuttlefish 的自留地", desc: "记录有意思的一切",      icon: "🐙", color: "#5e60ce", hot: 1111 },
      { name: "Cuttlefish 的同盘地", desc: "故事 & 灵感小站",        icon: "📚", color: "#56ccf2", hot: 999  },
      { name: "Cuttlefish's GitHub", desc: "开源仓库 / 个人项目",     icon: "🐱", color: "#222",    hot: 888  },
      { name: "自用好物",            desc: "认真选过的好东西",        icon: "⭐", color: "#06d6a0", hot: 666  },
    ],
  },
  {
    id: "video",
    name: "影视网站",
    icon: "🎬",
    sites: [
      { name: "新视频",       desc: "影视、小电影",             icon: "🎞️", color: "#ff006e", hot: 999  },
      { name: "蜂鸟库",       desc: "影视聚合",                icon: "🐦", color: "#ff8c00", hot: 999  },
      { name: "广长资源",     desc: "稳定 1080P",              icon: "🎥", color: "#ffb703", hot: 996  },
      { name: "NO 视频",      desc: "影视聚合搜索站",           icon: "🚫", color: "#fb5607", hot: 875  },
      { name: "在线之家",     desc: "新更新美剧 / 综艺",        icon: "🏠", color: "#8338ec", hot: 766  },
      { name: "磁力熊",       desc: "搜素 BT/磁力",             icon: "🐻", color: "#7f5539", hot: 569  },
      { name: "注视影视",     desc: "小众片，没商业广告",        icon: "👀", color: "#3a86ff", hot: 488  },
    ],
  },
  {
    id: "anime",
    name: "动漫番剧",
    icon: "🌸",
    sites: [
      { name: "Anime1",          desc: "免费观看，更新快",       icon: "1️⃣", color: "#fb6f92", hot: 779 },
      { name: "girigiri 爱动漫",  desc: "日漫、番剧为主",         icon: "🌸", color: "#ff8fab", hot: 777 },
      { name: "Ebb",             desc: "在线动漫，可缓存",        icon: "🅴", color: "#264653", hot: 666 },
      { name: "Bilibili",         desc: "B 站正版番剧",           icon: "📺", color: "#00a1d6", hot: 555 },
    ],
  },
  {
    id: "down",
    name: "资源下载",
    icon: "📥",
    sites: [
      { name: "磁力搜索",   desc: "聚合磁力搜索",        icon: "🧲", color: "#118ab2", hot: 588 },
      { name: "动漫花园",   desc: "动漫 BT 下载",         icon: "🌳", color: "#06a77d", hot: 488 },
      { name: "Nyaa",      desc: "番剧 / 漫画 BT",       icon: "🐾", color: "#1e6091", hot: 388 },
      { name: "Wallhaven",  desc: "高清壁纸",             icon: "🖼️", color: "#3a86ff", hot: 366 },
      { name: "音范丝",     desc: "无损音乐分享",         icon: "🎵", color: "#222",    hot: 366 },
    ],
  },
  {
    id: "tools",
    name: "工具相关",
    icon: "🛠️",
    sites: [
      { name: "WebTools",   desc: "在线小工具集合",     icon: "🧰", color: "#3a86ff" },
      { name: "JSON 解析",  desc: "格式化 / 校验",      icon: "{ }", color: "#06d6a0" },
      { name: "WHOIS",     desc: "域名信息查询",        icon: "🌐", color: "#ef476f" },
      { name: "图片压缩",   desc: "在线无损压缩",        icon: "📷", color: "#ffd166" },
      { name: "Speedtest",  desc: "网络速度测试",        icon: "⚡", color: "#118ab2" },
    ],
  },
  {
    id: "scripts",
    name: "油猴脚本",
    icon: "🐒",
    sites: [
      { name: "自动无缝翻页", desc: "懒人必备",          icon: "📄", color: "#06a77d", hot: 666 },
      { name: "JAV-JHS",   desc: "增强",                icon: "🈲", color: "#ef476f", hot: 99 },
      { name: "GreasyFork", desc: "脚本分享平台",        icon: "🐵", color: "#f08c00", hot: 99 },
    ],
  },
  {
    id: "shop",
    name: "商店换区",
    icon: "🛒",
    sites: [
      { name: "美国",     desc: "United States",  icon: "🇺🇸", color: "#3a86ff" },
      { name: "中国",     desc: "China",          icon: "🇨🇳", color: "#ef476f" },
      { name: "日本",     desc: "Japan",          icon: "🇯🇵", color: "#fb5607" },
      { name: "新加坡",    desc: "Singapore",      icon: "🇸🇬", color: "#e63946" },
      { name: "英国",     desc: "United Kingdom", icon: "🇬🇧", color: "#1d3557" },
      { name: "土耳其",    desc: "Turkey",         icon: "🇹🇷", color: "#c1121f" },
    ],
  },
  {
    id: "read",
    name: "悦享阅读",
    icon: "📖",
    sites: [
      { name: "好性教育",     desc: "性教育站点",            icon: "💗", color: "#ef476f", hot: 488 },
      { name: "我不是监神",   desc: "幽默深度阅读公众号",     icon: "🤖", color: "#118ab2", hot: 188 },
      { name: "小火苗使用教程", desc: "新手指南",            icon: "💡", color: "#ffd166", hot: 88 },
    ],
  },
  {
    id: "music",
    name: "音乐视频",
    icon: "🎵",
    sites: [
      { name: "Lofi",     desc: "学习放松背景音乐",       icon: "🎧", color: "#06a77d", hot: 266 },
      { name: "Hifi",     desc: "无损下载论坛",            icon: "🎼", color: "#ffb703", hot: 99 },
      { name: "看理想",    desc: "知识播客 / 音频教育",     icon: "📻", color: "#222",   hot: 99 },
    ],
  },
  {
    id: "contact",
    name: "联系我们",
    icon: "📮",
    sites: [
      { name: "TG 联系", desc: "项目合作 / 广告咨询", icon: "✈️", color: "#3a86ff", hot: 99, url: "https://t.me/azusamyo" },
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
