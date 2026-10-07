const API_BASE = "http://localhost:3001";
const TOKEN_KEY = "todo_app_jwt_token";

// Tətbiq vəziyyəti (State)
const state = {
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: null,
    role: "USER",
    myTodos: []
};

// DOM Elementləri
const el = {
    toastContainer: document.getElementById("toast-container"),
    apiDot: document.getElementById("api-dot"),
    userNav: document.getElementById("user-nav"),
    navUserLogin: document.getElementById("nav-user-login"),
    navUserRole: document.getElementById("nav-user-role"),
    btnLogout: document.getElementById("btn-logout"),

    // Auth
    authSection: document.getElementById("auth-section"),
    tabLogin: document.getElementById("tab-login"),
    tabRegister: document.getElementById("tab-register"),
    loginForm: document.getElementById("login-form"),
    registerForm: document.getElementById("register-form"),
    loginInput: document.getElementById("login-input"),
    loginPassword: document.getElementById("login-password"),

    // Dashboard & Views
    dashboardSection: document.getElementById("dashboard-section"),
    viewTabTodos: document.getElementById("view-tab-todos"),
    viewTabAdmin: document.getElementById("view-tab-admin"),
    viewTabProfile: document.getElementById("view-tab-profile"),
    todosView: document.getElementById("todos-view"),
    adminView: document.getElementById("admin-view"),
    profileView: document.getElementById("profile-view"),

    // My Todos
    statMyTotal: document.getElementById("stat-my-total"),
    statMyCompleted: document.getElementById("stat-my-completed"),
    statMyPending: document.getElementById("stat-my-pending"),
    createTodoForm: document.getElementById("create-todo-form"),
    todoTextInput: document.getElementById("todo-text-input"),
    todoStatusInput: document.getElementById("todo-status-input"),
    btnRefreshTodos: document.getElementById("btn-refresh-todos"),
    myTodoSearch: document.getElementById("my-todo-search"),
    myTodoFilter: document.getElementById("my-todo-filter"),
    myTodosContainer: document.getElementById("my-todos-container"),

    // Admin
    adminFilterForm: document.getElementById("admin-filter-form"),
    adminSearchInput: document.getElementById("admin-search-input"),
    adminStatusSelect: document.getElementById("admin-status-select"),
    btnAdminReset: document.getElementById("btn-admin-reset"),
    adminQueryPreview: document.getElementById("admin-query-preview"),
    adminUsersCount: document.getElementById("admin-users-count"),
    adminResultsContainer: document.getElementById("admin-results-container"),

    // Profile
    btnRefreshMe: document.getElementById("btn-refresh-me"),
    meJsonOutput: document.getElementById("me-json-output"),
    tokenRawOutput: document.getElementById("token-raw-output"),
    btnCopyToken: document.getElementById("btn-copy-token")
};

// ==================== KÖMƏKÇİ FUNKSİYALAR ====================

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isCompletedValue(val) {
    return val === true || String(val).toLowerCase() === "true";
}

function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

