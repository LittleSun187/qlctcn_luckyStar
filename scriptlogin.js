function showForm(formId) {
    const forms = document.querySelectorAll('.form-box');
    forms.forEach(f => f.classList.add('hidden'));

    const target = document.getElementById(formId);
    if (target) target.classList.remove('hidden');
}

// ĐĂNG KÝ
function handleRegister() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const username = document.getElementById("regUser").value;
    const password = document.getElementById("regPass").value;
    const password2 = document.getElementById("regPass2").value;

    if (!name || !email || !username || !password) {
        alert("Nhập đầy đủ!");
        return;
    }

    if (password !== password2) {
        alert("Mật khẩu không khớp!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // check trùng
    if (users.find(u => u.username === username)) {
        alert("Tài khoản đã tồn tại!");
        return;
    }

    const newUser = {
        username,
        password,
        name,
        email,

        // 🔥 QUAN TRỌNG
        data: {
            transactions: [],
            categories: {
                expense: [],
                income: []
            },
            budget: 0
        }
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Đăng ký thành công!");
}

// ĐĂNG NHẬP
function handleLogin() {
    const username = document.getElementById("userLogin").value;
    const password = document.getElementById("passLogin").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert("Sai tài khoản!");
        return;
    }

    // 🔥 LƯU USER HIỆN TẠI
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("isLogin", "true");

    window.location.href = "trangchu.html";
}


