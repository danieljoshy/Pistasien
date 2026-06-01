(() => {
  "use strict";

  const ADMIN_PRODUCTS = [
    {
      id: "prd-1001",
      name: "Double-Breasted Wool Coat",
      category: "Coats",
      price: 890,
      stock: 18,
      status: "Active",
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=180&q=80",
    },
    {
      id: "prd-1002",
      name: "Classic Silk Shirt",
      category: "Shirts",
      price: 240,
      stock: 42,
      status: "Active",
      image: "https://images.unsplash.com/photo-1596392927852-2a42166c40e1?w=180&q=80",
    },
    {
      id: "prd-1003",
      name: "Tailored Linen Trousers",
      category: "Trousers",
      price: 320,
      stock: 7,
      status: "Low Stock",
      image: "https://images.unsplash.com/photo-1624378439575-d10cabcbc768?w=180&q=80",
    },
    {
      id: "prd-1004",
      name: "Cashmere Turtleneck",
      category: "Knitwear",
      price: 450,
      stock: 24,
      status: "Active",
      image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=180&q=80",
    },
    {
      id: "prd-1005",
      name: "Leather Oxford Shoes",
      category: "Shoes",
      price: 510,
      stock: 0,
      status: "Out of Stock",
      image: "https://images.unsplash.com/photo-1614252339475-533eea802cbb?w=180&q=80",
    },
    {
      id: "prd-1006",
      name: "Minimalist Chronograph",
      category: "Accessories",
      price: 280,
      stock: 31,
      status: "Draft",
      image: "https://images.unsplash.com/photo-1524592094714-a57ee11b5ac8?w=180&q=80",
    },
    {
      id: "prd-1007",
      name: "Pleated Midi Dress",
      category: "Dresses",
      price: 295,
      stock: 15,
      status: "Active",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=180&q=80",
    },
    {
      id: "prd-1008",
      name: "Tailored Blazer",
      category: "Blazers",
      price: 420,
      stock: 9,
      status: "Low Stock",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=180&q=80",
    },
    {
      id: "prd-1009",
      name: "Classic Trench",
      category: "Coats",
      price: 580,
      stock: 12,
      status: "Active",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=180&q=80",
    },
    {
      id: "prd-1010",
      name: "Satin Skirt",
      category: "Skirts",
      price: 275,
      stock: 27,
      status: "Draft",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=180&q=80",
    },
    {
      id: "prd-1011",
      name: "Knit Day Dress",
      category: "Dresses",
      price: 310,
      stock: 6,
      status: "Low Stock",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=180&q=80",
    },
    {
      id: "prd-1012",
      name: "Silk Evening Blouse",
      category: "Shirts",
      price: 189,
      stock: 34,
      status: "Active",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=180&q=80",
    },
  ];

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
    return ADMIN_PRODUCTS.filter((product) => {
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
    els.summaryTotal.textContent = ADMIN_PRODUCTS.length;
    els.summaryActive.textContent = ADMIN_PRODUCTS.filter((product) => product.status === "Active").length;
    els.summaryLow.textContent = ADMIN_PRODUCTS.filter((product) => product.status === "Low Stock").length;
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

    document.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;

      const action = actionButton.dataset.action;
      const productId = actionButton.dataset.id;

      if (action === "add") {
        openModal();
        return;
      }

      const product = ADMIN_PRODUCTS.find((item) => item.id === productId);
      if (!product) return;

      if (action === "edit") {
        openModal(product);
      } else if (action === "delete") {
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
          const idx = ADMIN_PRODUCTS.findIndex((item) => item.id === productId);
          if (idx > -1) {
            ADMIN_PRODUCTS.splice(idx, 1);
            showToast("Product deleted successfully.");
            updateSummary();
            render();
          }
        }
      } else if (action === "view") {
        showToast(`Locating details for ${product.name}...`);
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

    els.productForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const idInput = document.getElementById("modal-product-id").value;
      const name = document.getElementById("modal-product-name").value;
      const category = document.getElementById("modal-product-category").value;
      const price = Number(document.getElementById("modal-product-price").value) || 0;
      const stock = Number(document.getElementById("modal-product-stock").value) || 0;
      const status = document.getElementById("modal-product-status").value;

      if (idInput) {
        const product = ADMIN_PRODUCTS.find((p) => p.id === idInput);
        if (product) {
          product.name = name;
          product.category = category;
          product.price = price;
          product.stock = stock;
          product.status = status;
          showToast(`"${name}" updated successfully.`);
        }
      } else {
        const newId = `prd-${1000 + ADMIN_PRODUCTS.length + 1}`;
        ADMIN_PRODUCTS.unshift({
          id: newId,
          name, category, price, stock, status,
          image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=180&q=80"
        });
        showToast(`"${name}" fully listed!`);
      }
      closeModal();
      updateSummary();
      render();
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

  document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    updateSummary();
    bindEvents();
    render();
  });
})();
