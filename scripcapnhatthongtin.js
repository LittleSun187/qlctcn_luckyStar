// CHỐNG CHƯA LOGIN
if (localStorage.getItem("isLogin") !== "true") {
    window.location.href = "login.html";
}

window.onload = function() {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (user) {
        // ===== FORM =====
        const nameInput = document.getElementById("userName");
        const emailInput = document.getElementById("userEmail");
        const phoneInput = document.getElementById("userPhone");
        const addressInput = document.getElementById("userAddress");

        if (nameInput) nameInput.value = user.name || "";
        if (emailInput) emailInput.value = user.email || "";
        if (phoneInput) phoneInput.value = user.phone || "";
        if (addressInput) addressInput.value = user.address || "";

        // ===== GIỚI TÍNH =====
        if (user.gender) {
            const radio = document.querySelector(`input[name="gender"][value="${user.gender}"]`);
            if (radio) radio.checked = true;
        }

        // ===== HELLO =====
        const hello = document.querySelector(".user-profile h3");
        if (hello) {
            hello.innerText = "Xin chào, " + user.name + "!";
        }
        const avatarBox = document.getElementById("avatarPreview");

if (user.avatar && avatarBox) {
    avatarBox.style.backgroundImage = `url(${user.avatar})`;
    avatarBox.style.backgroundSize = "cover";
    avatarBox.style.backgroundPosition = "center";
}
    }
     // 🔥 THÊM ĐOẠN NÀY VÀO TRONG onload
    const input = document.getElementById("imageUpload");

    if (input) {
        input.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                alert("Ảnh vượt quá 5 MB!");
                return;
            }

            const reader = new FileReader();

            reader.onload = function(event) {
                const base64 = event.target.result;

                const preview = document.getElementById("avatarPreview");

                // 👉 dùng img cho chắc
                preview.innerHTML = `<img src="${base64}" 
                    style="width:100%; height:100%; border-radius:50%;">`;

                let user = JSON.parse(localStorage.getItem("currentUser"));
                user.avatar = base64;

                localStorage.setItem("currentUser", JSON.stringify(user));
            };

            reader.readAsDataURL(file);
        });
    }
   
};
function logout() {
    if (confirm("Bạn có chắc muốn đăng xuất không?")) {

        localStorage.removeItem("isLogin"); // chỉ xoá trạng thái login
         localStorage.removeItem("currentUser"); 
        document.body.style.opacity = "0";

        setTimeout(() => {
            window.location.href = "./login.html";
        }, 300);
    }
}

//hàm lưu thông tin
function saveUser(e) {
    e.preventDefault();

    let user = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Lấy dữ liệu mới
    const name = document.getElementById("userName").value;
    const phone = document.getElementById("userPhone").value;
    const address = document.getElementById("userAddress").value;

    const gender = document.querySelector('input[name="gender"]:checked')?.value;

    // Cập nhật user hiện tại
    user.name = name;
    user.phone = phone;
    user.address = address;
    user.gender = gender;

    // Cập nhật trong danh sách users
    users = users.map(u => {
    if (u.username === user.username) {
        return { ...u, ...user };
    }
    return u;
});

    // Lưu lại
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));

    alert("Lưu thông tin thành công!");
}
// load thêm dữ liệu
document.getElementById("userPhone").value = user.phone || "";
document.getElementById("userAddress").value = user.address || "";

// gender
if (user.gender) {
    const radio = document.querySelector(`input[name="gender"][value="${user.gender}"]`);
    if (radio) radio.checked = true;
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
// thêm ảnh
document.getElementById("imageUpload").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // ❗ giới hạn 1MB
    if (file.size > 1024 * 1024) {
        alert("Ảnh vượt quá 1MB!");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        const base64 = event.target.result;

        // hiển thị ảnh
        const preview = document.getElementById("avatarPreview");
        preview.style.backgroundImage = `url(${base64})`;
        preview.style.backgroundSize = "cover";
        preview.style.backgroundPosition = "center";

        // lưu vào user
        let user = JSON.parse(localStorage.getItem("currentUser"));
        user.avatar = base64;

        localStorage.setItem("currentUser", JSON.stringify(user));
    };

    reader.readAsDataURL(file);
});