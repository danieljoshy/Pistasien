(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("men-products-grid");
    const filter = document.getElementById("men-filter");
    const sort = document.getElementById("men-sort");
    if (!grid || !filter || !sort) return;

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
  });
})();
