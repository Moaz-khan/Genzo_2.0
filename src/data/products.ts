export type ProductCategory = "Men" | "Women" | "Unisex";
export type ProductType = "Rings" | "Necklaces" | "Earrings" | "Bracelets" | "Chains";
export type ProductFinish = "High Polish" | "Oxidized Silver" | "Brushed Matte" | "Textured";

export type Product = {
  id: number;
  name: string;
  slug?: string;
  category: ProductCategory;
  type: ProductType;
  price: number;
  image: string;
  badge?: "Bestseller" | "New" | "Limited";
  finish: ProductFinish;
  description: string;
  inStock: boolean;
  stockQuantity?: number;
  isFeatured?: boolean;
  purity?: string;
  gallery?: string[];
  sizes?: string[];
  accordions?: Array<{ title: string; content: string }>;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Noir Signet Ring",
    category: "Men",
    type: "Rings",
    price: 12400,
    badge: "Bestseller",
    finish: "High Polish",
    description: "A commanding signet cast in solid 925 sterling silver with a mirror-finish face.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1656010280162-772358d9f4ed?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    name: "Celeste Pendant",
    category: "Women",
    type: "Necklaces",
    price: 18900,
    badge: "New",
    finish: "High Polish",
    description: "A delicate celestial drop on an ultra-fine link silver chain.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1786840319645-427aa6b23b12?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    name: "Eclipse Band",
    category: "Men",
    type: "Rings",
    price: 9800,
    finish: "Brushed Matte",
    description: "Sleek low-profile band with a hand-brushed satin surface and beveled interior.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1639660680736-14b79f169a27?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    name: "Lune Drop Earrings",
    category: "Women",
    type: "Earrings",
    price: 14500,
    badge: "Limited",
    finish: "High Polish",
    description: "Fluid silver teardrops engineered with feather-light hollow core balance.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1639660680572-f5de04d56df0?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    name: "Sculpted Serpent",
    category: "Women",
    type: "Rings",
    price: 21500,
    finish: "High Polish",
    description: "Organic spiraled ring inspired by serpentine fluidity and Lahore silversmithing.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1669278629728-0db49976eb1f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    name: "Obsidian Cuff",
    category: "Men",
    type: "Bracelets",
    price: 16800,
    badge: "New",
    finish: "Oxidized Silver",
    description: "Deep oxidized inner groove flanked by hand-polished silver edges.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1726195641634-a8940e99719c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 7,
    name: "Aurelia Twisted Chain",
    category: "Unisex",
    type: "Chains",
    price: 15200,
    badge: "Bestseller",
    finish: "High Polish",
    description: "Diamond-cut rope chain reflecting radiant silver flashes from every angle.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 8,
    name: "Mirage Statement Ring",
    category: "Women",
    type: "Rings",
    price: 17800,
    badge: "Limited",
    finish: "Textured",
    description: "Hammered dome ring capturing the play of light with gentle undulating facets.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 9,
    name: "Sovereign Signet",
    category: "Men",
    type: "Rings",
    price: 13900,
    finish: "Brushed Matte",
    description: "Geometric cushion-top signet ring with refined industrial matte finish.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 10,
    name: "Ethereal Chunky Hoops",
    category: "Women",
    type: "Earrings",
    price: 11200,
    finish: "High Polish",
    description: "Sculptural tubular hoops with secure latch backs and seamless luster.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 11,
    name: "Solstice Torque Collar",
    category: "Women",
    type: "Necklaces",
    price: 24000,
    badge: "Limited",
    finish: "High Polish",
    description:
      "Rigid open collar in heavy gauge sterling silver that rests gracefully on collarbones.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 12,
    name: "Raw Edge Silver Cuff",
    category: "Unisex",
    type: "Bracelets",
    price: 19500,
    finish: "Textured",
    description:
      "Chiseled organic edge forged by hand, creating an heirloom look of ancient treasure.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1611591475806-96bb05504787?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 13,
    name: "Vapour Minimalist Studs",
    category: "Unisex",
    type: "Earrings",
    price: 7800,
    finish: "Brushed Matte",
    description: "Architectural square studs for subtle, confident everyday distinction.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 14,
    name: "Arc Box Chain",
    category: "Men",
    type: "Chains",
    price: 16500,
    badge: "Bestseller",
    finish: "Oxidized Silver",
    description: "Dense 4mm rounded box chain treated with dark patina for masculine depth.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 15,
    name: "Zenith Medallion",
    category: "Unisex",
    type: "Necklaces",
    price: 22800,
    badge: "New",
    finish: "Oxidized Silver",
    description: "Hand-embossed talisman pendant on a 24-inch curb chain with antique wash.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1617038220319-276d35ab60e8?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 16,
    name: "Monolith Heavy Band",
    category: "Men",
    type: "Rings",
    price: 14200,
    finish: "Oxidized Silver",
    description: "Substantial 8mm band featuring raw hand-distressed sides and burnished rim.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1620656798579-1984d9e87dfa?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 17,
    name: "Astraea Pendant",
    category: "Women",
    type: "Necklaces",
    price: 19800,
    badge: "New",
    finish: "High Polish",
    description: "Sculpted droplet pendant suspended gracefully on a shimmering cable chain.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 18,
    name: "Nomad Link Bracelet",
    category: "Men",
    type: "Bracelets",
    price: 18200,
    badge: "Bestseller",
    finish: "Brushed Matte",
    description:
      "Articulated oval curb links fastened with our custom engineered Genzo silver bar clasp.",
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85",
  },
];

export const money = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
