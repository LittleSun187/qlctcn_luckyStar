// ==================== LƯU TRỮ ====================
function getTransactions() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    return user.data.transactions || [];
}
function saveTransactions(newList) {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // cập nhật data
    user.data.transactions = newList;

    // cập nhật lại trong danh sách users
    users = users.map(u => {
        if (u.username === user.username) return user;
        return u;
    });

    // lưu lại
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));
}
function getCategories() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    return user.data.categories || { expense: [], income: [] };
}

// ==================== TỰ LẤY THÁNG HIỆN TẠI ====================
const monthInput = document.getElementById("monthPicker");
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");

if (monthInput) {
    monthInput.value = `${year}-${month}`;
}




// ==================== NGÂN SÁCH ====================
let budget = 0;
let totalExpense = 0;
function saveBudget() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const month = document.getElementById("monthPicker").value;
    const raw = document.getElementById("budgetInput").value;
    const budget = parseInt(raw.replace(/\D/g, "")) || 0;

    if (!user.data.budgets) user.data.budgets = {};

    // 🔥 lưu theo tháng
    user.data.budgets[month] = budget;

    // cập nhật lại users
    const newUsers = users.map(u =>
        u.username === user.username ? user : u
    );

    localStorage.setItem("users", JSON.stringify(newUsers));
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function addTransaction(amount) {
    totalExpense += amount;
    updateRemain();
}
function updateRemain() {
    const month = document.getElementById("monthPicker").value;

    let transactions = getTransactions();

    // 🔥 lọc theo tháng
    let filtered = transactions.filter(t => t.date.startsWith(month));

    let income = 0;
    let expense = 0;

    filtered.forEach(t => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });

    // 🔥 lấy ngân sách tháng
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const budget = user?.data?.budgets?.[month] || 0;

    //  còn lại ngân sách
    const remainBudget = budget - expense;

    //  còn lại thu nhập 
    const remainIncome = income - expense;

    // ===== HIỂN THỊ =====
    const budgetEl = document.getElementById("remainBudget");
    const incomeEl = document.getElementById("remainIncome");

    if (budgetEl) {
        budgetEl.innerText =

            (remainBudget >= 0 ? "+" : "") +
            remainBudget.toLocaleString("vi-VN") + " đ";

        
    }

    if (incomeEl) {
        incomeEl.innerText =
           
            (remainIncome >= 0 ? "+" : "") +
            remainIncome.toLocaleString("vi-VN") + " đ";

        incomeEl.style.color = remainIncome >= 0 ? "#191d1c" : "#e63946";
    }
}

// ==================== LOAD USER ====================
document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const monthInput = document.getElementById("monthPicker");

    if (!user || !monthInput) return;

    // ===== 1. SET THÁNG TRƯỚC =====
    const today = new Date();
    const year = today.getFullYear();
    const monthNow = String(today.getMonth() + 1).padStart(2, "0");

    if (!monthInput.value) {
        monthInput.value = `${year}-${monthNow}`;
    }

    // ===== 2. LOAD BUDGET =====
 function loadBudget() {
    const month = monthInput.value;

    let budgets = user?.data?.budgets || {};

    // 🔥 mặc định
    budget = 0;

    // ===== 1. nếu có tháng hiện tại =====
    if (budgets[month]) {
        budget = budgets[month];
    } else {
        // ===== 2. tìm tháng trước =====
        const months = Object.keys(budgets).sort().reverse();

        for (let m of months) {
            if (m < month) {
                budget = budgets[m];
                break;
            }
        }
    }

    // ===== 3. update input =====
    const input = document.getElementById("budgetInput");

    if (input) {
        input.value = budget
            ? budget.toLocaleString("vi-VN") + " VNĐ"
            : "";
    }

    // ===== 4. update UI =====
    updateRemain();
}
    

    loadBudget(); // 🔥 gọi sau khi đã set tháng

    // ===== 3. CHANGE MONTH =====
    monthInput.addEventListener("change", () => {
    loadBudget();

    renderTransactions();
    calculateSummary();   // 🔥 thiếu cái này là lỗi
    updateRemain();

    renderChart();
    renderIncomeChart();
});

    // ===== LOAD USER INFO =====
    const hello = document.querySelector(".user-profile h3");
    if (hello) {
        hello.innerText = "Xin chào, " + user.name + "!";
    }

    renderTransactions();
    updateRemain();
    calculateSummary();
});
// ==================== ĐĂNG XUẤT ====================
function logout() {
    if (confirm("Bạn có chắc muốn đăng xuất không?")) {
        localStorage.removeItem("isLogin");
        localStorage.removeItem("currentUser");

        document.body.style.opacity = "0";

        setTimeout(() => {
            window.location.href = "./login.html";
        }, 300);
    }
}