async function apiRequest(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (state.token) {
        headers["Authorization"] = `Bearer ${state.token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers
        });

        el.apiDot.classList.remove("offline");

        let data = null;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }

        if (!response.ok) {
            const errMsg = data?.message || data?.meesage || `Xəta kodu: ${response.status}`;
            const error = new Error(errMsg);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (error) {
        if (error.name === "TypeError") {
            el.apiDot.classList.add("offline");
            throw new Error("Serverlə əlaqə qurulmadı (http://localhost:3001 işləyirmi?)");
        }
        throw error;
    }
}

// ==================== AUTH ƏMƏLİYYATLARI ====================

function switchAuthTab(mode) {
    const isLogin = mode === "login";
    el.tabLogin.classList.toggle("active", isLogin);
    el.tabRegister.classList.toggle("active", !isLogin);
    el.loginForm.classList.toggle("hidden", !isLogin);
    el.registerForm.classList.toggle("hidden", isLogin);
}

async function handleLogin(e) {
    e.preventDefault();
    const login = el.loginInput.value.trim();
    const password = el.loginPassword.value;

    try {
        const data = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ login, password })
        });

        if (!data.token) {
            throw new Error(data.meesage || data.message || "Token alınmadı");
        }

        state.token = data.token;
        localStorage.setItem(TOKEN_KEY, data.token);
        showToast("Uğurla daxil oldunuz!", "success");
        await initDashboard();
    } catch (err) {
        showToast(err.message || "Giriş zamanı xəta baş verdi", "error");
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const login = document.getElementById("reg-login").value.trim();
    const password = document.getElementById("reg-password").value;

    try {
        const data = await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, login, password })
        });

        showToast(data.message || data.meesage || "Qeydiyyat tamamlandı!", "success");
        el.registerForm.reset();
        el.loginInput.value = login;
        el.loginPassword.value = password;
        switchAuthTab("login");
    } catch (err) {
        showToast(err.message || "Qeydiyyat xətası", "error");
    }
}

function handleLogout() {
    state.token = null;
    state.user = null;
    state.role = "USER";
    state.myTodos = [];
    localStorage.removeItem(TOKEN_KEY);

    el.userNav.classList.add("hidden");
    el.dashboardSection.classList.add("hidden");
    el.authSection.classList.remove("hidden");
    showToast("Hesabdan çıxış edildi");
}

// ==================== DASHBOARD & SESSION ====================

async function initDashboard() {
    if (!state.token) {
        handleLogout();
        return;
    }

    try {
        // 1. /auth/me sorğusu ilə cari istifadəçini yoxla
        const meRes = await apiRequest("/auth/me");
        state.user = meRes.message || {};

        // UI yenilə
        el.authSection.classList.add("hidden");
        el.dashboardSection.classList.remove("hidden");
        el.userNav.classList.remove("hidden");

        el.navUserLogin.textContent = state.user.login || "İstifadəçi";
        el.meJsonOutput.textContent = JSON.stringify(meRes, null, 2);
        el.tokenRawOutput.textContent = state.token;

        // 2. İstifadəçinin öz todolarını gətir
        await loadMyTodos();

        // 3. Admin səlahiyyətini yoxla
        await detectUserRole();
    } catch (err) {
        showToast(err.message || "Sessiya vaxtı bitib", "error");
        handleLogout();
    }
}

async function detectUserRole() {
    try {
        const adminData = await apiRequest("/admin/getUsers");
        state.role = "ADMIN";
        updateRoleBadge("ADMIN");
        renderAdminUsers(adminData);
    } catch {
        state.role = state.user?.role || "USER";
        updateRoleBadge(state.role);
    }
}

function updateRoleBadge(role) {
    const isAdmin = role === "ADMIN";
    el.navUserRole.textContent = isAdmin ? "ADMIN" : "USER";
    el.navUserRole.className = `badge badge-role ${isAdmin ? "admin" : "user"}`;
}

function switchDashboardView(viewName) {
    const views = {
        todos: { tab: el.viewTabTodos, panel: el.todosView },
        admin: { tab: el.viewTabAdmin, panel: el.adminView },
        profile: { tab: el.viewTabProfile, panel: el.profileView }
    };

    Object.entries(views).forEach(([key, item]) => {
        const active = key === viewName;
        item.tab.classList.toggle("active", active);
        item.panel.classList.toggle("hidden", !active);
    });

    if (viewName === "admin") {
        loadAdminUsers();
    }
}

// ==================== MƏNİM TODOLARIM (/todo) ====================

async function loadMyTodos() {
    try {
        const todos = await apiRequest("/todo/get");
        state.myTodos = Array.isArray(todos) ? todos.slice().reverse() : [];
        updateMyTodoStats();
        renderMyTodos();
    } catch (err) {
        el.myTodosContainer.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
    }
}

function updateMyTodoStats() {
    const total = state.myTodos.length;
    const completed = state.myTodos.filter((t) => isCompletedValue(t.iscomplite)).length;
    const pending = total - completed;

    el.statMyTotal.textContent = total;
    el.statMyCompleted.textContent = completed;
    el.statMyPending.textContent = pending;
}

function renderMyTodos() {
    const searchTerm = el.myTodoSearch.value.trim().toLowerCase();
    const statusFilter = el.myTodoFilter.value;

    const filtered = state.myTodos.filter((item) => {
        const done = isCompletedValue(item.iscomplite);
        if (statusFilter === "true" && !done) return false;
        if (statusFilter === "false" && done) return false;
        if (searchTerm && !String(item.todo || "").toLowerCase().includes(searchTerm)) {
            return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        el.myTodosContainer.innerHTML = `<div class="empty-state">Uyğun tapşırıq tapılmadı.</div>`;
        return;
    }

    el.myTodosContainer.innerHTML = filtered
        .map((item) => {
            const done = isCompletedValue(item.iscomplite);
            const authorName = item.author?.name || item.author?.login || state.user?.login || "Mən";

            return `
                <div class="todo-item ${done ? "completed" : ""}">
                    <div class="todo-main">
                        <span class="todo-title">${escapeHtml(item.todo)}</span>
                        <div class="todo-meta">
                            <span>👤 ${escapeHtml(authorName)}</span>
                            <span>#ID: ${escapeHtml(String(item._id || "").slice(-6))}</span>
                        </div>
                    </div>
                    <span class="badge ${done ? "badge-done" : "badge-pending"}">
                        ${done ? "✅ Tamamlanıb" : "⏳ Gözləyir"}
                    </span>
                </div>
            `;
        })
        .join("");
}

async function handleCreateTodo(e) {
    e.preventDefault();
    const todo = el.todoTextInput.value.trim();
    const iscomplite = el.todoStatusInput.value;

    if (!todo) return;

    try {
        await apiRequest("/todo/create", {
            method: "POST",
            body: JSON.stringify({ todo, iscomplite })
        });

        showToast("Yeni tapşırıq əlavə edildi!", "success");
        el.todoTextInput.value = "";
        el.todoStatusInput.value = "false";
        await loadMyTodos();
    } catch (err) {
        showToast(err.message || "Tapşırıq yaradılmadı", "error");
    }
}

// ==================== ADMIN PANEL (/admin/getUsers) ====================

function buildAdminEndpoint() {
    const params = new URLSearchParams();
    const search = el.adminSearchInput.value.trim();
    const iscomplite = el.adminStatusSelect.value;

    if (iscomplite !== "") {
        params.set("iscomplite", iscomplite);
    }
    if (search !== "") {
        params.set("search", search);
    }

    const queryString = params.toString();
    return `/admin/getUsers${queryString ? `?${queryString}` : ""}`;
}

async function loadAdminUsers(e) {
    if (e) e.preventDefault();

    const endpoint = buildAdminEndpoint();
    el.adminQueryPreview.textContent = `GET ${endpoint}`;
    el.adminResultsContainer.innerHTML = `<div class="empty-state">Sorğu göndərilir...</div>`;

    try {
        const res = await apiRequest(endpoint);
        renderAdminUsers(res);
    } catch (err) {
        el.adminUsersCount.textContent = "Giriş Məhduddur";
        el.adminResultsContainer.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center;">
                <h3 style="color: var(--danger); margin-bottom: 0.5rem;">⛔ Giriş İcazəsi Yoxdur (403)</h3>
                <p style="color: var(--text-secondary);">
                    Server cavabı: <code>${escapeHtml(err.message)}</code><br/>
                    Bu bölmə yalnız <strong>ADMIN</strong> roluna sahib istifadəçilər üçündür.
                </p>
            </div>
        `;
    }
}

