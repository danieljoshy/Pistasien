import { PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

const initialProducts = [
  {
    name: "Double-Breasted Wool Coat",
    description: "Premium double-breasted coat crafted from 100% fine wool. Ideal for elegant layering.",
    price: 890,
    images: ["https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80"],
    category: Category.MEN,
    stock: 18,
    isActive: true,
  },
  {
    name: "Classic Silk Shirt",
    description: "Luxurious pure silk shirt with a relaxed yet tailored drape.",
    price: 240,
    images: ["https://images.unsplash.com/photo-1596392927852-2a42166c40e1?w=800&q=80"],
    category: Category.MEN,
    stock: 42,
    isActive: true,
  },
  {
    name: "Tailored Linen Trousers",
    description: "Breathable fine linen trousers tailored to perfection for warm weather sophistication.",
    price: 320,
    images: ["https://images.unsplash.com/photo-1624378439575-d10cabcbc768?w=800&q=80"],
    category: Category.MEN,
    stock: 7,
    isActive: true,
  },
  {
    name: "Cashmere Turtleneck",
    description: "Ultra-soft premium cashmere turtleneck sweater, a timeless winter essential.",
    price: 450,
    images: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80"],
    category: Category.MEN,
    stock: 24,
    isActive: true,
  },
  {
    name: "Leather Oxford Shoes",
    description: "Handcrafted full-grain leather Oxford shoes with a polished finish.",
    price: 510,
    images: ["https://images.unsplash.com/photo-1614252339475-533eea802cbb?w=800&q=80"],
    category: Category.MEN,
    stock: 5,
    isActive: true,
  },
  {
    name: "Minimalist Chronograph",
    description: "Sleek, minimalist wrist watch featuring a brushed steel bezel and black leather strap.",
    price: 280,
    images: ["https://images.unsplash.com/photo-1524592094714-a57ee11b5ac8?w=800&q=80"],
    category: Category.ACCESSORIES,
    stock: 31,
    isActive: true,
  },
  {
    name: "Pleated Midi Dress",
    description: "Flowing midi dress with delicate pleating and a flattering cinched waist.",
    price: 295,
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"],
    category: Category.COLLECTIONS,
    stock: 15,
    isActive: true,
  },
  {
    name: "Tailored Blazer",
    description: "Classic structured blazer with clean lines, perfect for both formal and casual settings.",
    price: 420,
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"],
    category: Category.MEN,
    stock: 9,
    isActive: true,
  },
  {
    name: "Classic Trench Coat",
    description: "Water-resistant double-breasted trench coat with an adjustable belt.",
    price: 580,
    images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80"],
    category: Category.MEN,
    stock: 12,
    isActive: true,
  },
  {
    name: "Satin A-Line Skirt",
    description: "Flowy satin A-line skirt with a subtle sheen, versatile for any wardrobe.",
    price: 275,
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"],
    category: Category.COLLECTIONS,
    stock: 27,
    isActive: true,
  },
  {
    name: "Knit Day Dress",
    description: "Comfortable fine-knit dress designed for everyday elegance.",
    price: 310,
    images: ["https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"],
    category: Category.COLLECTIONS,
    stock: 6,
    isActive: true,
  },
  {
    name: "Silk Evening Blouse",
    description: "Elegant silk blouse with premium draping details and delicate cuffs.",
    price: 189,
    images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80"],
    category: Category.ACCESSORIES,
    stock: 34,
    isActive: true,
  }
];

async function main() {
  console.log("🌱 Starting database seeding...");
  
  // Clean up database products first to avoid duplicates
  await prisma.product.deleteMany({});
  console.log("🗑️ Cleaned up existing products.");

  for (const prod of initialProducts) {
    const createdProduct = await prisma.product.create({
      data: prod,
    });
    console.log(`📦 Seeded product: ${createdProduct.name} (${createdProduct.category})`);
  }

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
