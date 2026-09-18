document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("login-form");

    const message = document.getElementById("login-message");

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();

        const password = document.getElementById("password").value;

        const rememberMe = document.getElementById("remember-me").checked;

        const registeredUser = JSON.parse(

            localStorage.getItem("maisonUser")

        );

        if (!registeredUser) {

            message.textContent =

                "No account found. Please create an account first.";

            message.style.color = "#dc2626";

            return;

        }

        if (

            email === registeredUser.email &&

            password === registeredUser.password

        ) {

            localStorage.setItem(

                "maisonLoggedIn",

                "true"

            );

            localStorage.setItem(

                "maisonCurrentUser",

                JSON.stringify(registeredUser)

            );

            if (rememberMe) {

                localStorage.setItem(

                    "maisonRememberMe",

                    "true"

                );

            } else {

                localStorage.removeItem(

                    "maisonRememberMe"

                );

            }

            message.textContent =

                "Login successful! Redirecting...";

            message.style.color = "#16a34a";

            setTimeout(function () {

                window.location.href = "index.html";

            }, 500);

        } else {

            message.textContent =

                "Invalid email or password.";

            message.style.color = "#dc2626";

        }

    });

});
