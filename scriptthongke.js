// ===== LOAD USER =====
const user = JSON.parse(localStorage.getItem("currentUser"));
const centerTextPlugin = {
    id: "centerText",
    beforeDraw(chart) {
        const { ctx } = chart;
        ctx.save();

        const meta = chart.getDatasetMeta(0);
        if (!meta.data[0]) return; // Safety check

        const centerX = meta.data[0].x;
        const centerY = meta.data[0].y;

        const total = chart.config.data.datasets[0].data.reduce((a, b) => a + b, 0);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 🔥 SMART LOGIC: Check canvas ID to decide the label
        const label = chart.canvas.id === "expenseChart" ? "Chi tiêu" : "Thu nhập";

        ctx.font = "14px Segoe UI";
        ctx.fillStyle = "#666";
        ctx.fillText(label, centerX, centerY - 15);

        ctx.font = "bold 18px Segoe UI";
        ctx.fillStyle = "#000";
        ctx.fillText(total.toLocaleString("vi-VN") + " đ", centerX, centerY + 10);

        ctx.restore();
    }
};
if (user) {
    const hello = document.querySelector(".user-profile h3");
    if (hello) {
        hello.innerText = "Xin chào, " + user.name + "!";
    }
}

//nút đăng xuất
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

// ==================== Thống kê chi tiêu ====================


//Lấy data theo user
function getTransactions() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    return user?.data?.transactions || [];
}
//lọc theo tháng
function filterByMonth(transactions, monthValue) {
    return transactions.filter(t => t.date.startsWith(monthValue));
}
//vẽ biểu đồ chi tiêu theo danh mục
let chart;
function renderChart() {
    const monthInput = document.getElementById("monthPicker");
    if (!monthInput) return;

    const monthValue = monthInput.value;

    let transactions = getTransactions();
    transactions = filterByMonth(transactions, monthValue);

    // 🔥 chỉ lấy chi tiêu
    let expense = transactions.filter(t => t.type === "expense");

    // 🔴 KHÔNG CÓ DATA
    if (expense.length === 0) {
        const box = document.getElementById("expenseList");
        if (box) box.innerHTML = "Không có dữ liệu";

        if (chart) chart.destroy();
         chart = null;   
        return;
    }

    // ===== GOM THEO DANH MỤC =====
    let categoryMap = {};

    expense.forEach(t => {
        if (!categoryMap[t.category]) {
            categoryMap[t.category] = 0;
        }
        categoryMap[t.category] += t.amount;
    });

    const labels = Object.keys(categoryMap);
    const data = Object.values(categoryMap);

    const total = data.reduce((a, b) => a + b, 0);

   
    const colors = labels.map(label => {
    const found = expense.find(t => t.category === label && t.color);
    return found ? found.color : "#ccc";
});

    const ctx = document.getElementById("expenseChart");
    if (!ctx) return;

    if (chart) chart.destroy();

    // ===== VẼ CHART =====
    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: false,          // 🔥 giữ tròn
            maintainAspectRatio: false,
            cutout: "65%", 
            plugins: {
                legend: {
                    position: "right"
                }
            }
        },
         plugins: [centerTextPlugin] 
    });

    renderList(labels, data, total);
}
//hiển thi danh mục được chi trong tháng
function renderList(labels, data, total) {
    const box = document.getElementById("expenseList");
    box.innerHTML = "";

    let transactions = getTransactions();

    labels.forEach((label, i) => {
        const percent = ((data[i] / total) * 100).toFixed(1);

        const found = transactions.find(t => t.category === label);

        const color = found?.color || "#ccc";
        const icon = found?.icon || "fa-solid fa-layer-group";

        box.innerHTML += `
            <div class="item">
                
                <div class="item-left">
                    <div class="icon" style="background:${color}">
                        <i class="${icon}"></i>
                    </div>

                    <div class="info">
                        <div class="top">
                            <span class="name">${label}</span>
                            <span class="percent">${percent}%</span>
                            <span class="amount">-${data[i].toLocaleString()}</span>
                        </div>

                        <div class="bar">
                            <div class="fill" 
                                 style="width:${percent}%; background:${color}">
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    });
}
//=================END THỐNG KÊ CHI TIÊU========================

// ==================== Thống kê thu nhập ====================
//Lấy data theo user như chi tiêu nên dùng như ở trên

//vẽ biểu đồ thu nhập theo danh mục
let incomeChart;
function renderIncomeChart()
{
    const monthOutput = document.getElementById("monthPicker");
    if (!monthOutput) return;

    const monthValue = monthOutput.value;

    let transactions = getTransactions();
    transactions = filterByMonth(transactions, monthValue);

    // 🔥 chỉ lấy thu nhập
    let income = transactions.filter(t => t.type === "income");

    // 🔴 KHÔNG CÓ DATA
    if (income.length === 0) {
        const box = document.getElementById("incomeList");
        if (box) box.innerHTML = "Không có dữ liệu";

        if (incomeChart) incomeChart.destroy();
        incomeChart = null;
        return;
    }

    // ===== GOM THEO DANH MỤC =====
    let categoryMap = {};

    income.forEach(t =>
    {
        if (!categoryMap[t.category]) {
            categoryMap[t.category] = 0;
        }
        categoryMap[t.category] += t.amount;
    });

    const labels = Object.keys(categoryMap);
    const data = Object.values(categoryMap);

    const total = data.reduce((a, b) => a + b, 0);

   
    const colors = labels.map(label => {
    const found = income.find(t => t.category === label && t.color);
    return found ? found.color : "#ccc";
});

    const ctx = document.getElementById("incomeChart");
    if (!ctx) return;

    if (incomeChart) incomeChart.destroy();

    // ===== VẼ CHART =====
    incomeChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: false,          // 🔥 giữ tròn
            maintainAspectRatio: false,
            cutout: "65%", 
            plugins: {
                legend: {
                    position: "right"
                }
            }
        },
        plugins: [centerTextPlugin] 
    });

    renderListIncome(labels, data, total);
}

//hiển thị danh mục thu nhập trong tháng
function renderListIncome(labels, data, total) {
    const box = document.getElementById("incomeList");
    box.innerHTML = "";

    let transactions = getTransactions();

    labels.forEach((label, i) => {
        const percent = ((data[i] / total) * 100).toFixed(1);

        const found = transactions.find(t => t.category === label);

        const color = found?.color || "#ccc";
        const icon = found?.icon || "fa-solid fa-layer-group";

        box.innerHTML += `
            <div class="item">
                
                <div class="item-left">
                    <div class="icon" style="background:${color}">
                        <i class="${icon}"></i>
                    </div>

                    <div class="info">
                        <div class="top">
                            <span class="name">${label}</span>
                            <span class="percent">${percent}%</span>
                            <span class="amount">+${data[i].toLocaleString()}</span>
                        </div>

                        <div class="bar">
                            <div class="fill" 
                                 style="width:${percent}%; background:${color}">
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    });
}
// ==================END THỐNG KÊ THU NHẬP========================

