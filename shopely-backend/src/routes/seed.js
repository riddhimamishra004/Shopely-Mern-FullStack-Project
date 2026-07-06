import { Router } from "express";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const router = Router();

const SEED_CATEGORIES = [
  {
    name: "Electronics", slug: "electronics", icon: "Cpu",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
    order: 3,
    columns: [
      { title: "Mobiles & Tablets", links: [
        { label: "Smartphones", slug: "smartphones" },
        { label: "Tablets", slug: "tablets" },
        { label: "Mobile Accessories", slug: "mobile-accessories" },
      ]},
      { title: "Computers", links: [
        { label: "Laptops", slug: "laptops" },
        { label: "Monitors", slug: "monitors" },
        { label: "Keyboards & Mice", slug: "keyboards-mice" },
      ]},
      { title: "Audio", links: [
        { label: "Headphones", slug: "headphones" },
        { label: "Bluetooth Speakers", slug: "speakers" },
        { label: "Earbuds", slug: "earbuds" },
      ]},
    ],
  },
  {
    name: "Fashion", slug: "fashion", icon: "Shirt",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
    order: 1,
    columns: [
      { title: "Men's Wear", links: [
        { label: "T-Shirts", slug: "men-tshirts" },
        { label: "Shirts", slug: "men-shirts" },
        { label: "Jeans", slug: "men-jeans" },
        { label: "Jackets", slug: "men-jackets" },
        { label: "Ethnic Wear", slug: "men-ethnic" },
        { label: "Activewear", slug: "men-activewear" },
      ]},
      { title: "Women's Wear", links: [
        { label: "Dresses", slug: "women-dresses" },
        { label: "Tops", slug: "women-tops" },
        { label: "Kurtas & Kurtis", slug: "women-kurtas" },
        { label: "Sarees", slug: "women-sarees" },
        { label: "Jeans & Trousers", slug: "women-jeans" },
        { label: "Ethnic Wear", slug: "women-ethnic" },
      ]},
      { title: "Girls Wear", links: [
        { label: "Dresses", slug: "girls-dresses" },
        { label: "Tops & Tees", slug: "girls-tops" },
        { label: "Ethnic Wear", slug: "girls-ethnic" },
        { label: "Skirts", slug: "girls-skirts" },
      ]},
      { title: "Boys Wear", links: [
        { label: "T-Shirts", slug: "boys-tshirts" },
        { label: "Shirts", slug: "boys-shirts" },
        { label: "Shorts", slug: "boys-shorts" },
        { label: "Ethnic Wear", slug: "boys-ethnic" },
      ]},
      { title: "Footwear", links: [
        { label: "Sneakers", slug: "sneakers" },
        { label: "Sandals", slug: "sandals" },
        { label: "Formal Shoes", slug: "formal-shoes" },
        { label: "Heels", slug: "heels" },
      ]},
      { title: "Accessories", links: [
        { label: "Bags", slug: "bags" },
        { label: "Watches", slug: "watches" },
        { label: "Belts", slug: "belts" },
        { label: "Sunglasses", slug: "sunglasses" },
      ]},
    ],
  },
  {
    name: "Home & Kitchen", slug: "home-kitchen", icon: "Home",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    order: 4,
    columns: [
      { title: "Kitchen", links: [
        { label: "Cookware", slug: "cookware" },
        { label: "Appliances", slug: "kitchen-appliances" },
        { label: "Storage", slug: "kitchen-storage" },
      ]},
      { title: "Home Decor", links: [
        { label: "Wall Art", slug: "wall-art" },
        { label: "Lighting", slug: "lighting" },
        { label: "Cushions & Covers", slug: "cushions" },
      ]},
      { title: "Furniture", links: [
        { label: "Sofas", slug: "sofas" },
        { label: "Beds", slug: "beds" },
        { label: "Storage Units", slug: "storage-units" },
      ]},
    ],
  },
  {
    name: "Sports", slug: "sports", icon: "Dumbbell",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80",
    order: 6,
    columns: [
      { title: "Fitness", links: [
        { label: "Yoga Mats", slug: "yoga-mats" },
        { label: "Dumbbells", slug: "dumbbells" },
        { label: "Resistance Bands", slug: "resistance-bands" },
      ]},
      { title: "Outdoor Sports", links: [
        { label: "Cricket", slug: "cricket-gear" },
        { label: "Football", slug: "football-gear" },
        { label: "Badminton", slug: "badminton-gear" },
      ]},
      { title: "Sportswear", links: [
        { label: "Activewear", slug: "sports-activewear" },
        { label: "Sports Shoes", slug: "sports-shoes" },
      ]},
    ],
  },
  {
    name: "Books", slug: "books", icon: "BookOpen",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
    order: 7,
    columns: [
      { title: "Fiction", links: [
        { label: "Bestsellers", slug: "fiction-bestsellers" },
        { label: "Romance", slug: "romance" },
        { label: "Thriller", slug: "thriller" },
        { label: "Fantasy", slug: "fantasy" },
      ]},
      { title: "Non-Fiction", links: [
        { label: "Biography", slug: "biography" },
        { label: "Self-Help", slug: "self-help" },
        { label: "Business", slug: "business-books" },
      ]},
      { title: "Kids & Young Adult", links: [
        { label: "Picture Books", slug: "picture-books" },
        { label: "Young Adult", slug: "young-adult" },
        { label: "Educational", slug: "educational-books" },
      ]},
    ],
  },
  {
    name: "Beauty", slug: "beauty", icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
    order: 2,
    columns: [
      { title: "Face", links: [
        { label: "Face Primer", slug: "face-primer" },
        { label: "Foundation", slug: "foundation" },
        { label: "Concealer", slug: "concealer" },
        { label: "Compact", slug: "compact" },
        { label: "Blush", slug: "blush" },
        { label: "Highlighter", slug: "highlighter" },
      ]},
      { title: "Eyes", links: [
        { label: "Kajal", slug: "kajal" },
        { label: "Eyeliner", slug: "eyeliner" },
        { label: "Mascara", slug: "mascara" },
        { label: "Eye Shadow", slug: "eye-shadow" },
      ]},
      { title: "Lips", links: [
        { label: "Lipstick", slug: "lipstick" },
        { label: "Lip Gloss", slug: "lip-gloss" },
        { label: "Lip Liner", slug: "lip-liner" },
        { label: "Lip Tint", slug: "lip-tint" },
      ]},
      { title: "Skin Care", links: [
        { label: "Moisturizer", slug: "moisturizer" },
        { label: "Sunscreen", slug: "sunscreen" },
        { label: "Face Wash", slug: "face-wash" },
        { label: "Serum", slug: "serum" },
      ]},
    ],
  },
  {
    name: "Toys & Baby", slug: "toys-baby", icon: "Baby",
    image: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&q=80",
    order: 5,
    columns: [
      { title: "Toys", links: [
        { label: "Soft Toys", slug: "soft-toys" },
        { label: "Educational Toys", slug: "educational-toys" },
        { label: "Action Figures", slug: "action-figures" },
      ]},
      { title: "Baby Care", links: [
        { label: "Diapers", slug: "diapers" },
        { label: "Baby Skin Care", slug: "baby-skin-care" },
        { label: "Feeding", slug: "feeding" },
      ]},
    ],
  },
  {
    name: "Grocery", slug: "grocery", icon: "ShoppingBasket",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    order: 8,
    columns: [
      { title: "Staples", links: [
        { label: "Atta & Flours", slug: "atta-flours" },
        { label: "Rice & Dals", slug: "rice-dals" },
        { label: "Edible Oils", slug: "edible-oils" },
      ]},
      { title: "Beverages", links: [
        { label: "Tea & Coffee", slug: "tea-coffee" },
        { label: "Juices", slug: "juices" },
      ]},
      { title: "Snacks", links: [
        { label: "Namkeen", slug: "namkeen" },
        { label: "Biscuits", slug: "biscuits" },
      ]},
    ],
  },
];

