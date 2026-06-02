(() => {
  "use strict";

  const keys = {
    cart: "pistasien_cart_v1",
    orders: "pistasien_orders_v1",
    profile: "pistasien_profile_v1",
  };

  const catalog = [
    {
      id: "p1",
      name: "Cashmere Sweater",
      variant: "Espresso / Ivory",
      category: "Women",
      price: 340,
      accent: "Soft brushed cashmere with a relaxed atelier drape.",
      description: "A refined layer for cool evenings, knitted in a plush cashmere blend with ribbed trims and a softly structured shoulder.",
      images: [
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1000&q=80",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1000&q=80",
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&q=80",
      ],
      sizes: ["XS", "S", "M", "L"],
    },
    {
      id: "p2",
      name: "Pleated Midi Dress",
      variant: "Sage / Stone",
      category: "Women",
      price: 295,
      accent: "Fluid pleats with a clean, feminine line.",
      description: "A softly moving midi silhouette designed for daytime polish and evening ease, finished with subtle waist definition.",
      images: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&q=80",
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80",
      ],
      sizes: ["XS", "S", "M", "L"],
    },
    {
      id: "p3",
      name: "Tailored Blazer",
      variant: "Charcoal / Camel",
      category: "Women",
      price: 420,
      accent: "Sharp tailoring with a softened shoulder.",
      description: "A modern blazer cut with a long line, subtle waist shaping, and a smooth satin-touch lining.",
      images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80",
        "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1000&q=80",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1000&q=80",
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
    },
    {
      id: "p4",
      name: "Classic Trench",
      variant: "Beige / Black",
      category: "Women",
      price: 580,
      accent: "Weather-ready cotton gabardine with timeless proportion.",
      description: "A seasonless trench with a clean storm flap, belted waist, and polished horn-effect buttons.",
      images: [
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1000&q=80",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1000&q=80",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1000&q=80",
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
    },
    {
      id: "m1",
      name: "Double-Breasted Wool Coat",
      variant: "Midnight Blue",
      category: "Coats",
      price: 890,
      accent: "Dense wool tailoring with a clean winter profile.",
      description: "A double-breasted wool coat with broad lapels, smooth lining, and a long tailored shape.",
      images: [
        "https://images.unsplash.com/photo-1544441893-675973e31985?w=1000&q=80",
        "https://images.unsplash.com/photo-1592878904946-b3cd8ae2438cb?w=1000&q=80",
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1000&q=80",
      ],
      sizes: ["S", "M", "L", "XL"],
    },
    {
      id: "m2",
      name: "Classic Silk Shirt",
      variant: "Noir",
      category: "Shirts",
      price: 240,
      accent: "A fluid shirt with a quiet evening sheen.",
      description: "Cut from a silk-touch weave with a relaxed collar, clean placket, and a soft drape.",
      images: [
        "https://images.unsplash.com/photo-1596392927852-2a42166c40e1?w=1000&q=80",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1000&q=80",
        "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&q=80",
      ],
      sizes: ["S", "M", "L", "XL"],
    },
    {
      id: "m3",
      name: "Tailored Linen Trousers",
      variant: "Sand",
      category: "Trousers",
      price: 320,
      accent: "Crisp linen tailoring with breathable structure.",
      description: "Pleated trousers in a linen blend, finished with a clean waistband and tapered leg.",
      images: [
        "https://images.unsplash.com/photo-1624378439575-d10cabcbc768?w=1000&q=80",
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&q=80",
        "https://images.unsplash.com/photo-1544441893-675973e31985?w=1000&q=80",
      ],
      sizes: ["30", "32", "34", "36"],
    },
    {
      id: "m4",
      name: "Cashmere Turtleneck",
      variant: "Charcoal",
      category: "Shirts",
      price: 450,
      accent: "A warm, minimal knit for precise layering.",
      description: "A fine-gauge cashmere turtleneck with ribbed neck, cuff, and hem details.",
      images: [
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1000&q=80",
        "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&q=80",
        "https://images.unsplash.com/photo-1596392927852-2a42166c40e1?w=1000&q=80",
      ],
      sizes: ["S", "M", "L", "XL"],
    },
    {
      id: "m5",
      name: "Leather Oxford Shoes",
      variant: "Cognac",
      category: "Shoes",
      price: 510,
      accent: "Polished leather oxfords with an elongated toe.",
      description: "Hand-finished leather shoes with tonal stitching, stacked heel, and a classic closed-lace shape.",
      images: [
        "https://images.unsplash.com/photo-1614252339475-533eea802cbb?w=1000&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&q=80",
        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1000&q=80",
      ],
      sizes: ["8", "9", "10", "11", "12"],
    },
    {
      id: "m6",
      name: "Minimalist Chronograph",
      variant: "Silver / Black",
      category: "Accessories",
      price: 280,
      accent: "A precise chronograph with a restrained dial.",
      description: "A stainless steel chronograph with leather strap, clean markers, and water-resistant construction.",
      images: [
        "https://images.unsplash.com/photo-1524592094714-a57ee11b5ac8?w=1000&q=80",
        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1000&q=80",
        "https://images.unsplash.com/photo-1614252339475-533eea802cbb?w=1000&q=80",
      ],
      sizes: ["One Size"],
    },
  ];

  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  const readJson = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (_err) {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const getProduct = (id) => catalog.find((product) => product.id === id) || catalog[0];
  const readCart = () => {
    const items = readJson(keys.cart, []);
    return Array.isArray(items) ? items : [];
  };
  const writeCart = (items) => writeJson(keys.cart, items);
  const readOrders = () => {
    const orders = readJson(keys.orders, []);
    return Array.isArray(orders) ? orders : [];
  };
  const writeOrders = (orders) => writeJson(keys.orders, orders);
  const readProfile = () => readJson(keys.profile, {
    name: "Pistasien Guest",
    email: "guest@pistasien.com",
    phone: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    style: "Tailored essentials",
  });
  const writeProfile = (profile) => writeJson(keys.profile, profile);

  const cartTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
    const shipping = subtotal === 0 || subtotal >= 500 ? 0 : 18;
    const tax = subtotal * 0.08;
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
  };

  const addToCart = (item) => {
    if (window.CartStore) {
      window.CartStore.add(item);
      window.CartStore.open();
      return;
    }

    const items = readCart();
    const existing = items.find((entry) => entry.id === item.id && entry.variant === item.variant);
    if (existing) existing.qty += item.qty || 1;
    else items.push({ ...item, qty: item.qty || 1 });
    writeCart(items);
  };

  const renderOrderSummary = (items, listEl, totalsEl) => {
    const totals = cartTotals(items);

    if (listEl) {
      listEl.innerHTML = items.length
        ? items.map((item) => `
          <li class="sf-summary-item">
            <img src="${item.image}" alt="${item.name}" />
            <div>
              <strong>${item.name}</strong>
              <span>${item.variant || "Standard"} x ${item.qty}</span>
            </div>
            <b>${money.format(item.price * item.qty)}</b>
          </li>
        `).join("")
        : `<li class="sf-empty-line">Your cart is empty.</li>`;
    }

    if (totalsEl) {
      totalsEl.innerHTML = `
        <div><span>Subtotal</span><strong>${money.format(totals.subtotal)}</strong></div>
        <div><span>Shipping</span><strong>${totals.shipping === 0 ? "Complimentary" : money.format(totals.shipping)}</strong></div>
        <div><span>Estimated Tax</span><strong>${money.format(totals.tax)}</strong></div>
        <div class="sf-total-line"><span>Total</span><strong>${money.format(totals.total)}</strong></div>
      `;
    }

    return totals;
  };

  const initProductPage = () => {
    const root = document.querySelector("[data-product-page]");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const product = getProduct(params.get("id") || "p1");
    let selectedImage = product.images[0];
    let selectedSize = product.sizes[0];
    let qty = 1;

    const render = () => {
      document.title = `${product.name} - Pistasien`;
      root.querySelector("[data-product-category]").textContent = product.category;
      root.querySelector("[data-product-name]").textContent = product.name;
      root.querySelector("[data-product-variant]").textContent = product.variant;
      root.querySelector("[data-product-price]").textContent = money.format(product.price);
      root.querySelector("[data-product-accent]").textContent = product.accent;
      root.querySelector("[data-product-description]").textContent = product.description;
      root.querySelector("[data-product-main-image]").src = selectedImage;
      root.querySelector("[data-product-main-image]").alt = product.name;
      root.querySelector("[data-product-qty]").textContent = String(qty);
      root.querySelector("[data-product-thumbs]").innerHTML = product.images.map((image) => `
        <button type="button" class="${image === selectedImage ? "is-active" : ""}" data-product-thumb="${image}">
          <img src="${image}" alt="${product.name}" />
        </button>
      `).join("");
      root.querySelector("[data-product-sizes]").innerHTML = product.sizes.map((size) => `
        <button type="button" class="${size === selectedSize ? "is-active" : ""}" data-product-size="${size}">${size}</button>
      `).join("");
      root.querySelector("[data-product-related]").innerHTML = catalog
        .filter((entry) => entry.id !== product.id)
        .slice(0, 3)
        .map((entry) => `
          <a class="sf-related-item" href="/product?id=${entry.id}">
            <img src="${entry.images[0]}" alt="${entry.name}" />
            <span>${entry.category}</span>
            <strong>${entry.name}</strong>
            <b>${money.format(entry.price)}</b>
          </a>
        `).join("");
    };

    root.addEventListener("click", (event) => {
      const thumb = event.target.closest("[data-product-thumb]");
      const size = event.target.closest("[data-product-size]");
      const qtyAction = event.target.closest("[data-qty-action]");
      const add = event.target.closest("[data-product-add]");
      const tab = event.target.closest("[data-product-tab]");

      if (thumb) {
        selectedImage = thumb.getAttribute("data-product-thumb");
        render();
      }
      if (size) {
        selectedSize = size.getAttribute("data-product-size");
        render();
      }
      if (qtyAction) {
        qty = Math.max(1, qty + Number(qtyAction.getAttribute("data-qty-action")));
        render();
      }
      if (add) {
        const lineId = selectedSize === "One Size" ? product.id : `${product.id}-${selectedSize}`;
        addToCart({
          id: lineId,
          name: product.name,
          variant: selectedSize === "One Size" ? product.variant : `${product.variant} / ${selectedSize}`,
          image: product.images[0],
          qty,
          price: product.price,
        });
      }
      if (tab) {
        root.querySelectorAll("[data-product-tab]").forEach((button) => button.classList.toggle("is-active", button === tab));
        root.querySelectorAll("[data-product-panel]").forEach((panel) => {
          panel.hidden = panel.getAttribute("data-product-panel") !== tab.getAttribute("data-product-tab");
        });
      }
    });

    render();
  };

  const initCheckoutPage = () => {
    const form = document.getElementById("checkout-form");
    if (!form) return;

    const profile = readProfile();
    ["name", "email", "phone", "address", "city", "country", "zipCode"].forEach((field) => {
      const input = form.elements[field];
      if (input && profile[field]) input.value = profile[field];
    });

    const items = readCart();
    const totals = renderOrderSummary(items, document.getElementById("checkout-items"), document.getElementById("checkout-totals"));
    const submit = form.querySelector("[type='submit']");
    if (submit) submit.disabled = items.length === 0;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const customer = Object.fromEntries(formData.entries());
      writeProfile({ ...profile, ...customer });

      const order = {
        id: `PS-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: "CONFIRMED",
        customer,
        address: `${customer.address}, ${customer.city}, ${customer.country} ${customer.zipCode}`,
        items,
        totals,
      };

      writeOrders([order, ...readOrders()]);
      writeCart([]);
      if (window.CartStore) window.CartStore.clear();

      const success = document.getElementById("checkout-success");
      if (success) {
        success.hidden = false;
        success.querySelector("[data-order-id]").textContent = order.id;
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
      renderOrderSummary([], document.getElementById("checkout-items"), document.getElementById("checkout-totals"));
      if (submit) submit.disabled = true;
    });
  };

  const initOrdersPage = () => {
    const list = document.getElementById("orders-list");
    if (!list) return;

    const orders = readOrders();
    list.innerHTML = orders.length ? orders.map((order) => `
      <article class="sf-order-row reveal-section">
        <div class="sf-order-main">
          <span>${new Date(order.createdAt).toLocaleDateString()}</span>
          <h3>${order.id}</h3>
          <p>${order.items.length} item${order.items.length === 1 ? "" : "s"} shipping to ${order.customer.city || "your address"}</p>
        </div>
        <div class="sf-order-status">
          <span>${order.status}</span>
          <strong>${money.format(order.totals.total)}</strong>
        </div>
        <ul class="sf-order-items">
          ${order.items.map((item) => `<li><img src="${item.image}" alt="${item.name}" /><span>${item.name}</span><b>x${item.qty}</b></li>`).join("")}
        </ul>
      </article>
    `).join("") : `
      <div class="sf-empty-state">
        <p class="section-eyebrow">No Orders</p>
        <h2 class="section-title">Your first order will appear here.</h2>
        <a class="btn-primary" href="/mens">Shop the Edit</a>
      </div>
    `;
  };

  const initProfilePage = () => {
    const form = document.getElementById("profile-form");
    if (!form) return;

    const status = document.getElementById("profile-status");
    const profile = readProfile();
    Object.entries(profile).forEach(([key, value]) => {
      const field = form.elements[key];
      if (field) field.value = value;
    });

    const initials = document.querySelector("[data-profile-initials]");
    const name = document.querySelector("[data-profile-name]");
    const email = document.querySelector("[data-profile-email]");
    const hydrateHeader = () => {
      const current = readProfile();
      const parts = String(current.name || "Pistasien Guest").trim().split(/\s+/);
      if (initials) initials.textContent = parts.map((part) => part[0]).join("").slice(0, 2).toUpperCase();
      if (name) name.textContent = current.name || "Pistasien Guest";
      if (email) email.textContent = current.email || "guest@pistasien.com";
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      writeProfile(data);
      hydrateHeader();
      if (status) {
        status.textContent = "Profile saved locally.";
        setTimeout(() => { status.textContent = ""; }, 2200);
      }
    });

    hydrateHeader();
  };

  document.addEventListener("DOMContentLoaded", () => {
    initProductPage();
    initCheckoutPage();
    initOrdersPage();
    initProfilePage();
  });

  window.PistasienStorefront = {
    keys,
    catalog,
    getProduct,
    readCart,
    writeCart,
    readOrders,
    writeOrders,
    readProfile,
    writeProfile,
    cartTotals,
    addToCart,
  };
})();
