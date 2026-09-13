document.addEventListener("DOMContentLoaded", function () {

    const ordersContainer = document.getElementById("orders-container");

    const orderFilter = document.getElementById("order-filter");

    let orders = JSON.parse(localStorage.getItem("maisonOrders")) || [];

    function formatPrice(price) {

        return "₱" + Number(price).toLocaleString("en-PH");

    }

    function formatDate(date) {

        const orderDate = new Date(date);

        return orderDate.toLocaleDateString("en-PH", {

            year: "numeric",

            month: "long",

            day: "numeric"

        });

    }

    function saveOrders() {

        localStorage.setItem(

            "maisonOrders",

            JSON.stringify(orders)

        );

    }

    function renderOrders(filter = "all") {

        ordersContainer.innerHTML = "";

        let filteredOrders = orders;

        if (filter !== "all") {

            filteredOrders = orders.filter(function (order) {

                return order.status.toLowerCase() === filter.toLowerCase();

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

            const customer = order.customer || {};

            const customerName = (

                (customer.firstName || "") +

                " " +

                (customer.lastName || "")

            ).trim();

            const customerAddress = [

                customer.address || "",

                customer.city || "",

                customer.zip || ""

            ].filter(Boolean).join(", ");

            const customerPhone = customer.phone || "Not provided";

            let itemsHTML = "";

            items.forEach(function (item) {

                itemsHTML += `

                    <div class="order-item">

                        <div class="order-item-image ${item.image || ""}"></div>

                        <div class="order-item-info">

                            <h4>${item.name}</h4>

                            <span>

                                ${item.quantity} × ${formatPrice(item.price)}

                            </span>

                        </div>

                        <strong>

                            ${formatPrice(item.price * item.quantity)}

                        </strong>

                    </div>

                `;

            });

            orderCard.innerHTML = `

                <div class="order-card-header">

                    <div>

                        <p class="order-number">

                            ${order.orderNumber || "ORDER"}

                        </p>

                        <h3>

                            ${formatDate(order.date)}

                        </h3>

                    </div>

                    <span class="order-status ${order.status.toLowerCase()}">

                        ${order.status}

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

                        ${items.reduce(function (total, item) {

                            return total + Number(item.quantity);

                        }, 0)}

                        item${items.reduce(function (total, item) {

                            return total + Number(item.quantity);

                        }, 0) !== 1 ? "s" : ""}

                    </span>

                    <strong>

                        Total: ${formatPrice(order.total)}

                    </strong>

                </div>

                <div class="order-actions">

                    ${order.status.toLowerCase() === "preparing" ? `

                        <button

                            type="button"

                            class="order-complete-btn"

                            data-order="${order.orderNumber}"

                        >

                            Mark as Completed

                        </button>

                        <button

                            type="button"

                            class="order-cancel-btn"

                            data-order="${order.orderNumber}"

                        >

                            Cancel Order

                        </button>

                    ` : ""}

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

                const orderNumber = button.getAttribute("data-order");

                const order = orders.find(function (item) {

                    return item.orderNumber === orderNumber;

                });

                if (!order) {

                    return;

                }

                order.status = "completed";

                saveOrders();

                renderOrders(orderFilter.value);

            });

        });

        cancelButtons.forEach(function (button) {

            button.addEventListener("click", function () {

                const orderNumber = button.getAttribute("data-order");

                const order = orders.find(function (item) {

                    return item.orderNumber === orderNumber;

                });

                if (!order) {

                    return;

                }

                const confirmCancel = confirm(

                    "Are you sure you want to cancel this order?"

                );

                if (!confirmCancel) {

                    return;

                }

                order.status = "cancelled";

                saveOrders();

                renderOrders(orderFilter.value);

            });

        });

    }

    orderFilter.addEventListener("change", function () {

        renderOrders(orderFilter.value);

    });

    renderOrders();

});
