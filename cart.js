document.addEventListener("DOMContentLoaded", function () {

    const cartItemsContainer = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const subtotalElement = document.getElementById("subtotal");
    const deliveryFeeElement = document.getElementById("delivery-fee");
    const discountElement = document.getElementById("discount");
    const totalElement = document.getElementById("total");
    const promoInput = document.getElementById("promo-code");
    const promoButton = document.getElementById("promo-button");
    const checkoutButton = document.getElementById("checkout-button");

    const DELIVERY_FEE = 50;

    let discount = 0;

    let cart = JSON.parse(localStorage.getItem("maisonCart")) || [];

    function saveCart() {
        localStorage.setItem("maisonCart", JSON.stringify(cart));
    }

    function formatPrice(price) {
        return "₱" + Number(price).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function renderCart() {

        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {

            cartItemsContainer.innerHTML = `
                <div class="empty-cart">

                    <h3>Your cart is empty</h3>

                    <p>Add delicious dishes from our menu.</p>

                    <a href="menu.html" class="primary-btn">
                        Browse Menu
                    </a>

                </div>
            `;

            updateSummary();

            saveCart();

            return;
        }

        cart.forEach(function (item) {

            const cartItem = document.createElement("div");

            cartItem.className = "cart-item";

            cartItem.innerHTML = `
                <div class="cart-food-image ${item.image}"></div>

                <div class="cart-food-details">

                    <p class="food-category">
                        ${item.category}
                    </p>

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        ${item.description}
                    </p>

                    <div class="quantity-control">

                        <button
                            type="button"
                            class="quantity-minus"
                            data-id="${item.id}"
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            type="button"
                            class="quantity-plus"
                            data-id="${item.id}"
                        >
                            +
                        </button>

                    </div>

                </div>

                <div class="cart-food-price">

                    <strong>
                        ${formatPrice(item.price * item.quantity)}
                    </strong>

                    <button
                        type="button"
                        class="remove-item"
                        data-id="${item.id}"
                    >
                        Remove
                    </button>

                </div>
            `;

            cartItemsContainer.appendChild(cartItem);
        });

        updateSummary();

        saveCart();
    }

    function updateSummary() {

        let subtotal = 0;
        let totalItems = 0;

        cart.forEach(function (item) {

            subtotal += Number(item.price) * item.quantity;

            totalItems += item.quantity;
        });

        const discountAmount = subtotal * discount;

        const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;

        const total = subtotal + deliveryFee - discountAmount;

        cartCount.textContent =
            totalItems + (totalItems === 1 ? " Item" : " Items");

        subtotalElement.textContent = formatPrice(subtotal);

        deliveryFeeElement.textContent =
            formatPrice(deliveryFee);

        discountElement.textContent =
            "-" + formatPrice(discountAmount);

        totalElement.textContent =
            formatPrice(Math.max(total, 0));
    }

    cartItemsContainer.addEventListener("click", function (event) {

        const button = event.target.closest("button");

        if (!button) {
            return;
        }

        const itemId = Number(button.dataset.id);

        const item = cart.find(function (product) {
            return product.id === itemId;
        });

        if (!item) {
            return;
        }

        if (button.classList.contains("quantity-plus")) {

            item.quantity += 1;
        }

        if (button.classList.contains("quantity-minus")) {

            item.quantity -= 1;

            if (item.quantity <= 0) {

                cart = cart.filter(function (product) {
                    return product.id !== itemId;
                });
            }
        }

        if (button.classList.contains("remove-item")) {

            cart = cart.filter(function (product) {
                return product.id !== itemId;
            });
        }

        renderCart();
    });

    promoButton.addEventListener("click", function () {

        const code = promoInput.value.trim().toUpperCase();

        if (code === "MAISON15") {

            discount = 0.15;

            promoInput.value = "";

            promoInput.placeholder = "15% discount applied!";

        } else {

            discount = 0;

            promoInput.value = "";

            promoInput.placeholder = "Invalid promo code";
        }

        updateSummary();
    });

    checkoutButton.addEventListener("click", function (event) {

        if (cart.length === 0) {

            event.preventDefault();

            alert("Your cart is empty. Please add some items first.");

            return;
        }

        const subtotal = cart.reduce(function (total, item) {

            return total + Number(item.price) * item.quantity;

        }, 0);

        const discountAmount = subtotal * discount;

        const total =
            subtotal + DELIVERY_FEE - discountAmount;

        localStorage.setItem(
            "maisonCheckoutCart",
            JSON.stringify(cart)
        );

        localStorage.setItem(
            "maisonCheckoutTotal",
            JSON.stringify(total)
        );
    });

    renderCart();

});