//button xem
document.addEventListener("DOMContentLoaded", function () {
    const monthInput = document.getElementById("monthPicker");

    // Set default month to current month
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    if (monthInput) {
        monthInput.value = `${year}-${month}`;
    }

    // 🔥 FIX: Make the button trigger BOTH charts
    const btn = document.querySelector(".header button");
    if (btn) {
        btn.onclick = function() {
            renderChart();        // Update Expenses
            renderIncomeChart(); 
            renderCompareChart(); // 🔥 t // Update Income
        };
    }

    // Initial load for both charts
    renderChart(); 
    renderIncomeChart();
    renderCompareChart(); // 🔥 t
});

//nút hàm xuất dữ liệu
function exportExcel() {
    const month = document.getElementById("monthPicker").value;

    const user = JSON.parse(localStorage.getItem("currentUser"));
    const budget = user?.data?.budgets?.[month] || 0;

    let transactions = getTransactions();
    transactions = filterByMonth(transactions, month);

    const data = [
        { Thông_tin: `Ngân sách tháng ${month}: ${budget.toLocaleString("vi-VN")} đ` },
        {},
        ...transactions.map(t => ({
            Ngày: t.date,
            Loại: t.type,
            Danh_mục: t.category,
            Số_tiền: t.amount
        }))
    ];

    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "ThongKe");

    XLSX.writeFile(wb, `thongke_${month}.xlsx`);
}

