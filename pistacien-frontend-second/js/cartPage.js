(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("cart-container");
    const emptyState = document.getElementById("cart-empty-state");
    const itemsList = document.getElementById("cart-page-items");
    const subtotalEl = document.getElementById("summary-subtotal");
    const shippingEl = document.getElementById("summary-shipping");
    const taxEl = document.getElementById("summary-tax");
    const totalEl = document.getElementById("summary-total");

    if (!container || !emptyState || !itemsList) return;

    const esc = (text) =>
      String(text).replace(/[&<>"']/g, (c) => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
      ));

    const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

    const renderCartPage = (items) => {
      if (!items || items.length === 0) {
        container.style.display = "none";
        emptyState.style.display = "block";
        return;
      }

      emptyState.style.display = "none";
      container.style.display = "grid";

      itemsList.innerHTML = items.map((item) => {
        const itemTotal = item.price * item.qty;
        return `
          <div class="cart-page-item" data-id="${esc(item.id)}">
            <div class="cart-page-item-info">
              <div class="cart-page-item-img">
                <img src="${esc(item.image)}" alt="${esc(item.name)}" />
              </div>
              <div class="cart-page-item-details">
                <h3 class="cart-page-item-name">${esc(item.name)}</h3>
                <span class="cart-page-item-variant">Size: ${esc(item.variant)}</span>
                <div>
                  <button type="button" class="cart-page-remove-btn" data-action="remove">Remove</button>
                </div>
              </div>
            </div>
            <div class="cart-page-item-price">${money.format(item.price)}</div>
            <div>
              <div class="cart-page-qty">
                <button type="button" class="cart-page-qty-btn" data-action="dec" aria-label="Decrease quantity">-</button>
                <span class="cart-page-qty-val">${item.qty}</span>
                <button type="button" class="cart-page-qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <div class="cart-page-item-total" style="text-align: right;">${money.format(itemTotal)}</div>
          </div>
        `;
      }).join("");

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const shipping = subtotal >= 500 ? 0 : 25.00;
      const tax = subtotal * 0.08;
      const grandTotal = subtotal + shipping + tax;

      subtotalEl.textContent = money.format(subtotal);
      shippingEl.textContent = shipping === 0 ? "Free" : money.format(shipping);
      taxEl.textContent = money.format(tax);
      totalEl.textContent = money.format(grandTotal);
    };

    // Event delegation for cart actions (dec, inc, remove)
    itemsList.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const itemRow = btn.closest(".cart-page-item");
      if (!itemRow) return;

      const itemId = itemRow.getAttribute("data-id");
      const action = btn.getAttribute("data-action");

      if (!window.CartStore) return;

      const items = window.CartStore.items;
      const currentItem = items.find(item => item.id === itemId);
      if (!currentItem) return;

      if (action === "inc") {
        window.CartStore.update(itemId, currentItem.qty + 1);
      } else if (action === "dec") {
        window.CartStore.update(itemId, currentItem.qty - 1);
      } else if (action === "remove") {
        window.CartStore.remove(itemId);
      }
    });

    // Listen to store updates
    document.addEventListener("cart-updated", (e) => {
      renderCartPage(e.detail);
    });

    // Initialize if store is ready
    if (window.CartStore && window.CartStore.items) {
      renderCartPage(window.CartStore.items);
    }
  });
})();
