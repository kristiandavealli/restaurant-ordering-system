document.addEventListener("DOMContentLoaded", function () { 
    const registerForm = document.getElementById("register-form");
    const message = document.getElementById("register-message");
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const fullname =
            document.getElementById("fullname").value.trim();
        const email =
            document.getElementById("register-email").value.trim();
        const password =
            document.getElementById("register-password").value;
        const confirmPassword =
            document.getElementById("confirm-password").value;
        if (password !== confirmPassword) {
            message.textContent =
                "Passwords do not match.";
            message.style.color = "#dc2626";
            return;
        }
        if (password.length < 6) {
            message.textContent =
                "Password must be at least 6 characters.";
            message.style.color = "#dc2626";
            return;
        }
        const user = {
            name: fullname,
            email: email,
            password: password
        };
        localStorage.setItem(
            "maisonUser",
            JSON.stringify(user)
        );
        message.textContent =
            "Account created successfully! Redirecting to login...";
        message.style.color = "#16a34a";
        setTimeout(function () {
            window.location.href = "login.html";
        }, 1000);
    });
});
