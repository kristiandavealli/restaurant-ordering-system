document.addEventListener("DOMContentLoaded", function () {
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const subtotalElement = document.getElementById("subtotal");
    const deliveryFeeElement = document.getElementById("delivery-fee");
    const discountElement = document.getElementById("discount");
    const totalElement = document.getElementById("total");
    const promoCode = document.getElementById("promo-code");
    const promoButton = document.getElementById("promo-button");
    const checkoutButton = document.getElementById("checkout-button");

    let discount = 0;

    function formatPrice(price) {
        return "₱" + Number(price).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    async function loadCart() {
        try {
            const response = await fetch("cart.php");
            const result = await response.json();

            if (!result.success) {
                cartItems.innerHTML = "<p>Unable to load cart.</p>";
                return;
            }

            displayCart(result.items);
            updateSummary(result.subtotal, result.delivery_fee);

        } catch (error) {
            cartItems.innerHTML = "<p>Unable to connect to the server.</p>";
        }
    }

    function displayCart(items) {
        cartItems.innerHTML = "";

        if (items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Add some delicious dishes from our menu.</p>
                </div>
            `;

            cartCount.textContent = "0 Items";
            checkoutButton.style.pointerEvents = "none";
            checkoutButton.style.opacity = "0.5";
            return;
        }

        checkoutButton.style.pointerEvents = "auto";
        checkoutButton.style.opacity = "1";

        let totalItems = 0;

        items.forEach(function (item) {
            totalItems += Number(item.quantity);

            const itemElement = document.createElement("div");
            itemElement.className = "cart-item";

            itemElement.innerHTML = `
                <div class="cart-item-image">
                    ${
                        item.image
                            ? `<img src="${item.image}" alt="${item.product_name}">`
                            : ""
                    }
                </div>

                <div class="cart-item-info">
                    <h3>${item.product_name}</h3>
                    <p>${formatPrice(item.price)}</p>

                    <div class="cart-item-actions">
                        <button type="button" class="quantity-btn decrease" data-id="${item.id}">
                            −
                        </button>

                        <span>${item.quantity}</span>

                        <button type="button" class="quantity-btn increase" data-id="${item.id}">
                            +
                        </button>

                        <button type="button" class="remove-btn" data-id="${item.id}">
                            Remove
                        </button>
                    </div>
                </div>

                <div class="cart-item-total">
                    ${formatPrice(Number(item.price) * Number(item.quantity))}
                </div>
            `;

            cartItems.appendChild(itemElement);
        });

        cartCount.textContent =
            totalItems + (totalItems === 1 ? " Item" : " Items");

        addCartEvents();
    }

    function updateSummary(subtotal, deliveryFee) {
        if (subtotal <= 0) {
            deliveryFee = 0;
            discount = 0;
        }

        const total = Number(subtotal) + Number(deliveryFee) - Number(discount);

        subtotalElement.textContent = formatPrice(subtotal);
        deliveryFeeElement.textContent = formatPrice(deliveryFee);
        discountElement.textContent = "-" + formatPrice(discount);
        totalElement.textContent = formatPrice(total);
    }

    function addCartEvents() {
        const increaseButtons = document.querySelectorAll(".increase");
        const decreaseButtons = document.querySelectorAll(".decrease");
        const removeButtons = document.querySelectorAll(".remove-btn");

        increaseButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                updateQuantity(button.dataset.id, 1);
            });
        });

        decreaseButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                updateQuantity(button.dataset.id, -1);
            });
        });

        removeButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                removeItem(button.dataset.id);
            });
        });
    }

    async function updateQuantity(id, change) {
        try {
            const response = await fetch("cart.php");
            const result = await response.json();

            const item = result.items.find(function (cartItem) {
                return Number(cartItem.id) === Number(id);
            });

            if (!item) {
                return;
            }

            const newQuantity = Number(item.quantity) + change;

            if (newQuantity <= 0) {
                removeItem(id);
                return;
            }

            await fetch("cart.php", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    quantity: newQuantity
                })
            });

            loadCart();

        } catch (error) {
            alert("Unable to update cart.");
        }
    }

    async function removeItem(id) {
        try {
            await fetch("cart.php", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id
                })
            });

            loadCart();

        } catch (error) {
            alert("Unable to remove item.");
        }
    }

    promoButton.addEventListener("click", function () {
        const code = promoCode.value.trim().toUpperCase();

        if (code === "MAISON10") {
            discount = 10;
            loadCart();
            alert("Promo code applied.");
        } else if (code === "") {
            discount = 0;
            loadCart();
        } else {
            discount = 0;
            alert("Invalid promo code.");
            loadCart();
        }
    });

    loadCart();
});