// ==================== CHUYỂN TRANG ====================
function goToPage(url) {
    const main = document.querySelector(".main-content");

    if (main) {
        main.style.pointerEvents = "none";
        main.style.opacity = "0";
        main.style.transform = "translateX(30px)";
        main.style.transition = "0.3s";

        setTimeout(() => {
            window.location.href = url;
        }, 300);
    } else {
        window.location.href = url;
    }
}

// ==================== DANH MỤC ====================
let currentType = "expense";

let currentSelectedCategory = {
    name: "Chọn chủ đề",
    color: "#ccc",
    icon: "fa-solid fa-layer-group"
};

const addBtn = document.querySelector(".add-btn");
if (addBtn) {
    addBtn.onclick = () => {
        document.getElementById("popup").style.display = "flex";

        const now = new Date();
        document.getElementById("date").value = now.toISOString().split("T")[0];
        document.getElementById("time").value = now.toTimeString().slice(0, 5);

        loadCategoryDropdown();
    };
}

function toggleCategoryDropdown() {
    const dropdown = document.getElementById("categoryDropdown");

    dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";

    loadCategoryDropdown();
}

function switchType(type, event) {
    event.stopPropagation();
    currentType = type;

    document.querySelectorAll(".dropdown-tab").forEach(tab =>
        tab.classList.remove("active")
    );

    event.target.classList.add("active");
    loadCategoryDropdown();
}

function loadCategoryDropdown() {
    // Đọc dữ liệu từ localStorage mà file Danh mục đã lưu
    const categories = getCategories()[currentType];

    const list = document.getElementById("dropdownCategoryList");
    if (!list) return;
    list.innerHTML = "";

    categories.forEach(cat => {
        const item = document.createElement("div");
        item.className = "category-option";
        item.innerHTML = `
            <i class="${cat.icon}" style="background:${cat.color}; color:white; padding:10px; border-radius:50%;"></i>
            <span>${cat.name}</span>
        `;
        item.onclick = (e) => {
            e.stopPropagation();
            selectCategory(cat); // Hàm này sẽ cập nhật currentSelectedCategory
        };
        list.appendChild(item);
    });
}

function selectCategory(cat) {
    currentSelectedCategory = cat;

    document.getElementById("selectedCategory").innerText = cat.name;
    document.getElementById("selectedCircle").style.background = cat.color;
    document.getElementById("selectedIcon").className = cat.icon;
    document.getElementById("categoryDropdown").style.display = "none";
}

