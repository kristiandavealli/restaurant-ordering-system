document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("login-form");
    const message = document.getElementById("login-message");

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const rememberMe = document.getElementById("remember-me").checked;

        message.textContent = "Logging in...";
        message.style.color = "#6b7280";

        fetch("login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                password: password,
                rememberMe: rememberMe
            })
        })
        .then(response => response.json())
        .then(data => {

            if (data.success) {

                message.textContent = "Login successful! Redirecting...";
                message.style.color = "#16a34a";

                setTimeout(function () {
                    window.location.href = "index.html";
                }, 500);

            } else {

                message.textContent = data.message || "Invalid email or password.";
                message.style.color = "#dc2626";

            }

        })
        .catch(error => {

            console.error("Login error:", error);

            message.textContent = "Unable to connect to the server.";
            message.style.color = "#dc2626";

        });

    });

});
