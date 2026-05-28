/* ====================================================================
 *  AzusaWebList — 渲染 & 交互 v2.1
 * ==================================================================== */
(function () {
  const navEl       = document.getElementById("nav");
  const contentEl   = document.getElementById("content");
  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("searchClear");
  const enginesEl   = document.getElementById("engines");
  const resultInfo  = document.getElementById("resultInfo");
  const heroTitle   = document.getElementById("heroTitle");
  const heroSubtitle= document.getElementById("heroSubtitle");
  const pageBg      = document.getElementById("pageBg");
  const heroTags    = document.getElementById("heroTags");
  const greetingEl  = document.getElementById("greeting");
  const clockEl     = document.getElementById("clock");
  const heroMeta    = document.getElementById("heroMeta");
  const wpShuffle   = document.getElementById("wpShuffle");
  const uptimeEl    = document.getElementById("uptime");
  const sidebar     = document.getElementById("sidebar");
  const sidebarMask = document.getElementById("sidebarMask");
  const toggleBtn   = document.getElementById("sidebarToggle");
  const backTop     = document.getElementById("backToTop");
  const ctxMenu     = document.getElementById("ctxMenu");
  const helpModal   = document.getElementById("helpModal");
  const helpClose   = document.getElementById("helpClose");

  const cfg = window.SITE_CONFIG || {};
  const state = {
    keyword: "",
    sort: "default",
    activeCat: null,
    engine: "local"
  };

  // 点击次数统计
  const HITS_KEY = "azusa.hits";
  function getHits() {
    try { return JSON.parse(localStorage.getItem(HITS_KEY) || "{}"); }
    catch { return {}; }
  }
  function bumpHit(url) {
    const h = getHits();
    h[url] = (h[url] || 0) + 1;
    localStorage.setItem(HITS_KEY, JSON.stringify(h));
  }

  // ---------- 初始化 ----------
  applyVisualConfig();
  if (cfg.title) {
    heroTitle.textContent = cfg.title;
    document.title = cfg.title + " — 网址导航";
  }
  if (heroSubtitle && cfg.subtitle) heroSubtitle.textContent = cfg.subtitle;
  initTheme();
  renderNav();
  renderContent();
  renderUptime();
  renderHeroButtons();
  initWallpaper();
  initClockGreeting();
  initPetals();
  initContextMenu();
  initShortcuts();
  restoreFromHash();

  // ====================================================================
  //  外观
  // ====================================================================
  function applyVisualConfig() {
    const root = document.documentElement;
    if (cfg.themeColor) {
      root.style.setProperty("--primary", cfg.themeColor);
      root.style.setProperty("--primary-2", lighten(cfg.themeColor, 0.15));
      root.style.setProperty("--primary-rgb", hexToRgb(cfg.themeColor));
    }
    root.setAttribute("data-density", cfg.density || "normal");
    root.setAttribute("data-anim",    cfg.enableAnimations === false ? "off" : "on");
    root.setAttribute("data-glass",   cfg.glassmorphism === false ? "off" : "on");

    if (cfg.showClock === false && cfg.showGreeting === false) {
      heroMeta.style.display = "none";
    }
  }

  // ====================================================================
  //  壁纸
  // ====================================================================
  function initWallpaper() {
    const list = Array.isArray(cfg.wallpapers) ? cfg.wallpapers : [];
    const mode = cfg.wallpaperMode || "rotate";

    if (mode === "off" || list.length === 0) {
      document.documentElement.setAttribute("data-has-wp", "off");
      pageBg.classList.add("fallback");
      wpShuffle.style.display = "none";
      return;
    }
    document.documentElement.setAttribute("data-has-wp", "on");

    let idx = mode === "static" ? 0 : Math.floor(Math.random() * list.length);
    setWallpaper(list[idx]);

    wpShuffle.addEventListener("click", () => {
      idx = (idx + 1) % list.length;
      setWallpaper(list[idx]);
    });

    if (mode === "rotate" && cfg.wallpaperInterval > 0) {
      setInterval(() => {
        idx = (idx + 1) % list.length;
        setWallpaper(list[idx]);
      }, cfg.wallpaperInterval * 1000);
    }
  }
  function setWallpaper(url) {
    if (!url) return;
    const img = new Image();
    img.onload = () => {
      pageBg.classList.remove("fallback");
      pageBg.style.backgroundImage = `url("${url}")`;
    };
    img.onerror = () => {
      pageBg.classList.add("fallback");
      pageBg.style.backgroundImage = "";
    };
    img.src = url;
  }

  // ====================================================================
  //  时钟 + 问候语
  // ====================================================================
  function initClockGreeting() {
    if (cfg.showClock !== false) {
      const tick = () => {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        clockEl.textContent = `🕐 ${hh}:${mm}`;
      };
      tick(); setInterval(tick, 30000);
    } else {
      clockEl.style.display = "none";
    }
    if (cfg.showGreeting !== false) {
      const h = new Date().getHours();
      let g = "晚上好";
      if (h < 6)        g = "凌晨好";
      else if (h < 11)  g = "早上好";
      else if (h < 13)  g = "中午好";
      else if (h < 18)  g = "下午好";
      greetingEl.textContent = "👋 " + g;
    } else {
      greetingEl.style.display = "none";
    }
  }

  // ====================================================================
  //  顶部按钮
  // ====================================================================
  function renderHeroButtons() {
    const btns = Array.isArray(cfg.heroButtons) ? cfg.heroButtons : [];
    heroTags.innerHTML = btns.map((b, i) => {
      const label = `${b.icon || ""} ${b.label || ""}`.trim();
      const href = b.action === "url" ? (b.url || "#") : "#";
      const target = b.action === "url" && /^https?:\/\//.test(b.url || "") ? "_blank" : "";
      return `<a class="tag" href="${href}" data-i="${i}" ${target ? `target="${target}" rel="noopener"` : ""}>${escapeHtml(label)}</a>`;
    }).join("");
    heroTags.querySelectorAll(".tag").forEach(a => {
      a.addEventListener("click", e => {
        const i = +a.dataset.i;
        const b = btns[i];
        if (!b) return;
        if (b.action === "url") return;
        e.preventDefault();
        runAction(b.action);
      });
    });
  }

  function runAction(action) {
    switch (action) {
      case "random": openRandom(); break;
      case "theme": toggleTheme(); break;
      case "shuffle-wp": wpShuffle?.click(); break;
      case "scroll-top": window.scrollTo({ top: 0, behavior: "smooth" }); break;
      case "search-focus": searchInput?.focus(); break;
      case "petals-burst": petalBurst(); break;
    }
  }
  function openRandom() {
    const all = window.CATEGORIES.flatMap(c => c.sites);
    const pick = all[Math.floor(Math.random() * all.length)];
    if (pick?.url) {
      bumpHit(pick.url);
      window.open(pick.url, "_blank", "noopener");
      toast(`随机打开：${pick.name}`);
    }
  }

  // ====================================================================
  //  侧边栏
  // ====================================================================
  function renderNav() {
    navEl.innerHTML = window.CATEGORIES.map((c, i) => `
      <div class="nav-item ${i === 0 ? "active" : ""}" data-cat="${c.id}">
        <span class="nav-icon">${c.icon || "📁"}</span>
        <span>${escapeHtml(c.name)}</span>
        <span class="nav-count">${c.sites.length}</span>
      </div>
    `).join("");

    navEl.addEventListener("click", e => {
      const item = e.target.closest(".nav-item");
      if (!item) return;
      const id = item.dataset.cat;
      jumpTo(id);
    });
  }

  function jumpTo(id) {
    const target = document.getElementById("cat-" + id);
    if (!target) return;
    navEl.querySelectorAll(".nav-item").forEach(n =>
      n.classList.toggle("active", n.dataset.cat === id));
    window.scrollTo({ top: target.offsetTop - 10, behavior: "smooth" });
    history.replaceState(null, "", "#" + id);
    if (window.innerWidth <= 860) closeSidebar();
  }

  function restoreFromHash() {
    const id = location.hash.slice(1);
    if (!id) return;
    setTimeout(() => {
      const el = document.getElementById("cat-" + id);
      if (el) window.scrollTo({ top: el.offsetTop - 10, behavior: "instant" });
    }, 50);
  }

  // ====================================================================
  //  主内容
  // ====================================================================
  function renderContent() {
    const kw = state.keyword.trim().toLowerCase();
    let total = 0;

    const html = window.CATEGORIES.map(cat => {
      let sites = cat.sites.slice();
      if (kw) {
        sites = sites.filter(s =>
          s.name.toLowerCase().includes(kw) ||
          (s.desc || "").toLowerCase().includes(kw) ||
          cat.name.toLowerCase().includes(kw)
        );
      }
      if (state.sort === "name") {
        sites.sort((a, b) => a.name.localeCompare(b.name, "zh"));
      } else if (state.sort === "popular") {
        const hits = getHits();
        sites.sort((a, b) => (hits[b.url] || 0) - (hits[a.url] || 0));
      }
      if (!sites.length) return "";
      total += sites.length;

      return `
        <section class="category" id="cat-${cat.id}">
          <h2 class="category-title">
            <span class="icon-bubble">${cat.icon || "📁"}</span>
            <span>${escapeHtml(cat.name)}</span>
            <span class="category-count">· ${sites.length}</span>
          </h2>
          <div class="grid">
            ${sites.map((s, i) => renderCard(s, i, cat.id)).join("")}
          </div>
        </section>
      `;
    }).join("");

    contentEl.innerHTML = html || `
      <div class="empty">
        <div class="empty-icon">🌸</div>
        <div>没有找到与 "<strong>${escapeHtml(state.keyword)}</strong>" 相关的网站</div>
        <div style="margin-top:14px;">
          <button class="chip" id="emptySearchExt">用外部引擎搜索</button>
        </div>
      </div>
    `;

    document.getElementById("emptySearchExt")?.addEventListener("click", () => {
      const url = engineUrl(state.engine === "local" ? "google" : state.engine, state.keyword);
      if (url) window.open(url, "_blank", "noopener");
    });

    if (kw) {
      resultInfo.textContent = `共找到 ${total} 个匹配结果`;
    } else {
      const totalSites = window.CATEGORIES.reduce((n, c) => n + c.sites.length, 0);
      resultInfo.textContent = `共收录 ${window.CATEGORIES.length} 个分类 · ${totalSites} 个网站`;
    }

    // 卡片点击：记录点击数 + 右键菜单
    contentEl.querySelectorAll(".card").forEach(el => {
      el.addEventListener("click", () => bumpHit(el.dataset.url));
      el.addEventListener("contextmenu", e => {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, {
          url: el.dataset.url,
          name: el.dataset.name,
          cat: el.dataset.cat,
        });
      });
    });
  }

  function renderCard(s, i, catId) {
    const isImg = typeof s.icon === "string" && /^https?:\/\//.test(s.icon);
    const iconHtml = isImg
      ? `<img src="${s.icon}" alt="" loading="lazy" />`
      : `<span>${s.icon || faviconFallback(s.url)}</span>`;
    const bg = isImg ? "transparent" : (s.color || "var(--primary)");
    const delay = Math.min(i * 30, 400);
    return `
      <a class="card"
         href="${escapeAttr(s.url)}"
         data-url="${escapeAttr(s.url)}"
         data-name="${escapeAttr(s.name)}"
         data-cat="${escapeAttr(catId)}"
         target="_blank" rel="noopener"
         title="${escapeAttr(s.name)}${s.desc ? '\n' + s.desc : ''}\n${s.url}"
         style="animation-delay:${delay}ms">
        <div class="card-icon" style="background:${bg}">${iconHtml}</div>
        <div class="card-body">
          <div class="card-title">${escapeHtml(s.name)}</div>
          <div class="card-desc">${escapeHtml(s.desc || hostOf(s.url))}</div>
        </div>
      </a>
    `;
  }

  function faviconFallback(url) {
    // 没有 emoji 图标时回退到一个字母气泡
    try {
      const h = new URL(url).hostname.replace(/^www\./, "");
      return h[0]?.toUpperCase() || "🌐";
    } catch { return "🌐"; }
  }
  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); }
    catch { return ""; }
  }

  // ====================================================================
  //  搜索
  // ====================================================================
  let searchTimer;
  searchInput.addEventListener("input", e => {
    clearTimeout(searchTimer);
    const v = e.target.value;
    searchClear.hidden = !v;
    searchTimer = setTimeout(() => {
      state.keyword = v;
      if (state.engine === "local") renderContent();
    }, 100);
  });

  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    state.keyword = "";
    searchClear.hidden = true;
    renderContent();
  });

  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const q = searchInput.value.trim();
      if (!q) return;
      // 站内引擎：如只有 1 条结果，回车直接打开它
      if (state.engine === "local") {
        const matches = window.CATEGORIES
          .flatMap(c => c.sites)
          .filter(s => s.name.toLowerCase().includes(q.toLowerCase())
                    || (s.desc || "").toLowerCase().includes(q.toLowerCase()));
        if (matches.length === 1) {
          bumpHit(matches[0].url);
          window.open(matches[0].url, "_blank", "noopener");
          return;
        }
        // 否则用 Google 兜底
        const url = engineUrl("google", q);
        if (url) window.open(url, "_blank", "noopener");
      } else {
        const url = engineUrl(state.engine, q);
        if (url) window.open(url, "_blank", "noopener");
      }
    }
  });

  // 引擎 chip 切换
  enginesEl.addEventListener("click", e => {
    const btn = e.target.closest(".engine-btn");
    if (!btn) return;
    enginesEl.querySelectorAll(".engine-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.engine = btn.dataset.engine;
    if (state.engine === "local") {
      state.keyword = searchInput.value;
    } else {
      state.keyword = "";
    }
    renderContent();
    searchInput.focus();
  });

  function engineUrl(engine, q) {
    const e = encodeURIComponent(q);
    return {
      local:  null,
      google: `https://www.google.com/search?q=${e}`,
      bing:   `https://www.bing.com/search?q=${e}`,
      baidu:  `https://www.baidu.com/s?wd=${e}`,
      ddg:    `https://duckduckgo.com/?q=${e}`,
    }[engine] || null;
  }

  // ====================================================================
  //  排序 chip
  // ====================================================================
  // 给 toolbar 加常用 chip
  (function injectSortChips() {
    const right = document.querySelector(".toolbar-right");
    if (!right) return;
    if (!right.querySelector('[data-sort="popular"]')) {
      const popular = document.createElement("button");
      popular.className = "chip";
      popular.dataset.sort = "popular";
      popular.textContent = "🔥 常用";
      right.insertBefore(popular, right.firstChild);
    }
  })();

  document.querySelectorAll(".chip[data-sort]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".chip[data-sort]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.sort = btn.dataset.sort;
      renderContent();
    });
  });

  // ====================================================================
  //  侧边栏 + 滚动联动
  // ====================================================================
  toggleBtn?.addEventListener("click", openSidebar);
  sidebarMask?.addEventListener("click", closeSidebar);
  function openSidebar() {
    sidebar.classList.add("open");
    sidebarMask.classList.add("show");
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarMask.classList.remove("show");
  }

  let scrollTimer;
  window.addEventListener("scroll", () => {
    backTop.classList.toggle("show", window.scrollY > 300);
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const y = window.scrollY + 80;
      let current = window.CATEGORIES[0]?.id;
      for (const cat of window.CATEGORIES) {
        const el = document.getElementById("cat-" + cat.id);
        if (el && el.offsetTop <= y) current = cat.id;
      }
      if (current && current !== state.activeCat) {
        state.activeCat = current;
        navEl.querySelectorAll(".nav-item").forEach(n =>
          n.classList.toggle("active", n.dataset.cat === current));
        // 不要每次滚动都改 hash，避免抖动 / 历史记录爆炸
      }
    }, 80);
  }, { passive: true });

  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ====================================================================
  //  右键菜单
  // ====================================================================
  let ctxTarget = null;

  function initContextMenu() {
    document.addEventListener("click", () => hideContextMenu());
    window.addEventListener("scroll", () => hideContextMenu(), { passive: true });
    document.addEventListener("keydown", e => { if (e.key === "Escape") hideContextMenu(); });
    ctxMenu.addEventListener("click", e => {
      const btn = e.target.closest("button[data-act]");
      if (!btn || !ctxTarget) return;
      const act = btn.dataset.act;
      const t = ctxTarget;
      if (act === "open")        window.open(t.url, "_blank", "noopener");
      else if (act === "open-self") location.href = t.url;
      else if (act === "copy")   copyText(t.url, "已复制链接");
      else if (act === "copy-name") copyText(t.name, "已复制名称");
      else if (act === "edit")   location.href = "admin.html#edit-" + encodeURIComponent(t.cat);
      hideContextMenu();
    });
  }

  function showContextMenu(x, y, data) {
    ctxTarget = data;
    ctxMenu.hidden = false;
    // 防止超出视口
    const rect = ctxMenu.getBoundingClientRect();
    const W = window.innerWidth, H = window.innerHeight;
    if (x + rect.width  > W) x = W - rect.width  - 8;
    if (y + rect.height > H) y = H - rect.height - 8;
    ctxMenu.style.left = x + "px";
    ctxMenu.style.top  = y + "px";
  }
  function hideContextMenu() {
    ctxMenu.hidden = true;
    ctxTarget = null;
  }

  // ====================================================================
  //  快捷键
  // ====================================================================
  let gPressed = 0;
  function initShortcuts() {
    document.addEventListener("keydown", e => {
      // 输入框中只处理少量
      const inInput = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      if (inInput) {
        if (e.key === "Escape" && document.activeElement === searchInput) {
          searchInput.value = "";
          state.keyword = "";
          searchClear.hidden = true;
          renderContent();
          searchInput.blur();
        }
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Help: ? (即 shift+/)
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        helpModal.hidden = !helpModal.hidden;
        return;
      }
      if (e.key === "Escape") {
        helpModal.hidden = true;
        hideContextMenu();
        return;
      }

      // 单字符
      switch (e.key) {
        case "/":
          e.preventDefault();
          searchInput.focus();
          break;
        case "r": openRandom(); break;
        case "w": wpShuffle?.click(); break;
        case "d": toggleTheme(); break;
        case "s": petalBurst(); break;
        case "g":
          gPressed = Date.now();
          break;
        case "t":
          if (Date.now() - gPressed < 800) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            gPressed = 0;
          }
          break;
        case "a":
          if (Date.now() - gPressed < 800) {
            location.href = "admin.html";
            gPressed = 0;
          }
          break;
      }
    });

    helpClose?.addEventListener("click", () => helpModal.hidden = true);
    helpModal?.addEventListener("click", e => {
      if (e.target === helpModal) helpModal.hidden = true;
    });
  }

  // ====================================================================
  //  主题
  // ====================================================================
  function initTheme() {
    const saved = localStorage.getItem("theme");
    const prefer = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", saved || prefer);
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    localStorage.setItem("theme", cur);
    toast(cur === "dark" ? "🌙 已切换到深色模式" : "☀️ 已切换到浅色模式");
  }

  // ====================================================================
  //  运行天数
  // ====================================================================
  function renderUptime() {
    const start = cfg.startDate;
    if (!start || !uptimeEl) return;
    const update = () => {
      const diff = Date.now() - new Date(start).getTime();
      if (diff < 0) return;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      uptimeEl.textContent = `已稳定运行 ${d} 天 ${h} 时 ${m} 分`;
    };
    update();
    setInterval(update, 60000);
  }

  // ====================================================================
  //  Toast
  // ====================================================================
  let toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "app-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function copyText(text, msg) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => toast(msg || "已复制"),
        () => fallbackCopy(text, msg)
      );
    } else {
      fallbackCopy(text, msg);
    }
  }
  function fallbackCopy(text, msg) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast(msg || "已复制"); }
    catch { toast("复制失败"); }
    document.body.removeChild(ta);
  }

  // ====================================================================
  //  工具
  // ====================================================================
  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!m) return "255, 111, 163";
    const n = parseInt(m[1], 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }
  function lighten(hex, amount) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!m) return hex;
    let n = parseInt(m[1], 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
  }

  // ====================================================================
  //  🌸 樱花特效
  // ====================================================================
  let petalsRuntime = null;

  function initPetals() {
    if (cfg.petals === false) return;
    const canvas = document.getElementById("petalsCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = canvas.width  = innerWidth  * dpr;
      H = canvas.height = innerHeight * dpr;
      canvas.style.width  = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    const COLORS = [
      "rgba(255,182,193,0.85)",
      "rgba(255,192,203,0.80)",
      "rgba(255,210,220,0.78)",
      "rgba(255,160,190,0.85)",
      "rgba(255,255,255,0.82)",
    ];

    class Petal {
      constructor(burst = false) { this.reset(burst); }
      reset(burst) {
        this.x = Math.random() * W;
        this.y = burst
          ? (innerHeight * 0.35 + Math.random() * 80) * dpr
          : -20 * dpr - Math.random() * H * 0.5;
        this.size = (8 + Math.random() * 10) * dpr;
        this.speedY = (0.6 + Math.random() * 0.9) * dpr;
        this.speedX = (Math.random() - 0.5) * 0.7 * dpr;
        this.swayPhase = Math.random() * Math.PI * 2;
        this.swaySpeed = 0.01 + Math.random() * 0.02;
        this.swayAmp   = 0.6 + Math.random() * 0.8;
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.04;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
      update() {
        this.swayPhase += this.swaySpeed;
        this.x += this.speedX + Math.sin(this.swayPhase) * this.swayAmp;
        this.y += this.speedY;
        this.angle += this.rotSpeed;
        if (this.y > H + 30 * dpr) this.reset(false);
        if (this.x < -40 * dpr)  this.x = W + 20 * dpr;
        if (this.x > W + 40 * dpr) this.x = -20 * dpr;
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.5);
        ctx.bezierCurveTo(s * 0.55, -s * 0.5, s * 0.55, s * 0.4, 0, s * 0.55);
        ctx.bezierCurveTo(-s * 0.55, s * 0.4, -s * 0.55, -s * 0.5, 0, -s * 0.5);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.5);
        ctx.bezierCurveTo(s * 0.15, -s * 0.55, s * 0.12, -s * 0.3, 0, -s * 0.32);
        ctx.bezierCurveTo(-s * 0.12, -s * 0.3, -s * 0.15, -s * 0.55, 0, -s * 0.5);
        ctx.fill();
        ctx.restore();
      }
    }

    const baseCount = Math.floor((innerWidth * innerHeight) / 38000);
    const petals = Array.from({ length: Math.min(baseCount, 30) }, () => new Petal());

    let raf;
    function loop() {
      ctx.clearRect(0, 0, W, H);
      for (const p of petals) { p.update(); p.draw(); }
      raf = requestAnimationFrame(loop);
    }
    loop();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else loop();
    });

    petalsRuntime = {
      addBurst(n = 30) {
        for (let i = 0; i < n; i++) petals.push(new Petal(true));
        while (petals.length > 80) petals.shift();
      }
    };
  }

  function petalBurst() {
    if (petalsRuntime) {
      petalsRuntime.addBurst(40);
    } else {
      cfg.petals = true;
      initPetals();
      setTimeout(() => petalsRuntime?.addBurst(40), 50);
    }
  }
})();
