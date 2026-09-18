document.addEventListener("DOMContentLoaded", function () {

    const buttons = document.querySelectorAll(".menu-add-btn");
    const cartLink = document.querySelector(".cart-link");

    function updateCartCount() {
        fetch("cart.php")
            .then(response => response.json())
            .then(data => {
                if (data.success && cartLink) {
                    let count = data.items.reduce((total, item) => {
                        return total + Number(item.quantity);
                    }, 0);

                    cartLink.innerHTML = `🛒 Cart${count > 0 ? ` (${count})` : ""}`;
                }
            })
            .catch(error => {
                console.error("Cart error:", error);
            });
    }

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const id = Number(button.getAttribute("data-id"));

            fetch("menu.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    product_id: id,
                    quantity: 1
                })
            })
            .then(response => response.json())
            .then(data => {

                if (data.success) {

                    button.textContent = "✓ Added";

                    updateCartCount();

                    setTimeout(function () {
                        button.textContent = "Add to Cart +";
                    }, 800);

                } else {
                    alert(data.message || "Unable to add item to cart.");
                }

            })
            .catch(error => {
                console.error("Add to cart error:", error);
                alert("Unable to connect to the server.");
            });

        });

    });

    updateCartCount();

});
