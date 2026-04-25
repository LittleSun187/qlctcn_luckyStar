window.onload = function () {

    // ===== LOAD USER =====
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (user) {
        const hello = document.querySelector(".user-profile h3");
        if (hello) {
            hello.innerText = "Xin chào, " + user.name + "!";
        }
    }

    // ===== NGÀY =====
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const dateText = `Hôm nay là ngày ${day} tháng ${month} năm ${year}. Bạn đang làm rất tốt việc quản lý tài chính!`;

    const dateElement = document.getElementById("currentDate");
    if (dateElement) {
        dateElement.innerText = dateText;
    }

    
};

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