function renderAdminUsers(res) {
    const users = Array.isArray(res?.data) ? res.data : [];
    el.adminUsersCount.textContent = `${res?.count ?? users.length} İstifadəçi`;

    if (users.length === 0) {
        el.adminResultsContainer.innerHTML = `<div class="empty-state">Heç bir istifadəçi tapılmadı.</div>`;
        return;
    }

    el.adminResultsContainer.innerHTML = users
        .map((u) => {
            const todos = Array.isArray(u.todos) ? u.todos : [];
            const isAdmin = u.role === "ADMIN";
            const avatar = u.userimg || "https://www.freeiconspng.com/uploads/person-icon--icon-search-engine-3.png";

            const todosHtml =
                todos.length === 0
                    ? `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem 0;">Filtrə uyğun todo yoxdur.</div>`
                    : todos
                          .map((t) => {
                              const done = isCompletedValue(t.iscomplite);
                              return `
                                <div class="mini-todo ${done ? "done" : ""}">
                                    <span>${escapeHtml(t.todo)}</span>
                                    <span>${done ? "✅" : "⏳"}</span>
                                </div>
                            `;
                          })
                          .join("");

            return `
                <article class="user-card">
                    <div class="user-card-header">
                        <img
                            class="user-avatar"
                            src="${escapeHtml(avatar)}"
                            alt="${escapeHtml(u.name)}"
                            onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "U")}&background=334155&color=fff'"
                        />
                        <div class="user-info">
                            <div class="user-name">${escapeHtml(u.name)}</div>
                            <span class="user-email">${escapeHtml(u.login)}</span>
                        </div>
                        <span class="badge badge-role ${isAdmin ? "admin" : "user"}">
                            ${escapeHtml(u.role || "USER")}
                        </span>
                    </div>

                    <div class="user-todos-box">
                        <div class="user-todos-header">
                            <span>Tapşırıqlar (Todos)</span>
                            <strong>${todos.length} ədəd</strong>
                        </div>
                        <div class="user-todos-list">
                            ${todosHtml}
                        </div>
                    </div>
                </article>
            `;
        })
        .join("");
}

