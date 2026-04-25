
    // ===== LOAD USER =====
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (user) {
        const hello = document.querySelector(".user-profile h3");
        if (hello) {
            hello.innerText = "Xin chào, " + user.name + "!";
        }
    }
let editIndex = null; // null là thêm mới, nếu là số thì là đang sửa vị trí đó
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
        main.style.pointerEvents = "none"; // 🔥 chặn spam click

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
//danh mục 
// ===== DATA =====
function getCategories() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    return user.data.categories || { expense: [], income: [] };
}

function saveCategories(categories) {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];

    user.data.categories = categories;

    users = users.map(u => {
        if (u.username === user.username) return user;
        return u;
    });

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));
}

let currentType = "expense";
let categories = getCategories();

// ===== LOAD =====
document.addEventListener("DOMContentLoaded", function () {
    categories = getCategories();

    render();
           // 🔥 chạy mặc định khi load
    const firstTab = document.querySelector(".tab-item");
    if (firstTab) {
          switchTab("expense", firstTab);
     }

    // ===== HIỂN THỊ MÀU =====
    document.querySelectorAll(".color").forEach(c => {
        const color = c.getAttribute("data-color");
        c.style.background = color;
    });
    const popup = document.getElementById("categoryPopup");

if (popup) {
    popup.addEventListener("click", function (e) {
       if (!e.target.closest(".popup-box")) {
        popup.style.display = "none";
        }
    });
}

    // ===== CHỌN MÀU =====
    document.querySelectorAll(".color").forEach(c => {
        c.onclick = () => {

            document.querySelectorAll(".color").forEach(x => x.classList.remove("active"));
            c.classList.add("active");

            const selectedColor = c.getAttribute("data-color");

            // 👉 CHỈ đổi màu icon đang active
            const activeIcon = document.querySelector(".icon-list i.active");

            if (activeIcon) {
                activeIcon.style.background = selectedColor;
                activeIcon.style.color = "white";
            }
        };
    });

    // ===== CHỌN ICON (🔥 tách riêng ra ngoài) =====
    document.querySelectorAll(".icon-list i").forEach(i => {
        i.onclick = () => {

            // reset icon cũ
            document.querySelectorAll(".icon-list i").forEach(x => {
                x.classList.remove("active");
                x.style.background = "#eee";
                x.style.color = "#666";
            });

            // active icon mới
            i.classList.add("active");

            // lấy màu đang chọn
            const selectedColor = document.querySelector(".color.active").getAttribute("data-color");

            // tô màu icon vừa chọn
            i.style.background = selectedColor;
            i.style.color = "white";
        };
    });



    // ===== ĐẾM KÝ TỰ =====
    const input = document.getElementById("categoryName");
    const counter = document.getElementById("charCount");

    input.addEventListener("input", () => {
        let value = input.value;

        value = value.replace(/[0-9]/g, "");

        if (value.length > 16) {
            value = value.slice(0, 16);
        }

        input.value = value;
        counter.innerText = value.length + "/16";
    });

});

// ===== RENDER =====
function render() {
    const list = document.getElementById("category-list");
    list.innerHTML = "";

    categories[currentType].forEach((cat, index) => {
        const div = document.createElement("div");
        div.className = "category-item";

        div.innerHTML = `
            <div class="category-left">
                <i class="fa-solid fa-trash delete-btn" onclick="deleteCategory(${index})"></i>
                
                <i class="fa-solid fa-pen-to-square edit-btn" onclick="openEditPopup(${index})" style="margin-left: 10px; color: #2b659c; cursor: pointer;"></i>

                <i class="${cat.icon}" 
                   style="background:${cat.color}; color:white; border-radius:50%; padding:12px; margin-left: 15px;"></i>

                <span>${cat.name}</span>
            </div>
        `;
        list.appendChild(div);
    });
}
// ===== SWITCH TAB =====
function switchTab(type, el) {
    currentType = type;

    const line = document.getElementById("tabLine");
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement.getBoundingClientRect();

    line.style.left = (rect.left - parentRect.left) + "px";
    line.style.width = rect.width + "px";

    document.querySelectorAll(".tab-item").forEach(tab => tab.classList.remove("active"));
    el.classList.add("active");

    render();
}

// ===== POPUP =====
function openPopup() {
    editIndex = null; // 🔥 QUAN TRỌNG NHẤT

    document.querySelector("#categoryPopup h2").innerText = "Thêm danh mục";
    document.getElementById("categoryName").value = "";

    // reset màu
    document.querySelectorAll(".color").forEach(c => c.classList.remove("active"));

    // reset icon
    document.querySelectorAll(".icon-list i").forEach(i => {
        i.classList.remove("active");
        i.style.background = "#eee";
        i.style.color = "#666";
    });

    document.getElementById("categoryPopup").style.display = "flex";
}

// ===== ADD =====
// ===== ADD CATEGORY (Sửa lại để chuẩn hóa dữ liệu) =====
console.log("CLICK OK");
function addCategory() {
    console.log("RUN ADD"); // debug

    const name = document.getElementById("categoryName").value.trim();
    if (!name) {
        alert("Nhập tên danh mục!");
        return;
    }

    // 🔥 FIX NULL
    const colorEl = document.querySelector(".color.active");
    const iconEl = document.querySelector(".icon-list i.active");

    const color = colorEl ? colorEl.getAttribute("data-color") : "#ccc";
    const icon = iconEl ? iconEl.className.replace(" active", "") : "fa-solid fa-star";

    const newCat = { name, color, icon };

    // add hoặc edit
    if (editIndex !== null) {
        categories[currentType][editIndex] = newCat;
        editIndex = null;
    } else {
        categories[currentType].push(newCat);
    }

    // lưu
    saveCategories(categories);

    // 🔥 QUAN TRỌNG: render NGAY
    render();

    // 🔥 đóng popup
    document.getElementById("categoryPopup").style.display = "none";

    // reset input
    document.getElementById("categoryName").value = "";
}
// hàm xóa
function deleteCategory(index) {

    if (!confirm("Bạn có chắc muốn xóa không?")) return;

    // xóa đúng phần tử
    categories[currentType].splice(index, 1);

    // cập nhật localStorage
   saveCategories(categories);

    render();
}

// 1. Hàm mở popup để sửa
function openEditPopup(index) {
    editIndex = index; // Lưu vị trí đang sửa
    const cat = categories[currentType][index];

    // Hiện popup
    document.getElementById("categoryPopup").style.display = "flex";
    document.querySelector("#categoryPopup h2").innerText = "Sửa danh mục";

    // Điền tên cũ
    document.getElementById("categoryName").value = cat.name;

    // Chọn lại màu cũ
    document.querySelectorAll(".color").forEach(c => {
        c.classList.remove("active");
        if (c.getAttribute("data-color") === cat.color) {
            c.classList.add("active");
        }
    });

    // Chọn lại icon cũ
    document.querySelectorAll(".icon-list i").forEach(i => {
        i.classList.remove("active");
        i.style.background = "#eee";
        i.style.color = "#666";
        if (i.className.includes(cat.icon)) {
            i.classList.add("active");
            i.style.background = cat.color;
            i.style.color = "white";
        }
    });
}


