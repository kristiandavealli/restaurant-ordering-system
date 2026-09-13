document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".menu-add-btn");
    let cart = JSON.parse(localStorage.getItem("maisonCart")) || [];
    const foods = {
        101: {
            id: 101,
            name: "Classic Beef Burger",
            category: "BURGERS",
            price: 189,
            image: "menu-img-one"
        },
        102: {
            id: 102,
            name: "Margherita Pizza",
            category: "PIZZA",
            price: 299,
            image: "menu-img-two"
        },
        103: {
            id: 103,
            name: "Truffle Mushroom Pasta",
            category: "PASTA",
            price: 249,
            image: "menu-img-three"
        },
        104: {
            id: 104,
            name: "Crispy Signature Chicken",
            category: "CHICKEN",
            price: 229,
            image: "menu-img-four"
        },
        105: {
            id: 105,
            name: "Chocolate Lava Cake",
            category: "DESSERTS",
            price: 159,
            image: "menu-img-five"
        },
        106: {
            id: 106,
            name: "Classic Iced Latte",
            category: "DRINKS",
            price: 129,
            image: "menu-img-six"
        }
    };
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
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: food.id,
                    name: food.name,
                    category: food.category,
                    price: food.price,
                    image: food.image,
                    quantity: 1
                });
            }
            localStorage.setItem(
                "maisonCart",
                JSON.stringify(cart)
            );
            button.textContent = "✓ Added";
            setTimeout(function () {
                button.textContent = "Add to Cart +";
            }, 800);
        });
    });
});