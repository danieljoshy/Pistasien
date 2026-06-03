(() => {
  "use strict";

  let adminProductsList = [];

  const state = {
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

  const bindEvents = () => {
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
      if (targetProduct) {
        els.modalTitle.textContent = "Edit Product";
        document.getElementById("modal-product-id").value = targetProduct.id;
        document.getElementById("modal-product-name").value = targetProduct.name;
        document.getElementById("modal-product-category").value = targetProduct.category;
        document.getElementById("modal-product-price").value = targetProduct.price;
        document.getElementById("modal-product-stock").value = targetProduct.stock;
        document.getElementById("modal-product-status").value = targetProduct.status;
      } else {
        els.modalTitle.textContent = "Add Product";
        document.getElementById("modal-product-id").value = "";
      }
      els.modal.showModal();
    };

    const closeModal = () => els.modal.close();
    els.closeModalBtn.addEventListener("click", closeModal);
    els.cancelModalBtn.addEventListener("click", closeModal);

    els.productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const idInput = document.getElementById("modal-product-id").value;
      const name = document.getElementById("modal-product-name").value;
      const category = document.getElementById("modal-product-category").value;
      const price = Number(document.getElementById("modal-product-price").value) || 0;
      const stock = Number(document.getElementById("modal-product-stock").value) || 0;
      const status = document.getElementById("modal-product-status").value;

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
        images: ["https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80"],
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
              image: p.images[0] || "https://images.unsplash.com/photo-1544441893-675973e31985?w=180&q=80"
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
          await fetchInventory();
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
