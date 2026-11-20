import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Product, money } from "../data/products";

export default function ProductCard({
  product,
  wished,
  onWish,
  onAdd,
  onView,
}: {
  product: Product;
  wished: boolean;
  onWish: () => void;
  onAdd: () => void;
  onView: () => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="product-card group"
    >
      <div className="product-image-wrap">
        <button
          className="product-image-button"
          onClick={onView}
          aria-label={`View ${product.name}`}
        >
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        </button>
        {product.badge && <span className="badge">{product.badge}</span>}
        <button
          className={`wish-button ${wished ? "active" : ""}`}
          onClick={onWish}
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart size={18} fill={wished ? "currentColor" : "none"} />
        </button>
        <button className="quick-add" onClick={onAdd}>
          Add to bag
        </button>
      </div>
      <div className="product-copy">
        <div>
          <div className="flex items-center justify-between">
            <p className="eyebrow">
              {product.category} · {product.type} · {product.finish}
            </p>
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
              ★ 5.0
            </span>
          </div>
          <button className="product-name" onClick={onView}>
            <h3>{product.name}</h3>
          </button>
        </div>
        <p className="price">{money(product.price)}</p>
      </div>
    </motion.article>
  );
}
