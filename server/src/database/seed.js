import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const initialCategories = [
  { name: 'Men', slug: 'men', description: 'Sculptural signets, cuffs, and bold chains for him.' },
  { name: 'Women', slug: 'women', description: 'Luminous drops, celestial pendants, and refined rings.' },
  { name: 'Unisex', slug: 'unisex', description: 'Fluid, architectural sterling pieces for any expression.' },
];

const initialTypes = [
  { name: 'Rings', slug: 'rings' },
  { name: 'Necklaces', slug: 'necklaces' },
  { name: 'Earrings', slug: 'earrings' },
  { name: 'Bracelets', slug: 'bracelets' },
  { name: 'Chains', slug: 'chains' },
];

const initialFinishes = [
  { name: 'High Polish', slug: 'high-polish', description: 'Luminous mirror finish reflecting clean brilliance.' },
  { name: 'Oxidized Silver', slug: 'oxidized-silver', description: 'Deep antique patina with dramatic contrast.' },
  { name: 'Brushed Matte', slug: 'brushed-matte', description: 'Understated satin grain for tactile quiet luxury.' },
  { name: 'Textured', slug: 'textured', description: 'Hand-hammered or chiseled organic surface facets.' },
];

const initialSettings = [
  { key: 'free_shipping_threshold', value: '25000', description: 'Orders above this amount get free shipping (PKR)' },
  { key: 'standard_shipping_fee', value: '450', description: 'Standard nationwide courier rate (PKR)' },
  { key: 'announcement_bar', value: 'Complimentary nationwide delivery on orders over PKR 25,000', description: 'Top promo bar text' },
  { key: 'support_phone', value: '+92 300 1234567', description: 'Studio contact & WhatsApp phone number' },
  { key: 'support_email', value: 'care@genzosilver.pk', description: 'Official client care email' },
  { key: 'studio_location', value: 'Lahore, Pakistan', description: 'Physical studio and atelier address' },
  { key: 'studio_hours', value: 'Mon–Sat, 11am–8pm', description: 'Studio operating schedule' },
];

