document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".add-btn");
    const cartLink = document.querySelector(".cart-link");

    const foods = {
        101: {
            id: 101,
            name: "Classic Beef Burger",
            category: "BURGER",
            description: "Juicy beef patty, fresh lettuce, tomato, and special sauce.",
            price: 189,
            image: "food-one"
        },

        102: {
            id: 102,
            name: "Truffle Mushroom Pasta",
            category: "PASTA",
            description: "Creamy pasta with mushrooms and a touch of truffle oil.",
            price: 249,
            image: "food-two"
        },

        103: {
            id: 103,
            name: "Signature Chicken",
            category: "CHICKEN",
            description: "Crispy golden chicken served with our signature dipping sauce.",
            price: 229,
            image: "food-three"
        }
    };

    function updateCartCount(count) {
        if (!cartLink) {
            return;
        }

        if (count > 0) {
            cartLink.textContent = "🛒 Cart (" + count + ")";
        } else {
            cartLink.textContent = "🛒 Cart";
        }
    }

    async function loadCartCount() {
        try {
            const response = await fetch("cart.php");
            const data = await response.json();

            if (data.success) {
                let count = 0;

                if (Array.isArray(data.items)) {
                    data.items.forEach(function (item) {
                        count += Number(item.quantity);
                    });
                }

                updateCartCount(count);
            }
        } catch (error) {
            console.error("Unable to load cart count:", error);
        }
    }

    buttons.forEach(function (button) {
        button.addEventListener("click", async function () {
            const id = Number(button.getAttribute("data-id"));
            const food = foods[id];

            if (!food) {
                return;
            }

            button.disabled = true;
            button.textContent = "...";

            try {
                const response = await fetch("index.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        product_id: food.id,
                        quantity: 1
                    })
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || "Unable to add item to cart.");
                }

                updateCartCount(Number(data.cart_count));

                button.textContent = "✓";

                setTimeout(function () {
                    button.textContent = "+";
                    button.disabled = false;
                }, 800);

            } catch (error) {
                console.error(error);

                alert(error.message || "Something went wrong.");

                button.textContent = "+";
                button.disabled = false;
            }
        });
    });

    loadCartCount();
});