// ==================== EVENT LISTENERS ====================

el.tabLogin.addEventListener("click", () => switchAuthTab("login"));
el.tabRegister.addEventListener("click", () => switchAuthTab("register"));

el.loginForm.addEventListener("submit", handleLogin);
el.registerForm.addEventListener("submit", handleRegister);
el.btnLogout.addEventListener("click", handleLogout);

// Sürətli Demo Hesab düymələri
document.querySelectorAll("[data-demo-login]").forEach((btn) => {
    btn.addEventListener("click", () => {
        el.loginInput.value = btn.getAttribute("data-demo-login");
        el.loginPassword.value = btn.getAttribute("data-demo-pass");
        showToast("Demo hesab məlumatları dolduruldu — 'Daxil ol' klikləyin");
    });
});

// Dashboard Tab keçidləri
el.viewTabTodos.addEventListener("click", () => switchDashboardView("todos"));
el.viewTabAdmin.addEventListener("click", () => switchDashboardView("admin"));
el.viewTabProfile.addEventListener("click", () => switchDashboardView("profile"));

// Todo hadisələri
el.createTodoForm.addEventListener("submit", handleCreateTodo);
el.btnRefreshTodos.addEventListener("click", loadMyTodos);
el.myTodoSearch.addEventListener("input", renderMyTodos);
el.myTodoFilter.addEventListener("change", renderMyTodos);

// Admin filter hadisələri
el.adminFilterForm.addEventListener("submit", loadAdminUsers);
el.adminSearchInput.addEventListener("input", () => {
    el.adminQueryPreview.textContent = `GET ${buildAdminEndpoint()}`;
});
el.adminStatusSelect.addEventListener("change", () => {
    el.adminQueryPreview.textContent = `GET ${buildAdminEndpoint()}`;
    loadAdminUsers();
});
el.btnAdminReset.addEventListener("click", () => {
    el.adminSearchInput.value = "";
    el.adminStatusSelect.value = "";
    loadAdminUsers();
});

// Profil /auth/me yenilə və Token kopyala
el.btnRefreshMe.addEventListener("click", async () => {
    try {
        const meRes = await apiRequest("/auth/me");
        el.meJsonOutput.textContent = JSON.stringify(meRes, null, 2);
        showToast("/auth/me məlumatı yeniləndi", "success");
    } catch (err) {
        showToast(err.message, "error");
    }
});

el.btnCopyToken.addEventListener("click", async () => {
    if (!state.token) return;
    try {
        await navigator.clipboard.writeText(state.token);
        showToast("JWT Token mübadilə buferinə kopyalandı!", "success");
    } catch {
        showToast("Kopyalama mümkün olmadı", "error");
    }
});

// İlk yüklənmə zamanı sessiyanı yoxla
if (state.token) {
    initDashboard();
}
