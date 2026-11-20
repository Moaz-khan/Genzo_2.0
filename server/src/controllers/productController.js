import pool from '../config/db.js';

/**
 * GET /api/v1/products
 * Fetch products with dynamic filtering, sorting, and search
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      types,
      finishes,
      pricePreset,
      minPrice,
      maxPrice,
      badge,
      inStockOnly,
      search,
      sortBy = 'featured',
      limit,
      page = 1,
    } = req.query;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        c.name AS category,
        pt.name AS type,
        pf.name AS finish,
        p.price,
        p.badge,
        p.description,
        p.in_stock AS inStock,
        p.stock_quantity AS stockQuantity,
        p.is_featured AS isFeatured,
        p.purity,
        p.created_at AS createdAt,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1),
          ''
        ) AS image
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      INNER JOIN product_types pt ON p.type_id = pt.id
      INNER JOIN product_finishes pf ON p.finish_id = pf.id
      WHERE 1=1
    `;

    const params = [];

    // Category Filter
    if (category && category !== 'All') {
      query += ` AND c.name = ?`;
      params.push(category);
    }

    // Product Types Filter (Supports comma-separated or array)
    if (types) {
      const typeList = Array.isArray(types) ? types : types.split(',').map((t) => t.trim());
      if (typeList.length > 0) {
        query += ` AND pt.name IN (${typeList.map(() => '?').join(',')})`;
        params.push(...typeList);
      }
    }

    // Product Finishes Filter (Supports comma-separated or array)
    if (finishes) {
      const finishList = Array.isArray(finishes)
        ? finishes
        : finishes.split(',').map((f) => f.trim());
      if (finishList.length > 0) {
        query += ` AND pf.name IN (${finishList.map(() => '?').join(',')})`;
        params.push(...finishList);
      }
    }

    // Price Preset Filter
    if (pricePreset) {
      if (pricePreset === 'under-12k') {
        query += ` AND p.price <= 12000`;
      } else if (pricePreset === '12k-18k') {
        query += ` AND p.price >= 12000 AND p.price <= 18000`;
      } else if (pricePreset === '18k-22k') {
        query += ` AND p.price >= 18000 AND p.price <= 22000`;
      } else if (pricePreset === 'above-22k') {
        query += ` AND p.price >= 22000`;
      }
    }

    // Min & Max Price Bounds
    if (minPrice !== undefined && minPrice !== '') {
      query += ` AND p.price >= ?`;
      params.push(Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      query += ` AND p.price <= ?`;
      params.push(Number(maxPrice));
    }

    // Badge Filter
    if (badge && badge !== 'all') {
      query += ` AND p.badge = ?`;
      params.push(badge);
    }

    // In Stock Only
    if (inStockOnly === 'true' || inStockOnly === true) {
      query += ` AND p.in_stock = 1`;
    }

    // Search Query (across name, description, category, type, finish)
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (
        p.name LIKE ? OR 
        p.description LIKE ? OR 
        c.name LIKE ? OR 
        pt.name LIKE ? OR 
        pf.name LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
      case 'low':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price-high':
      case 'high':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'name':
        query += ` ORDER BY p.name ASC`;
        break;
      case 'newest':
        query += ` ORDER BY (p.badge = 'New') DESC, p.id DESC`;
        break;
      case 'featured':
      default:
        query += ` ORDER BY p.is_featured DESC, p.id ASC`;
        break;
    }

    // Optional Pagination / Limit
    if (limit) {
      const take = Number(limit);
      const skip = (Number(page) - 1) * take;
      query += ` LIMIT ? OFFSET ?`;
      params.push(take, skip);
    }

    const [products] = await pool.query(query, params);

    res.json({
      success: true,
      count: products.length,
      data: products.map((item) => ({
        ...item,
        price: Number(item.price),
        inStock: Boolean(item.inStock),
        isFeatured: Boolean(item.isFeatured),
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/products/featured
 * Quick helper for Homepage Curated / New Icons section
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        c.name AS category,
        pt.name AS type,
        pf.name AS finish,
        p.price,
        p.badge,
        p.description,
        p.in_stock AS inStock,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1),
          ''
        ) AS image
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      INNER JOIN product_types pt ON p.type_id = pt.id
      INNER JOIN product_finishes pf ON p.finish_id = pf.id
      WHERE p.is_featured = 1 OR p.badge = 'Bestseller' OR p.badge = 'New'
      ORDER BY p.id ASC
      LIMIT 8
    `;
    const [products] = await pool.query(query);

    res.json({
      success: true,
      count: products.length,
      data: products.map((item) => ({
        ...item,
        price: Number(item.price),
        inStock: Boolean(item.inStock),
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/products/:idOrSlug
 * Product Detail Page with gallery images, sizes, and accordions
 */
