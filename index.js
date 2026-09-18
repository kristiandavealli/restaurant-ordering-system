document.addEventListener("DOMContentLoaded", function () {

    const buttons = document.querySelectorAll(".add-btn");
    const cartLink = document.querySelector(".cart-link");

    let cart = JSON.parse(localStorage.getItem("maisonCart")) || [];

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

    function updateCartCount() {

        let totalItems = 0;

        cart.forEach(function (item) {
            totalItems += Number(item.quantity);
        });

        if (cartLink) {

            if (totalItems > 0) {
                cartLink.textContent = "🛒 Cart (" + totalItems + ")";
            } else {
                cartLink.textContent = "🛒 Cart";
            }

        }
    }

    function saveCart() {

        localStorage.setItem(
            "maisonCart",
            JSON.stringify(cart)
        );

    }

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const id = Number(button.getAttribute("data-id"));

            const food = foods[id];

            if (!food) {
                return;
            }

            const existingItem = cart.find(function (item) {

                return Number(item.id) === id;

            });

            if (existingItem) {

                existingItem.quantity =
                    Number(existingItem.quantity) + 1;

            } else {

                cart.push({
                    id: food.id,
                    name: food.name,
                    category: food.category,
                    description: food.description,
                    price: food.price,
                    quantity: 1,
                    image: food.image
                });

            }

            saveCart();

            updateCartCount();

            button.textContent = "✓";

            setTimeout(function () {

                button.textContent = "+";

            }, 800);

        });

    });

    updateCartCount();

});