// ==================== LƯU GIAO DỊCH ====================
function saveTransaction() {
    const note = document.getElementById("note").value.trim();
    const amount = parseInt(document.getElementById("amount").value) || 0;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    const warningAmount = document.getElementById("warningAmount");
    const warningCategory = document.getElementById("warningCategory");

    let isValid = true;

    // Kiểm tra bằng biến đã đổi tên
    if (currentSelectedCategory.name === "Chọn chủ đề") {
        warningCategory.classList.add("show");
        isValid = false;
    } else {
        warningCategory.classList.remove("show");
    }

    if (amount === 0) {
        warningAmount.classList.add("show");
        isValid = false;
    } else {
        warningAmount.classList.remove("show");
    }

    if (!isValid) return;

    const newTransaction = {
        id: Date.now(),
        type: currentType,
        category: currentSelectedCategory.name, // Dùng biến mới
        color: currentSelectedCategory.color,   // Dùng biến mới
        icon: currentSelectedCategory.icon,     // Dùng biến mới
        amount,
        note,
        date,
        time
    };

    let transactions = getTransactions();
    transactions.push(newTransaction);
    saveTransactions(transactions);

    renderTransactions();

    document.getElementById("popup").style.display = "none";
    document.getElementById("note").value = "";
    document.getElementById("amount").value = 0;

    // Reset về mặc định sau khi lưu
    currentSelectedCategory = {
        name: "Chọn chủ đề",
        color: "#ccc",
        icon: "fa-solid fa-layer-group"
    };
    document.getElementById("selectedCategory").innerText = "Chọn chủ đề";
    document.getElementById("selectedCircle").style.background = "#ccc";
    document.getElementById("selectedIcon").className = "fa-solid fa-layer-group";
}
    // reset
    currentSelectedCategory = {
        name: "Chọn chủ đề",
        color: "#ccc",
        icon: "fa-solid fa-layer-group"
    };

    document.getElementById("selectedCategory").innerText = "Chọn chủ đề";

    warningAmount.classList.remove("show");
    warningCategory.classList.remove("show");


// ==================== HIỂN THỊ DANH SÁCH ====================
function renderTransactions() {
    let transactions = getTransactions();
    const container = document.getElementById("transaction-list");
    if (!container) return;

    container.innerHTML = "";

    const grouped = {};

    transactions.forEach(item => {
        if (!grouped[item.date]) {
            grouped[item.date] = [];
        }
        grouped[item.date].push(item);
    });

    Object.keys(grouped)
        .sort((a, b) => new Date(b) - new Date(a))
        .forEach(date => {
            const items = grouped[date];

            let totalExpense = 0;
            let totalIncome = 0;

            items.forEach(item => {
                if (item.type === "expense") totalExpense += item.amount;
                else totalIncome += item.amount;
            });

            const group = document.createElement("div");
            group.className = "date-group";

            group.innerHTML = `
                <div class="date-header">
                    <span>📅 ${date}</span>
                    <span>
                        Chi: -${totalExpense.toLocaleString()} đ |
                        Thu: +${totalIncome.toLocaleString()} đ
                    </span>
                </div>
                <div class="date-items"></div>
            `;

            const itemsBox = group.querySelector(".date-items");

            items.forEach(item => {
                const sign = item.type === "expense" ? "-" : "+";
                const label = item.type === "expense" ? "Chi tiêu" : "Thu nhập";

                const div = document.createElement("div");
                div.className = "transaction-item";
                div.onclick = () => openDetail(item.id);

                div.innerHTML = `
                    <div class="transaction-top">
                        <div class="transaction-left">
                            <i class="${item.icon}" 
                               style="background:${item.color}; color:white; padding:8px; border-radius:50%;"></i>
                            <h4>${item.category}</h4>
                        </div>
                        <div class="transaction-right">
                            ${label}: ${sign}${item.amount.toLocaleString()} đ
                        </div>
                    </div>
                    <div class="transaction-note">
                        ${item.note || "Không có ghi chú"}
                    </div>
                `;

                itemsBox.appendChild(div);
            });

            container.appendChild(group);
        });
            calculateSummary();
            updateRemain();
}

// ==================== XEM CHI TIẾT GIAO DỊCH ====================
let currentTransactionId = null;
let editSelectedCategory = null;
let editCurrentType = "expense";