export const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    const productQuery = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        c.name AS category,
        pt.name AS type,
        pf.name AS finish,
        p.price,
        p.badge,
        p.description,
        p.in_stock AS inStock,
        p.stock_quantity AS stockQuantity,
        p.purity,
        p.warranty_period AS warrantyPeriod
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      INNER JOIN product_types pt ON p.type_id = pt.id
      INNER JOIN product_finishes pf ON p.finish_id = pf.id
      WHERE ${isNumeric ? 'p.id = ?' : 'p.slug = ?'}
      LIMIT 1
    `;

    const [rows] = await pool.query(productQuery, [idOrSlug]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const product = rows[0];

    // Fetch Gallery Images
    const [images] = await pool.query(
      `SELECT id, image_url AS url, is_primary AS isPrimary, alt_text AS altText
       FROM product_images
       WHERE product_id = ?
       ORDER BY display_order ASC, id ASC`,
      [product.id]
    );

    // Fetch Sizes
    const [sizes] = await pool.query(
      `SELECT id, size_name AS name, stock_quantity AS stockQuantity
       FROM product_sizes
       WHERE product_id = ?
       ORDER BY display_order ASC`,
      [product.id]
    );

    // Fetch Accordions
    const [accordions] = await pool.query(
      `SELECT id, title, content
       FROM product_accordions
       WHERE product_id = ?
       ORDER BY display_order ASC`,
      [product.id]
    );

    const gallery = images.map((img) => img.url);

    res.json({
      success: true,
      data: {
        ...product,
        price: Number(product.price),
        inStock: Boolean(product.inStock),
        image: gallery[0] || '',
        gallery,
        images,
        sizes: sizes.map((s) => s.name),
        detailedSizes: sizes,
        accordions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/products/facets
 * Dynamic counts for sidebar filters in CollectionPage
 */
export const getFilterFacets = async (req, res, next) => {
  try {
    const [categories] = await pool.query(
      `SELECT c.name, COUNT(p.id) AS count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id`
    );

    const [types] = await pool.query(
      `SELECT pt.name, COUNT(p.id) AS count
       FROM product_types pt
       LEFT JOIN products p ON p.type_id = pt.id
       GROUP BY pt.id`
    );

    const [finishes] = await pool.query(
      `SELECT pf.name, COUNT(p.id) AS count
       FROM product_finishes pf
       LEFT JOIN products p ON p.finish_id = pf.id
       GROUP BY pf.id`
    );

    const [badges] = await pool.query(
      `SELECT badge, COUNT(*) AS count
       FROM products
       WHERE badge IS NOT NULL
       GROUP BY badge`
    );

    const [[priceStats]] = await pool.query(
      `SELECT MIN(price) AS minPrice, MAX(price) AS maxPrice, COUNT(*) AS total
       FROM products`
    );

    res.json({
      success: true,
      data: {
        total: Number(priceStats.total || 0),
        minPrice: Number(priceStats.minPrice || 0),
        maxPrice: Number(priceStats.maxPrice || 0),
        categories: categories.reduce((acc, c) => ({ ...acc, [c.name]: c.count }), {
          All: Number(priceStats.total || 0),
        }),
        types: types.reduce((acc, t) => ({ ...acc, [t.name]: t.count }), {}),
        finishes: finishes.reduce((acc, f) => ({ ...acc, [f.name]: f.count }), {}),
        badges: badges.reduce((acc, b) => ({ ...acc, [b.badge]: b.count }), {}),
      },
    });
  } catch (error) {
    next(error);
  }
};
