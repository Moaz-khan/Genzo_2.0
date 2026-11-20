import React from 'react';
import { motion } from 'framer-motion';
import { Heart, X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { Product, money } from '../data/products';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: number[];
  allProducts: Product[];
  onRemove: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onOpenProduct: (product: Product) => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistIds,
  allProducts,
  onRemove,
  onAddToCart,
  onOpenProduct,
}: WishlistDrawerProps) {
  if (!isOpen) return null;

  const wishedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
      style={{ zIndex: 120 }}
    >
      <motion.aside
        className="drawer cart-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="drawer-head">
          <div>
            <p className="kicker dark">Curated Atelier</p>
            <h2 className="flex items-center gap-2">
              <Heart size={20} className="fill-black text-black" />
              <span>Saved Pieces ({wishedProducts.length})</span>
            </h2>
          </div>
          <button className="close" onClick={onClose} aria-label="Close wishlist">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-lines flex-1 overflow-y-auto">
          {wishedProducts.length === 0 ? (
            <div className="empty-cart text-center py-16 px-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-serif">Your wishlist is empty</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Save your favorite 925 sterling pieces to compare finishes, follow availability, or acquire later.
              </p>
              <button
                className="button dark mx-auto text-xs py-3 px-6"
                onClick={onClose}
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {wishedProducts.map((item) => (
                <div
                  key={item.id}
                  className="cart-line p-3 bg-white border border-black/10 rounded-xl flex gap-3 items-center shadow-xs"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer bg-zinc-100"
                    onClick={() => {
                      onClose();
                      onOpenProduct(item);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="eyebrow text-[10px] tracking-wider uppercase text-zinc-500">
                      {item.category} · {item.type}
                    </p>
                    <h3
                      className="font-serif text-sm truncate cursor-pointer hover:underline"
                      onClick={() => {
                        onClose();
                        onOpenProduct(item);
                      }}
                    >
                      {item.name}
                    </h3>
                    <p className="font-semibold text-xs text-zinc-900 mt-0.5">
                      {money(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          onAddToCart(item, item.type === 'Rings' ? '18' : 'One size');
                        }}
                        className="text-[11px] font-semibold uppercase tracking-wider bg-black text-white px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-zinc-800 transition"
                      >
                        <ShoppingBag size={12} />
                        <span>Move to Bag</span>
                      </button>
                      <button
                        onClick={() => onRemove(item)}
                        className="text-zinc-400 hover:text-rose-600 p-1.5 transition"
                        title="Remove piece"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishedProducts.length > 0 && (
          <div className="cart-summary border-t border-black/10 p-4 bg-[#fafaf9]">
            <p className="text-[11px] text-zinc-500 text-center mb-3">
              Certified 925 sterling silver hallmarked & stored in your cloud atelier.
            </p>
            <button
              className="button dark w-full py-3 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2"
              onClick={() => {
                wishedProducts.forEach((p) => onAddToCart(p, p.type === 'Rings' ? '18' : 'One size'));
                onClose();
              }}
            >
              <span>Move All to Bag</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </motion.aside>
    </motion.div>
  );
}
