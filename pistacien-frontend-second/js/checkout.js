(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("checkout-form");
    const summaryList = document.getElementById("checkout-items-summary");
    const subtotalEl = document.getElementById("checkout-subtotal");
    const shippingEl = document.getElementById("checkout-shipping");
    const taxEl = document.getElementById("checkout-tax");
    const totalEl = document.getElementById("checkout-total");
    const submitBtn = document.getElementById("checkout-submit-btn");

    if (!form || !summaryList) return;

    const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

    // Handle Payment Option toggles
    const paymentOptions = document.querySelectorAll(".checkout-payment-option");
    paymentOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        paymentOptions.forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
        const radio = opt.querySelector(".checkout-payment-radio");
        if (radio) radio.checked = true;
      });
    });

    const renderCheckoutSummary = (items) => {
      if (!items || items.length === 0) {
        summaryList.innerHTML = "<p style='color: rgba(26,26,20,0.5); font-size: 0.85rem;'>Your cart is empty.</p>";
        submitBtn.disabled = true;
        
        // If unauthenticated or empty after 1.5 seconds, redirect
        setTimeout(() => {
          if (!window.CartStore || window.CartStore.items.length === 0) {
            window.showToast("Your cart is empty. Redirecting to shop...", "warning");
            window.location.href = "/pages/mens.html";
          }
        }, 1500);
        return;
      }

      submitBtn.disabled = false;
      summaryList.innerHTML = items.map(item => `
        <div class="checkout-item-row">
          <div class="checkout-item-details">
            <div class="checkout-item-img">
              <img src="${item.image}" alt="${item.name}" />
            </div>
            <div>
              <div class="checkout-item-name-qty">${item.name} <span style="color: rgba(26,26,20,0.5)">x${item.qty}</span></div>
              <div class="checkout-item-variant">Size: ${item.variant}</div>
            </div>
          </div>
          <div style="font-weight: 500;">${money.format(item.price * item.qty)}</div>
        </div>
      `).join("");

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

    // Listen to cart updates
    document.addEventListener("cart-updated", (e) => {
      renderCheckoutSummary(e.detail);
    });

    // Initial render if ready
    if (window.CartStore && window.CartStore.items) {
      renderCheckoutSummary(window.CartStore.items);
    }

    // Form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Check validation
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Processing Order...";

      const name = document.getElementById("checkout-name").value;
      const phone = document.getElementById("checkout-phone").value;
      const email = document.getElementById("checkout-email").value;
      const address = document.getElementById("checkout-address").value;
      const city = document.getElementById("checkout-city").value;
      const zip = document.getElementById("checkout-zip").value;
      const country = document.getElementById("checkout-country").value;
      
      const activePMOption = document.querySelector(".checkout-payment-option.active");
      const pm = activePMOption ? activePMOption.dataset.pm : "card";

      // Build structured address string
      const addressString = `Recipient: ${name} | Phone: ${phone} | Email: ${email} | Address: ${address}, ${city}, ${zip}, ${country} | Payment: ${pm}`;

      try {
        if (window.apiPlaceOrder) {
          const res = await window.apiPlaceOrder(addressString);
          console.log("Order placed successfully:", res);
          
          // Queue toast for next page
          window.showToastNextPage("Thank you! Your order has been placed successfully.", "success");
          
          // Clear client-side cart (clears both state and database cart items)
          if (window.CartStore && window.CartStore.clear) {
            window.CartStore.clear();
          }

          // Redirect to profile to view order history
          window.location.href = "/pages/profile.html";
        } else {
          window.showToast("Order API helper is missing.", "error");
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      } catch (err) {
        console.error("Failed to place order:", err);
        window.showToast(err.message || "Failed to place order. Please try again.", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  });
})();
