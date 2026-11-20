import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Filter,
  Grid2X2,
  Grid3X3,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Product, ProductCategory, ProductFinish, ProductType, products as fallbackProducts } from "../data/products";
import ProductCard from "./ProductCard";

type CollectionPageProps = {
  initialCategory?: string;
  wishlist: number[];
  onWishlistToggle: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onBackToHome: () => void;
  products?: Product[];
};

export default function CollectionPage({
  initialCategory = "All",
  wishlist,
  onWishlistToggle,
  onAddToCart,
  onViewProduct,
  onBackToHome,
  products: productsProp,
}: CollectionPageProps) {
  const allProducts = productsProp && productsProp.length > 0 ? productsProp : fallbackProducts;

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedTypes, setSelectedTypes] = useState<ProductType[]>([]);
  const [selectedFinishes, setSelectedFinishes] = useState<ProductFinish[]>([]);
  const [pricePreset, setPricePreset] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [gridColumns, setGridColumns] = useState<2 | 3>(3);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Accordion toggle states
  const [sectionsOpen, setSectionsOpen] = useState({
    category: true,
    type: true,
    price: true,
    finish: true,
    curation: true,
  });

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const allTypes: ProductType[] = ["Rings", "Necklaces", "Earrings", "Bracelets", "Chains"];
  const allFinishes: ProductFinish[] = [
    "High Polish",
    "Oxidized Silver",
    "Brushed Matte",
    "Textured",
  ];

  // Helper toggle functions
  const toggleType = (t: ProductType) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t],
    );
  };

  const toggleFinish = (f: ProductFinish) => {
    setSelectedFinishes((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f],
    );
  };

  const resetAllFilters = () => {
    setSelectedCategory("All");
    setSelectedTypes([]);
    setSelectedFinishes([]);
    setPricePreset("all");
    setMaxPrice(25000);
    setSelectedBadge("all");
    setInStockOnly(false);
    setSearchQuery("");
    setSortBy("featured");
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count += 1;
    count += selectedTypes.length;
    count += selectedFinishes.length;
    if (pricePreset !== "all" || maxPrice < 25000) count += 1;
    if (selectedBadge !== "all") count += 1;
    if (inStockOnly) count += 1;
    if (searchQuery.trim().length > 0) count += 1;
    return count;
  }, [
    selectedCategory,
    selectedTypes,
    selectedFinishes,
    pricePreset,
    maxPrice,
    selectedBadge,
    inStockOnly,
    searchQuery,
  ]);

  // Facet counts
  const facetCounts = useMemo(() => {
    const counts = {
      types: {} as Record<string, number>,
      finishes: {} as Record<string, number>,
      categories: { All: allProducts.length, Men: 0, Women: 0, Unisex: 0 } as Record<string, number>,
    };

    allTypes.forEach((t) => (counts.types[t] = 0));
    allFinishes.forEach((f) => (counts.finishes[f] = 0));

    allProducts.forEach((p) => {
      counts.types[p.type] = (counts.types[p.type] || 0) + 1;
      counts.finishes[p.finish] = (counts.finishes[p.finish] || 0) + 1;
      if (counts.categories[p.category] !== undefined) {
        counts.categories[p.category] += 1;
      }
    });

    return counts;
  }, [allProducts]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        // Category / Gender filter
        if (selectedCategory !== "All" && p.category !== selectedCategory) {
          return false;
        }

        // Jewelry Type filter
        if (selectedTypes.length > 0 && !selectedTypes.includes(p.type)) {
          return false;
        }

        // Finish filter
        if (selectedFinishes.length > 0 && !selectedFinishes.includes(p.finish)) {
          return false;
        }

        // Price preset filter
        if (pricePreset === "under-12k" && p.price > 12000) return false;
        if (pricePreset === "12k-18k" && (p.price < 12000 || p.price > 18000)) return false;
        if (pricePreset === "18k-22k" && (p.price < 18000 || p.price > 22000)) return false;
        if (pricePreset === "above-22k" && p.price < 22000) return false;

        // Price slider
        if (p.price > maxPrice) return false;

        // Badge filter
        if (selectedBadge !== "all" && p.badge !== selectedBadge) return false;

        // In Stock filter
        if (inStockOnly && !p.inStock) return false;

        // Search query
        if (searchQuery.trim().length > 0) {
          const query = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchType = p.type.toLowerCase().includes(query);
          const matchCategory = p.category.toLowerCase().includes(query);
          const matchFinish = p.finish.toLowerCase().includes(query);
          if (!matchName && !matchType && !matchCategory && !matchFinish) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "newest") {
          if (a.badge === "New") return -1;
          if (b.badge === "New") return 1;
          return b.id - a.id;
        }
        // "featured" default
        return a.id - b.id;
      });
  }, [
    selectedCategory,
    selectedTypes,
    selectedFinishes,
    pricePreset,
    maxPrice,
    selectedBadge,
    inStockOnly,
    searchQuery,
    sortBy,
  ]);

  // Sidebar Filter Component Content (reused on Desktop & Mobile Drawer)
  const FilterContent = () => (
    <div className="filter-inner">
      {/* Header with count and reset */}
      <div className="filter-header">
        <div className="filter-header-title">
          <SlidersHorizontal size={15} />
          <span>Filters</span>
          {activeFilterCount > 0 && <span className="filter-badge-count">{activeFilterCount}</span>}
        </div>
        {activeFilterCount > 0 && (
          <button className="reset-filter-btn" onClick={resetAllFilters}>
            <RotateCcw size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="filter-search-box">
        <Search size={14} />
        <input
          type="text"
          placeholder="Filter by keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} aria-label="Clear search">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Section 1: Gender / Collection */}
      <div className="filter-accordion">
        <button
          className="accordion-trigger"
          onClick={() => toggleSection("category")}
          aria-expanded={sectionsOpen.category}
        >
          <span>Collection & Gender</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${sectionsOpen.category ? "rotate-180" : ""}`}
          />
        </button>
        {sectionsOpen.category && (
          <div className="accordion-content">
            {(["All", "Men", "Women", "Unisex"] as const).map((cat) => (
              <label
                key={cat}
                className={`filter-radio-row ${selectedCategory === cat ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat)}
                />
                <span className="radio-indicator" />
                <span className="filter-name">{cat === "All" ? "All Collections" : cat}</span>
                <span className="filter-count">({facetCounts.categories[cat] || 0})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Jewellery Type */}
      <div className="filter-accordion">
        <button
          className="accordion-trigger"
          onClick={() => toggleSection("type")}
          aria-expanded={sectionsOpen.type}
        >
          <span>Jewellery Type</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${sectionsOpen.type ? "rotate-180" : ""}`}
          />
        </button>
        {sectionsOpen.type && (
          <div className="accordion-content">
            {allTypes.map((type) => {
              const isChecked = selectedTypes.includes(type);
              return (
                <label key={type} className={`filter-checkbox-row ${isChecked ? "active" : ""}`}>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleType(type)} />
                  <span className="checkbox-box">
                    {isChecked && <span className="checkbox-inner" />}
                  </span>
                  <span className="filter-name">{type}</span>
                  <span className="filter-count">({facetCounts.types[type] || 0})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Price Range */}
      <div className="filter-accordion">
        <button
          className="accordion-trigger"
          onClick={() => toggleSection("price")}
          aria-expanded={sectionsOpen.price}
        >
          <span>Price (PKR)</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${sectionsOpen.price ? "rotate-180" : ""}`}
          />
        </button>
        {sectionsOpen.price && (
          <div className="accordion-content">
            {/* Price Presets */}
            <div className="price-presets-list">
              {[
                { id: "all", label: "All Prices" },
                { id: "under-12k", label: "Under PKR 12,000" },
                { id: "12k-18k", label: "PKR 12,000 – 18,000" },
                { id: "18k-22k", label: "PKR 18,000 – 22,000" },
                { id: "above-22k", label: "PKR 22,000+" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  className={`price-preset-pill ${pricePreset === tier.id ? "active" : ""}`}
                  onClick={() => setPricePreset(tier.id)}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            {/* Max Price Slider */}
            <div className="price-slider-wrap">
              <div className="price-slider-header">
                <span>Maximum budget:</span>
                <strong>PKR {maxPrice.toLocaleString()}</strong>
              </div>
              <input
                type="range"
                min="7000"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  if (pricePreset !== "all") setPricePreset("all");
                }}
                className="price-range-slider"
              />
              <div className="price-slider-bounds">
                <span>PKR 7,000</span>
                <span>PKR 25,000</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Silver Finish & Patina */}
      <div className="filter-accordion">
        <button
          className="accordion-trigger"
          onClick={() => toggleSection("finish")}
          aria-expanded={sectionsOpen.finish}
        >
          <span>Silver Finish & Patina</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${sectionsOpen.finish ? "rotate-180" : ""}`}
          />
        </button>
        {sectionsOpen.finish && (
          <div className="accordion-content">
            {allFinishes.map((finish) => {
              const isChecked = selectedFinishes.includes(finish);
              return (
                <label key={finish} className={`filter-checkbox-row ${isChecked ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFinish(finish)}
                  />
                  <span className="checkbox-box">
                    {isChecked && <span className="checkbox-inner" />}
                  </span>
                  <span className="filter-name">{finish}</span>
                  <span className="filter-count">({facetCounts.finishes[finish] || 0})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 5: Editions & Curations */}
      <div className="filter-accordion">
        <button
          className="accordion-trigger"
          onClick={() => toggleSection("curation")}
          aria-expanded={sectionsOpen.curation}
        >
          <span>Editions & Status</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${sectionsOpen.curation ? "rotate-180" : ""}`}
          />
        </button>
        {sectionsOpen.curation && (
          <div className="accordion-content">
            {[
              { id: "all", label: "All Editions" },
              { id: "Bestseller", label: "Bestseller Icons" },
              { id: "New", label: "New Arrivals" },
              { id: "Limited", label: "Limited Studio Pieces" },
            ].map((badge) => (
              <label
                key={badge.id}
                className={`filter-radio-row ${selectedBadge === badge.id ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="badge"
                  checked={selectedBadge === badge.id}
                  onChange={() => setSelectedBadge(badge.id)}
                />
                <span className="radio-indicator" />
                <span className="filter-name">{badge.label}</span>
              </label>
            ))}

            <div className="filter-divider-mini" />

            {/* In stock only toggle */}
            <label className="filter-toggle-row">
              <span className="toggle-label">In-stock pieces only</span>
              <div
                className={`toggle-switch ${inStockOnly ? "on" : ""}`}
                onClick={() => setInStockOnly(!inStockOnly)}
              >
                <div className="toggle-thumb" />
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Trust note inside sidebar */}
      <div className="sidebar-craft-note">
        <Sparkles size={14} />
        <p>Certified 925 sterling silver, hallmarked and inspected by hand.</p>
      </div>
    </div>
  );

  return (
    <motion.main
      className="page-view collection-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Editorial Page Crumb */}
      <div className="page-crumb">
        <button onClick={onBackToHome}>
          <ArrowLeft size={15} /> Back home
        </button>
        <span>
          Home / Collections / {selectedCategory === "All" ? "Archive" : selectedCategory}
        </span>
      </div>

      {/* Collection Hero Banner */}
      <header className="collection-hero-banner">
        <div className="collection-hero-inner">
          <p className="kicker dark">The Archive · 925 Sterling Silver</p>
          <h1>
            {selectedCategory === "Men"
              ? "Men’s Collection"
              : selectedCategory === "Women"
                ? "Women’s Collection"
                : selectedCategory === "Unisex"
                  ? "Universal Forms"
                  : "The Silver Archive"}
          </h1>
          <p className="collection-hero-sub">
            Meticulously sculpted in Lahore. Hand-finished forms, pure proportions, and quiet
            endurance for every day.
          </p>

          {/* Quick Collection Switcher Pills */}
          <div className="quick-category-pills">
            {(["All", "Men", "Women", "Unisex"] as const).map((cat) => (
              <button
                key={cat}
                className={`quick-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "All" ? "All Pieces" : cat}
                <span>({facetCounts.categories[cat] || 0})</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Two-Column Layout (Left: Sidebar, Right: Catalog) */}
      <div className="collection-container">
        {/* DESKTOP LEFT FILTER SIDEBAR */}
        <aside className="collection-sidebar" aria-label="Product filters">
          <FilterContent />
        </aside>

        {/* MAIN PRODUCT CATALOG AREA */}
        <section className="collection-main">
          {/* Top Control Bar */}
          <div className="catalog-control-bar">
            {/* Mobile Filter Button */}
            <button className="mobile-filter-trigger" onClick={() => setMobileDrawerOpen(true)}>
              <Filter size={15} />
              <span>Filter & Refine</span>
              {activeFilterCount > 0 && <span className="count-pill">{activeFilterCount}</span>}
            </button>

            {/* Results Count */}
            <div className="catalog-count">
              Showing <strong>{filteredProducts.length}</strong> of {allProducts.length} creations
            </div>

            {/* Right Tools: Sort & Grid Layout */}
            <div className="catalog-tools">
              <label className="sort-field collection-sort">
                <span>Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Featured Icons</option>
                  <option value="price-low">Price: Low to high</option>
                  <option value="price-high">Price: High to low</option>
                  <option value="newest">Newest Additions</option>
                  <option value="name">Alphabetical (A–Z)</option>
                </select>
                <ChevronDown size={14} />
              </label>

              {/* View columns switch (Desktop) */}
              <div className="grid-switcher" aria-label="Change grid view">
                <button
                  className={gridColumns === 2 ? "active" : ""}
                  onClick={() => setGridColumns(2)}
                  title="2 columns view"
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  className={gridColumns === 3 ? "active" : ""}
                  onClick={() => setGridColumns(3)}
                  title="3 columns view"
                >
                  <Grid3X3 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips / Badges Bar */}
          {activeFilterCount > 0 && (
            <div className="active-chips-bar">
              <div className="active-chips-label">Active filters:</div>
              <div className="active-chips-list">
                {selectedCategory !== "All" && (
                  <span className="chip">
                    Collection: {selectedCategory}
                    <button onClick={() => setSelectedCategory("All")}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedTypes.map((t) => (
                  <span className="chip" key={t}>
                    {t}
                    <button onClick={() => toggleType(t)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {selectedFinishes.map((f) => (
                  <span className="chip" key={f}>
                    {f}
                    <button onClick={() => toggleFinish(f)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {pricePreset !== "all" && (
                  <span className="chip">
                    Price: {pricePreset}
                    <button onClick={() => setPricePreset("all")}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                {maxPrice < 25000 && (
                  <span className="chip">
                    Under PKR {maxPrice.toLocaleString()}
                    <button onClick={() => setMaxPrice(25000)}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedBadge !== "all" && (
                  <span className="chip">
                    {selectedBadge}
                    <button onClick={() => setSelectedBadge("all")}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="chip">
                    In Stock Only
                    <button onClick={() => setInStockOnly(false)}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="chip">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery("")}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button className="clear-all-text-btn" onClick={resetAllFilters}>
                  Clear all ({activeFilterCount})
                </button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <motion.div layout className={`collection-grid cols-${gridColumns}`}>
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wished={wishlist.includes(product.id)}
                    onWish={() => onWishlistToggle(product)}
                    onAdd={() => onAddToCart(product)}
                    onView={() => onViewProduct(product)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Luxury Empty State */
            <div className="empty-catalog-state">
              <div className="empty-catalog-icon">
                <SlidersHorizontal size={34} />
              </div>
              <h3>No matching creations</h3>
              <p>
                We could not find any silver pieces that match your specific filter criteria. Try
                adjusting your price range or clearing selected filters.
              </p>
              <button className="button dark" onClick={resetAllFilters}>
                <RotateCcw size={14} /> Clear all filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* MOBILE FILTER SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <motion.div
            className="overlay mobile-filter-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setMobileDrawerOpen(false)}
          >
            <motion.aside
              className="drawer mobile-filter-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="mobile-drawer-header">
                <div>
                  <p className="kicker dark">Refine by</p>
                  <h2>Filters</h2>
                </div>
                <button
                  className="close"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mobile-drawer-body">
                <FilterContent />
              </div>

              <div className="mobile-drawer-footer">
                <button className="button dark w-full" onClick={() => setMobileDrawerOpen(false)}>
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
