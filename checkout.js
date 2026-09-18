document.addEventListener("DOMContentLoaded", function () {

    const checkoutItems = document.getElementById("checkout-items");
    const subtotalElement = document.getElementById("checkout-subtotal");
    const deliveryElement = document.getElementById("checkout-delivery");
    const discountElement = document.getElementById("checkout-discount");
    const totalElement = document.getElementById("checkout-total");
    const placeOrderButton = document.getElementById("place-order-btn");

    const DELIVERY_FEE = 50;

    let cart = [];
    let discount = 0;

    function formatPrice(price) {
        return "₱" + Number(price).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function getSubtotal() {
        return cart.reduce(function (total, item) {
            return total + Number(item.price) * Number(item.quantity);
        }, 0);
    }

    async function loadCart() {
        try {
            const response = await fetch("cart.php", {
                credentials: "include"
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "Unable to load cart.");
            }

            cart = data.items || [];

            renderCheckout();

        } catch (error) {
            console.error("Cart error:", error);

            checkoutItems.innerHTML = `
                <p>Unable to load your cart.</p>
            `;

            placeOrderButton.disabled = true;
        }
    }

    function renderCheckout() {

        checkoutItems.innerHTML = "";

        if (cart.length === 0) {

            checkoutItems.innerHTML = `
                <p>Your cart is empty.</p>
            `;

            subtotalElement.textContent = "₱0.00";
            deliveryElement.textContent = "₱0.00";
            discountElement.textContent = "₱0.00";
            totalElement.textContent = "₱0.00";

            placeOrderButton.disabled = true;

            return;
        }

        cart.forEach(function (item) {

            const checkoutItem = document.createElement("div");

            checkoutItem.className = "checkout-item";

            checkoutItem.innerHTML = `
                <div>
                    <strong>${item.product_name}</strong>
                    <span>Qty: ${item.quantity}</span>
                </div>

                <strong>
                    ${formatPrice(Number(item.price) * Number(item.quantity))}
                </strong>
            `;

            checkoutItems.appendChild(checkoutItem);
        });

        const subtotal = getSubtotal();

        if (discount > subtotal) {
            discount = subtotal;
        }

        const total = subtotal + DELIVERY_FEE - discount;

        subtotalElement.textContent = formatPrice(subtotal);

        deliveryElement.textContent = formatPrice(DELIVERY_FEE);

        if (discount > 0) {
            discountElement.textContent = "-" + formatPrice(discount);
        } else {
            discountElement.textContent = "₱0.00";
        }

        totalElement.textContent = formatPrice(total);

        placeOrderButton.disabled = false;
    }

    placeOrderButton.addEventListener("click", async function () {

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
        const notes = document.getElementById("notes").value.trim();

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

        const selectedPayment = document.querySelector(
            'input[name="payment"]:checked'
        );

        if (!selectedPayment) {
            alert("Please select a payment method.");
            return;
        }

        const paymentMethod = selectedPayment.value;

        const orderData = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            address: address,
            city: city,
            zip: zip,
            notes: notes,
            payment_method: paymentMethod,
            discount: discount
        };

        placeOrderButton.disabled = true;
        placeOrderButton.textContent = "Placing Order...";

        try {

            const response = await fetch("checkout.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(
                    data.message || "Unable to place order."
                );
            }

            alert(
                "Your order has been placed successfully!\n\n" +
                "Order ID: " +
                data.order_id +
                "\nTotal: " +
                formatPrice(data.total)
            );

            window.location.href = "orders.html";

        } catch (error) {

            console.error("Checkout error:", error);

            alert(
                error.message ||
                "Something went wrong while placing your order."
            );

            placeOrderButton.disabled = false;
            placeOrderButton.textContent = "Place Order";
        }
    });

    loadCart();

});