const productsData = [
  {
    name: "Noir Signet Ring",
    category: "Men",
    type: "Rings",
    price: 12400,
    badge: "Bestseller",
    finish: "High Polish",
    description: "A commanding signet cast in solid 925 sterling silver with a mirror-finish face.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1656010280162-772358d9f4ed?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Celeste Pendant",
    category: "Women",
    type: "Necklaces",
    price: 18900,
    badge: "New",
    finish: "High Polish",
    description: "A delicate celestial drop on an ultra-fine link silver chain.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1786840319645-427aa6b23b12?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Eclipse Band",
    category: "Men",
    type: "Rings",
    price: 9800,
    badge: null,
    finish: "Brushed Matte",
    description: "Sleek low-profile band with a hand-brushed satin surface and beveled interior.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1639660680736-14b79f169a27?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Lune Drop Earrings",
    category: "Women",
    type: "Earrings",
    price: 14500,
    badge: "Limited",
    finish: "High Polish",
    description: "Fluid silver teardrops engineered with feather-light hollow core balance.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1639660680572-f5de04d56df0?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Sculpted Serpent",
    category: "Women",
    type: "Rings",
    price: 21500,
    badge: null,
    finish: "High Polish",
    description: "Organic spiraled ring inspired by serpentine fluidity and Lahore silversmithing.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1669278629728-0db49976eb1f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Obsidian Cuff",
    category: "Men",
    type: "Bracelets",
    price: 16800,
    badge: "New",
    finish: "Oxidized Silver",
    description: "Deep oxidized inner groove flanked by hand-polished silver edges.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1726195641634-a8940e99719c?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Aurelia Twisted Chain",
    category: "Unisex",
    type: "Chains",
    price: 15200,
    badge: "Bestseller",
    finish: "High Polish",
    description: "Diamond-cut rope chain reflecting radiant silver flashes from every angle.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Mirage Statement Ring",
    category: "Women",
    type: "Rings",
    price: 17800,
    badge: "Limited",
    finish: "Textured",
    description: "Hammered dome ring capturing the play of light with gentle undulating facets.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Sovereign Signet",
    category: "Men",
    type: "Rings",
    price: 13900,
    badge: null,
    finish: "Brushed Matte",
    description: "Geometric cushion-top signet ring with refined industrial matte finish.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Ethereal Chunky Hoops",
    category: "Women",
    type: "Earrings",
    price: 11200,
    badge: null,
    finish: "High Polish",
    description: "Sculptural tubular hoops with secure latch backs and seamless luster.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Solstice Torque Collar",
    category: "Women",
    type: "Necklaces",
    price: 24000,
    badge: "Limited",
    finish: "High Polish",
    description: "Rigid open collar in heavy gauge sterling silver that rests gracefully on collarbones.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Raw Edge Silver Cuff",
    category: "Unisex",
    type: "Bracelets",
    price: 19500,
    badge: null,
    finish: "Textured",
    description: "Chiseled organic edge forged by hand, creating an heirloom look of ancient treasure.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1611591475806-96bb05504787?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Vapour Minimalist Studs",
    category: "Unisex",
    type: "Earrings",
    price: 7800,
    badge: null,
    finish: "Brushed Matte",
    description: "Architectural square studs for subtle, confident everyday distinction.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Arc Box Chain",
    category: "Men",
    type: "Chains",
    price: 16500,
    badge: "Bestseller",
    finish: "Oxidized Silver",
    description: "Dense 4mm rounded box chain treated with dark patina for masculine depth.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Zenith Medallion",
    category: "Unisex",
    type: "Necklaces",
    price: 22800,
    badge: "New",
    finish: "Oxidized Silver",
    description: "Hand-embossed talisman pendant on a 24-inch curb chain with antique wash.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1617038220319-276d35ab60e8?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Monolith Heavy Band",
    category: "Men",
    type: "Rings",
    price: 14200,
    badge: null,
    finish: "Oxidized Silver",
    description: "Substantial 8mm band featuring raw hand-distressed sides and burnished rim.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1620656798579-1984d9e87dfa?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Astraea Pendant",
    category: "Women",
    type: "Necklaces",
    price: 19800,
    badge: "New",
    finish: "High Polish",
    description: "Sculpted droplet pendant suspended gracefully on a shimmering cable chain.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Nomad Link Bracelet",
    category: "Men",
    type: "Bracelets",
    price: 18200,
    badge: "Bestseller",
    finish: "Brushed Matte",
    description: "Articulated oval curb links fastened with our custom engineered Genzo silver bar clasp.",
    inStock: true,
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85",
  },
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

async function seedDatabase() {
  console.log('--- Starting TiDB Data Seeding ---');

  try {
    // 1. Seed Store Settings
    console.log('Seeding store settings...');
    for (const s of initialSettings) {
      await pool.query(
        `INSERT INTO store_settings (setting_key, setting_value, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), description = VALUES(description)`,
        [s.key, s.value, s.description]
      );
    }

    // 2. Seed Categories
    console.log('Seeding categories...');
    const categoryMap = {};
    for (const c of initialCategories) {
      const [result] = await pool.query(
        `INSERT INTO categories (name, slug, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [c.name, c.slug, c.description]
      );
      const [rows] = await pool.query(`SELECT id FROM categories WHERE slug = ?`, [c.slug]);
      categoryMap[c.name] = rows[0].id;
    }

    // 3. Seed Types
    console.log('Seeding product types...');
    const typeMap = {};
    for (const t of initialTypes) {
      await pool.query(
        `INSERT INTO product_types (name, slug)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [t.name, t.slug]
      );
      const [rows] = await pool.query(`SELECT id FROM product_types WHERE slug = ?`, [t.slug]);
      typeMap[t.name] = rows[0].id;
    }

    // 4. Seed Finishes
    console.log('Seeding product finishes...');
    const finishMap = {};
    for (const f of initialFinishes) {
      await pool.query(
        `INSERT INTO product_finishes (name, slug, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [f.name, f.slug, f.description]
      );
      const [rows] = await pool.query(`SELECT id FROM product_finishes WHERE slug = ?`, [f.slug]);
      finishMap[f.name] = rows[0].id;
    }

    // 5. Seed Products
    console.log('Seeding 18 catalog products...');
    for (let index = 0; index < productsData.length; index++) {
      const item = productsData[index];
      const slug = slugify(item.name);
      const categoryId = categoryMap[item.category];
      const typeId = typeMap[item.type];
      const finishId = finishMap[item.finish];
      const isFeatured = index < 6; // first 6 are featured on homepage

      const [res] = await pool.query(
        `INSERT INTO products (name, slug, category_id, type_id, finish_id, price, badge, description, in_stock, stock_quantity, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           price = VALUES(price),
           badge = VALUES(badge),
           description = VALUES(description),
           is_featured = VALUES(is_featured)`,
        [
          item.name,
          slug,
          categoryId,
          typeId,
          finishId,
          item.price,
          item.badge,
          item.description,
          item.inStock,
          50,
          isFeatured,
        ]
      );

      const [rows] = await pool.query(`SELECT id FROM products WHERE slug = ?`, [slug]);
      const productId = rows[0].id;

      // Seed Product Images
      await pool.query(`DELETE FROM product_images WHERE product_id = ?`, [productId]);
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, item.image, true, 0, `${item.name} main view`]
      );
      // Additional gallery views
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
         VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
        [
          productId,
          'https://images.unsplash.com/photo-1639660680788-bf160240864e?auto=format&fit=crop&w=1000&q=85',
          false,
          1,
          `${item.name} angle detail`,
          productId,
          'https://images.unsplash.com/photo-1656010280156-fa8c1793c235?auto=format&fit=crop&w=1000&q=85',
          false,
          2,
          `${item.name} lifestyle craft`,
        ]
      );

      // Seed Sizes
      await pool.query(`DELETE FROM product_sizes WHERE product_id = ?`, [productId]);
      if (item.type === 'Rings') {
        const ringSizes = ['16', '18', '20', '22'];
        for (let sIdx = 0; sIdx < ringSizes.length; sIdx++) {
          await pool.query(
            `INSERT INTO product_sizes (product_id, size_name, stock_quantity, display_order)
             VALUES (?, ?, ?, ?)`,
            [productId, ringSizes[sIdx], 15, sIdx]
          );
        }
      } else {
        await pool.query(
          `INSERT INTO product_sizes (product_id, size_name, stock_quantity, display_order)
           VALUES (?, ?, ?, ?)`,
          [productId, 'One size', 30, 0]
        );
      }

      // Seed Product Accordions
      await pool.query(`DELETE FROM product_accordions WHERE product_id = ?`, [productId]);
      await pool.query(
        `INSERT INTO product_accordions (product_id, title, content, display_order)
         VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)`,
        [
          productId,
          'Materials & care',
          'Certified solid 925 sterling silver stamped with the official Genzo hallmark. Clean gently with a silver microfiber polishing cloth. Keep stored in your airtight presentation pouch away from direct moisture.',
          0,
          productId,
          'Delivery & returns',
          'Complimentary insured nationwide courier delivery on orders over PKR 25,000 (standard rate PKR 450). Delivered within 2-5 business days across Pakistan. 7-day hassle-free exchange policy.',
          1,
          productId,
          'Our one-year warranty',
          'Every Genzo creation is backed by our comprehensive one-year craftsmanship warranty covering structural integrity, clasp alignment, and surface repolishing.',
          2,
        ]
      );
    }

    console.log('Seeding completed successfully!');
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM products');
    console.log(`Verified total products in database: ${count}`);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('--- Database Seeding Complete ---');
  }
}

seedDatabase();
