"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type MensProduct = {
  pid: string;
  name: string;
  sub: string;
  category: string;
  price: string;
  img1: string;
  img2: string;
};

const MENS_PRODUCTS: MensProduct[] = [
  {
    pid: "m1",
    name: "Double-Breasted Wool Coat",
    sub: "Midnight Blue",
    category: "Coats",
    price: "$890",
    img1: "https://images.unsplash.com/photo-1544441893-675973e31985?w=700&q=80",
    img2: "https://images.unsplash.com/photo-1592878904946-b3cd8ae2438cb?w=700&q=80",
  },
  {
    pid: "m2",
    name: "Classic Silk Shirt",
    sub: "Noir",
    category: "Shirts",
    price: "$240",
    img1: "https://images.unsplash.com/photo-1596392927852-2a42166c40e1?w=700&q=80",
    img2: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&q=80",
  },
  {
    pid: "m3",
    name: "Tailored Linen Trousers",
    sub: "Sand",
    category: "Trousers",
    price: "$320",
    img1: "https://images.unsplash.com/photo-1624378439575-d10cabcbc768?w=700&q=80",
    img2: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&q=80",
  },
  {
    pid: "m4",
    name: "Cashmere Turtleneck",
    sub: "Charcoal",
    category: "Shirts",
    price: "$450",
    img1: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=700&q=80",
    img2: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=700&q=80",
  },
  {
    pid: "m5",
    name: "Leather Oxford Shoes",
    sub: "Cognac",
    category: "Shoes",
    price: "$510",
    img1: "https://images.unsplash.com/photo-1614252339475-533eea802cbb?w=700&q=80",
    img2: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&q=80",
  },
  {
    pid: "m6",
    name: "Minimalist Chronograph",
    sub: "Silver / Black",
    category: "Accessories",
    price: "$280",
    img1: "https://images.unsplash.com/photo-1524592094714-a57ee11b5ac8?w=700&q=80",
    img2: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=700&q=80",
  },
];

const priceNumber = (price: string) => Number(price.replace(/[^0-9.]/g, "")) || 0;

export default function MensSection() {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");

  const products = useMemo(() => {
    return MENS_PRODUCTS
      .filter((product) => filter === "All" || product.category === filter)
      .sort((a, b) => {
        if (sort === "Newest") return 0;
        return sort === "PriceLowHigh"
          ? priceNumber(a.price) - priceNumber(b.price)
          : priceNumber(b.price) - priceNumber(a.price);
      });
  }, [filter, sort]);

  return (
    <>
      <section className="men-hero" id="mens-collection">
        <div className="men-hero-media">
          <Image
            src="https://images.unsplash.com/photo-1544441893-675973e31985?w=1800&q=80"
            alt="Men's Collection"
            fill
            className="men-hero-img"
            priority
          />
          <div className="men-hero-overlay" />
        </div>
        <div className="men-hero-content">
          <p className="men-hero-sub">The New Standard</p>
          <h1 className="men-hero-title">Men&apos;s Collection</h1>
          <a href="#mens-products" className="btn-primary">
            Shop the Edit <span data-antigravity>&rarr;</span>
          </a>
        </div>
      </section>

      <section className="section-pad" id="mens-products">
        <div className="container">
          <div className="section-header reveal-section">
            <p className="section-eyebrow">Tailored Essentials</p>
            <h2 className="section-title">Men&apos;s New Arrivals</h2>
          </div>

          <div className="men-toolbar reveal-section">
            <label className="men-select-label">
              <span>Category</span>
              <select className="men-select" value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="All">All Categories</option>
                <option value="Coats">Coats</option>
                <option value="Shirts">Shirts</option>
                <option value="Trousers">Trousers</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
              </select>
            </label>
            <label className="men-select-label">
              <span>Sort By</span>
              <select className="men-select" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="Newest">Newest</option>
                <option value="PriceLowHigh">Price: Low to High</option>
                <option value="PriceHighLow">Price: High to Low</option>
              </select>
            </label>
          </div>

          <div className="products-grid men-products-grid">
            {products.map((product) => (
              <article className="prod-card reveal-section" data-pid={product.pid} key={product.pid}>
                <div className="prod-img-wrap">
                  <Image src={product.img1} alt={product.name} width={700} height={1050} className="prod-img prod-img-1" />
                  <Image src={product.img2} alt={`${product.name} back`} width={700} height={1050} className="prod-img prod-img-2" />
                  <div className="prod-actions">
                    <button className="prod-btn-wish" aria-label="Wishlist">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </button>
                    <button className="prod-btn-cart">Add to Cart</button>
                  </div>
                </div>
                <div className="prod-info">
                  <h4 className="prod-name">{product.name}</h4>
                  <p className="prod-sub">{product.sub}</p>
                  <p className="prod-price">{product.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
