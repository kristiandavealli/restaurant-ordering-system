document.addEventListener("DOMContentLoaded", function () {

    const ordersContainer = document.getElementById("orders-container");
    const orderFilter = document.getElementById("order-filter");

    let orders = [];

    function formatPrice(price) {
        return "₱" + Number(price).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatDate(date) {
        const orderDate = new Date(date);

        return orderDate.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function loadOrders() {

        fetch("orders.php")
            .then(response => response.json())
            .then(data => {

                if (!data.success) {
                    ordersContainer.innerHTML = `
                        <div class="empty-orders">
                            <div class="empty-orders-icon">⚠️</div>
                            <h3>Unable to Load Orders</h3>
                            <p>${data.message || "Something went wrong."}</p>
                        </div>
                    `;
                    return;
                }

                orders = data.orders || [];

                renderOrders(orderFilter.value);

            })
            .catch(error => {

                console.error("Orders error:", error);

                ordersContainer.innerHTML = `
                    <div class="empty-orders">
                        <div class="empty-orders-icon">⚠️</div>
                        <h3>Connection Error</h3>
                        <p>Unable to connect to the server.</p>
                    </div>
                `;

            });

    }

    function renderOrders(filter = "all") {

        ordersContainer.innerHTML = "";

        let filteredOrders = orders;

        if (filter !== "all") {

            filteredOrders = orders.filter(function (order) {

                return String(order.status).toLowerCase() === filter.toLowerCase();

            });

        }

        if (filteredOrders.length === 0) {

            ordersContainer.innerHTML = `
                <div class="empty-orders">
                    <div class="empty-orders-icon">📋</div>
                    <h3>No Orders Yet</h3>
                    <p>
                        Your recent orders will appear here after you place an order.
                    </p>
                    <a href="menu.html" class="primary-btn">
                        Browse Menu
                    </a>
                </div>
            `;

            return;
        }

        filteredOrders.forEach(function (order) {

            const orderCard = document.createElement("div");

            orderCard.className = "order-card";

            const items = order.items || [];

            const customerName = (
                (order.first_name || "") +
                " " +
                (order.last_name || "")
            ).trim();

            const customerAddress = [
                order.address || "",
                order.city || "",
                order.zip || ""
            ].filter(Boolean).join(", ");

            const customerPhone = order.phone || "Not provided";

            let itemsHTML = "";

            items.forEach(function (item) {

                itemsHTML += `
                    <div class="order-item">

                        <div class="order-item-image ${item.image || ""}"></div>

                        <div class="order-item-info">

                            <h4>${item.product_name}</h4>

                            <span>
                                ${item.quantity} × ${formatPrice(item.price)}
                            </span>

                        </div>

                        <strong>
                            ${formatPrice(Number(item.price) * Number(item.quantity))}
                        </strong>

                    </div>
                `;

            });

            const itemCount = items.reduce(function (total, item) {

                return total + Number(item.quantity);

            }, 0);

            const status = String(order.status || "Pending");

            orderCard.innerHTML = `

                <div class="order-card-header">

                    <div>

                        <p class="order-number">
                            ORDER #${order.id}
                        </p>

                        <h3>
                            ${formatDate(order.created_at)}
                        </h3>

                    </div>

                    <span class="order-status ${status.toLowerCase()}">
                        ${status}
                    </span>

                </div>

                <div class="order-customer">

                    <div>

                        <span>Customer</span>

                        <strong>
                            ${customerName || "Guest Customer"}
                        </strong>

                    </div>

                    <div>

                        <span>Address</span>

                        <strong>
                            ${customerAddress || "Not provided"}
                        </strong>

                    </div>

                    <div>

                        <span>Contact Number</span>

                        <strong>
                            ${customerPhone}
                        </strong>

                    </div>

                </div>

                <div class="order-items">

                    ${itemsHTML}

                </div>

                <div class="order-card-footer">

                    <span>
                        ${itemCount}
                        item${itemCount !== 1 ? "s" : ""}
                    </span>

                    <strong>
                        Total: ${formatPrice(order.total)}
                    </strong>

                </div>

                <div class="order-actions">

                    ${
                        status.toLowerCase() === "preparing"
                        ? `
                            <button
                                type="button"
                                class="order-complete-btn"
                                data-order="${order.id}"
                            >
                                Mark as Completed
                            </button>

                            <button
                                type="button"
                                class="order-cancel-btn"
                                data-order="${order.id}"
                            >
                                Cancel Order
                            </button>
                        `
                        : ""
                    }

                </div>

            `;

            ordersContainer.appendChild(orderCard);

        });

        const completeButtons = document.querySelectorAll(
            ".order-complete-btn"
        );

        const cancelButtons = document.querySelectorAll(
            ".order-cancel-btn"
        );

        completeButtons.forEach(function (button) {

            button.addEventListener("click", function () {

                const orderId = button.getAttribute("data-order");

                updateOrderStatus(orderId, "Completed");

            });

        });

        cancelButtons.forEach(function (button) {

            button.addEventListener("click", function () {

                const orderId = button.getAttribute("data-order");

                const confirmCancel = confirm(
                    "Are you sure you want to cancel this order?"
                );

                if (!confirmCancel) {
                    return;
                }

                updateOrderStatus(orderId, "Cancelled");

            });

        });

    }

    function updateOrderStatus(orderId, status) {

        fetch("orders.php", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: orderId,
                status: status
            })
        })
        .then(response => response.json())
        .then(data => {

            if (!data.success) {
                alert(data.message || "Unable to update order.");
                return;
            }

            loadOrders();

        })
        .catch(error => {

            console.error("Status update error:", error);

            alert("Unable to connect to the server.");

        });

    }

    orderFilter.addEventListener("change", function () {

        renderOrders(orderFilter.value);

    });

    loadOrders();

});