function openDetail(id) {
    currentTransactionId = id;
    let transactions = getTransactions();
    const transaction = transactions.find(t => t.id === id);

    if (!transaction) return;

    document.getElementById("detailCategory").innerText = transaction.category;
    document.getElementById("detailType").innerText = transaction.type === "expense" ? "Chi tiêu" : "Thu nhập";
    document.getElementById("detailAmount").innerText = transaction.amount.toLocaleString() + " đ";
    document.getElementById("detailDate").innerText = transaction.date;
    document.getElementById("detailTime").innerText = transaction.time;
    document.getElementById("detailNote").innerText = transaction.note || "Không có ghi chú";

    document.getElementById("detailPopup").style.display = "flex";
}

function closeDetail() {
    const popup = document.getElementById("detailPopup");
    if (popup) {
        popup.style.display = "none";
        currentTransactionId = null;
    }
}

// ==================== SỬA GIAO DỊCH ====================
function enterEditMode() {
    if (!currentTransactionId) return;
     let transactions = getTransactions();
    const transaction = transactions.find(t => t.id === currentTransactionId);
    if (!transaction) return;

    editSelectedCategory = transaction;
    editCurrentType = transaction.type;

    // Load data into edit popup
    document.getElementById("editAmount").value = transaction.amount;
    document.getElementById("editDate").value = transaction.date;
    document.getElementById("editTime").value = transaction.time;
    document.getElementById("editNote").value = transaction.note || "";

    // Set category
    document.getElementById("editSelectedCategory").innerText = transaction.category;
    document.getElementById("editSelectedCircle").style.background = transaction.color;
    document.getElementById("editSelectedIcon").className = transaction.icon;

    // Switch to edit popup
    document.getElementById("detailPopup").style.display = "none";
    document.getElementById("editPopup").style.display = "flex";

    loadEditCategoryDropdown();
}

function toggleEditCategoryDropdown() {
    const dropdown = document.getElementById("editCategoryDropdown");
    dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";

    loadEditCategoryDropdown();
}

function switchEditType(type, event) {
    event.stopPropagation();
    editCurrentType = type;

    document.querySelectorAll("#editCategoryDropdown .dropdown-tab").forEach(tab =>
        tab.classList.remove("active")
    );

    event.target.classList.add("active");
    loadEditCategoryDropdown();
}

function loadEditCategoryDropdown() {
    const categories = getCategories()[editCurrentType];

    const list = document.getElementById("editDropdownCategoryList");
    if (!list) return;

    list.innerHTML = "";

    categories.forEach(cat => {
        const item = document.createElement("div");
        item.className = "category-option";

        item.innerHTML = `
            <i class="${cat.icon}"
               style="background:${cat.color}; color:white; padding:10px; border-radius:50%;"></i>
            <span>${cat.name}</span>
        `;

        item.onclick = (e) => {
            e.stopPropagation();
            selectEditCategory(cat);
        };

        list.appendChild(item);
    });
}

function selectEditCategory(cat) {
    editSelectedCategory = cat;

    document.getElementById("editSelectedCategory").innerText = cat.name;
    document.getElementById("editSelectedCircle").style.background = cat.color;
    document.getElementById("editSelectedIcon").className = cat.icon;
    document.getElementById("editCategoryDropdown").style.display = "none";
}

function saveEditTransaction() {
    const note = document.getElementById("editNote").value.trim();
    const amount = parseInt(document.getElementById("editAmount").value) || 0;
    const date = document.getElementById("editDate").value;
    const time = document.getElementById("editTime").value;

    if (!currentTransactionId || !editSelectedCategory) return;
     let transactions = getTransactions();
    // Find and update transaction
    const index = transactions.findIndex(t => t.id === currentTransactionId);
    if (index !== -1) {
        transactions[index] = {
            id: currentTransactionId,
            type: editCurrentType,
            category: editSelectedCategory.name,
            color: editSelectedCategory.color,
            icon: editSelectedCategory.icon,
            amount,
            note,
            date,
            time
        };

       saveTransactions(transactions);
        renderTransactions();

        document.getElementById("editPopup").style.display = "none";
        currentTransactionId = null;
    }
}

