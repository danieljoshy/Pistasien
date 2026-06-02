(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("men-products-grid");
    const filter = document.getElementById("men-filter");
    const sort = document.getElementById("men-sort");
    if (!grid || !filter || !sort) return;

    // Helper: Bind events and animations to cards
    const initCards = () => {
      // Bind cart buttons for mens catalog cards
      document.querySelectorAll("#men-products-grid .prod-card .prod-btn-cart").forEach((btn) => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = "true";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const card = btn.closest(".prod-card");
          if (!card) return;

          const id = card.dataset.pid;
          const name = card.querySelector(".prod-name")?.textContent?.trim() || "Product";
          const variant = card.querySelector(".prod-sub")?.textContent?.trim() || "Standard";
          const priceText = card.querySelector(".prod-price")?.textContent || "$0";
          const price = Number(priceText.replace(/[^0-9.]/g, "")) || 0;
          const image = card.querySelector(".prod-img-1")?.getAttribute("src") || "../assets/images/logo.png";

          if (window.CartStore) {
            window.CartStore.add({ id, name, variant, image, qty: 1, price });
            window.CartStore.open();
          }
        });
      });

      // Make sure GSAP hover animations apply to newly added cards
      if (window.gsap) {
        document.querySelectorAll("#men-products-grid .prod-card").forEach((card) => {
          if (card.dataset.gsapBound) return;
          card.dataset.gsapBound = "true";
          const wrap = card.querySelector(".prod-img-wrap");
          const img2 = card.querySelector(".prod-img-2");
          const actions = card.querySelector(".prod-actions");
          if (!wrap || !img2 || !actions) return;

          card.addEventListener("mouseenter", () => {
            gsap.to(img2, { opacity: 1, duration: 0.8 });
            gsap.to(actions, { y: 0, duration: 0.8, ease: "expo.out" });
            gsap.to(wrap, { boxShadow: "0 24px 48px rgba(26,26,20,0.22)", duration: 0.8 });
          });

          card.addEventListener("mouseleave", () => {
            gsap.to(img2, { opacity: 0, duration: 0.4 });
            gsap.to(actions, { y: "100%", duration: 0.35, ease: "power3.in" });
            gsap.to(wrap, { boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.4 });
            gsap.to(wrap, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power3.out" });
          });

          card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rx = ((y / rect.height) - 0.5) * -10;
            const ry = ((x / rect.width) - 0.5) * 10;
            gsap.to(wrap, {
              rotateX: rx, rotateY: ry,
              transformPerspective: 800,
              duration: 0.5, ease: "power2.out",
            });
          });
        });
      }
    };

    // 1. Fetch products dynamically from the backend for the MEN category
    try {
      if (window.apiFetchProducts) {
        const apiBase = 'http://localhost:5000/api';
        const res = await fetch(`${apiBase}/products?category=MEN`);
        if (res.ok) {
          const resData = await res.json();
          const products = resData.data || [];
          if (products.length > 0) {
            grid.innerHTML = products.map((p) => {
              const img1 = p.images[0] || "../assets/images/logo.png";
              const img2 = p.images[1] || img1;
              
              // Map DB name to subcategory for UI filtering
              let subcat = "Shirts";
              const nameLower = p.name.toLowerCase();
              if (nameLower.includes("coat") || nameLower.includes("trench")) subcat = "Coats";
              else if (nameLower.includes("shirt") || nameLower.includes("turtleneck") || nameLower.includes("sweater")) subcat = "Shirts";
              else if (nameLower.includes("trouser")) subcat = "Trousers";
              else if (nameLower.includes("shoes") || nameLower.includes("oxford")) subcat = "Shoes";
              else if (nameLower.includes("chronograph") || nameLower.includes("watch")) subcat = "Accessories";

              return `
                <div class="prod-card" data-pid="${p.id}" data-category="${subcat}" data-price="${p.price}">
                  <div class="prod-img-wrap">
                    <img src="${img1}" alt="${p.name}" class="prod-img prod-img-1" />
                    <img src="${img2}" alt="${p.name} back" class="prod-img prod-img-2" />
                    <div class="prod-actions">
                      <button class="prod-btn-wish" aria-label="Wishlist">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                      </button>
                      <button class="prod-btn-cart">Add to Cart</button>
                    </div>
                  </div>
                  <div class="prod-info">
                    <h4 class="prod-name">${p.name}</h4>
                    <p class="prod-sub">${p.description || subcat}</p>
                    <p class="prod-price">$${p.price}</p>
                  </div>
                </div>
              `;
            }).join("");
            
            // Re-initialize cards immediately after loading from database
            initCards();
          }
        }
      }
    } catch (err) {
      console.error("Failed to dynamically load mens products:", err);
    }

    // Gather cards (both static fallback and newly loaded)
    const cards = Array.from(grid.querySelectorAll(".prod-card"));

    const applyControls = () => {
      const activeCategory = filter.value;
      const sorted = [...cards].sort((a, b) => {
        if (sort.value === "Newest") return 0;
        const priceA = Number(a.dataset.price) || 0;
        const priceB = Number(b.dataset.price) || 0;
        return sort.value === "PriceLowHigh" ? priceA - priceB : priceB - priceA;
      });

      sorted.forEach((card) => {
        const isVisible = activeCategory === "All" || card.dataset.category === activeCategory;
        card.hidden = !isVisible;
        grid.appendChild(card);
      });

      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    };

    filter.addEventListener("change", applyControls);
    sort.addEventListener("change", applyControls);
    applyControls();
    
    // Final check to bind any cards (static or remaining)
    initCards();
  });
})();
