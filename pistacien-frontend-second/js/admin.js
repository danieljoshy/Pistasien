(() => {
  "use strict";

  let adminProductsList = [];
  let adminOrdersList = [];

  const state = {
    search: "",
    status: "All",
    page: 1,
    perPage: 6,
    currentView: "dashboard",
  };

  const orderState = {
    search: "",
    status: "All",
    page: 1,
    perPage: 6,
  };

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const els = {};
  let toastTimer = null;

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);

  const statusClass = (status) => `status-${status.toLowerCase().replace(/\s+/g, "-")}`;

  const getFilteredProducts = () => {
    const query = state.search.trim().toLowerCase();
    return adminProductsList.filter((product) => {
      const matchesSearch = !query
        || product.name.toLowerCase().includes(query)
        || product.category.toLowerCase().includes(query);
      const matchesStatus = state.status === "All" || product.status === state.status;
      return matchesSearch && matchesStatus;
    });
  };

  const showToast = (message) => {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2200);
  };

  const updateSummary = () => {
    els.summaryTotal.textContent = adminProductsList.length;
    els.summaryActive.textContent = adminProductsList.filter((product) => product.status === "Active").length;
    els.summaryLow.textContent = adminProductsList.filter((product) => product.status === "Low Stock").length;
  };

  const renderRows = (products) => {
    els.body.innerHTML = products.map((product) => (
      `<tr>
        <td>
          <div class="product-cell">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
            <div>
              <strong>${escapeHtml(product.name)}</strong>
              <span>${escapeHtml(product.id)}</span>
            </div>
          </div>
        </td>
        <td>${escapeHtml(product.category)}</td>
        <td>${money.format(product.price)}</td>
        <td>${product.stock}</td>
        <td><span class="status-badge ${statusClass(product.status)}">${escapeHtml(product.status)}</span></td>
        <td>
          <div class="actions-cell">
            <button type="button" class="action-button" data-action="view" data-id="${escapeHtml(product.id)}">View</button>
            <button type="button" class="action-button" data-action="edit" data-id="${escapeHtml(product.id)}">Edit</button>
            <button type="button" class="action-button is-danger" data-action="delete" data-id="${escapeHtml(product.id)}">Delete</button>
          </div>
        </td>
      </tr>`
    )).join("");
  };

  const render = () => {
    const filtered = getFilteredProducts();
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));

    if (state.page > totalPages) state.page = totalPages;

    const start = (state.page - 1) * state.perPage;
    const pageProducts = filtered.slice(start, start + state.perPage);

    renderRows(pageProducts);

    const visibleStart = filtered.length ? start + 1 : 0;
    const visibleEnd = Math.min(start + state.perPage, filtered.length);
    els.resultSummary.textContent = `${filtered.length} product${filtered.length === 1 ? "" : "s"} found`;
    els.paginationSummary.textContent = `Showing ${visibleStart}-${visibleEnd} of ${filtered.length} products`;
    els.pageIndicator.textContent = `Page ${state.page} of ${totalPages}`;
    els.prevPage.disabled = state.page <= 1;
    els.nextPage.disabled = state.page >= totalPages;
    els.emptyState.hidden = filtered.length !== 0;
  };

  const setSidebarOpen = (isOpen) => {
    els.sidebar.classList.toggle("is-open", isOpen);
    els.backdrop.hidden = !isOpen;
    els.sidebarToggle.setAttribute("aria-expanded", String(isOpen));
  };

  const fetchInventory = async () => {
    try {
      if (window.apiFetchProducts) {
        const res = await window.apiFetchProducts();
        const rawProducts = res.data || res;
        
        // Map raw DB products categories to UI subcategories
        adminProductsList = rawProducts.map((p) => {
          let subcat = "Shirts";
          const nameLower = p.name.toLowerCase();
          if (nameLower.includes("coat") || nameLower.includes("trench")) subcat = "Coats";
          else if (nameLower.includes("shirt") || nameLower.includes("turtleneck") || nameLower.includes("sweater")) subcat = "Shirts";
          else if (nameLower.includes("trouser")) subcat = "Trousers";
          else if (nameLower.includes("shoes") || nameLower.includes("oxford")) subcat = "Shoes";
          else if (nameLower.includes("chronograph") || nameLower.includes("watch")) subcat = "Accessories";
          else if (nameLower.includes("dress")) subcat = "Dresses";
          else if (nameLower.includes("blazer")) subcat = "Blazers";
          else if (nameLower.includes("skirt")) subcat = "Skirts";
          else if (nameLower.includes("turtleneck")) subcat = "Knitwear";

          let status = "Active";
          if (!p.isActive) status = "Draft";
          else if (p.stock === 0) status = "Out of Stock";
          else if (p.stock < 10) status = "Low Stock";

          return {
            id: p.id,
            name: p.name,
            category: subcat,
            price: p.price,
            stock: p.stock,
            status: status,
            image: p.images[0] || "https://images.unsplash.com/photo-1544441893-675973e31985?w=180&q=80"
          };
        });

        updateSummary();
        render();
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
      showToast("Failed to retrieve inventory.");
    }
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-draft';
      case 'CONFIRMED': return 'status-active';
      case 'SHIPPED': return 'status-low-stock';
      case 'DELIVERED': return 'status-active';
      case 'CANCELLED': return 'status-out-of-stock';
      default: return 'status-draft';
    }
  };

  const getFilteredOrders = () => {
    const query = orderState.search.trim().toLowerCase();
    return adminOrdersList.filter((order) => {
      const matchesSearch = !query
        || order.id.toLowerCase().includes(query)
        || (order.user.name && order.user.name.toLowerCase().includes(query))
        || order.user.email.toLowerCase().includes(query);
      const matchesStatus = orderState.status === "All" || order.status === orderState.status;
      return matchesSearch && matchesStatus;
    });
  };

  const renderOrdersTable = () => {
    const filtered = getFilteredOrders();
    const totalPages = Math.max(1, Math.ceil(filtered.length / orderState.perPage));

    if (orderState.page > totalPages) orderState.page = totalPages;

    const start = (orderState.page - 1) * orderState.perPage;
    const pageOrders = filtered.slice(start, start + orderState.perPage);

    els.ordersBody.innerHTML = pageOrders.map((order) => {
      const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const customerName = order.user.name || "Guest User";
      
      return `<tr>
        <td><strong>#${escapeHtml(order.id.substring(0, 8))}...</strong></td>
        <td>
          <div>
            <strong>${escapeHtml(customerName)}</strong>
            <span style="display: block; font-size: 0.78rem; color: var(--admin-muted);">${escapeHtml(order.user.email)}</span>
          </div>
        </td>
        <td>${escapeHtml(formattedDate)}</td>
        <td>${money.format(order.total)}</td>
        <td><span class="status-badge ${statusBadgeClass(order.status)}">${escapeHtml(order.status)}</span></td>
        <td>
          <button type="button" class="action-button" data-action="view-order" data-id="${escapeHtml(order.id)}">
            View Details
          </button>
        </td>
      </tr>`;
    }).join("");

    const visibleStart = filtered.length ? start + 1 : 0;
    const visibleEnd = Math.min(start + orderState.perPage, filtered.length);
    els.ordersResultSummary.textContent = `${filtered.length} order${filtered.length === 1 ? "" : "s"} found`;
    els.ordersPaginationSummary.textContent = `Showing ${visibleStart}-${visibleEnd} of ${filtered.length} orders`;
    els.ordersPageIndicator.textContent = `Page ${orderState.page} of ${totalPages}`;
    els.ordersPrevPage.disabled = orderState.page <= 1;
    els.ordersNextPage.disabled = orderState.page >= totalPages;
    els.ordersEmptyState.hidden = filtered.length !== 0;
  };

  const fetchOrders = async () => {
    try {
      if (window.apiAdminGetOrders) {
        const res = await window.apiAdminGetOrders();
        adminOrdersList = res.data || [];
        renderOrdersTable();
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      showToast("Failed to retrieve orders.");
    }
  };

  const fetchAnalytics = async () => {
    try {
      if (window.apiGetAnalytics) {
        const res = await window.apiGetAnalytics();
        const data = res.data;
        if (!data) return;

        // Render KPI metrics
        els.analyticsRevenue.textContent = money.format(data.totalRevenue);
        els.analyticsOrders.textContent = data.totalOrders;
        els.analyticsUsers.textContent = data.totalUsers;
        els.analyticsProducts.textContent = data.totalProducts;

        // Render low stock alerts list
        if (data.lowStockAlerts && data.lowStockAlerts.length > 0) {
          els.analyticsLowStockBody.innerHTML = data.lowStockAlerts.map((product) => {
            return `<tr>
              <td style="padding: 8px 10px;"><strong>${escapeHtml(product.name)}</strong></td>
              <td style="padding: 8px 10px; text-align: center;"><span class="status-badge status-out-of-stock">${product.stock}</span></td>
              <td style="padding: 8px 10px; text-align: right;">${money.format(product.price)}</td>
            </tr>`;
          }).join("");
          els.analyticsLowStockBody.style.display = "table-row-group";
          els.analyticsLowStockEmpty.style.display = "none";
        } else {
          els.analyticsLowStockBody.innerHTML = "";
          els.analyticsLowStockEmpty.style.display = "block";
        }

        // Render recent orders (recent sales preview)
        if (data.recentOrders && data.recentOrders.length > 0) {
          els.analyticsRecentOrdersBody.innerHTML = data.recentOrders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
              month: 'short', day: 'numeric'
            });
            const custName = order.user.name || "Guest";
            return `<tr>
              <td style="padding: 8px 10px;"><strong>#${escapeHtml(order.id.substring(0, 6))}</strong> <span style="font-size: 0.76rem; color: var(--admin-muted);">${escapeHtml(formattedDate)}</span></td>
              <td style="padding: 8px 10px;">${escapeHtml(custName)}</td>
              <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: var(--admin-accent-dark);">${money.format(order.total)}</td>
            </tr>`;
          }).join("");
          els.analyticsRecentOrdersBody.style.display = "table-row-group";
          els.analyticsRecentOrdersEmpty.style.display = "none";
        } else {
          els.analyticsRecentOrdersBody.innerHTML = "";
          els.analyticsRecentOrdersEmpty.style.display = "block";
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard analytics:", err);
      showToast("Failed to retrieve dashboard analytics.");
    }
  };

  const showView = (viewName) => {
    state.currentView = viewName;
    
    // Toggle active link highlights
    els.navProducts.classList.toggle("is-active", viewName === "products");
    els.navOrders.classList.toggle("is-active", viewName === "orders");
    els.navDashboard.classList.toggle("is-active", viewName === "dashboard");
    if (els.navAnalytics) {
      els.navAnalytics.classList.toggle("is-active", viewName === "dashboard");
    }
    
    // Toggle visible panels
    els.productsPanel.style.display = viewName === "products" ? "block" : "none";
    els.productsSummaryGrid.style.display = viewName === "products" ? "grid" : "none";
    els.ordersPanel.style.display = viewName === "orders" ? "block" : "none";
    els.dashboardPanel.style.display = viewName === "dashboard" ? "block" : "none";
    
    // Adjust topbar kicker/title headers
    const headerTitle = document.querySelector(".admin-topbar h1");
    const headerKicker = document.querySelector(".admin-kicker");
    if (viewName === "products") {
      headerTitle.textContent = "Products";
      headerKicker.textContent = "Inventory";
      fetchInventory();
    } else if (viewName === "orders") {
      headerTitle.textContent = "Orders";
      headerKicker.textContent = "Sales";
      fetchOrders();
    } else if (viewName === "dashboard") {
      headerTitle.textContent = "Dashboard";
      headerKicker.textContent = "Analytics";
      fetchAnalytics();
    }
  };

  const openOrderDetails = async (orderId) => {
    try {
      if (window.apiAdminGetOrderById) {
        const res = await window.apiAdminGetOrderById(orderId);
        const order = res.data;
        if (!order) return;

        document.getElementById("order-modal-id").textContent = `Order ID: ${order.id}`;
        document.getElementById("order-cust-name").textContent = order.user.name || "Guest User";
        document.getElementById("order-cust-email").textContent = order.user.email;
        document.getElementById("order-cust-phone").textContent = order.user.phone || "-";
        
        // Parse shipping address representation
        document.getElementById("order-cust-address").textContent = order.address.replace(/,\s*/g, "\n");

        // Display list of ordered items
        els.orderItemsBody.innerHTML = order.items.map((item) => {
          const productImg = item.product.images[0] || "https://images.unsplash.com/photo-1544441893-675973e31985?w=120&q=80";
          return `<tr>
            <td style="padding: 10px 14px;">
              <div class="product-cell" style="min-width: 0;">
                <img src="${escapeHtml(productImg)}" alt="${escapeHtml(item.product.name)}" style="width: 36px; height: 44px; margin-right: 8px;" />
                <div>
                  <strong style="font-size: 0.88rem;">${escapeHtml(item.product.name)}</strong>
                </div>
              </div>
            </td>
            <td style="padding: 10px 14px; text-align: center;">${escapeHtml(item.size || "-")}</td>
            <td style="padding: 10px 14px; text-align: right;">${money.format(item.price)}</td>
            <td style="padding: 10px 14px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px 14px; text-align: right;">${money.format(item.price * item.quantity)}</td>
          </tr>`;
        }).join("");

        document.getElementById("order-total-price").textContent = money.format(order.total);

        // Bind data state
        els.modalOrderStatus.value = order.status;
        els.modalOrderStatusNote.value = "";
        els.orderStatusForm.dataset.orderId = order.id;

        // Render status history log timelines
        renderStatusTimeline(order.statusHistory || []);

        els.orderModal.showModal();
      }
    } catch (err) {
      console.error("Failed to load order details:", err);
      showToast("Failed to retrieve order details.");
    }
  };

  const renderStatusTimeline = (history) => {
    if (history.length === 0) {
      els.orderStatusTimeline.innerHTML = `<li style="font-size: 0.88rem; color: var(--admin-muted);">No logs recorded.</li>`;
      return;
    }

    els.orderStatusTimeline.innerHTML = history.map((log) => {
      const logDate = new Date(log.createdAt).toLocaleString("en-US", {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      return `<li>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 2px;">
          <span>Status: ${escapeHtml(log.status)}</span>
          <span style="color: var(--admin-muted); font-size: 0.78rem; font-weight: 400;">${escapeHtml(logDate)}</span>
        </div>
        <p style="margin: 0; font-size: 0.82rem; color: var(--admin-muted); line-height: 1.4;">${escapeHtml(log.note || "No comments.")}</p>
      </li>`;
    }).join("");
  };

  const bindEvents = () => {
    // Sidebar view switches
    if (els.navProducts) {
      els.navProducts.addEventListener("click", (e) => { e.preventDefault(); showView("products"); });
    }
    if (els.navOrders) {
      els.navOrders.addEventListener("click", (e) => { e.preventDefault(); showView("orders"); });
    }
    if (els.navDashboard) {
      els.navDashboard.addEventListener("click", (e) => { e.preventDefault(); showView("dashboard"); });
    }
    if (els.navAnalytics) {
      els.navAnalytics.addEventListener("click", (e) => { e.preventDefault(); showView("dashboard"); });
    }

    // Products inputs
    els.search.addEventListener("input", (event) => {
      state.search = event.target.value;
      state.page = 1;
      render();
    });

    els.statusFilter.addEventListener("change", (event) => {
      state.status = event.target.value;
      state.page = 1;
      render();
    });

    els.prevPage.addEventListener("click", () => {
      if (state.page <= 1) return;
      state.page -= 1;
      render();
    });

    els.nextPage.addEventListener("click", () => {
      state.page += 1;
      render();
    });

    // Orders input listeners
    if (els.orderSearch) {
      els.orderSearch.addEventListener("input", (event) => {
        orderState.search = event.target.value;
        orderState.page = 1;
        renderOrdersTable();
      });
    }

    if (els.orderStatusFilter) {
      els.orderStatusFilter.addEventListener("change", (event) => {
        orderState.status = event.target.value;
        orderState.page = 1;
        renderOrdersTable();
      });
    }

    if (els.ordersPrevPage) {
      els.ordersPrevPage.addEventListener("click", () => {
        if (orderState.page <= 1) return;
        orderState.page -= 1;
        renderOrdersTable();
      });
    }

    if (els.ordersNextPage) {
      els.ordersNextPage.addEventListener("click", () => {
        orderState.page += 1;
        renderOrdersTable();
      });
    }

    els.sidebarToggle.addEventListener("click", () => {
      setSidebarOpen(!els.sidebar.classList.contains("is-open"));
    });

    els.backdrop.addEventListener("click", () => setSidebarOpen(false));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    });

    document.addEventListener("click", async (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;

      const action = actionButton.dataset.action;
      const productId = actionButton.dataset.id;

      if (action === "add") {
        openModal();
        return;
      }

      if (action === "view-order") {
        openOrderDetails(productId);
        return;
      }

      const product = adminProductsList.find((item) => item.id === productId);
      if (!product) return;

      if (action === "edit") {
        openModal(product);
      } else if (action === "delete") {
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
          try {
            if (window.apiDeleteProduct) {
              await window.apiDeleteProduct(productId);
              showToast("Product deleted successfully.");
              
              const idx = adminProductsList.findIndex((item) => item.id === productId);
              if (idx > -1) {
                adminProductsList.splice(idx, 1);
                updateSummary();
                render();
              }
            }
          } catch (err) {
            console.error("Failed to delete product:", err);
            window.showToast(err.message || "Failed to delete product.", "error");
          }
        }
      } else if (action === "view") {
        showToast(`Details: ${product.name} | Price: $${product.price} | Stock: ${product.stock}`);
      }
    });

    const openModal = (targetProduct = null) => {
      els.productForm.reset();
      els.imageFile.value = "";
      els.imageUrl.value = "";

      if (targetProduct) {
        els.modalTitle.textContent = "Edit Product";
        document.getElementById("modal-product-id").value = targetProduct.id;
        document.getElementById("modal-product-name").value = targetProduct.name;
        document.getElementById("modal-product-category").value = targetProduct.category;
        document.getElementById("modal-product-price").value = targetProduct.price;
        document.getElementById("modal-product-stock").value = targetProduct.stock;
        document.getElementById("modal-product-status").value = targetProduct.status;

        if (targetProduct.image) {
          els.imageUrl.value = targetProduct.image;
          els.imagePreviewThumb.src = targetProduct.image;
          els.imagePreviewStatus.textContent = "Current product image";
          els.imagePreviewWrapper.style.display = "block";
          els.imagePreviewProgress.style.display = "none";
        } else {
          els.imagePreviewWrapper.style.display = "none";
        }
      } else {
        els.modalTitle.textContent = "Add Product";
        document.getElementById("modal-product-id").value = "";
        els.imagePreviewWrapper.style.display = "none";
      }
      els.modal.showModal();
    };

    const closeModal = () => els.modal.close();
    els.closeModalBtn.addEventListener("click", closeModal);
    els.cancelModalBtn.addEventListener("click", closeModal);

    const closeOrderModal = () => els.orderModal.close();
    document.getElementById("close-order-modal-btn").addEventListener("click", closeOrderModal);
    document.getElementById("cancel-order-modal-btn").addEventListener("click", closeOrderModal);

    els.orderStatusForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const orderId = els.orderStatusForm.dataset.orderId;
      const status = els.modalOrderStatus.value;
      const note = els.modalOrderStatusNote.value.trim();

      try {
        if (window.apiAdminUpdateOrderStatus) {
          await window.apiAdminUpdateOrderStatus(orderId, status, note);
          showToast(`Order status updated to ${status}.`);
          closeOrderModal();
          await fetchOrders();
        }
      } catch (err) {
        console.error("Failed to update status:", err);
        showToast(err.message || "Failed to update status.");
      }
    });

    // Track manual custom image URL changes
    els.imageUrl.addEventListener("input", (e) => {
      const url = e.target.value.trim();
      if (url) {
        els.imagePreviewWrapper.style.display = "block";
        els.imagePreviewThumb.src = url;
        els.imagePreviewStatus.textContent = "Custom image URL preview";
        els.imagePreviewProgress.style.display = "none";
      } else {
        els.imagePreviewWrapper.style.display = "none";
      }
    });

    // Handle file selection and direct uploading to Cloudinary
    els.imageFile.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showToast("Please choose a valid image file.");
        els.imageFile.value = "";
        return;
      }

      // Display uploading progress states
      els.imagePreviewWrapper.style.display = "block";
      els.imagePreviewProgress.style.display = "block";
      els.imagePreviewBar.style.width = "15%";
      els.imagePreviewStatus.textContent = "Uploading to Cloudinary...";

      // Local progress loader simulation (up to 85%)
      let uploadPct = 15;
      const progressTimer = setInterval(() => {
        if (uploadPct < 85) {
          uploadPct += 10;
          els.imagePreviewBar.style.width = `${uploadPct}%`;
        }
      }, 150);

      try {
        if (window.apiUploadImage) {
          const res = await window.apiUploadImage(file);
          clearInterval(progressTimer);

          els.imagePreviewBar.style.width = "100%";
          els.imageUrl.value = res.url;
          els.imagePreviewThumb.src = res.url;
          els.imagePreviewStatus.textContent = "Upload complete!";

          setTimeout(() => {
            els.imagePreviewProgress.style.display = "none";
          }, 800);

          showToast("Image uploaded successfully.");
        } else {
          throw new Error("apiUploadImage wrapper is missing.");
        }
      } catch (err) {
        clearInterval(progressTimer);
        els.imagePreviewProgress.style.display = "none";
        els.imagePreviewStatus.textContent = "Upload failed.";
        els.imageFile.value = "";
        console.error("Image upload failed:", err);
        showToast(err.message || "Upload failed. Please try again.");
      }
    });

    els.productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const idInput = document.getElementById("modal-product-id").value;
      const name = document.getElementById("modal-product-name").value;
      const category = document.getElementById("modal-product-category").value;
      const price = Number(document.getElementById("modal-product-price").value) || 0;
      const stock = Number(document.getElementById("modal-product-stock").value) || 0;
      const status = document.getElementById("modal-product-status").value;
      const imageUrl = els.imageUrl.value.trim() || "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80";

      // Map subcategory to main Category enum
      let dbCategory = "MEN";
      if (category === "Accessories") {
        dbCategory = "ACCESSORIES";
      }

      const productPayload = {
        name,
        description: `Premium ${category.toLowerCase()} selection.`,
        price,
        stock,
        category: dbCategory,
        images: [imageUrl],
        isActive: status !== "Draft"
      };

      try {
        if (idInput) {
          if (window.apiUpdateProduct) {
            const res = await window.apiUpdateProduct(idInput, productPayload);
            const p = res.data;

            const product = adminProductsList.find((item) => item.id === idInput);
            if (product) {
              product.name = p.name;
              product.category = category; // keep subcategory
              product.price = p.price;
              product.stock = p.stock;
              product.status = status;
              product.image = p.images[0] || imageUrl;
              showToast(`"${name}" updated successfully.`);
            }
          }
        } else {
          if (window.apiCreateProduct) {
            const res = await window.apiCreateProduct(productPayload);
            const p = res.data;

            adminProductsList.unshift({
              id: p.id,
              name: p.name,
              category: category,
              price: p.price,
              stock: p.stock,
              status: status,
              image: p.images[0] || imageUrl
            });
            showToast(`"${name}" fully listed!`);
          }
        }
        closeModal();
        updateSummary();
        render();
      } catch (err) {
        console.error("Failed to save product:", err);
        window.showToast(err.message || "Failed to save product.", "error");
      }
    });
  };

  const cacheElements = () => {
    els.body = document.getElementById("products-body");
    els.search = document.getElementById("product-search");
    els.statusFilter = document.getElementById("status-filter");
    els.resultSummary = document.getElementById("result-summary");
    els.paginationSummary = document.getElementById("pagination-summary");
    els.pageIndicator = document.getElementById("page-indicator");
    els.prevPage = document.getElementById("prev-page");
    els.nextPage = document.getElementById("next-page");
    els.emptyState = document.getElementById("empty-state");
    els.summaryTotal = document.getElementById("summary-total");
    els.summaryActive = document.getElementById("summary-active");
    els.summaryLow = document.getElementById("summary-low");
    els.toast = document.getElementById("admin-toast");
    els.sidebar = document.getElementById("admin-sidebar");
    els.sidebarToggle = document.getElementById("sidebar-toggle");
    els.backdrop = document.getElementById("admin-backdrop");
    els.modal = document.getElementById("product-modal");
    els.productForm = document.getElementById("product-form");
    els.modalTitle = document.getElementById("modal-title");
    els.closeModalBtn = document.getElementById("close-modal-btn");
    els.cancelModalBtn = document.getElementById("cancel-modal-btn");

    // File upload elements
    els.imageFile = document.getElementById("modal-product-image-file");
    els.imageUrl = document.getElementById("modal-product-image-url");
    els.imagePreviewWrapper = document.getElementById("modal-image-preview-wrapper");
    els.imagePreviewThumb = document.getElementById("image-preview-thumb");
    els.imagePreviewStatus = document.getElementById("image-preview-status");
    els.imagePreviewProgress = document.getElementById("image-preview-progress");
    els.imagePreviewBar = document.getElementById("image-preview-bar");

    // Order views and panel elements
    els.navProducts = document.getElementById("nav-products");
    els.navOrders = document.getElementById("nav-orders");
    els.navDashboard = document.getElementById("nav-dashboard");
    els.productsPanel = document.getElementById("products-panel");
    els.ordersPanel = document.getElementById("orders-panel");
    
    // Order table and inputs
    els.ordersBody = document.getElementById("orders-body");
    els.orderSearch = document.getElementById("order-search");
    els.orderStatusFilter = document.getElementById("order-status-filter");
    els.ordersPaginationSummary = document.getElementById("orders-pagination-summary");
    els.ordersPageIndicator = document.getElementById("orders-page-indicator");
    els.ordersPrevPage = document.getElementById("orders-prev-page");
    els.ordersNextPage = document.getElementById("orders-next-page");
    els.ordersEmptyState = document.getElementById("orders-empty-state");
    els.ordersResultSummary = document.getElementById("orders-result-summary");
    
    // Order detail modal and logs
    els.orderModal = document.getElementById("order-modal");
    els.orderItemsBody = document.getElementById("order-items-body");
    els.orderStatusTimeline = document.getElementById("order-status-timeline");
    els.orderStatusForm = document.getElementById("order-status-form");
    els.modalOrderStatus = document.getElementById("modal-order-status");
    els.modalOrderStatusNote = document.getElementById("modal-order-status-note");

    // Analytics elements
    els.navAnalytics = document.getElementById("nav-analytics");
    els.dashboardPanel = document.getElementById("dashboard-panel");
    els.analyticsRevenue = document.getElementById("analytics-revenue");
    els.analyticsOrders = document.getElementById("analytics-orders");
    els.analyticsUsers = document.getElementById("analytics-users");
    els.analyticsProducts = document.getElementById("analytics-products");
    els.analyticsLowStockBody = document.getElementById("analytics-low-stock-body");
    els.analyticsLowStockEmpty = document.getElementById("analytics-low-stock-empty");
    els.analyticsRecentOrdersBody = document.getElementById("analytics-recent-orders-body");
    els.analyticsRecentOrdersEmpty = document.getElementById("analytics-recent-orders-empty");
    els.productsSummaryGrid = document.getElementById("products-summary-grid");
  };

  document.addEventListener("DOMContentLoaded", async () => {
    cacheElements();
    
    // Security check: Verify user authentication and ADMIN role
    try {
      if (window.apiGetProfile) {
        const res = await window.apiGetProfile();
        if (res && res.success && res.data && res.data.role === 'ADMIN') {
          // Authorized Admin
          document.querySelector(".admin-profile__avatar").textContent = res.data.name ? res.data.name.substring(0, 2).toUpperCase() : "AD";
          document.querySelector(".admin-profile p").textContent = res.data.name || "Admin";
          
          bindEvents();
          showView("dashboard");
        } else {
          window.showToastNextPage("Access Denied: Admin privileges required.", "error");
          window.location.href = "/pages/index.html";
        }
      } else {
        window.showToastNextPage("Authentication API wrapper missing.", "error");
        window.location.href = "/pages/index.html";
      }
    } catch (err) {
      console.error("Access check failed:", err);
      window.showToastNextPage("Access Denied: Please sign in as an Administrator.", "error");
      window.location.href = "/pages/auth.html";
    }
  });
})();