// ===== BIỂU ĐỒ SO SÁNH =====
let compareChart;
function renderCompareChart() {
    const canvas = document.getElementById("compareChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const monthValue = document.getElementById("monthPicker").value;
    if (!monthValue) return;

    const selectedYear = monthValue.split("-")[0];

    const user = getCurrentUser();
    const budgets = user?.data?.budgets || {};

    let transactions = getTransactions();

    // ===== FILTER NĂM =====
    transactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() == selectedYear;
    });

    let monthlyIncome = Array(12).fill(0);
    let monthlyExpense = Array(12).fill(0);

    transactions.forEach(t => {
        const d = new Date(t.date);
        const m = d.getMonth();

        if (t.type === "income") monthlyIncome[m] += t.amount;
        else monthlyExpense[m] += t.amount;
    });

    // ===== NGÂN SÁCH =====
    let monthlyBudget = [];

    for (let i = 0; i < 12; i++) {
        const m = String(i + 1).padStart(2, "0");
        const key = `${selectedYear}-${m}`;

        let b = budgets[key] || 0;

        if (!b) {
            const months = Object.keys(budgets).sort().reverse();
            for (let mm of months) {
                if (mm < key) {
                    b = budgets[mm];
                    break;
                }
            }
        }

        monthlyBudget.push(b);
    }

    const profit = monthlyIncome.map((inc, i) => inc - monthlyExpense[i]);

    // ===== GRADIENT =====
    const gradientGreen = ctx.createLinearGradient(0, 0, 0, 350);
    gradientGreen.addColorStop(0, "#2ecc71");
    gradientGreen.addColorStop(1, "#b8f5d3");

    const gradientProfit = ctx.createLinearGradient(0, 0, 0, 350);
    gradientProfit.addColorStop(0, "rgba(0,0,0,0.08)");
    gradientProfit.addColorStop(1, "rgba(0,0,0,0.02)");

    if (compareChart) compareChart.destroy();

    compareChart = new Chart(ctx, {
        data: {
            labels: ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"],
            datasets: [
                // 🔴 CHI (LUÔN TRÊN CÙNG)
                {
                    type: "line",
                    label: "Chi",
                    data: monthlyExpense,
                    borderColor: "#fe1417",
                    tension: 0.45,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 9,
                    pointHitRadius: 25,
                    pointBackgroundColor: "#fff",
                    pointBorderColor: "#f90a0e",
                    pointBorderWidth: 2,
                    order: 0
                },

                // 🔵 NGÂN SÁCH
                {
                    type: "line",
                    label: "Ngân sách",
                    data: monthlyBudget,
                    borderColor: "#3498db",
                    borderDash: [6,6],
                    borderWidth: 2,
                    pointRadius: 0,
                    order: 1
                },

                // 🟩 THU
                {
                    type: "bar",
                    label: "Thu",
                    data: monthlyIncome,
                    backgroundColor:  " rgba(64, 244, 52, 5)", // ✅ đậm hơn, đẹp hơn
                    borderRadius: 12,
                    barThickness: 20,
                    order: 2
                },

                // ⚪ DƯ
                {
                    type: "bar",
                    label: "Dư Thu Nhập",
                    data: profit,
                    backgroundColor: "rgba(52, 152, 219, 0.1)",
                    borderRadius: 12,
                    barThickness: 20,
                    order: 3
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            animation: {
                duration: 1200,
                easing: "easeOutQuart"
            },

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },

                tooltip: {
                    backgroundColor: "#fff",
                    titleColor: "#333",
                    bodyColor: "#333",
                    borderColor: "#ddd",
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 10,
                    callbacks: {
                        label: ctx =>
                            ctx.dataset.label + ": " +
                            ctx.raw.toLocaleString("vi-VN") + " đ"
                    }
                }
            },

            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    grace: "10%",
                    grid: {
                        color: "rgba(0,0,0,0.05)"
                    },
                    ticks: {
                        callback: v => v.toLocaleString("vi-VN") + " đ"
                    }
                }
            }
        }
    });

    // ===== TEXT % =====
    const totalExpense = monthlyExpense.reduce((a,b)=>a+b,0);
    const totalBudget = monthlyBudget.reduce((a,b)=>a+b,0);

    const percent = totalBudget > 0
        ? (totalExpense / totalBudget) * 100
        : 0;

    const compareText = document.getElementById("compareText");

    if (compareText) {
        compareText.innerText = "Đã dùng: " + percent.toFixed(1) + "%";
        compareText.className =
            totalExpense > totalBudget ? "up" : "down";
    }
}