// ==================== XÓA GIAO DỊCH ====================
function deleteTransaction() {
    if (!currentTransactionId) return;

    if (confirm("Bạn có chắc muốn xóa giao dịch này không?")) {
       let transactions = getTransactions();

        transactions = transactions.filter(t => t.id !== currentTransactionId);

        saveTransactions(transactions);

        closeDetail();
        renderTransactions();
    }
}

// ==================== ĐÓNG POPUP KHI CLICK NGOÀI ====================
const popup = document.getElementById("popup");
const detailPopup = document.getElementById("detailPopup");
const editPopup = document.getElementById("editPopup");
const searchPopup = document.getElementById("searchPopup");

if (popup) {
    popup.addEventListener("click", function (e) {
        if (e.target === popup) {
            popup.style.display = "none";
        }
    });
}

if (detailPopup) {
    detailPopup.addEventListener("click", function (e) {
        if (e.target === detailPopup) {
            closeDetail();
        }
    });
}

if (editPopup) {
    editPopup.addEventListener("click", function (e) {
        if (e.target === editPopup) {
            editPopup.style.display = "none";
            currentTransactionId = null;
        }
    });
}

if (searchPopup) {
    searchPopup.addEventListener("click", function (e) {
        if (e.target === searchPopup) {
            closeSearchPopup();
        }
    });
}

// ==================== TÌM KIẾM GIAO DỊCH ====================
function openSearchPopup() {
    document.getElementById("searchPopup").style.display = "flex";
}

function closeSearchPopup() {
    document.getElementById("searchPopup").style.display = "none";
}

function resetSearchFilters() {
    document.getElementById("searchNote").value = "";
    document.getElementById("searchCategory").value = "";
    document.getElementById("searchFromDate").value = "";
    document.getElementById("searchToDate").value = "";
    document.getElementById("searchMinAmount").value = 0;
    document.getElementById("searchMaxAmount").value = 999999999;
    renderTransactions();
}

function performSearch() {
    const note = document.getElementById("searchNote").value.toLowerCase().trim();
    const type = document.getElementById("searchCategory").value;
    const fromDate = document.getElementById("searchFromDate").value;
    const toDate = document.getElementById("searchToDate").value;
    const minAmount = parseInt(document.getElementById("searchMinAmount").value) || 0;
    const maxAmount = parseInt(document.getElementById("searchMaxAmount").value) || 999999999;
    let transactions = getTransactions();
   let filteredTransactions = transactions.filter(transaction => {
        let match = true;

        // Lọc theo ghi chú
        if (note && !transaction.note.toLowerCase().includes(note)) {
            match = false;
        }

        // Lọc theo loại giao dịch
        if (type && transaction.type !== type) {
            match = false;
        }

        // Lọc theo từ ngày
        if (fromDate && transaction.date < fromDate) {
            match = false;
        }

        // Lọc theo đến ngày
        if (toDate && transaction.date > toDate) {
            match = false;
        }

        // Lọc theo khoảng tiền
        if (transaction.amount < minAmount || transaction.amount > maxAmount) {
            match = false;
        }

        return match;
    });

    // Hiển thị kết quả tìm kiếm
    renderSearchResults(filteredTransactions);
    closeSearchPopup();
}

