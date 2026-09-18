document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");
    const message = document.getElementById("register-message");

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            message.style.color = "#dc2626";
            return;
        }

        if (password.length < 6) {
            message.textContent = "Password must be at least 6 characters.";
            message.style.color = "#dc2626";
            return;
        }

        message.textContent = "Creating account...";
        message.style.color = "#6b7280";

        try {
            const response = await fetch("register.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullname: fullname,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                message.textContent = result.message + " Redirecting to login...";
                message.style.color = "#16a34a";

                setTimeout(function () {
                    window.location.href = "login.html";
                }, 1000);
            } else {
                message.textContent = result.message;
                message.style.color = "#dc2626";
            }

        } catch (error) {
            message.textContent = "Unable to connect to the server.";
            message.style.color = "#dc2626";
        }
    });
});
