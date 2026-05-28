/* ====================================================================
 *  AzusaWebList · 后台管理逻辑
 * ==================================================================== */
(function () {
  // ------------------ 登录 ------------------
  const PWD_KEY = "azusa.admin.pwd";
  const SESSION_KEY = "azusa.admin.session";
  const DEFAULT_PWD = "Jyt123456.";

  const loginMask = document.getElementById("loginMask");
  const loginPwd  = document.getElementById("loginPwd");
  const loginBtn  = document.getElementById("loginBtn");
  const adminWrap = document.getElementById("adminWrap");

  function getPwd() { return localStorage.getItem(PWD_KEY) || DEFAULT_PWD; }

  function tryLogin() {
    if (loginPwd.value === getPwd()) {
      sessionStorage.setItem(SESSION_KEY, "1");
      showAdmin();
    } else {
      loginPwd.style.borderColor = "#ef476f";
      loginPwd.value = "";
      loginPwd.placeholder = "密码错误";
      loginPwd.focus();
    }
  }
  function showAdmin() {
    loginMask.style.display = "none";
    adminWrap.hidden = false;
    init();
  }

  loginBtn.addEventListener("click", tryLogin);
  loginPwd.addEventListener("keydown", e => { if (e.key === "Enter") tryLogin(); });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  // ------------------ 数据 ------------------
  // 若 localStorage 里的数据是空的（损坏 / 误存），回退到默认
  if (!Array.isArray(window.CATEGORIES) || window.CATEGORIES.length === 0) {
    window.CATEGORIES = JSON.parse(JSON.stringify(window.DEFAULT_CATEGORIES || []));
    localStorage.removeItem("azusa.categories");
  }

  // 深拷贝当前数据用于编辑
  let cats   = JSON.parse(JSON.stringify(window.CATEGORIES || []));
  let config = JSON.parse(JSON.stringify(window.SITE_CONFIG || {}));
  let dirty  = false;

  function markDirty() {
    dirty = true;
    pushUndoSnapshot();
    document.getElementById("dirtyDot")?.removeAttribute("hidden");
    document.title = "● AzusaWebList · 后台";
  }
  function clearDirty() {
    dirty = false;
    document.getElementById("dirtyDot")?.setAttribute("hidden", "");
    document.title = "AzusaWebList · 后台";
  }

  // ---------- 撤销 / 重做 ----------
  const undoStack = [];
  const redoStack = [];
  let undoLockUntil = 0;
  function snapshot() {
    return {
      cats:   JSON.parse(JSON.stringify(cats)),
      config: JSON.parse(JSON.stringify(config)),
    };
  }
  function pushUndoSnapshot() {
    if (Date.now() < undoLockUntil) return;
    undoLockUntil = Date.now() + 200;
    undoStack.push(snapshot());
    if (undoStack.length > 50) undoStack.shift();
    redoStack.length = 0;
    refreshUndoBtns();
  }
  function applySnapshot(snap) {
    cats = JSON.parse(JSON.stringify(snap.cats));
    config = JSON.parse(JSON.stringify(snap.config));
    renderCategories();
    renderSettings();
    renderExportPreview();
  }
  function undo() {
    if (undoStack.length === 0) return;
    redoStack.push(snapshot());
    const last = undoStack.pop();
    applySnapshot(last);
    refreshUndoBtns();
    toast("已撤销");
  }
  function redo() {
    if (redoStack.length === 0) return;
    undoStack.push(snapshot());
    const next = redoStack.pop();
    applySnapshot(next);
    refreshUndoBtns();
    toast("已重做");
  }
  function refreshUndoBtns() {
    const u = document.getElementById("undoBtn");
    const r = document.getElementById("redoBtn");
    if (u) u.disabled = undoStack.length === 0;
    if (r) r.disabled = redoStack.length === 0;
  }

  window.addEventListener("beforeunload", e => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = "有未保存的修改，确定离开？";
    }
  });

  // ------------------ 主流程 ------------------
  function init() {
    bindTabs();
    renderCategories();
    renderSettings();
    renderExportPreview();
    bindGlobalActions();
    initAdminSearch();
    initAdminShortcuts();
  }

  function bindTabs() {
    document.querySelectorAll(".tab").forEach(t => {
      t.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(x => x.classList.remove("active"));
        t.classList.add("active");
        document.querySelector(`[data-pane="${t.dataset.tab}"]`).classList.add("active");
        if (t.dataset.tab === "data") renderExportPreview();
      });
    });
  }

  // ------------------ 分类管理 ------------------
  const catList = document.getElementById("catList");

  function renderCategories() {
    catList.innerHTML = cats.map((c, i) => `
      <div class="cat-card" data-idx="${i}">
        <div class="cat-head">
          <span class="drag-handle" title="按住拖动排序">⋮⋮</span>
          <div class="cat-icon-edit">${escapeHtml(c.icon || "📁")}</div>
          <div class="cat-name">${escapeHtml(c.name)} <span class="cat-meta">/ ${escapeHtml(c.id)} · ${c.sites.length} 个</span></div>
          <div class="cat-actions">
            <button class="icon-btn" data-action="edit-cat" data-idx="${i}" title="编辑分类">✏️</button>
            <button class="icon-btn danger" data-action="del-cat" data-idx="${i}" title="删除分类">🗑️</button>
          </div>
        </div>
        <div class="site-grid" data-cat="${i}">
          ${c.sites.map((s, j) => renderMiniSite(s, i, j)).join("")}
          <div class="site-mini add" data-action="add-site" data-cat="${i}">＋ 添加网站</div>
        </div>
      </div>
    `).join("") + `
      <div style="text-align:center; margin-top:8px;">
        <button class="btn ghost" id="addCatBtn2">＋ 新建分类</button>
      </div>
    `;

    document.getElementById("addCatBtn2")?.addEventListener("click", addCategory);
    bindCategoryEvents();
    bindDnD();
  }

  function renderMiniSite(s, ci, si) {
    const isImg = typeof s.icon === "string" && /^https?:\/\//.test(s.icon);
    const iconHtml = isImg
      ? `<img src="${escapeAttr(s.icon)}" alt="">`
      : `<span>${escapeHtml(s.icon || "🌐")}</span>`;
    const bg = isImg ? "transparent" : (s.color || "#3a86ff");
    return `
      <div class="site-mini" data-action="edit-site" data-cat="${ci}" data-idx="${si}" draggable="true">
        <div class="mini-icon" style="background:${bg}">${iconHtml}</div>
        <div class="mini-name" title="${escapeAttr(s.name)}">${escapeHtml(s.name)}</div>
        <button class="mini-del" data-action="del-site" data-cat="${ci}" data-idx="${si}" title="删除">✕</button>
      </div>
    `;
  }

  function bindCategoryEvents() {
    catList.querySelectorAll("[data-action]").forEach(el => {
      el.addEventListener("click", e => {
        e.stopPropagation();
        const a = el.dataset.action;
        if (a === "edit-cat") return editCategory(+el.dataset.idx);
        if (a === "del-cat")  return deleteCategory(+el.dataset.idx);
        const ci = +el.dataset.cat;
        const si = +el.dataset.idx;
        if (a === "add-site")       editSite(ci, -1);
        else if (a === "edit-site") editSite(ci, si);
        else if (a === "del-site")  deleteSite(ci, si);
      });
    });
  }

  function addCategory() {
    editCategory(-1);
  }

  function editCategory(idx) {
    const isNew = idx < 0;
    const c = isNew ? { id: "", name: "", icon: "📁", sites: [] } : cats[idx];
    openModal(isNew ? "新建分类" : "编辑分类", `
      <label>分类 ID（英文，唯一）<input id="m-id" value="${escapeAttr(c.id)}" /></label>
      <label>名称<input id="m-name" value="${escapeAttr(c.name)}" /></label>
      <label>图标 (emoji)<input id="m-icon" value="${escapeAttr(c.icon)}" /></label>
    `, () => {
      const id   = document.getElementById("m-id").value.trim();
      const name = document.getElementById("m-name").value.trim();
      const icon = document.getElementById("m-icon").value.trim() || "📁";
      if (!id || !name) { toast("ID 和名称必填", "error"); return false; }
      if (isNew && cats.some(x => x.id === id)) { toast("ID 已存在", "error"); return false; }
      if (isNew) cats.push({ id, name, icon, sites: [] });
      else { c.id = id; c.name = name; c.icon = icon; }
      markDirty();
      renderCategories();
      return true;
    });
  }

  function deleteCategory(idx) {
    if (!confirm(`确定删除分类「${cats[idx].name}」及其下所有网站？`)) return;
    cats.splice(idx, 1);
    markDirty();
    renderCategories();
  }

  function editSite(ci, si) {
    const isNew = si < 0;
    const s = isNew
      ? { name: "", desc: "", url: "", icon: "🌐", color: "#3a86ff" }
      : { ...cats[ci].sites[si] };

    openModal(isNew ? "新建网站" : "编辑网站", `
      <div class="preview">
        <div class="preview-icon" id="prev-icon" style="background:${escapeAttr(s.color || "#3a86ff")}">
          ${/^https?:\/\//.test(s.icon) ? `<img src="${escapeAttr(s.icon)}">` : escapeHtml(s.icon || "🌐")}
        </div>
        <div>
          <div id="prev-name" style="font-weight:500">${escapeHtml(s.name) || "网站名"}</div>
          <div id="prev-desc" style="font-size:12px;color:var(--text-3)">${escapeHtml(s.desc) || "描述"}</div>
        </div>
      </div>
      <label>名称 <input id="m-name" value="${escapeAttr(s.name)}" /></label>
      <label>描述 <input id="m-desc" value="${escapeAttr(s.desc)}" /></label>
      <label>URL  <input id="m-url"  value="${escapeAttr(s.url)}" placeholder="https://..." /></label>
      <label>图标（emoji 或 https 图片 URL）<input id="m-icon" value="${escapeAttr(s.icon)}" /></label>
      <label>颜色（图标是 emoji 时作背景）<input id="m-color" type="color" value="${pickColor(s.color)}" /></label>
    `, () => {
      const name = document.getElementById("m-name").value.trim();
      const url  = document.getElementById("m-url").value.trim();
      if (!name) { toast("名称必填", "error"); return false; }
      const data = {
        name,
        desc: document.getElementById("m-desc").value.trim(),
        url:  url || "https://www.google.com/search?q=" + encodeURIComponent(name),
        icon: document.getElementById("m-icon").value.trim() || "🌐",
        color: document.getElementById("m-color").value
      };
      if (isNew) cats[ci].sites.push(data);
      else cats[ci].sites[si] = data;
      markDirty();
      renderCategories();
      return true;
    });

    // 实时预览
    setTimeout(() => {
      const wire = (id, key) => {
        const inp = document.getElementById(id);
        inp?.addEventListener("input", () => updatePreview());
      };
      wire("m-name");
      wire("m-desc");
      wire("m-icon");
      wire("m-color");
      function updatePreview() {
        const name = document.getElementById("m-name").value || "网站名";
        const desc = document.getElementById("m-desc").value || "描述";
        const icon = document.getElementById("m-icon").value || "🌐";
        const color = document.getElementById("m-color").value;
        const isImg = /^https?:\/\//.test(icon);
        document.getElementById("prev-name").textContent = name;
        document.getElementById("prev-desc").textContent = desc;
        const pi = document.getElementById("prev-icon");
        pi.style.background = isImg ? "transparent" : color;
        pi.innerHTML = isImg
          ? `<img src="${escapeAttr(icon)}">`
          : escapeHtml(icon);
      }
    }, 30);
  }

  function deleteSite(ci, si) {
    if (!confirm(`删除网站「${cats[ci].sites[si].name}」？`)) return;
    cats[ci].sites.splice(si, 1);
    markDirty();
    renderCategories();
  }

  // ------------------ 拖拽排序 ------------------
  function bindDnD() {
    // 分类卡片整体排序：按住 ⋮⋮ 手柄才允许拖
    catList.querySelectorAll(".cat-card").forEach(card => {
      const handle = card.querySelector(".drag-handle");

      // 只有按住手柄时才把卡片设为 draggable，松开就关掉
      handle?.addEventListener("mousedown", () => card.setAttribute("draggable", "true"));
      card.addEventListener("mouseup",     () => card.removeAttribute("draggable"));
      card.addEventListener("mouseleave",  () => card.removeAttribute("draggable"));

      card.addEventListener("dragstart", e => {
        // 必须设置 dataTransfer 否则 Firefox 不触发拖动
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "cat");
        card.classList.add("dragging");
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        card.removeAttribute("draggable");
      });
      card.addEventListener("dragover", e => {
        const dragging = catList.querySelector(".cat-card.dragging");
        if (!dragging || dragging === card) return;
        e.preventDefault();
        const rect = card.getBoundingClientRect();
        const after = (e.clientY - rect.top) > rect.height / 2;
        card.parentNode.insertBefore(dragging, after ? card.nextSibling : card);
      });
      card.addEventListener("drop", e => {
        e.preventDefault();
        commitOrderFromDom();
      });
    });

    // 站点卡内排序
    catList.querySelectorAll(".site-grid").forEach(grid => {
      let src = null;
      grid.querySelectorAll(".site-mini:not(.add)").forEach(item => {
        item.addEventListener("dragstart", e => {
          src = item; item.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
          e.stopPropagation();
        });
        item.addEventListener("dragend", () => {
          item.classList.remove("dragging");
          commitOrderFromDom();
        });
      });
      grid.addEventListener("dragover", e => {
        const dragging = grid.querySelector(".site-mini.dragging");
        if (!dragging) return;
        e.preventDefault();
        const after = [...grid.querySelectorAll(".site-mini:not(.dragging):not(.add)")]
          .find(el => {
            const r = el.getBoundingClientRect();
            return e.clientY < r.top + r.height / 2;
          });
        if (after) grid.insertBefore(dragging, after);
        else grid.insertBefore(dragging, grid.querySelector(".site-mini.add"));
      });
    });
  }

  function commitOrderFromDom() {
    const newCats = [];
    catList.querySelectorAll(".cat-card").forEach(card => {
      const ci = +card.dataset.idx;
      const cat = cats[ci];
      const sites = [];
      card.querySelectorAll(".site-mini:not(.add)").forEach(item => {
        const j = +item.dataset.idx;
        sites.push(cat.sites[j]);
      });
      newCats.push({ ...cat, sites });
    });
    cats = newCats;
    markDirty();
    renderCategories();
  }

  // ------------------ 设置 ------------------
  function renderSettings() {
    document.getElementById("cfgTitle").value     = config.title || "";
    document.getElementById("cfgSubtitle").value  = config.subtitle || "";
    document.getElementById("cfgStartDate").value = config.startDate || "";
    document.getElementById("cfgPwd").value       = "";

    // 外观
    document.getElementById("cfgThemeColor").value = config.themeColor || "#4f7cff";
    document.getElementById("cfgDensity").value    = config.density || "normal";
    document.getElementById("cfgClock").checked    = config.showClock !== false;
    document.getElementById("cfgGreeting").checked = config.showGreeting !== false;
    document.getElementById("cfgAnim").checked     = config.enableAnimations !== false;
    document.getElementById("cfgGlass").checked    = config.glassmorphism !== false;
    document.getElementById("cfgPetals").checked   = config.petals !== false;

    // 壁纸
    document.getElementById("cfgWpMode").value       = config.wallpaperMode || "rotate";
    document.getElementById("cfgWpInterval").value   = config.wallpaperInterval ?? 0;
    document.getElementById("cfgWpList").value       = (config.wallpapers || []).join("\n");

    ["cfgTitle","cfgSubtitle","cfgStartDate",
     "cfgThemeColor","cfgDensity","cfgClock","cfgGreeting","cfgAnim","cfgGlass","cfgPetals",
     "cfgWpMode","cfgWpInterval","cfgWpList"]
      .forEach(id => {
        const el = document.getElementById(id);
        if (!el || el.dataset.bound === "1") return;
        el.dataset.bound = "1";
        el.addEventListener("input",  markDirty);
        el.addEventListener("change", markDirty);
      });

    // 壁纸快捷按钮
    const addSampleBtn = document.getElementById("wpAddSampleBtn");
    if (addSampleBtn && !addSampleBtn.dataset.bound) {
      addSampleBtn.dataset.bound = "1";
      addSampleBtn.addEventListener("click", () => {
        const samples = [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
          "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80",
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80",
          "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&q=80",
        ];
        const ta = document.getElementById("cfgWpList");
        const cur = ta.value.trim();
        ta.value = (cur ? cur + "\n" : "") + samples.join("\n");
        markDirty();
      });
    }
    const clearBtn = document.getElementById("wpClearBtn");
    if (clearBtn && !clearBtn.dataset.bound) {
      clearBtn.dataset.bound = "1";
      clearBtn.addEventListener("click", () => {
        document.getElementById("cfgWpList").value = "";
        markDirty();
      });
    }

    // 顶部按钮
    if (!Array.isArray(config.heroButtons)) config.heroButtons = [];
    renderHeroButtons();
    const addBtn = document.getElementById("addHeroBtnBtn");
    if (addBtn && !addBtn.dataset.bound) {
      addBtn.dataset.bound = "1";
      addBtn.addEventListener("click", () => {
        config.heroButtons.push({ icon: "✨", label: "新按钮", action: "url", url: "https://" });
        markDirty();
        renderHeroButtons();
      });
    }

    fillGhForm();
  }

  function renderHeroButtons() {
    const list = document.getElementById("heroBtnList");
    if (!list) return;
    const btns = config.heroButtons || [];
    list.innerHTML = btns.map((b, i) => `
      <div class="hero-btn-row" data-i="${i}" draggable="true">
        <span class="btn-handle">⋮⋮</span>
        <input type="text" value="${escapeAttr(b.icon || "")}" data-k="icon" placeholder="🎲" />
        <input type="text" value="${escapeAttr(b.label || "")}" data-k="label" placeholder="标签" />
        <input class="url-cell" type="text" value="${escapeAttr(b.url || "")}" data-k="url" placeholder="https://… 或仅 action 时留空" />
        <select class="action-cell" data-k="action">
          <option value="url"           ${b.action==="url"?"selected":""}>跳转链接</option>
          <option value="random"        ${b.action==="random"?"selected":""}>随机一个网站</option>
          <option value="theme"         ${b.action==="theme"?"selected":""}>切换主题</option>
          <option value="shuffle-wp"    ${b.action==="shuffle-wp"?"selected":""}>换张壁纸</option>
          <option value="petals-burst"  ${b.action==="petals-burst"?"selected":""}>🌸 撒花</option>
          <option value="search-focus"  ${b.action==="search-focus"?"selected":""}>聚焦搜索框</option>
          <option value="scroll-top"    ${b.action==="scroll-top"?"selected":""}>回到顶部</option>
        </select>
        <button class="icon-btn danger" data-del="${i}" title="删除">✕</button>
      </div>
    `).join("");

    list.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => {
        const row = el.closest(".hero-btn-row");
        const i = +row.dataset.i;
        const k = el.dataset.k;
        if (!config.heroButtons[i]) return;
        config.heroButtons[i][k] = el.value;
        markDirty();
      });
    });
    list.querySelectorAll("[data-del]").forEach(b => {
      b.addEventListener("click", () => {
        const i = +b.dataset.del;
        config.heroButtons.splice(i, 1);
        markDirty();
        renderHeroButtons();
      });
    });

    // DnD on hero button rows
    let drag = null;
    list.querySelectorAll(".hero-btn-row").forEach(row => {
      row.addEventListener("dragstart", e => {
        drag = row; row.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "row");
      });
      row.addEventListener("dragend", () => {
        row.classList.remove("dragging");
        // commit order
        const newOrder = [];
        list.querySelectorAll(".hero-btn-row").forEach(r => {
          newOrder.push(config.heroButtons[+r.dataset.i]);
        });
        config.heroButtons = newOrder;
        markDirty();
        renderHeroButtons();
      });
      row.addEventListener("dragover", e => {
        if (!drag || drag === row) return;
        e.preventDefault();
        const rect = row.getBoundingClientRect();
        const after = (e.clientY - rect.top) > rect.height / 2;
        row.parentNode.insertBefore(drag, after ? row.nextSibling : row);
      });
    });
  }

  // ------------------ 导出 / 导入 ------------------
  function buildDataJs() {
    const cfgStr  = JSON.stringify(config, null, 2);
    const catsStr = JSON.stringify(cats,   null, 2);
    return `/* AzusaWebList data — generated by admin panel */
window.SITE_CONFIG = ${cfgStr};

window.CATEGORIES = ${catsStr};

window.CATEGORIES.forEach(cat => {
  cat.sites.forEach(s => {
    if (!s.url) s.url = "https://www.google.com/search?q=" + encodeURIComponent(s.name);
  });
});

window.DEFAULT_CATEGORIES  = JSON.parse(JSON.stringify(window.CATEGORIES));
window.DEFAULT_SITE_CONFIG = JSON.parse(JSON.stringify(window.SITE_CONFIG));

try {
  const savedCats = localStorage.getItem("azusa.categories");
  const savedCfg  = localStorage.getItem("azusa.config");
  if (savedCats) window.CATEGORIES  = JSON.parse(savedCats);
  if (savedCfg)  window.SITE_CONFIG = JSON.parse(savedCfg);
} catch (e) { /* ignore */ }
`;
  }

  function renderExportPreview() {
    document.getElementById("exportPreview").value = buildDataJs();
  }

  function download(filename, content, mime = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function bindGlobalActions() {
    document.getElementById("addCatBtn").addEventListener("click", addCategory);

    document.getElementById("hardResetBtn")?.addEventListener("click", () => {
      if (!confirm("确定恢复为代码默认数据？\n（会清空本浏览器保存的所有修改）")) return;
      localStorage.removeItem("azusa.categories");
      localStorage.removeItem("azusa.config");
      cats   = JSON.parse(JSON.stringify(window.DEFAULT_CATEGORIES));
      config = JSON.parse(JSON.stringify(window.DEFAULT_SITE_CONFIG));
      dirty = false;
      renderCategories();
      renderSettings();
      renderExportPreview();
      toast("已恢复默认", "success");
    });

    document.getElementById("saveBtn").addEventListener("click", saveAll);
    document.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveAll();
      }
    });

    document.getElementById("exportJsBtn").addEventListener("click", () => {
      renderExportPreview();
      download("data.js", buildDataJs(), "application/javascript;charset=utf-8");
      toast("已下载 data.js — 替换到 assets/data.js 即可永久生效", "success");
    });
    document.getElementById("exportJsonBtn").addEventListener("click", () => {
      const json = JSON.stringify({ config, categories: cats }, null, 2);
      download("azusa-data.json", json, "application/json;charset=utf-8");
    });
    document.getElementById("copyJsBtn").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(buildDataJs());
        toast("已复制到剪贴板", "success");
      } catch (e) { toast("复制失败：" + e.message, "error"); }
    });

    document.getElementById("importBtn").addEventListener("click", () => {
      const text = document.getElementById("importInput").value.trim();
      if (!text) return;
      try {
        let data;
        if (text.startsWith("{") || text.startsWith("[")) {
          data = JSON.parse(text);
        } else {
          // 假定是 data.js 内容，提取 CATEGORIES
          // 用临时沙箱执行
          const sandbox = {};
          new Function("window", text)(sandbox);
          data = { categories: sandbox.CATEGORIES, config: sandbox.SITE_CONFIG };
        }
        const newCats = Array.isArray(data) ? data : data.categories;
        const newCfg  = data.config;
        if (!Array.isArray(newCats)) throw new Error("数据格式不正确");
        cats = newCats;
        if (newCfg && typeof newCfg === "object") config = newCfg;
        markDirty();
        renderCategories();
        renderSettings();
        renderExportPreview();
        toast("导入成功，记得点保存", "success");
      } catch (e) {
        toast("导入失败：" + e.message, "error");
      }
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
      if (!confirm("重置为默认数据并清空 localStorage？")) return;
      localStorage.removeItem("azusa.categories");
      localStorage.removeItem("azusa.config");
      cats   = JSON.parse(JSON.stringify(window.DEFAULT_CATEGORIES));
      config = JSON.parse(JSON.stringify(window.DEFAULT_SITE_CONFIG));
      dirty = false;
      renderCategories();
      renderSettings();
      renderExportPreview();
      toast("已重置", "success");
    });

    // GitHub 同步相关
    document.getElementById("ghSaveCfgBtn")?.addEventListener("click", () => {
      saveGh(readGhForm());
      toast("✅ GitHub 配置已保存", "success");
    });
    document.getElementById("ghClearBtn")?.addEventListener("click", () => {
      if (!confirm("确定清除 GitHub 配置（包括 Token）？")) return;
      localStorage.removeItem(GH_KEY);
      fillGhForm();
      toast("已清除");
    });
    document.getElementById("ghTestBtn")?.addEventListener("click", ghTest);
    document.getElementById("ghPushBtn")?.addEventListener("click", ghPush);

    // 撤销重做按钮
    document.getElementById("undoBtn")?.addEventListener("click", undo);
    document.getElementById("redoBtn")?.addEventListener("click", redo);
  }

  function saveAll(silent = false) {
    // 基础
    config.title     = document.getElementById("cfgTitle").value.trim();
    config.subtitle  = document.getElementById("cfgSubtitle").value.trim();
    config.startDate = document.getElementById("cfgStartDate").value;
    const newPwd = document.getElementById("cfgPwd").value.trim();
    if (newPwd) {
      localStorage.setItem(PWD_KEY, newPwd);
      document.getElementById("cfgPwd").value = "";
    }

    // 外观
    config.themeColor       = document.getElementById("cfgThemeColor").value;
    config.density          = document.getElementById("cfgDensity").value;
    config.showClock        = document.getElementById("cfgClock").checked;
    config.showGreeting     = document.getElementById("cfgGreeting").checked;
    config.enableAnimations = document.getElementById("cfgAnim").checked;
    config.glassmorphism    = document.getElementById("cfgGlass").checked;
    config.petals           = document.getElementById("cfgPetals").checked;

    // 壁纸
    config.wallpaperMode     = document.getElementById("cfgWpMode").value;
    config.wallpaperInterval = +document.getElementById("cfgWpInterval").value || 0;
    config.wallpapers        = document.getElementById("cfgWpList").value
      .split("\n").map(s => s.trim()).filter(Boolean);

    // 安全检查：拒绝保存空数据，避免覆盖出空白页
    if (!Array.isArray(cats) || cats.length === 0) {
      if (!silent) toast("⚠ 当前数据为空，已阻止保存。请先添加分类或点「恢复默认」", "error");
      return;
    }

    localStorage.setItem("azusa.categories", JSON.stringify(cats));
    localStorage.setItem("azusa.config",     JSON.stringify(config));
    clearDirty();
    renderExportPreview();
    if (!silent) toast("✅ 已保存到本地（前台页面已生效）", "success");

    // 自动推送
    const gh = loadGh();
    if (gh.autoPush && gh.token && gh.owner && gh.repo) {
      ghPush();
    }
  }

  // ------------------ 弹窗 ------------------
  const modal = document.getElementById("modal");
  let modalOnOk = null;

  function openModal(title, html, onOk) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = html;
    modalOnOk = onOk;
    modal.hidden = false;
    setTimeout(() => modal.querySelector("input")?.focus(), 50);
  }
  function closeModal() {
    modal.hidden = true;
    modalOnOk = null;
  }
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalCancel").addEventListener("click", closeModal);
  document.getElementById("modalOk").addEventListener("click", () => {
    if (!modalOnOk || modalOnOk() !== false) closeModal();
  });
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  // ------------------ Toast ------------------
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg, type = "") {
    toastEl.textContent = msg;
    toastEl.className = "toast show " + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  // ------------------ utils ------------------
  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }
  function escapeAttr(s) { return escapeHtml(s); }
  function pickColor(c) {
    // <input type=color> 只接受 #RRGGBB
    if (!c || !/^#[0-9a-fA-F]{6}$/.test(c)) return "#3a86ff";
    return c;
  }

  // ====================================================================
  //  GitHub 同步
  // ====================================================================
  const GH_KEY = "azusa.gh";

  function loadGh() {
    try { return JSON.parse(localStorage.getItem(GH_KEY) || "{}"); }
    catch { return {}; }
  }
  function saveGh(g) { localStorage.setItem(GH_KEY, JSON.stringify(g)); }

  function fillGhForm() {
    const g = loadGh();
    document.getElementById("ghOwner").value  = g.owner  || "";
    document.getElementById("ghRepo").value   = g.repo   || "";
    document.getElementById("ghBranch").value = g.branch || "main";
    document.getElementById("ghPath").value   = g.path   || "assets/data.js";
    document.getElementById("ghToken").value  = g.token  || "";
    document.getElementById("ghMsg").value    = g.msg    || "";
    const ap = document.getElementById("ghAutoPush");
    if (ap) ap.checked = !!g.autoPush;
  }

  function readGhForm() {
    return {
      owner:  document.getElementById("ghOwner").value.trim(),
      repo:   document.getElementById("ghRepo").value.trim(),
      branch: document.getElementById("ghBranch").value.trim() || "main",
      path:   document.getElementById("ghPath").value.trim()   || "assets/data.js",
      token:  document.getElementById("ghToken").value.trim(),
      msg:    document.getElementById("ghMsg").value.trim(),
      autoPush: document.getElementById("ghAutoPush")?.checked || false,
    };
  }

  function ghHeaders(token) {
    return {
      "Accept": "application/vnd.github+json",
      "Authorization": "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }

  // 测试连接：拿仓库基本信息
  async function ghTest() {
    const g = readGhForm();
    if (!g.owner || !g.repo || !g.token) {
      toast("请先填 owner / repo / token", "error");
      return;
    }
    toast("测试中…");
    try {
      const r = await fetch(`https://api.github.com/repos/${g.owner}/${g.repo}`, {
        headers: ghHeaders(g.token)
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(`${r.status} ${err.message || r.statusText}`);
      }
      const data = await r.json();
      toast(`✅ 连接成功：${data.full_name}（默认分支 ${data.default_branch}）`, "success");
    } catch (e) {
      toast("❌ 连接失败：" + e.message, "error");
    }
  }

  // 推送 data.js 到仓库
  async function ghPush(opts = {}) {
    const g = loadGh();
    if (!g.owner || !g.repo || !g.token) {
      toast("请先在「站点设置」配置 GitHub 信息", "error");
      document.querySelector('.tab[data-tab="settings"]')?.click();
      return;
    }

    if (!Array.isArray(cats) || cats.length === 0) {
      toast("当前数据为空，已阻止推送", "error");
      return;
    }

    saveAll(/* silent */ true);

    const pushBtn = document.getElementById("ghPushBtn");
    if (pushBtn) {
      pushBtn.disabled = true;
      pushBtn.dataset.oldText = pushBtn.textContent;
      pushBtn.textContent = "☁ 推送中…";
    }

    try {
      const content = buildDataJs();
      const apiUrl = `https://api.github.com/repos/${g.owner}/${g.repo}/contents/${encodeURIComponent(g.path).replace(/%2F/g, "/")}`;

      let sha = null;
      const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(g.branch)}`, {
        headers: ghHeaders(g.token)
      });
      if (getRes.ok) {
        const j = await getRes.json();
        sha = j.sha;
      } else if (getRes.status !== 404) {
        const err = await getRes.json().catch(() => ({}));
        throw new Error(`读取文件失败：${getRes.status} ${err.message || ""}`);
      }

      const body = {
        message: g.msg || `chore: update data.js via admin (${new Date().toISOString()})`,
        content: utf8ToBase64(content),
        branch:  g.branch
      };
      if (sha) body.sha = sha;

      const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: { ...ghHeaders(g.token), "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        throw new Error(`${putRes.status} ${err.message || putRes.statusText}`);
      }

      const result = await putRes.json();
      toast(`☁ 已推送，Vercel 即将重新部署`, "success");
      if (!opts.silent && result.commit?.html_url) {
        window.open(result.commit.html_url, "_blank", "noopener");
      }
    } catch (e) {
      toast("❌ 推送失败：" + e.message, "error");
    } finally {
      if (pushBtn) {
        pushBtn.disabled = false;
        pushBtn.textContent = pushBtn.dataset.oldText || "☁ 推送到 GitHub";
      }
    }
  }

  // base64 编码 UTF-8 字符串（GitHub Contents API 要求 base64）
  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  // ====================================================================
  //  全局搜索（Ctrl+K 聚焦）
  // ====================================================================
  function initAdminSearch() {
    const input = document.getElementById("adminSearch");
    if (!input) return;
    let dropdown = null;
    let focusIdx = -1;

    function close() {
      dropdown?.remove();
      dropdown = null;
      focusIdx = -1;
    }

    function open(results) {
      close();
      dropdown = document.createElement("div");
      dropdown.className = "admin-search-results";
      dropdown.innerHTML = results.length === 0
        ? `<div class="empty">没有匹配的网站</div>`
        : results.map((r, i) => `
          <div class="res-item" data-i="${i}">
            <div class="res-icon" style="background:${/^https?:\/\//.test(r.s.icon) ? "transparent" : (r.s.color || "var(--primary)")}">
              ${/^https?:\/\//.test(r.s.icon) ? `<img src="${escapeAttr(r.s.icon)}">` : escapeHtml(r.s.icon || "🌐")}
            </div>
            <div class="res-name">${escapeHtml(r.s.name)} <span class="res-meta">— ${escapeHtml(r.cat.name)}</span></div>
          </div>
        `).join("");
      input.parentElement.appendChild(dropdown);

      dropdown.querySelectorAll(".res-item").forEach(el => {
        el.addEventListener("click", () => {
          const i = +el.dataset.i;
          const r = results[i];
          gotoSite(r);
          close();
        });
      });
    }

    function gotoSite(r) {
      // 切到分类管理 Tab → 滚动到该分类卡 → 打开编辑弹窗
      document.querySelector('.tab[data-tab="categories"]')?.click();
      setTimeout(() => {
        const ci = cats.findIndex(c => c.id === r.cat.id);
        const si = cats[ci]?.sites.indexOf(r.s);
        const card = document.querySelector(`.cat-card[data-idx="${ci}"]`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.style.transition = "box-shadow .3s";
          card.style.boxShadow = "0 0 0 3px var(--primary)";
          setTimeout(() => card.style.boxShadow = "", 1200);
        }
        if (si >= 0) editSite(ci, si);
      }, 30);
      input.value = "";
    }

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { close(); return; }
      const results = [];
      for (const cat of cats) {
        for (const s of cat.sites) {
          if (s.name.toLowerCase().includes(q) ||
              (s.desc || "").toLowerCase().includes(q) ||
              (s.url || "").toLowerCase().includes(q)) {
            results.push({ s, cat });
            if (results.length >= 30) break;
          }
        }
        if (results.length >= 30) break;
      }
      open(results);
    });
    input.addEventListener("keydown", e => {
      if (!dropdown) return;
      const items = dropdown.querySelectorAll(".res-item");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusIdx = (focusIdx + 1) % items.length;
        items.forEach((el, i) => el.classList.toggle("focus", i === focusIdx));
        items[focusIdx]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusIdx = (focusIdx - 1 + items.length) % items.length;
        items.forEach((el, i) => el.classList.toggle("focus", i === focusIdx));
        items[focusIdx]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusIdx < 0 && items.length > 0) focusIdx = 0;
        items[focusIdx]?.click();
      } else if (e.key === "Escape") {
        input.value = "";
        close();
        input.blur();
      }
    });
    document.addEventListener("click", e => {
      if (!input.parentElement.contains(e.target)) close();
    });

    // Ctrl+K
    document.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  // ====================================================================
  //  全局快捷键
  // ====================================================================
  function initAdminShortcuts() {
    document.addEventListener("keydown", e => {
      const ctrl = e.ctrlKey || e.metaKey;
      const inInput = ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName);

      // Ctrl+S: save
      if (ctrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveAll();
        return;
      }
      // Ctrl+Z / Ctrl+Shift+Z: undo / redo
      if (ctrl && e.key.toLowerCase() === "z") {
        if (inInput) return; // 输入框内让浏览器处理
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      // Ctrl+Y: redo
      if (ctrl && e.key.toLowerCase() === "y") {
        if (inInput) return;
        e.preventDefault();
        redo();
      }
    });
  }

  // ------------------ 自动登录（必须放最后，确保所有变量已初始化） ------------------
  if (sessionStorage.getItem(SESSION_KEY) === "1") showAdmin();
})();