function renderSearchResults(searchResults) {
    const container = document.getElementById("transaction-list");
    if (!container) return;

    container.innerHTML = "";

    if (searchResults.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">Không tìm thấy giao dịch nào</div>';
        return;
    }

    const grouped = {};

    searchResults.forEach(item => {
        if (!grouped[item.date]) {
            grouped[item.date] = [];
        }
        grouped[item.date].push(item);
    });

    Object.keys(grouped)
        .sort((a, b) => new Date(b) - new Date(a))
        .forEach(date => {
            const items = grouped[date];

            let totalExpense = 0;
            let totalIncome = 0;

            items.forEach(item => {
                if (item.type === "expense") totalExpense += item.amount;
                else totalIncome += item.amount;
            });

            const group = document.createElement("div");
            group.className = "date-group";

            group.innerHTML = `
                <div class="date-header">
                    <span>📅 ${date}</span>
                    <span>
                        Chi: -${totalExpense.toLocaleString()} đ |
                        Thu: +${totalIncome.toLocaleString()} đ
                    </span>
                </div>
                <div class="date-items"></div>
            `;

            const itemsBox = group.querySelector(".date-items");

            items.forEach(item => {
                const sign = item.type === "expense" ? "-" : "+";
                const label = item.type === "expense" ? "Chi tiêu" : "Thu nhập";

                const div = document.createElement("div");
                div.className = "transaction-item";
                div.onclick = () => openDetail(item.id);

                div.innerHTML = `
                    <div class="transaction-top">
                        <div class="transaction-left">
                            <i class="${item.icon}"
                               style="background:${item.color}; color:white; padding:8px; border-radius:50%;"></i>
                            <h4>${item.category}</h4>
                        </div>
                        <div class="transaction-right">
                            ${label}: ${sign}${item.amount.toLocaleString()} đ
                        </div>
                    </div>
                    <div class="transaction-note">
                        ${item.note || "Không có ghi chú"}
                    </div>
                `;

                itemsBox.appendChild(div);
            });

            container.appendChild(group);
        });
}

// ==================== LỊCH SỬ GIAO DỊCH ====================
function openHistoryPopup() {
    document.getElementById("HistoryPopup").style.display = "flex";
}

function closeHistoryPopup() {
    document.getElementById("HistoryPopup").style.display = "none";
}
function CheckHistory() {
    const fromDate = document.getElementById("FromDate").value;
    const toDate = document.getElementById("ToDate").value;
    if (fromDate && toDate && fromDate > toDate) {
    alert("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!");
    return;
}
    let transactions = getTransactions();
    let filteredTransactions = transactions.filter(transaction => {
        let match = true;

        // Lọc theo từ ngày
        if (fromDate && transaction.date < fromDate) {
            match = false;
        }

        // Lọc theo đến ngày
        if (toDate && transaction.date > toDate) {
            match = false;
        }

        return match;
    });

    // Hiển thị kết quả tìm kiếm
    renderSearchResults(filteredTransactions);
    closeHistoryPopup();
}

// chi tieu thu nhạp
function calculateSummary() {
    let totalExpense = 0;
    let totalIncome = 0;

    let transactions = getTransactions();
    const month = document.getElementById("monthPicker").value;

    // 🔥 lọc theo tháng
    let filtered = transactions.filter(t => t.date.startsWith(month));

    filtered.forEach(t => {
        if (t.type === "expense") totalExpense += t.amount;
        else totalIncome += t.amount;
    });

    document.getElementById("expense").innerText =
        totalExpense.toLocaleString("vi-VN") + " VNĐ";

    document.getElementById("income").innerText =
        totalIncome.toLocaleString("vi-VN") + " VNĐ";

    return { totalExpense, totalIncome };
}
const budgetInput = document.getElementById("budgetInput");


// 👉 Khi đang gõ
budgetInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");

    if (value === "") {
        e.target.value = "";
        return;
    }

    e.target.value = Number(value).toLocaleString("vi-VN");
     saveBudget();
     updateRemain();
});

// 👉 Khi click vào (focus) → bỏ VNĐ để dễ sửa
budgetInput.addEventListener("focus", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    e.target.value = value;
});

// 👉 Khi click ra ngoài (blur) → thêm VNĐ
budgetInput.addEventListener("blur", function (e) {
    let value = e.target.value.replace(/\D/g, "");

    if (value === "") {
        e.target.value = "";
        return;
    }

    e.target.value = Number(value).toLocaleString("vi-VN") + " VNĐ";
});
