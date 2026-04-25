function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function updateCurrentUser(newUser) {
    let users = getUsers();

    users = users.map(u => u.username === newUser.username ? newUser : u);

    saveUsers(users);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
}