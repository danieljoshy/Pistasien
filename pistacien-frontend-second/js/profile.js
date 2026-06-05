(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    const unauthView = document.getElementById("unauth-view");
    const dashboard = document.getElementById("profile-dashboard");
    const profileForm = document.getElementById("profile-form");
    const ordersTimeline = document.getElementById("orders-timeline");
    const logoutBtn = document.getElementById("btn-profile-logout");

    // Sidebar items
    const sidebarName = document.getElementById("sidebar-user-name");
    const sidebarEmail = document.getElementById("sidebar-user-email");
    const initialsBox = document.getElementById("avatar-initials");

    if (!profileForm || !ordersTimeline) return;

    const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

    // Load Profile
    let user = null;
    try {
      if (window.apiGetProfile) {
        const res = await window.apiGetProfile();
        if (res && res.success && res.data) {
          user = res.data;
          
          // Display dashboard
          unauthView.style.display = "none";
          dashboard.style.display = "grid";

          // Populate fields
          sidebarName.textContent = user.name || "User";
          sidebarEmail.textContent = user.email || "";
          initialsBox.textContent = (user.name || user.email || "U").substring(0, 1).toUpperCase();

          document.getElementById("profile-name").value = user.name || "";
          document.getElementById("profile-phone").value = user.phone || "";
          
          const profile = user.profile || {};
          document.getElementById("profile-address").value = profile.address || "";
          document.getElementById("profile-city").value = profile.city || "";
          document.getElementById("profile-country").value = profile.country || "";
          document.getElementById("profile-zip").value = profile.zipCode || "";
        }
      }
    } catch (err) {
      console.error("User is not authenticated:", err);
      dashboard.style.display = "none";
      unauthView.style.display = "block";
      return; // Stop execution if unauthorized
    }

    // Load Order History
    try {
      if (window.apiGetOrders) {
        const res = await window.apiGetOrders();
        const orders = res.data || [];
        renderOrderHistory(orders);
      }
    } catch (err) {
      console.error("Failed to load order history:", err);
      ordersTimeline.innerHTML = "<p style='color: #b33939; font-size: 0.85rem;'>Failed to load order history.</p>";
    }

    // Profile Form Save
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const submitBtn = profileForm.querySelector("button[type='submit']");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Saving Changes...";
      submitBtn.disabled = true;

      const name = document.getElementById("profile-name").value;
      const phone = document.getElementById("profile-phone").value;
      const address = document.getElementById("profile-address").value;
      const city = document.getElementById("profile-city").value;
      const country = document.getElementById("profile-country").value;
      const zipCode = document.getElementById("profile-zip").value;

      try {
        if (window.apiUpdateProfile) {
          const res = await window.apiUpdateProfile({ name, phone, address, city, country, zipCode });
          if (res && res.success) {
            window.showToast("Profile updated successfully!", "success");
            sidebarName.textContent = name;
            initialsBox.textContent = name.substring(0, 1).toUpperCase();
          }
        }
      } catch (err) {
        console.error("Failed to update profile:", err);
        window.showToast(err.message || "Failed to update profile. Please try again.", "error");
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        if (window.confirm("Are you sure you want to sign out?")) {
          try {
            if (window.apiLogout) {
              await window.apiLogout();
              
              // Clear client-side cart
              if (window.CartStore && window.CartStore.clear) {
                window.CartStore.clear();
              }
              
              window.showToastNextPage("You have signed out successfully.", "info");
              window.location.href = "index.html";
            }
          } catch (err) {
            console.error("Logout failed:", err);
            // Fallback clear
            window.location.href = "index.html";
          }
        }
      });
    }

    // Helper: Render Order History Cards
    function renderOrderHistory(orders) {
      if (!orders || orders.length === 0) {
        ordersTimeline.innerHTML = `
          <div class="history-empty">
            <p>You have not placed any orders yet.</p>
          </div>
        `;
        return;
      }

      ordersTimeline.innerHTML = orders.map(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const statusClass = `status-${order.status.toLowerCase()}`;
        const formattedStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase();

        // Render items inside this order card
        const itemsHtml = order.items.map(item => {
          const prodImage = (item.product && item.product.images && item.product.images[0]) || "../assets/images/logo.png";
          const prodName = (item.product && item.product.name) || "Product Item";
          return `
            <div class="order-item-row">
              <div class="order-item-img">
                <img src="${prodImage}" alt="${prodName}" />
              </div>
              <div class="order-item-info">
                <h4 class="order-item-name">${prodName}</h4>
                <span class="order-item-variant">Size: ${item.size || "Standard"}</span>
              </div>
              <div class="order-item-price-qty">
                <div>${money.format(item.price)}</div>
                <div style="color: rgba(26,26,20,0.5); font-size: 0.76rem;">Qty: ${item.quantity}</div>
              </div>
            </div>
          `;
        }).join("");

        return `
          <div class="order-card">
            <div class="order-header">
              <div class="order-meta">
                <div class="order-meta-item">
                  <span class="order-meta-label">Order Placed</span>
                  <span class="order-meta-val">${orderDate}</span>
                </div>
                <div class="order-meta-item">
                  <span class="order-meta-label">Total</span>
                  <span class="order-meta-val" style="color: var(--pistachio);">${money.format(order.total)}</span>
                </div>
                <div class="order-meta-item">
                  <span class="order-meta-label">Order ID</span>
                  <span class="order-meta-val" style="font-family: monospace; font-size: 0.76rem;">#${order.id}</span>
                </div>
              </div>
              <span class="order-status ${statusClass}">${formattedStatus}</span>
            </div>
            <div class="order-body">
              <div class="order-items-wrapper">
                ${itemsHtml}
              </div>
              <div class="order-address-box">
                <strong>Delivery Address & Order Metadata:</strong>
                <div>${order.address}</div>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

  });
})();