const SEED_PRODUCTS = [
  // ---------- Electronics ----------
  { name: "Wireless Noise-Cancelling Headphones", description: "Premium over-ear headphones with 30hr battery, ANC, and Hi-Res audio.", price: 2999, oldPrice: 4999, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"], category: "Electronics", brand: "SoundMax", stock: 50, rating: 4.5, numReviews: 128, isFeatured: true, isNewArrival: false, isDeal: true, discount: 40 },
  { name: "Mechanical Gaming Keyboard", description: "TKL layout, Cherry MX Red switches, RGB backlight, aluminium body.", price: 3499, oldPrice: 4999, images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"], category: "Electronics", brand: "GameZone", stock: 40, rating: 4.7, numReviews: 112, isFeatured: true, isNewArrival: true, isDeal: false, discount: 30 },
  { name: "27-inch 4K Monitor", description: "IPS panel, 99% sRGB, HDR10, 75Hz refresh rate.", price: 18999, oldPrice: 23999, images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80"], category: "Electronics", brand: "ViewTech", stock: 25, rating: 4.6, numReviews: 64, isFeatured: false, isNewArrival: true, isDeal: false, discount: 20 },
  { name: "True Wireless Earbuds", description: "Active noise cancellation, 24hr playback with case, IPX4 water resistance.", price: 1499, oldPrice: 2499, images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80"], category: "Electronics", brand: "SoundMax", stock: 90, rating: 4.3, numReviews: 201, isFeatured: false, isNewArrival: false, isDeal: true, discount: 40 },
  { name: "Slim Android Tablet 10.4-inch", description: "Octa-core processor, 6GB RAM, 128GB storage, all-day battery.", price: 14999, oldPrice: 18999, images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80"], category: "Electronics", brand: "ViewTech", stock: 30, rating: 4.2, numReviews: 47, isFeatured: false, isNewArrival: true, isDeal: false, discount: 21 },
  { name: "Portable Bluetooth Speaker", description: "360° sound, 12hr battery, waterproof IPX7, built-in mic for calls.", price: 1799, oldPrice: 2799, images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80"], category: "Electronics", brand: "SoundMax", stock: 70, rating: 4.4, numReviews: 156, isFeatured: true, isNewArrival: false, isDeal: false, discount: 36 },

  // ---------- Fashion ----------
  { name: "Men's Slim Fit Chinos", description: "Stretch cotton blend chinos, wrinkle-resistant, available in 6 colours.", price: 899, oldPrice: 1499, images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80"], category: "Fashion", brand: "UrbanFit", stock: 200, rating: 4.2, numReviews: 87, isFeatured: false, isNewArrival: true, isDeal: false, discount: 40 },
  { name: "Men's Cotton Casual Shirt", description: "100% cotton, breathable fabric, regular fit, machine washable.", price: 749, oldPrice: 1199, images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80"], category: "Fashion", brand: "UrbanFit", stock: 150, rating: 4.1, numReviews: 63, isFeatured: false, isNewArrival: false, isDeal: true, discount: 38 },
  { name: "Women's Floral Maxi Dress", description: "Flowy georgette fabric, floral print, perfect for daywear and outings.", price: 1299, oldPrice: 1999, images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80"], category: "Fashion", brand: "Chic Studio", stock: 100, rating: 4.5, numReviews: 142, isFeatured: true, isNewArrival: true, isDeal: false, discount: 35 },
  { name: "Women's Straight Fit Kurta", description: "Pure cotton kurta with embroidered yoke, ideal for casual and festive wear.", price: 899, oldPrice: 1399, images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80"], category: "Fashion", brand: "Chic Studio", stock: 130, rating: 4.4, numReviews: 98, isFeatured: false, isNewArrival: false, isDeal: true, discount: 36 },
  { name: "Girls Printed Cotton Frock", description: "Soft cotton frock with cute prints, comfortable for daily wear.", price: 549, oldPrice: 899, images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80"], category: "Fashion", brand: "TinyTrend", stock: 80, rating: 4.3, numReviews: 41, isFeatured: false, isNewArrival: true, isDeal: false, discount: 39 },
  { name: "Boys Graphic Print T-Shirt", description: "Soft cotton tee with fun graphic prints, breathable and durable.", price: 349, oldPrice: 599, images: ["https://images.unsplash.com/photo-1519457851950-04c1c0e83176?w=600&q=80"], category: "Fashion", brand: "TinyTrend", stock: 90, rating: 4.1, numReviews: 35, isFeatured: false, isNewArrival: false, isDeal: true, discount: 42 },
  { name: "Men's Running Sneakers", description: "Lightweight mesh upper, cushioned sole, breathable and flexible.", price: 1999, oldPrice: 2999, images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80"], category: "Fashion", brand: "StrideOn", stock: 120, rating: 4.6, numReviews: 178, isFeatured: true, isNewArrival: false, isDeal: false, discount: 33 },
  { name: "Women's Block Heels", description: "Comfortable block heel sandals, faux leather upper, cushioned footbed.", price: 1299, oldPrice: 1999, images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80"], category: "Fashion", brand: "StrideOn", stock: 60, rating: 4.2, numReviews: 52, isFeatured: false, isNewArrival: true, isDeal: false, discount: 35 },
  { name: "Unisex Canvas Tote Bag", description: "Durable canvas tote, spacious interior, perfect for daily use.", price: 499, oldPrice: 799, images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80"], category: "Fashion", brand: "CarryCo", stock: 200, rating: 4.0, numReviews: 29, isFeatured: false, isNewArrival: false, isDeal: true, discount: 38 },

  // ---------- Home & Kitchen ----------
  { name: "Non-Stick Cookware Set (5-piece)", description: "Granite-coated aluminium pans, PFOA-free, induction compatible.", price: 1799, oldPrice: 2999, images: ["https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=600&q=80"], category: "Home & Kitchen", brand: "ChefMate", stock: 35, rating: 4.4, numReviews: 56, isFeatured: true, isNewArrival: false, isDeal: true, discount: 40 },
  { name: "Ceramic Dinner Set (16-piece)", description: "Elegant ceramic dinnerware, microwave and dishwasher safe.", price: 2499, oldPrice: 3499, images: ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80"], category: "Home & Kitchen", brand: "ChefMate", stock: 20, rating: 4.5, numReviews: 38, isFeatured: false, isNewArrival: true, isDeal: false, discount: 29 },
  { name: "LED Table Lamp", description: "Warm white light, adjustable brightness, modern wooden base.", price: 899, oldPrice: 1399, images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80"], category: "Home & Kitchen", brand: "HomeGlow", stock: 55, rating: 4.3, numReviews: 44, isFeatured: false, isNewArrival: false, isDeal: true, discount: 36 },
  { name: "Decorative Wall Art Set (3 panels)", description: "Canvas wall art with abstract design, ready to hang.", price: 1299, oldPrice: 1999, images: ["https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80"], category: "Home & Kitchen", brand: "HomeGlow", stock: 40, rating: 4.2, numReviews: 27, isFeatured: false, isNewArrival: true, isDeal: false, discount: 35 },
  { name: "2-Seater Fabric Sofa", description: "Comfortable cushioned sofa, sturdy wooden frame, easy to clean fabric.", price: 12999, oldPrice: 17999, images: ["https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600&q=80"], category: "Home & Kitchen", brand: "NestFurnish", stock: 12, rating: 4.6, numReviews: 19, isFeatured: true, isNewArrival: false, isDeal: false, discount: 28 },

  // ---------- Sports ----------
  { name: "Yoga Mat with Carry Strap", description: "6mm thick TPE mat, anti-slip, eco-friendly, 183×61cm.", price: 799, oldPrice: 1199, images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80"], category: "Sports", brand: "ZenFlex", stock: 80, rating: 4.3, numReviews: 74, isFeatured: false, isNewArrival: true, isDeal: false, discount: 33 },
  { name: "Stainless Steel Water Bottle 1L", description: "Double-wall insulated, keeps drinks cold 24h / hot 12h, BPA-free.", price: 599, oldPrice: 899, images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80"], category: "Sports", brand: "HydroFlow", stock: 150, rating: 4.7, numReviews: 203, isFeatured: true, isNewArrival: false, isDeal: false, discount: 33 },
  { name: "Adjustable Dumbbell Set (2x5kg)", description: "Cast iron dumbbells with rubber coating, adjustable plates.", price: 1599, oldPrice: 2299, images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"], category: "Sports", brand: "IronCore", stock: 45, rating: 4.5, numReviews: 61, isFeatured: false, isNewArrival: false, isDeal: true, discount: 30 },
  { name: "Cricket Kit Bag with Bat", description: "Full-size kashmir willow bat with padded kit bag, ideal for beginners.", price: 2299, oldPrice: 3299, images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80"], category: "Sports", brand: "PlayPro", stock: 30, rating: 4.4, numReviews: 33, isFeatured: true, isNewArrival: true, isDeal: false, discount: 30 },
  { name: "Men's Running Sports Shoes", description: "Breathable knit upper, shock-absorbing sole, ideal for running and gym.", price: 1799, oldPrice: 2599, images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"], category: "Sports", brand: "StrideOn", stock: 95, rating: 4.5, numReviews: 120, isFeatured: false, isNewArrival: false, isDeal: true, discount: 31 },

  // ---------- Books ----------
  { name: "Atomic Habits - James Clear", description: "The life-changing million copy bestseller on building good habits.", price: 399, oldPrice: 599, images: ["https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80"], category: "Books", brand: "Penguin", stock: 300, rating: 4.8, numReviews: 450, isFeatured: false, isNewArrival: false, isDeal: true, discount: 33 },
  { name: "The Silent Patient - Thriller Novel", description: "A gripping psychological thriller with a shocking twist.", price: 349, oldPrice: 499, images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80"], category: "Books", brand: "HarperCollins", stock: 180, rating: 4.6, numReviews: 267, isFeatured: true, isNewArrival: true, isDeal: false, discount: 30 },
  { name: "Rich Dad Poor Dad", description: "A personal finance classic on building wealth and financial literacy.", price: 299, oldPrice: 450, images: ["https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80"], category: "Books", brand: "Plata Publishing", stock: 220, rating: 4.5, numReviews: 389, isFeatured: false, isNewArrival: false, isDeal: true, discount: 34 },
  { name: "The Very Hungry Caterpillar - Picture Book", description: "A timeless picture book classic for toddlers and early readers.", price: 249, oldPrice: 399, images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80"], category: "Books", brand: "Puffin", stock: 150, rating: 4.9, numReviews: 210, isFeatured: false, isNewArrival: true, isDeal: false, discount: 38 },

  // ---------- Beauty ----------
  { name: "Vitamin C Face Serum 30ml", description: "10% ascorbic acid, hyaluronic acid boost, brightening & anti-aging.", price: 449, oldPrice: 699, images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80"], category: "Beauty", brand: "GlowUp", stock: 120, rating: 4.6, numReviews: 311, isFeatured: false, isNewArrival: true, isDeal: false, discount: 36 },
  { name: "Matte Liquid Lipstick", description: "Long-lasting, transfer-proof matte finish, available in 8 shades.", price: 349, oldPrice: 549, images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80"], category: "Beauty", brand: "GlowUp", stock: 200, rating: 4.4, numReviews: 156, isFeatured: true, isNewArrival: false, isDeal: true, discount: 36 },
  { name: "Waterproof Kajal Pencil", description: "Intense black pigment, smudge-proof, 12hr stay formula.", price: 199, oldPrice: 349, images: ["https://images.unsplash.com/photo-1631730359585-5e3f9a10c00a?w=600&q=80"], category: "Beauty", brand: "GlowUp", stock: 250, rating: 4.3, numReviews: 198, isFeatured: false, isNewArrival: false, isDeal: true, discount: 43 },
  { name: "SPF 50 Sunscreen Gel", description: "Lightweight, non-greasy, broad spectrum protection, matte finish.", price: 399, oldPrice: 599, images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80"], category: "Beauty", brand: "DermaCare", stock: 160, rating: 4.7, numReviews: 224, isFeatured: true, isNewArrival: true, isDeal: false, discount: 33 },

  // ---------- Toys & Baby ----------
  { name: "Baby Soft Toy Bundle", description: "Set of 5 plush toys, BPA-free, washable, suitable for 0+ months.", price: 699, oldPrice: 999, images: ["https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&q=80"], category: "Toys & Baby", brand: "TinyJoy", stock: 75, rating: 4.3, numReviews: 34, isFeatured: false, isNewArrival: true, isDeal: false, discount: 30 },
  { name: "Wooden Educational Puzzle Set", description: "Non-toxic wooden puzzles for shape and colour recognition, ages 2+.", price: 499, oldPrice: 799, images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80"], category: "Toys & Baby", brand: "TinyJoy", stock: 100, rating: 4.5, numReviews: 58, isFeatured: false, isNewArrival: false, isDeal: true, discount: 38 },
  { name: "Baby Diapers Pack (Size M, 60 pcs)", description: "Ultra-soft, 12hr dryness lock, hypoallergenic material.", price: 799, oldPrice: 999, images: ["https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80"], category: "Toys & Baby", brand: "BabySoft", stock: 200, rating: 4.6, numReviews: 142, isFeatured: true, isNewArrival: false, isDeal: false, discount: 20 },

  // ---------- Grocery ----------
  { name: "Organic Green Tea - 100 bags", description: "100% organic Darjeeling green tea, antioxidant rich, individually wrapped.", price: 349, oldPrice: 499, images: ["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80"], category: "Grocery", brand: "TeaVeda", stock: 500, rating: 4.5, numReviews: 189, isFeatured: false, isNewArrival: false, isDeal: true, discount: 30 },
  { name: "Whole Wheat Atta 5kg", description: "Stone-ground whole wheat flour, rich in fibre, no additives.", price: 299, oldPrice: 399, images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80"], category: "Grocery", brand: "FarmFresh", stock: 400, rating: 4.4, numReviews: 97, isFeatured: false, isNewArrival: false, isDeal: false, discount: 25 },
  { name: "Cold Pressed Groundnut Oil 1L", description: "100% natural, chemical-free extraction, retains natural aroma and nutrients.", price: 349, oldPrice: 449, images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80"], category: "Grocery", brand: "FarmFresh", stock: 250, rating: 4.6, numReviews: 73, isFeatured: true, isNewArrival: true, isDeal: false, discount: 22 },
  { name: "Assorted Namkeen Combo Pack", description: "4 flavours of crunchy namkeen, made with premium ingredients.", price: 249, oldPrice: 349, images: ["https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80"], category: "Grocery", brand: "TeaVeda", stock: 300, rating: 4.3, numReviews: 61, isFeatured: false, isNewArrival: false, isDeal: true, discount: 29 },
];

router.post("/", async (req, res) => {
  if (process.env.NODE_ENV === "production") { res.status(403).json({ message: "Seed production me allowed nahi hai" }); return; }
  try {
    await Promise.all([Category.deleteMany({}), Product.deleteMany({})]);
    const categories = await Category.insertMany(SEED_CATEGORIES);
    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c._id.toString(); });
    const products = await Product.insertMany(SEED_PRODUCTS.map(p => ({ ...p, categoryId: catMap[p.category] })));
    if (!await User.findOne({ email: "admin@shopely.com" })) {
      await User.create({ name: "Admin", email: "admin@shopely.com", password: "admin123", isAdmin: true });
    }
    res.json({ message: "Seed data insert ho gaya!", categories: categories.length, products: products.length, admin: { email: "admin@shopely.com", password: "admin123" } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;