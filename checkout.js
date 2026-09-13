document.addEventListener("DOMContentLoaded", function () {

    const checkoutItems = document.getElementById("checkout-items");
    const subtotalElement = document.getElementById("checkout-subtotal");
    const deliveryElement = document.getElementById("checkout-delivery");
    const discountElement = document.getElementById("checkout-discount");
    const totalElement = document.getElementById("checkout-total");
    const placeOrderButton = document.getElementById("place-order-btn");

    const DELIVERY_FEE = 50;

    const cart = JSON.parse(
        localStorage.getItem("maisonCheckoutCart")
    ) || [];

    const savedTotal = JSON.parse(
        localStorage.getItem("maisonCheckoutTotal")
    );

    function formatPrice(price) {
        return "₱" + Number(price).toLocaleString("en-PH");
    }

    function getSubtotal() {
        return cart.reduce(function (total, item) {
            return total + item.price * item.quantity;
        }, 0);
    }

    function renderCheckout() {

        checkoutItems.innerHTML = "";

        if (cart.length === 0) {

            checkoutItems.innerHTML = `
                <p>Your cart is empty.</p>
            `;

            subtotalElement.textContent = "₱0";
            deliveryElement.textContent = "₱0";
            discountElement.textContent = "₱0";
            totalElement.textContent = "₱0";

            placeOrderButton.disabled = true;

            return;
        }

        cart.forEach(function (item) {

            const checkoutItem = document.createElement("div");

            checkoutItem.className = "checkout-item";

            checkoutItem.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <span>Qty: ${item.quantity}</span>
                </div>

                <strong>
                    ${formatPrice(item.price * item.quantity)}
                </strong>
            `;

            checkoutItems.appendChild(checkoutItem);
        });

        const subtotal = getSubtotal();

        let total = savedTotal;

        if (!total || total < 0) {
            total = subtotal + DELIVERY_FEE;
        }

        const discount = Math.max(
            subtotal + DELIVERY_FEE - total,
            0
        );

        subtotalElement.textContent = formatPrice(subtotal);
        deliveryElement.textContent = formatPrice(DELIVERY_FEE);
        discountElement.textContent = "-" + formatPrice(discount);
        totalElement.textContent = formatPrice(total);
    }

    placeOrderButton.addEventListener("click", function () {

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const firstName = document.getElementById("first-name").value.trim();
        const lastName = document.getElementById("last-name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        const city = document.getElementById("city").value.trim();
        const zip = document.getElementById("zip").value.trim();

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !address ||
            !city ||
            !zip
        ) {
            alert("Please complete all required information.");
            return;
        }

        const paymentMethod = document.querySelector(
            'input[name="payment"]:checked'
        ).value;

        const subtotal = getSubtotal();

        const total = savedTotal || subtotal + DELIVERY_FEE;

        const existingOrders = JSON.parse(
            localStorage.getItem("maisonOrders")
        ) || [];

        const orderNumber = "MSN-" + Date.now();

        const order = {
            orderNumber: orderNumber,
            date: new Date().toLocaleString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }),
            status: "preparing",
            payment: paymentMethod,
            customer: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                address: address,
                city: city,
                zip: zip,
                notes: document.getElementById("notes").value.trim()
            },
            items: cart,
            total: total
        };

        existingOrders.unshift(order);

        localStorage.setItem(
            "maisonOrders",
            JSON.stringify(existingOrders)
        );

        localStorage.removeItem("maisonCart");
        localStorage.removeItem("maisonCheckoutCart");
        localStorage.removeItem("maisonCheckoutTotal");

        alert("Your order has been placed successfully!");

        window.location.href = "orders.html";
    });

    renderCheckout();

});