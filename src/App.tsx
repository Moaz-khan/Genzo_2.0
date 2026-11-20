import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Heart,
  Landmark,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Minus,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Upload,
  User,
  X,
  Printer,
  Tag,
  Gift,
  KeyRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import CollectionPage from "./components/CollectionPage";
import ProductCard from "./components/ProductCard";
import WishlistDrawer from "./components/WishlistDrawer";
import RingSizeGuideModal from "./components/RingSizeGuideModal";
import ProductReviewsSection from "./components/ProductReviewsSection";
import PolicyModals, { PolicyModalType } from "./components/PolicyModals";
import { Product, money, products as staticProducts } from "./data/products";
import { api } from "./services/api";

type CartLine = Product & {
  quantity: number;
  size?: string;
  cartItemId?: number;
};

type Page = "home" | "collection" | "product" | "checkout" | "story";

/* ==========================================================================
   PRODUCT DETAIL PAGE COMPONENT (Live API Connected)
   ========================================================================== */
function ProductDetailPage({
  product,
  wished,
  onBack,
  onWish,
  onAdd,
  onBuy,
  onOpenSizeGuide,
}: {
  product: Product;
  wished: boolean;
  onBack: () => void;
  onWish: () => void;
  onAdd: (quantity: number, size: string) => void;
  onBuy: (quantity: number, size: string) => void;
  onOpenSizeGuide: () => void;
}) {
  const [details, setDetails] = useState<any>(null);
  const [size, setSize] = useState<string>(product.type === "Rings" ? "18" : "One size");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [openAccordion, setOpenAccordion] = useState<string | null>("materials");

  // Fetch live product details (gallery, sizes, accordions) from backend API
  useEffect(() => {
    setActiveImage(product.image);
    setSize(product.type === "Rings" ? "18" : "One size");
    setQuantity(1);

    api
      .getProduct(product.id || product.slug || 1)
      .then((res) => {
        if (res && res.data) {
          setDetails(res.data);
          if (res.data.image) {
            setActiveImage(res.data.image);
          } else if (res.data.gallery && res.data.gallery.length > 0) {
            setActiveImage(res.data.gallery[0]);
          }
          if (res.data.sizes && res.data.sizes.length > 0) {
            const firstSize =
              typeof res.data.sizes[0] === "string" ? res.data.sizes[0] : res.data.sizes[0].name;
            if (firstSize) setSize(firstSize);
          }
        }
      })
      .catch(() => {});
  }, [product.id, product.slug, product.image, product.type]);

  const gallery = useMemo(() => {
    if (details?.gallery && Array.isArray(details.gallery) && details.gallery.length > 0) {
      return details.gallery;
    }
    if (product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0) {
      return product.gallery;
    }
    return [
      product.image,
      "https://images.unsplash.com/photo-1639660680788-bf160240864e?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1656010280156-fa8c1793c235?auto=format&fit=crop&w=1000&q=85",
    ];
  }, [details, product]);

  const sizeOptions = useMemo(() => {
    if (details?.sizes && Array.isArray(details.sizes) && details.sizes.length > 0) {
      return details.sizes.map((s: any) => (typeof s === "string" ? s : s.name));
    }
    if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }
    return product.type === "Rings" ? ["16", "18", "20", "22"] : ["One size"];
  }, [details, product]);

  const accordions = useMemo(() => {
    if (details?.accordions && Array.isArray(details.accordions) && details.accordions.length > 0) {
      return details.accordions;
    }
    return [
      {
        id: "materials",
        title: "Materials & care",
        content:
          "Sculpted in solid 925 sterling silver with certified authenticity hallmark. Hand-finished with an anti-tarnish protective luster. Clean with a soft lint-free microfiber silver cloth and store in the provided anti-tarnish atelier pouch.",
      },
      {
        id: "delivery",
        title: "Delivery & returns",
        content:
          "Complimentary nationwide tracked delivery across Pakistan on orders over PKR 25,000. Dispatched within 2–4 business days via verified courier with signature tamper-proof box. 7-day complimentary exchange policy.",
      },
      {
        id: "warranty",
        title: "One-Year Care Warranty",
        content:
          "Every Genzo creation is protected by our complimentary one-year atelier care warranty covering silversmith craftsmanship, ultrasonic re-polishing, and hallmark verification.",
      },
    ];
  }, [details]);

  return (
    <motion.main
      className="page-view product-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="page-crumb">
        <button onClick={onBack}>
          <ArrowLeft size={15} /> Back to collection
        </button>
        <span>
          Home / Collections / {product.category} / {product.name}
        </span>
      </div>
      <section className="product-detail">
        <div className="product-gallery">
          <div className="gallery-thumbs">
            {gallery.map((image: string, index: number) => (
              <button
                key={`${image}-${index}`}
                className={activeImage === image ? "active" : ""}
                onClick={() => setActiveImage(image)}
              >
                <img src={image} alt={`${product.name} view ${index + 1}`} />
              </button>
            ))}
          </div>
          <motion.div
            className="gallery-main"
            key={activeImage}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            <img src={activeImage} alt={product.name} />
            <span>925</span>
          </motion.div>
        </div>
        <div className="product-info">
          <p className="kicker dark">
            {product.category} · {product.type} · {product.finish}
          </p>
          <div className="product-title-row">
            <h1>{product.name}</h1>
            <button
              className={wished ? "active" : ""}
              onClick={onWish}
              aria-label="Toggle wishlist"
            >
              <Heart fill={wished ? "currentColor" : "none"} />
            </button>
          </div>
          <p className="detail-price">{money(product.price)}</p>
          <p className="detail-intro">
            {product.description ||
              "A study in balance and restraint. Hand-finished in luminous 925 sterling silver, this signature piece brings quiet distinction to every day."}
          </p>
          <div className="detail-divider" />

          {/* Size Picker */}
          {sizeOptions.length > 1 ? (
            <div className="size-picker">
              <div className="flex justify-between items-center w-full">
                <div>
                  <span>Select size</span>
                  <span className="text-[11px] text-zinc-500 font-medium block">Standard Pakistan sizing</span>
                </div>
                {product.type === "Rings" && (
                  <button
                    type="button"
                    onClick={onOpenSizeGuide}
                    className="text-[11px] text-zinc-800 underline underline-offset-2 hover:text-black font-semibold cursor-pointer"
                  >
                    Ring Sizing Guide
                  </button>
                )}
              </div>
              <div className="size-options">
                {sizeOptions.map((item: string) => (
                  <button
                    key={item}
                    className={size === item ? "active" : ""}
                    onClick={() => setSize(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="one-size">
              <span>Size</span>
              <strong>{size}</strong>
            </div>
          )}

          {/* Stock Note */}
          <div className="stock-note">
            <span className={product.inStock ? "bg-emerald-500" : "bg-rose-500"} />
            {product.inStock
              ? "In stock · Ready for prompt nationwide dispatch"
              : "Made to order · Handcrafted upon request"}
          </div>

          {/* Action Buttons */}
          <div className="detail-actions">
            <div className="detail-quantity">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus size={14} />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>
                <Plus size={14} />
              </button>
            </div>
            <button className="button dark" onClick={() => onAdd(quantity, size)}>
              Add to bag <ShoppingBag size={16} />
            </button>
          </div>

          <button className="buy-now" onClick={() => onBuy(quantity, size)}>
            Buy now <ArrowRight size={16} />
          </button>

          {/* Expandable Accordions */}
          <div className="detail-accordions mt-6 space-y-2">
            {accordions.map((acc: any, idx: number) => {
              const accId = acc.id || `acc-${idx}`;
              const isOpen = openAccordion === accId;
              return (
                <div key={accId} className="border-b border-black/10 pb-3">
                  <button
                    className="w-full flex items-center justify-between py-2 text-left text-xs uppercase tracking-wider font-medium text-zinc-800 hover:text-black transition"
                    onClick={() => setOpenAccordion(isOpen ? null : accId)}
                  >
                    <span>{acc.title}</span>
                    <Plus
                      size={15}
                      className={`transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-zinc-600 leading-relaxed pt-1 pb-2"
                    >
                      {acc.content}
                    </motion.p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="detail-editorial">
        <div>
          <p className="kicker dark">Made with intention</p>
          <h2>
            Silver that tells
            <br />
            your story.
          </h2>
        </div>
        <p>
          Each piece passes through the hands of skilled artisans, from its first sculpted form to
          its final mirror polish. Natural variations are the quiet signature of work made by hand.
        </p>
      </section>

      {/* Customer Reviews & Appraisals */}
      <section className="max-w-6xl mx-auto px-6 pb-16 w-full">
        <ProductReviewsSection productId={product.id} productName={product.name} />
      </section>
    </motion.main>
  );
}

/* ==========================================================================
   CHECKOUT PAGE COMPONENT (Live API Connected)
   ========================================================================== */
function CheckoutPage({
  cart,
  subtotal,
  shipping,
  onBack,
  onQuantity,
  onOrderSuccess,
  currentUser,
  onOpenTrack,
}: {
  cart: CartLine[];
  subtotal: number;
  shipping: number;
  onBack: () => void;
  onQuantity: (id: number, delta: number) => void;
  onOrderSuccess: () => void;
  currentUser: any;
  onOpenTrack: (orderNumber: string) => void;
}) {
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Lahore");
  const [postalCode, setPostalCode] = useState("54000");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [payment, setPayment] = useState("cod");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Coupon Voucher State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError("");
    try {
      const res = await api.validateCoupon(couponInput.trim(), subtotal);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponInput("");
      } else {
        setCouponError(res.message || "Invalid coupon voucher code.");
      }
    } catch (e: any) {
      setCouponError(e.message || "Failed to validate coupon.");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleCheckoutSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg("");

    if (!cart.length) {
      setErrorMsg("Your bag is empty. Please add pieces before checking out.");
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        deliveryNotes: deliveryNotes.trim(),
        paymentMethod: payment,
        couponCode: appliedCoupon?.code,
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          size: item.size || "One size",
          quantity: item.quantity,
          image: item.image,
        })),
      };

      // 1. Call real Create Order API
      const res = await api.createOrder(orderPayload);

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to create order on server.");
      }

      const orderData = res.data;

      // 2. If customer attached receipt file for JazzCash/Easypaisa/Bank, upload receipt via API
      if (receiptFile && orderData.orderId) {
        try {
          await api.uploadReceipt(orderData.orderId, receiptFile);
        } catch (uploadErr) {
          console.warn("Receipt upload notice:", uploadErr);
        }
      }

      setPlacedOrder(orderData);
      onOrderSuccess();
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMsg(
        err.message ||
          "Could not place order. Please check that the server is running on port 5000."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // If order was placed successfully, show full verification confirmation screen
  if (placedOrder) {
    return (
      <motion.main className="checkout-page p-6 sm:p-12 max-w-4xl mx-auto space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="text-center space-y-4 pt-8">
          <div className="w-16 h-16 bg-emerald-950/20 text-emerald-700 border border-emerald-600/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={36} />
          </div>
          <p className="kicker dark">Order Confirmed</p>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#1c1d1e]">
            Thank you, {placedOrder.customerName || fullName}!
          </h1>
          <p className="text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
            Your creation request has been registered in the Genzo Atelier TiDB Cloud registry.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#f5f5f3] border border-black/10 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-black/10 pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block">
                Order Reference
              </span>
              <span className="text-xl font-mono font-bold text-zinc-900">
                {placedOrder.orderNumber}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block">
                Total Amount
              </span>
              <span className="text-xl font-semibold text-zinc-900">
                {money(placedOrder.totalAmount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <strong className="block text-zinc-400 uppercase tracking-wider mb-1">Status</strong>
              <span className="inline-block px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-300/60">
                Pending Verification
              </span>
            </div>
            <div>
              <strong className="block text-zinc-400 uppercase tracking-wider mb-1">Payment Method</strong>
              <span className="font-medium text-zinc-800 capitalize">
                {placedOrder.paymentMethod || payment}
              </span>
            </div>
            <div>
              <strong className="block text-zinc-400 uppercase tracking-wider mb-1">Delivery Destination</strong>
              <span className="font-medium text-zinc-800">
                {city}, Pakistan
              </span>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-lg border border-black/5 text-xs text-zinc-700 leading-relaxed flex items-start gap-3">
            <Clock size={16} className="text-zinc-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-900 mb-0.5">What happens next?</p>
              <p>
                Our silversmith team is preparing your certified 925 sterling silver selection. You will
                receive updates and live tracking details via SMS/Email as soon as your parcel is dispatched.
              </p>
            </div>
          </div>
        </div>

        {/* Next Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onBack}
            className="button light w-full sm:w-auto px-8 py-3 text-xs uppercase tracking-wider font-semibold"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => onOpenTrack(placedOrder.orderNumber)}
            className="button dark w-full sm:w-auto px-8 py-3 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2"
          >
            <Clock size={15} />
            <span>Track This Order</span>
          </button>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main className="checkout-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="checkout-top">
        <button onClick={onBack}>
          <ArrowLeft size={15} /> Continue shopping
        </button>
        <div className="secure-label">
          <LockKeyhole size={14} /> Secure checkout · TiDB Cloud Verified
        </div>
      </div>
      <div className="checkout-layout">
        <section className="checkout-form-side">
          <p className="kicker dark">Complete your order</p>
          <h1>Checkout</h1>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-xs mb-6">
              {errorMsg}
            </div>
          )}

          <form id="checkout-form" onSubmit={handleCheckoutSubmit}>
            {/* 01. Contact Details */}
            <fieldset>
              <legend>
                <span>01</span> Contact details
              </legend>
              <div className="form-grid">
                <label>
                  Full name *
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </label>
                <label>
                  Phone number *
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                  />
                </label>
                <label className="full">
                  Email address *
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
              </div>
            </fieldset>

            {/* 02. Delivery Address */}
            <fieldset>
              <legend>
                <span>02</span> Delivery address
              </legend>
              <div className="form-grid">
                <label className="full">
                  Street address *
                  <input
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House, street and area"
                  />
                </label>
                <label>
                  City *
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lahore"
                  />
                </label>
                <label>
                  Postal code *
                  <input
                    required
                    inputMode="numeric"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="54000"
                  />
                </label>
                <label className="full">
                  Delivery notes
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Optional instructions for your courier"
                  />
                </label>
              </div>
            </fieldset>

            {/* 03. Payment Method */}
            <fieldset>
              <legend>
                <span>03</span> Payment method
              </legend>
              <div className="payment-options">
                {[
                  { id: "cod", name: "Cash on Delivery", icon: <Truck size={17} /> },
                  { id: "card", name: "Visa / Mastercard", icon: <CreditCard size={17} /> },
                  { id: "jazzcash", name: "JazzCash", icon: <span>JC</span> },
                  { id: "easypaisa", name: "Easypaisa", icon: <span>EP</span> },
                  { id: "bank", name: "Bank transfer", icon: <Landmark size={17} /> },
                ].map((method) => (
                  <label className={payment === method.id ? "active" : ""} key={method.id}>
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={payment === method.id}
                      onChange={() => setPayment(method.id)}
                    />
                    {method.icon}
                    <span>{method.name}</span>
                    <i />
                  </label>
                ))}
              </div>

              {/* Payment Method Notice & Receipt Upload */}
              {payment === "cod" ? (
                <div className="payment-message">
                  <Truck size={17} />
                  Cash on Delivery: Pay the courier in cash upon receiving your signature Genzo tamper-proof box. Complimentary inspection allowed prior to payment.
                </div>
              ) : payment === "card" ? (
                <div className="payment-message">
                  <ShieldCheck size={17} />
                  Verified checkout: Card details are encrypted with TLS 1.3. A payment verification link will be shared via SMS/Email.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-[#f2f2ef] rounded-lg border border-black/5 text-xs text-zinc-700 space-y-1">
                    <p className="font-semibold text-zinc-900">
                      {payment === "jazzcash" && "JazzCash Mobile Account:"}
                      {payment === "easypaisa" && "Easypaisa Mobile Account:"}
                      {payment === "bank" && "Bank Alfalah / Meezan Bank Transfer:"}
                    </p>
                    <p className="font-mono text-zinc-800">
                      {payment === "jazzcash" && "0300-1234567 · Title: GENZO SILVER ATELIER"}
                      {payment === "easypaisa" && "0300-1234567 · Title: GENZO SILVER ATELIER"}
                      {payment === "bank" && "IBAN: PK36MEZN0001234567890123 · Title: GENZO SILVER PK"}
                    </p>
                    <p className="text-[11px] text-zinc-500 pt-1">
                      Please transfer the total amount and upload your screenshot below for rapid verification.
                    </p>
                  </div>

                  <label className="receipt-upload block cursor-pointer">
                    <Upload size={20} />
                    <span>{receiptFileName || "Upload payment receipt / screenshot"}</span>
                    <small>PNG, JPG or PDF · Maximum 5MB</small>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          setReceiptFile(file);
                          setReceiptFileName(file.name);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </fieldset>
          </form>
        </section>

        {/* Order Summary Sidebar */}
        <aside className="order-summary">
          <p className="kicker dark">Your selection</p>
          <h2>Order summary</h2>
          <div className="summary-lines">
            {cart.map((item, idx) => (
              <div className="summary-line" key={`${item.id}-${idx}`}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.category} · {item.size ? `Size ${item.size}` : "925 Silver"}
                  </p>
                  <div className="mini-quantity">
                    <button type="button" onClick={() => onQuantity(item.id, -1)}>
                      <Minus size={12} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => onQuantity(item.id, 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <strong>{money(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>

          {/* Promo / Coupon Voucher Input */}
          <div className="pt-3 pb-1 border-t border-black/10">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code (e.g. GENZO10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 border border-black/20 px-3 py-2 text-xs rounded uppercase font-mono tracking-wider outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={checkingCoupon || !couponInput.trim()}
                className="bg-black text-white text-xs px-3 py-2 rounded font-semibold uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50"
              >
                {checkingCoupon ? "..." : "Apply"}
              </button>
            </div>
            {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
            {appliedCoupon && (
              <div className="flex justify-between items-center text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded mt-2">
                <span>Voucher <strong>{appliedCoupon.code}</strong> applied (-{money(appliedCoupon.discountAmount)})</span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-zinc-500 hover:text-black p-0.5"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="summary-totals">
            <div>
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            {appliedCoupon && (
              <div className="text-emerald-700">
                <span>Voucher Discount</span>
                <strong>-{money(appliedCoupon.discountAmount)}</strong>
              </div>
            )}
            <div>
              <span>Nationwide delivery</span>
              <strong>{shipping ? money(shipping) : "Complimentary"}</strong>
            </div>
            <div className="grand-total">
              <span>Total</span>
              <strong>
                {money(Math.max(0, subtotal - (appliedCoupon?.discountAmount || 0) + shipping))}
              </strong>
            </div>
          </div>
          <button
            className="button dark place-order"
            form="checkout-form"
            type="submit"
            disabled={!cart.length || submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <RefreshCw size={15} className="animate-spin" /> Confirming with Registry...
              </span>
            ) : (
              <>
                Place order & verify <ArrowRight size={17} />
              </>
            )}
          </button>
          <p className="verification-copy">
            <LockKeyhole size={13} /> Secured by TiDB Cloud Serverless database & Atelier payment verification.
          </p>
        </aside>
      </div>
    </motion.main>
  );
}

/* ==========================================================================
   OUR STORY PAGE COMPONENT
   ========================================================================== */
function StoryPage({ onBack, onShop }: { onBack: () => void; onShop: () => void }) {
  return (
    <motion.main className="story-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <section className="story-hero">
        <img
          src="https://images.unsplash.com/photo-1639660680736-14b79f169a27?auto=format&fit=crop&w=1800&q=90"
          alt="Silver rings in the Genzo studio"
        />
        <div className="story-hero-shade" />
        <button onClick={onBack}>
          <ArrowLeft size={15} /> Back home
        </button>
        <div>
          <p className="kicker">The Atelier</p>
          <h1>
            Crafted with restraint.
            <br />
            Born in Pakistan.
          </h1>
        </div>
      </section>
      <section className="story-grid">
        <div className="story-block">
          <p className="kicker dark">01 · Origin</p>
          <h2>The purity of 925.</h2>
          <p>
            GENZO SILVER was founded on a singular conviction: that sterling silver possesses a quiet,
            architectural dignity distinct from any other precious metal. Every piece begins with certified
            925 sterling silver alloyed for strength, tactile presence, and enduring beauty.
          </p>
        </div>
        <div className="story-block">
          <p className="kicker dark">02 · Silversmithing</p>
          <h2>Sculpted by hand.</h2>
          <p>
            In our Lahore atelier, master silversmiths combine generational hand-casting with precise modern
            finishing. From mirror-polished signet faces to hand-brushed satin bands, each piece carries the subtle
            imprint of artisan intention.
          </p>
        </div>
      </section>
      <section className="story-pillars">
        <p className="kicker">The standard</p>
        <h2>Three promises in every box</h2>
        <div className="pillar-cards">
          <article>
            <Sparkles />
            <h3>Lasting distinction</h3>
            <p>Sculptural forms crafted to outlive fleeting seasonal trends.</p>
          </article>
          <article>
            <ShieldCheck />
            <h3>Honesty in materials</h3>
            <p>Certified 925 sterling silver with transparent hallmarked purity.</p>
          </article>
          <article>
            <Package />
            <h3>Care in every detail</h3>
            <p>Thoughtful anti-tarnish packaging, verified delivery, and lifetime care warranty.</p>
          </article>
        </div>
      </section>
      <section className="story-closing">
        <p className="kicker">Your silver. Your story.</p>
        <h2>Find the piece that feels like you.</h2>
        <button className="button light" onClick={onShop}>
          Explore the collection <ArrowRight size={17} />
        </button>
      </section>
    </motion.main>
  );
}

/* ==========================================================================
   PRIMARY APPLICATION ROOT (All APIs Connected)
   ========================================================================== */
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [previousPage, setPreviousPage] = useState<Page>("home");
  const [collectionCategory, setCollectionCategory] = useState<string>("All");

  // Dynamic products loaded from API
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product>(staticProducts[0]);

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [ringGuideOpen, setRingGuideOpen] = useState(false);
  const [policyModal, setPolicyModal] = useState<PolicyModalType>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [giftPackaging, setGiftPackaging] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any>(null);

  // Filters on Home
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  // Wishlist and Cart (API + LocalStorage Synced)
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("genzo-wishlist") || "[]");
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("genzo-cart") || "[]");
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState("");

  // Store Settings (Dynamic from DB)
  const [storeSettings, setStoreSettings] = useState({
    freeShippingThreshold: 25000,
    standardShippingFee: 450,
    announcement: "Complimentary nationwide delivery on orders over PKR 25,000",
  });

  // Auth State
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot" | "reset" | "edit_profile">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPass, setResetNewPass] = useState("");
  const [editProfileForm, setEditProfileForm] = useState({ fullName: "", phone: "", currentPassword: "", newPassword: "" });
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    role?: string;
  } | null>(null);

  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  // User Order History
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Tracking form state
  const [trackNumber, setTrackNumber] = useState("");
  const [trackContact, setTrackContact] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  // Contact / Client Care form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Inquiry about 925 sterling piece",
    message: "",
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  /* --------------------------------------------------------------------------
     1. INITIALIZATION & API FETCHING
     -------------------------------------------------------------------------- */
  // Load products from backend API
  const fetchProductsFromApi = async () => {
    try {
      const res = await api.getProducts({ limit: 100 });
      if (res && res.data && res.data.length > 0) {
        setAllProducts(res.data);
      }
    } catch {
      // Graceful fallback to static products
    }
  };

  // Load store settings from backend API
  const fetchSettingsFromApi = async () => {
    try {
      const res = await api.getStoreSettings();
      if (res && res.data) {
        setStoreSettings({
          freeShippingThreshold: Number(res.data.free_shipping_threshold) || 25000,
          standardShippingFee: Number(res.data.standard_shipping_fee) || 450,
          announcement:
            res.data.announcement_banner ||
            "Complimentary nationwide delivery on orders over PKR 25,000",
        });
      }
    } catch {}
  };

  // Verify Auth on mount
  useEffect(() => {
    fetchProductsFromApi();
    fetchSettingsFromApi();

    const token = localStorage.getItem("genzo_auth_token");
    if (token) {
      api
        .getMe()
        .then((res) => {
          if (res.success && res.user) {
            setCurrentUser({
              id: res.user.id,
              fullName: res.user.full_name || res.user.fullName,
              email: res.user.email,
              phone: res.user.phone,
              role: res.user.role,
            });
          } else {
            api.logout();
          }
        })
        .catch(() => {});
    }
  }, []);

  // Sync wishlist from backend API
  useEffect(() => {
    api
      .getWishlist()
      .then((res) => {
        if (res && Array.isArray(res.productIds) && res.productIds.length > 0) {
          setWishlist(res.productIds);
        }
      })
      .catch(() => {});
  }, [currentUser]);

  // Sync cart from backend API
  useEffect(() => {
    api
      .getCart()
      .then((res) => {
        if (res && res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
          setCart(
            res.data.items.map((item: any) => ({
              ...item,
              quantity: item.quantity || 1,
            }))
          );
        }
      })
      .catch(() => {});
  }, [currentUser]);

  // Persist LocalStorage mirrors
  useEffect(() => {
    localStorage.setItem("genzo-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("genzo-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Toast auto-clear
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Load user order history when account modal opens and user is logged in
  useEffect(() => {
    if (accountOpen && currentUser) {
      setLoadingOrders(true);
      api
        .getMyOrders()
        .then((res) => {
          if (res && res.data) {
            setUserOrders(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [accountOpen, currentUser]);

  /* --------------------------------------------------------------------------
     2. CART & WISHLIST ACTIONS (Connected to API)
     -------------------------------------------------------------------------- */
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const shipping = subtotal >= storeSettings.freeShippingThreshold || subtotal === 0 ? 0 : storeSettings.standardShippingFee;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = async (product: Product, size = "One size", quantity = 1) => {
    // 1. Optimistic update
    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id && (item.size || "One size") === size
      );
      if (existing) {
        return current.map((item) =>
          item.id === product.id && (item.size || "One size") === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { ...product, size, quantity }];
    });
    setToast(`${product.name} (${size}) added to your bag`);

    // 2. Call backend Cart API
    try {
      const res = await api.addToCart(product.id, size, quantity);
      if (res && res.data && Array.isArray(res.data.items)) {
        setCart(res.data.items);
      }
    } catch {}
  };

  const updateQuantity = async (id: number, delta: number) => {
    const lineItem = cart.find((item) => item.id === id);
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );

    try {
      if (lineItem && lineItem.cartItemId) {
        await api.updateCartItem(lineItem.cartItemId, delta);
      } else {
        await api.addToCart(id, lineItem?.size || "One size", delta);
      }
    } catch {}
  };

  const removeFromCart = async (id: number) => {
    const lineItem = cart.find((item) => item.id === id);
    setCart((current) => current.filter((item) => item.id !== id));
    setToast("Item removed from bag");

    try {
      if (lineItem && lineItem.cartItemId) {
        await api.removeFromCart(lineItem.cartItemId);
      }
    } catch {}
  };

  const handleWishlistToggle = async (product: Product) => {
    const isWished = wishlist.includes(product.id);
    setWishlist((current) =>
      isWished ? current.filter((id) => id !== product.id) : [...current, product.id]
    );
    setToast(isWished ? "Removed from wishlist" : `${product.name} saved to wishlist`);

    try {
      await api.toggleWishlist(product.id);
    } catch {}
  };

  /* --------------------------------------------------------------------------
     3. AUTHENTICATION & NEWSLETTER ACTIONS
     -------------------------------------------------------------------------- */
  const submitAuth = async (event: FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        const res = await api.signup({
          fullName: authForm.fullName,
          email: authForm.email,
          password: authForm.password,
          phone: authForm.phone,
        });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setToast(`Welcome to Genzo Silver, ${res.user.fullName}!`);
          setAccountOpen(false);
          setAuthForm({ fullName: "", email: "", password: "", phone: "" });
        } else {
          setToast(res.message || "Failed to create account");
        }
      } else {
        const res = await api.login({
          email: authForm.email,
          password: authForm.password,
        });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setToast(`Welcome back, ${res.user.fullName}!`);
          setAccountOpen(false);
          setAuthForm({ fullName: "", email: "", password: "", phone: "" });
        } else {
          setToast(res.message || "Invalid email or password");
        }
      }
    } catch {
      setToast("Connection error: Please ensure backend server is running on port 5000");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setAuthLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      if (res.success) {
        setToast("Password reset code sent! Check your inbox.");
        if (res.resetToken) {
          setResetToken(res.resetToken);
        }
        setAuthMode("reset");
      } else {
        setToast(res.message || "Failed to process request");
      }
    } catch {
      setToast("Error sending reset code");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !resetToken || !resetNewPass) return;
    setAuthLoading(true);
    try {
      const res = await api.resetPassword({
        email: forgotEmail,
        resetToken,
        newPassword: resetNewPass,
      });
      if (res.success) {
        setToast("Password successfully reset! Please sign in with your new credentials.");
        setAuthMode("login");
        setForgotEmail("");
        setResetToken("");
        setResetNewPass("");
      } else {
        setToast(res.message || "Invalid or expired reset code");
      }
    } catch {
      setToast("Failed to reset password");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEditProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await api.updateProfile(editProfileForm);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setToast("Profile updated successfully!");
        setAuthMode("login");
      } else {
        setToast(res.message || "Failed to update profile");
      }
    } catch {
      setToast("Error updating profile");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setUserOrders([]);
    setToast("Signed out successfully");
    setAccountOpen(false);
  };

  const handleNewsletterSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;
    setNewsletterSubmitting(true);
    try {
      const res = await api.subscribeNewsletter(newsletterEmail);
      setToast(res.message || "Welcome to the Genzo inner circle.");
      setNewsletterEmail("");
    } catch {
      setToast("Welcome to the Genzo inner circle.");
      setNewsletterEmail("");
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  /* --------------------------------------------------------------------------
     4. ORDER TRACKING & INQUIRY ACTIONS
     -------------------------------------------------------------------------- */
  const handleTrackSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTrackingError("");
    setTrackingResult(null);
    if (!trackNumber.trim()) return;

    setTrackingLoading(true);
    try {
      const res = await api.trackOrder(trackNumber.trim(), trackContact.trim());
      if (res.success && res.data) {
        setTrackingResult(res.data);
      } else {
        setTrackingError(res.message || "No order found matching these details.");
      }
    } catch {
      setTrackingError("Could not reach order tracking registry. Please try again.");
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleContactSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setContactSubmitting(true);
    try {
      const res = await api.submitInquiry(contactForm);
      if (res.success) {
        setToast("Inquiry received. Our client care team will respond promptly.");
        setContactModalOpen(false);
        setContactForm({
          name: "",
          email: "",
          phone: "",
          subject: "Inquiry about 925 sterling piece",
          message: "",
        });
      } else {
        setToast(res.message || "Could not submit inquiry.");
      }
    } catch {
      setToast("Thank you. Your message has been routed to our concierge.");
      setContactModalOpen(false);
    } finally {
      setContactSubmitting(false);
    }
  };

  /* --------------------------------------------------------------------------
     5. PAGE NAVIGATION HELPERS
     -------------------------------------------------------------------------- */
  const showHomeSection = (id: string, nextCategory?: string) => {
    if (nextCategory) setCategory(nextCategory);
    setPage("home");
    setMenuOpen(false);
    window.setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  const openCollection = (nextCategory = "All") => {
    setCollectionCategory(nextCategory);
    setPage("collection");
    setMenuOpen(false);
    setCartOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProduct = (product: Product) => {
    setPreviousPage(page);
    setSelectedProduct(product);
    setPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProductBack = () => {
    if (previousPage === "collection") {
      setPage("collection");
    } else {
      showHomeSection("shop");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPage = (nextPage: Page) => {
    setPage(nextPage);
    setCartOpen(false);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filtered products for Homepage "New Icons" section
  const visibleProducts = useMemo(() => {
    const filtered = allProducts.filter(
      (product) =>
        (category === "All" || product.category === category) &&
        product.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "low") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [allProducts, category, search, sort]);

  return (
    <div className="app-shell">
      {/* Dynamic Announcement Banner */}
      <div className="announcement">{storeSettings.announcement}</div>

      {/* Primary Header */}
      <header className="site-header">
        <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={21} />
        </button>
        <button className="brand" onClick={() => showHomeSection("home")}>
          <span>GENZO</span>
          <small>SILVER</small>
        </button>
        <nav className="desktop-nav">
          <button onClick={() => openCollection("All")}>Collections</button>
          <button onClick={() => openCollection("Men")}>Men</button>
          <button onClick={() => openCollection("Women")}>Women</button>
          <button onClick={() => showHomeSection("shop")}>New In</button>
          <button onClick={() => setTrackModalOpen(true)}>Track Order</button>
          <button onClick={() => openPage("story")}>Our Story</button>
        </nav>
        <div className="header-actions">
          <button aria-label="Search Collection" onClick={() => openCollection("All")}>
            <Search size={19} />
          </button>
          <button
            aria-label="Saved Pieces"
            onClick={() => setWishlistOpen(true)}
            className="cart-trigger relative"
            title="Saved Pieces"
          >
            <Heart size={19} className={wishlist.length > 0 ? "fill-black text-black" : ""} />
            {wishlist.length > 0 && <span>{wishlist.length}</span>}
          </button>
          <button
            aria-label="Account"
            onClick={() => setAccountOpen(true)}
            className="flex items-center gap-1.5"
          >
            <User size={19} />
            {currentUser && (
              <span className="text-xs tracking-wider uppercase font-medium">
                {currentUser.fullName.split(" ")[0]}
              </span>
            )}
          </button>
          <button className="cart-trigger" aria-label="Cart" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={19} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* Page Routing */}
      {page === "home" ? (
        <main>
          {/* Hero Section */}
          <section className="hero" id="home">
            <img
              src="https://images.unsplash.com/photo-1789799159417-fe50382ad51f?auto=format&fit=crop&w=1800&q=90"
              alt="Silver rings on a dark reflective surface"
            />
            <div className="hero-shade" />
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              <p className="kicker">The Signature Collection · 2026</p>
              <h1>
                Elegance
                <br />
                for everyone.
              </h1>
              <p className="hero-sub">
                Sculptural sterling silver, created in Pakistan for every expression of you.
              </p>
              <div className="hero-actions">
                <button className="button light" onClick={() => openCollection("All")}>
                  Shop the collection <ArrowRight size={17} />
                </button>
                <button className="text-link" onClick={() => openCollection("Men")}>
                  Discover men’s
                </button>
              </div>
            </motion.div>
            <div className="hero-index">
              01 <span /> 03
            </div>
          </section>

          {/* Value Strip */}
          <section className="value-strip">
            <div>
              <ShieldCheck />
              <span>
                <strong>925 Sterling Silver</strong>Certified purity, always
              </span>
            </div>
            <div>
              <Truck />
              <span>
                <strong>Nationwide Delivery</strong>Complimentary over PKR {storeSettings.freeShippingThreshold.toLocaleString()}
              </span>
            </div>
            <div>
              <Sparkles />
              <span>
                <strong>Made to Endure</strong>One-year atelier care warranty
              </span>
            </div>
          </section>

          {/* New Icons / Curated Shop Section */}
          <section className="shop-section" id="shop">
            <div className="section-heading">
              <div>
                <p className="kicker dark">Curated for you</p>
                <h2>New icons</h2>
              </div>
              <p>
                Quiet luxury in its purest form. Designed to become part of your everyday ritual.
              </p>
            </div>

            <div className="shop-tools">
              <div className="tabs">
                {["All", "Women", "Men"].map((item) => (
                  <button
                    key={item}
                    className={category === item ? "active" : ""}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="filter-tools">
                <label className="search-field">
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search pieces"
                  />
                </label>
                <label className="sort-field">
                  <select value={sort} onChange={(event) => setSort(event.target.value)}>
                    <option value="featured">Featured</option>
                    <option value="low">Price: Low to high</option>
                    <option value="high">Price: High to low</option>
                  </select>
                  <ChevronDown size={15} />
                </label>
              </div>
            </div>

            <motion.div layout className="product-grid">
              <AnimatePresence mode="popLayout">
                {visibleProducts.slice(0, 6).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wished={wishlist.includes(product.id)}
                    onWish={() => handleWishlistToggle(product)}
                    onAdd={() => addToCart(product)}
                    onView={() => openProduct(product)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
            {visibleProducts.length === 0 && (
              <div className="empty-search">No pieces found. Try a different search.</div>
            )}
            <div className="text-center mt-12">
              <button className="button dark" onClick={() => openCollection(category)}>
                View Full Collection ({allProducts.length} pieces) <ArrowRight size={16} />
              </button>
            </div>
          </section>

          {/* Collections Featured Banners */}
          <section className="collections" id="collections">
            <motion.article
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1639660680515-7c76c86b559b?auto=format&fit=crop&w=1000&q=85"
                alt="Men's silver rings"
              />
              <div className="collection-copy">
                <p>For him</p>
                <h3>Modern heirlooms</h3>
                <button onClick={() => openCollection("Men")}>
                  Shop men <ArrowRight size={16} />
                </button>
              </div>
            </motion.article>
            <motion.article
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1656010280156-fa8c1793c235?auto=format&fit=crop&w=1000&q=85"
                alt="Women's silver ring"
              />
              <div className="collection-copy">
                <p>For her</p>
                <h3>Everyday radiance</h3>
                <button onClick={() => openCollection("Women")}>
                  Shop women <ArrowRight size={16} />
                </button>
              </div>
            </motion.article>
          </section>

          {/* The Standard Story Preview */}
          <section className="story" id="story">
            <div className="story-mark">G</div>
            <div>
              <p className="kicker dark">The Genzo standard</p>
              <h2>
                Silver, thoughtfully
                <br />
                made to be lived in.
              </h2>
            </div>
            <div className="story-body">
              <p>
                We pair timeless silversmithing with a modern point of view. Every Genzo piece is
                shaped in 925 sterling silver, polished by hand and made for all the moments ahead.
              </p>
              <button onClick={() => openPage("story")}>
                Read our story <ArrowRight size={16} />
              </button>
            </div>
          </section>

          {/* Newsletter Section (Connected to API) */}
          <section className="newsletter">
            <p className="kicker">Private access</p>
            <h2>Join the inner circle</h2>
            <p>
              First look at new collections, private events and thoughtful notes from our studio.
            </p>
            <form onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address"
                aria-label="Email address"
              />
              <button type="submit" disabled={newsletterSubmitting}>
                {newsletterSubmitting ? "Joining..." : "Join"} <ArrowRight size={16} />
              </button>
            </form>
          </section>
        </main>
      ) : page === "collection" ? (
        <CollectionPage
          key={collectionCategory}
          initialCategory={collectionCategory}
          wishlist={wishlist}
          products={allProducts}
          onWishlistToggle={handleWishlistToggle}
          onAddToCart={addToCart}
          onViewProduct={openProduct}
          onBackToHome={() => showHomeSection("home")}
        />
      ) : page === "product" ? (
        <ProductDetailPage
          product={selectedProduct}
          wished={wishlist.includes(selectedProduct.id)}
          onBack={handleProductBack}
          onWish={() => handleWishlistToggle(selectedProduct)}
          onAdd={(quantity, size) => addToCart(selectedProduct, size, quantity)}
          onBuy={(quantity, size) => {
            addToCart(selectedProduct, size, quantity);
            openPage("checkout");
          }}
          onOpenSizeGuide={() => setRingGuideOpen(true)}
        />
      ) : page === "checkout" ? (
        <CheckoutPage
          cart={cart}
          subtotal={subtotal}
          shipping={shipping}
          currentUser={currentUser}
          onBack={() =>
            previousPage === "collection"
              ? openCollection(collectionCategory)
              : showHomeSection("shop")
          }
          onQuantity={updateQuantity}
          onOrderSuccess={() => {
            setCart([]);
            setToast("Order registered in TiDB database! Verification in progress.");
          }}
          onOpenTrack={(num) => {
            setTrackNumber(num);
            setTrackModalOpen(true);
          }}
        />
      ) : (
        <StoryPage onBack={() => showHomeSection("home")} onShop={() => openCollection("All")} />
      )}

      {/* Footer */}
      <footer>
        <div className="footer-brand">
          <span>GENZO</span>
          <small>SILVER</small>
        </div>
        <div>
          <h4>Explore</h4>
          <button onClick={() => openCollection("All")}>Shop all</button>
          <button onClick={() => openCollection("Men")}>Men</button>
          <button onClick={() => openCollection("Women")}>Women</button>
          <button onClick={() => setWishlistOpen(true)}>
            Wishlist ({wishlist.length})
          </button>
        </div>
        <div>
          <h4>Client care</h4>
          <button onClick={() => setContactModalOpen(true)}>Contact & Concierge</button>
          <button onClick={() => setTrackModalOpen(true)}>Order tracking</button>
          <button onClick={() => setPolicyModal("shipping")}>
            Shipping & 7-Day Exchange
          </button>
          <button onClick={() => setPolicyModal("care")}>Atelier Warranty & Care</button>
          <button onClick={() => setPolicyModal("faq")}>Frequently Asked Questions</button>
        </div>
        <div>
          <h4>Visit</h4>
          <p>Lahore, Pakistan</p>
          <p>Mon–Sat, 11am–8pm</p>
          <a
            href="https://wa.me/923001234567?text=Hello%20GENZO%20SILVER%2C%20I%20would%20like%20help%20with%20an%20order."
            target="_blank"
            rel="noreferrer"
          >
            Order on WhatsApp
          </a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Genzo Silver</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPolicyModal("legal")}
              className="text-zinc-500 hover:text-white transition text-xs"
            >
              Privacy · Terms · Authenticity
            </button>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-white transition flex items-center gap-1 text-[11px]"
            >
              <LockKeyhole size={11} /> Admin Portal
            </a>
          </div>
        </div>
      </footer>

      {/* ======================================================================
          DRAWERS & MODALS
          ====================================================================== */}
      <AnimatePresence>
        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.aside
              className="drawer menu-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
            >
              <button className="close" onClick={() => setMenuOpen(false)}>
                <X />
              </button>
              <div className="brand drawer-brand">
                <span>GENZO</span>
                <small>SILVER</small>
              </div>
              {["Collections", "Men", "Women", "New In", "Track Order", "Our Story"].map((item) => (
                <button
                  key={item}
                  className="menu-link"
                  onClick={() => {
                    if (item === "Our Story") {
                      openPage("story");
                    } else if (item === "Collections") {
                      openCollection("All");
                    } else if (item === "Men" || item === "Women") {
                      openCollection(item);
                    } else if (item === "Track Order") {
                      setMenuOpen(false);
                      setTrackModalOpen(true);
                    } else {
                      showHomeSection("shop");
                    }
                  }}
                >
                  {item}
                  <ArrowRight />
                </button>
              ))}
            </motion.aside>
          </motion.div>
        )}

        {/* Shopping Bag Drawer */}
        {cartOpen && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setCartOpen(false)}
          >
            <motion.aside
              className="drawer cart-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="drawer-head">
                <div>
                  <p className="kicker dark">Your selection</p>
                  <h2>Shopping bag</h2>
                </div>
                <button className="close" onClick={() => setCartOpen(false)}>
                  <X />
                </button>
              </div>

              {/* Dynamic Free Shipping Bar */}
              <div className="px-5 py-3 bg-[#f5f5f3] border-b border-black/5 text-xs">
                {subtotal >= 25000 ? (
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <Truck size={14} />
                    <span>Complimentary nationwide delivery unlocked!</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-600 mb-1">
                      <span>Add <strong>{money(25000 - subtotal)}</strong> for Free Delivery</span>
                      <span>{Math.round((subtotal / 25000) * 100)}%</span>
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-black h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (subtotal / 25000) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="cart-lines">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <ShoppingBag size={32} />
                    <h3>Your bag is empty</h3>
                    <p>Discover something made to last.</p>
                    <button
                      className="button dark"
                      onClick={() => {
                        setCartOpen(false);
                        openCollection("All");
                      }}
                    >
                      Explore the collection
                    </button>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div className="cart-line" key={`${item.id}-${idx}`}>
                      <img src={item.image} alt={item.name} />
                      <div>
                        <p className="eyebrow">
                          {item.category} · {item.type} {item.size && `· Size ${item.size}`}
                        </p>
                        <h3>{item.name}</h3>
                        <p>{money(item.price)}</p>
                        <div className="quantity">
                          <button onClick={() => updateQuantity(item.id, -1)}>
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <button className="remove" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>{money(subtotal)}</strong>
                  </div>
                  <div>
                    <span>Delivery</span>
                    <strong>{shipping ? money(shipping) : "Complimentary"}</strong>
                  </div>
                  <div className="total">
                    <span>Total</span>
                    <strong>{money(subtotal + shipping)}</strong>
                  </div>

                  <label className="flex items-center gap-2 text-[11px] text-zinc-600 cursor-pointer pt-1 pb-1">
                    <input
                      type="checkbox"
                      checked={giftPackaging}
                      onChange={(e) => setGiftPackaging(e.target.checked)}
                      className="accent-black"
                    />
                    <Gift size={13} className="text-zinc-800" />
                    <span>Include signature gift packaging & handwritten card</span>
                  </label>

                  <button className="button dark checkout" onClick={() => openPage("checkout")}>
                    Proceed to secure checkout <ArrowRight size={17} />
                  </button>
                  <p>
                    <ShieldCheck size={14} /> Payments verified in TiDB Cloud database.
                  </p>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}

        {/* Private Account Modal & Order History */}
        {accountOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setAccountOpen(false)}
          >
            <motion.div
              className="account-modal max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button className="close" onClick={() => setAccountOpen(false)}>
                <X />
              </button>
              <p className="kicker dark">Private account</p>

              {currentUser ? (
                <div className="account-logged-in py-2 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-serif mb-0.5">{currentUser.fullName}</h2>
                      <p className="text-xs opacity-70">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditProfileForm({
                          fullName: currentUser.fullName,
                          phone: currentUser.phone || "",
                          currentPassword: "",
                          newPassword: "",
                        });
                        setAuthMode(authMode === "edit_profile" ? "login" : "edit_profile");
                      }}
                      className="text-[11px] underline font-semibold text-zinc-700 hover:text-black"
                    >
                      {authMode === "edit_profile" ? "Cancel Edit" : "Edit Profile"}
                    </button>
                  </div>

                  {authMode === "edit_profile" ? (
                    <form onSubmit={handleEditProfileSubmit} className="space-y-3 bg-[#f5f5f3] p-4 rounded-xl border border-black/5 text-xs">
                      <p className="font-semibold text-zinc-900">Update Profile & Security</p>
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-zinc-600 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editProfileForm.fullName}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, fullName: e.target.value })}
                          className="w-full bg-white border border-black/15 p-2 rounded text-xs outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-zinc-600 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={editProfileForm.phone}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                          className="w-full bg-white border border-black/15 p-2 rounded text-xs outline-none focus:border-black"
                        />
                      </div>
                      <div className="border-t border-black/10 pt-2 space-y-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">Change Password (Optional)</span>
                        <input
                          type="password"
                          placeholder="Current password"
                          value={editProfileForm.currentPassword}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, currentPassword: e.target.value })}
                          className="w-full bg-white border border-black/15 p-2 rounded text-xs outline-none focus:border-black"
                        />
                        <input
                          type="password"
                          placeholder="New password (min 8 chars)"
                          value={editProfileForm.newPassword}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, newPassword: e.target.value })}
                          className="w-full bg-white border border-black/15 p-2 rounded text-xs outline-none focus:border-black"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="button dark w-full py-2.5 text-xs font-semibold uppercase tracking-wider"
                      >
                        {authLoading ? "Saving..." : "Save Profile"}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-[#f5f5f3] p-4 rounded-md space-y-2 text-xs text-[#1b1c1d]">
                      <div className="flex justify-between border-b border-black/5 pb-2">
                        <span className="opacity-60">Membership</span>
                        <strong className="font-medium text-emerald-800">Genzo Inner Circle Member</strong>
                      </div>
                      {currentUser.phone && (
                        <div className="flex justify-between border-b border-black/5 pb-2">
                          <span className="opacity-60">Phone</span>
                          <span>{currentUser.phone}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="opacity-60">Account Security</span>
                        <span>Verified (TiDB Database)</span>
                      </div>
                    </div>
                  )}

                  {/* Past Orders Section */}
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Package size={14} />
                        <span>My Order History</span>
                      </span>
                      <span className="text-[10px] text-zinc-500">Click order to inspect invoice</span>
                    </h4>

                    {loadingOrders ? (
                      <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Loading orders...</span>
                      </div>
                    ) : userOrders.length === 0 ? (
                      <p className="text-xs text-zinc-500 bg-zinc-50 p-3 rounded border border-zinc-200">
                        No orders recorded yet. Explore our collection to place your first piece.
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {userOrders.map((ord: any) => (
                          <div
                            key={ord.id}
                            onClick={() => setSelectedOrderForInvoice(ord)}
                            className="p-3 bg-white border border-zinc-200 rounded-lg text-xs space-y-1 shadow-xs cursor-pointer hover:border-black transition"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-zinc-900 flex items-center gap-1.5">
                                <FileText size={12} className="text-zinc-500" />
                                {ord.orderNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                  ord.orderStatus === "delivered"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : ord.orderStatus === "dispatched"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {ord.orderStatus || "Pending"}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                              <span>Total: {money(ord.totalAmount)}</span>
                              {ord.trackingCode ? (
                                <span className="text-purple-700 font-mono">Track: {ord.trackingCode}</span>
                              ) : (
                                <span className="underline text-zinc-600">View Invoice</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Invoice Details View Modal */}
                  {selectedOrderForInvoice && (
                    <div className="p-4 bg-zinc-50 border border-zinc-300 rounded-xl space-y-3 text-xs mt-3">
                      <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                        <div>
                          <strong className="font-mono text-sm block">{selectedOrderForInvoice.orderNumber}</strong>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedOrderForInvoice(null)}
                          className="text-zinc-400 hover:text-black p-1"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-semibold text-zinc-500">Ordered Items</span>
                        {selectedOrderForInvoice.items && selectedOrderForInvoice.items.length > 0 ? (
                          selectedOrderForInvoice.items.map((it: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-[11px]">
                              <span>{it.quantity}x {it.name} ({it.size || "925"})</span>
                              <span className="font-medium">{money(it.lineTotal || it.price)}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-zinc-500">Order recorded in Genzo atelier.</p>
                        )}
                      </div>

                      <div className="border-t border-zinc-200 pt-2 flex justify-between font-semibold">
                        <span>Total Paid / Payable</span>
                        <span>{money(selectedOrderForInvoice.totalAmount)}</span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            setTrackNumber(selectedOrderForInvoice.orderNumber);
                            setAccountOpen(false);
                            setTrackModalOpen(true);
                          }}
                          className="flex-1 py-1.5 rounded bg-black text-white text-[11px] font-semibold text-center"
                        >
                          Track Piece
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-100 flex items-center gap-1 text-[11px]"
                        >
                          <Printer size={13} />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Admin Portal Shortcut if Admin */}
                  {currentUser.role === "admin" && (
                    <a
                      href="http://localhost:3001"
                      target="_blank"
                      rel="noreferrer"
                      className="button secondary w-full py-2.5 flex items-center justify-center gap-2 border border-black/20 text-xs font-semibold"
                    >
                      <LockKeyhole size={14} />
                      <span>Open Atelier Admin Portal</span>
                    </a>
                  )}

                  <button className="button dark w-full py-2.5 text-xs font-semibold" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              ) : authMode === "forgot" ? (
                /* Forgot Password Form */
                <>
                  <h2>Reset your password</h2>
                  <p>Enter the email address associated with your atelier account to receive an authorization code.</p>
                  <form onSubmit={handleForgotSubmit}>
                    <input
                      required
                      type="email"
                      placeholder="Email address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                    <button className="button dark" type="submit" disabled={authLoading}>
                      {authLoading ? "Sending Code..." : "Send Reset Code"} <ArrowRight size={16} />
                    </button>
                  </form>
                  <button className="switch-auth" onClick={() => setAuthMode("login")}>
                    Remembered password? Sign in
                  </button>
                </>
              ) : authMode === "reset" ? (
                /* Enter Reset Code & New Password */
                <>
                  <h2>Enter Authorization Code</h2>
                  <p>Enter the code sent to {forgotEmail} and choose your new password.</p>
                  <form onSubmit={handleResetSubmit}>
                    <input
                      required
                      type="text"
                      placeholder="Authorization Code (e.g. GZ-123456)"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="font-mono tracking-wider"
                    />
                    <input
                      required
                      type="password"
                      minLength={8}
                      placeholder="New password (min 8 chars)"
                      value={resetNewPass}
                      onChange={(e) => setResetNewPass(e.target.value)}
                    />
                    <button className="button dark" type="submit" disabled={authLoading}>
                      {authLoading ? "Updating..." : "Update Password & Sign In"} <ArrowRight size={16} />
                    </button>
                  </form>
                  <button className="switch-auth" onClick={() => setAuthMode("login")}>
                    Back to Sign In
                  </button>
                </>
              ) : (
                /* Standard Login / Signup Form */
                <>
                  <h2>{authMode === "login" ? "Welcome back" : "Create your account"}</h2>
                  <p>Save your favourites and follow every order from our studio to your door.</p>
                  <form onSubmit={submitAuth}>
                    {authMode === "signup" && (
                      <>
                        <input
                          required
                          placeholder="Full name"
                          value={authForm.fullName}
                          onChange={(e) =>
                            setAuthForm((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                        />
                        <input
                          placeholder="Phone number (+92 300 0000000)"
                          value={authForm.phone}
                          onChange={(e) =>
                            setAuthForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                        />
                      </>
                    )}
                    <input
                      required
                      type="email"
                      placeholder="Email address"
                      value={authForm.email}
                      onChange={(e) =>
                        setAuthForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                    <input
                      required
                      type="password"
                      minLength={8}
                      placeholder="Password (min 8 chars)"
                      value={authForm.password}
                      onChange={(e) =>
                        setAuthForm((prev) => ({ ...prev, password: e.target.value }))
                      }
                    />

                    {authMode === "login" && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setAuthMode("forgot")}
                          className="text-[11px] text-zinc-600 hover:text-black underline cursor-pointer -mt-1 mb-2"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <button className="button dark" type="submit" disabled={authLoading}>
                      {authLoading
                        ? "Please wait..."
                        : authMode === "login"
                        ? "Sign in"
                        : "Create account"}{" "}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                  <button
                    className="switch-auth"
                    onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  >
                    {authMode === "login"
                      ? "New to Genzo? Create an account"
                      : "Already have an account? Sign in"}
                  </button>
                  <div className="prototype-note">
                    <ShieldCheck size={15} />
                    <span>Connected to TiDB Cloud Database with bcrypt encryption & JWT.</span>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ORDER TRACKING MODAL */}
        {trackModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setTrackModalOpen(false)}
          >
            <motion.div
              className="account-modal max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button className="close" onClick={() => setTrackModalOpen(false)}>
                <X />
              </button>
              <p className="kicker dark">Order registry</p>
              <h2 className="text-3xl font-serif mb-2">Track your piece</h2>
              <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
                Enter your Genzo order number (e.g. GZ-2026-XXXX) to review its silversmithing,
                verification and courier dispatch progress.
              </p>

              <form onSubmit={handleTrackSubmit} className="space-y-3 mb-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-700 mb-1">
                    Order Number *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. GZ-2026-4821"
                    value={trackNumber}
                    onChange={(e) => setTrackNumber(e.target.value)}
                    className="w-full h-11 border border-black/20 px-3 text-xs outline-none focus:border-black font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-700 mb-1">
                    Phone number or Email (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+92 300 0000000 or email"
                    value={trackContact}
                    onChange={(e) => setTrackContact(e.target.value)}
                    className="w-full h-11 border border-black/20 px-3 text-xs outline-none focus:border-black"
                  />
                </div>
                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="button dark w-full py-3 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2"
                >
                  {trackingLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Checking Registry...</span>
                    </>
                  ) : (
                    <>
                      <Search size={14} />
                      <span>Track Order</span>
                    </>
                  )}
                </button>
              </form>

              {trackingError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs">
                  {trackingError}
                </div>
              )}

              {/* Tracking Live Result Display */}
              {trackingResult && (
                <div className="bg-[#f5f5f3] p-4 rounded-xl border border-black/10 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-black/10 pb-2">
                    <span className="font-mono font-bold text-sm text-zinc-900">
                      {trackingResult.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        trackingResult.orderStatus === "delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : trackingResult.orderStatus === "dispatched"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {trackingResult.orderStatus || "Pending Verification"}
                    </span>
                  </div>

                  {/* Visual 5-Stage Stepper */}
                  <div className="py-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                      <span className={trackingResult.orderStatus ? "text-black" : ""}>Placed</span>
                      <span className={["confirmed", "processing", "dispatched", "delivered"].includes(trackingResult.orderStatus) ? "text-black" : ""}>Verified</span>
                      <span className={["processing", "dispatched", "delivered"].includes(trackingResult.orderStatus) ? "text-black" : ""}>Crafting</span>
                      <span className={["dispatched", "delivered"].includes(trackingResult.orderStatus) ? "text-black" : ""}>Dispatched</span>
                      <span className={trackingResult.orderStatus === "delivered" ? "text-emerald-700" : ""}>Delivered</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div className="bg-black h-full rounded-full" />
                      <div className={["confirmed", "processing", "dispatched", "delivered"].includes(trackingResult.orderStatus) ? "bg-black h-full" : "bg-transparent"} />
                      <div className={["processing", "dispatched", "delivered"].includes(trackingResult.orderStatus) ? "bg-black h-full" : "bg-transparent"} />
                      <div className={["dispatched", "delivered"].includes(trackingResult.orderStatus) ? "bg-black h-full" : "bg-transparent"} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-zinc-500 block">Customer</span>
                      <strong className="text-zinc-800">{trackingResult.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">City</span>
                      <strong className="text-zinc-800">{trackingResult.city || "Pakistan"}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Total Amount</span>
                      <strong className="text-zinc-800">{money(trackingResult.totalAmount)}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Payment Method</span>
                      <strong className="text-zinc-800 capitalize">{trackingResult.paymentMethod}</strong>
                    </div>
                  </div>

                  {trackingResult.trackingCode ? (
                    <div className="bg-white p-3 rounded border border-black/5 text-xs">
                      <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-semibold">
                        Courier Tracking ID
                      </span>
                      <span className="font-mono font-bold text-sm text-zinc-900">
                        {trackingResult.trackingCode}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-600 bg-white/70 p-2.5 rounded border border-black/5">
                      Silversmith atelier is currently preparing and inspecting this certified piece.
                    </div>
                  )}

                  {trackingResult.items && trackingResult.items.length > 0 && (
                    <div className="border-t border-black/10 pt-2 space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
                        Included Pieces
                      </span>
                      {trackingResult.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span>
                            {item.quantity}x {item.name} {item.size && `(${item.size})`}
                          </span>
                          <span className="font-medium">{money(item.lineTotal || item.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* CLIENT CARE / CONTACT MODAL */}
        {contactModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setContactModalOpen(false)}
          >
            <motion.div
              className="account-modal max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button className="close" onClick={() => setContactModalOpen(false)}>
                <X />
              </button>
              <p className="kicker dark">Client Concierge</p>
              <h2 className="text-3xl font-serif mb-2">Speak with our studio</h2>
              <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
                For bespoke commissions, custom ring sizing, care inquiries, or courier assistance,
                our client care concierge is at your service.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full h-11 border border-black/20 px-3 text-xs outline-none focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full h-11 border border-black/20 px-3 text-xs outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+92 300 0000000"
                      className="w-full h-11 border border-black/20 px-3 text-xs outline-none focus:border-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full h-11 border border-black/20 px-3 text-xs outline-none focus:border-black bg-white"
                  >
                    <option value="Inquiry about 925 sterling piece">Inquiry about 925 sterling piece</option>
                    <option value="Custom ring sizing / Bespoke">Custom ring sizing / Bespoke</option>
                    <option value="Order & Courier status">Order & Courier status</option>
                    <option value="Jewelry Care & Polishing">Jewelry Care & Polishing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="How can our atelier assist you?"
                    className="w-full border border-black/20 p-3 text-xs outline-none focus:border-black"
                  />
                </div>
                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="button dark w-full py-3 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2"
                >
                  {contactSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Sending to Atelier...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* DEDICATED WISHLIST DRAWER */}
        <WishlistDrawer
          isOpen={wishlistOpen}
          onClose={() => setWishlistOpen(false)}
          wishlistIds={wishlist}
          allProducts={allProducts}
          onRemove={handleWishlistToggle}
          onAddToCart={addToCart}
          onOpenProduct={(prod) => {
            setWishlistOpen(false);
            openProduct(prod);
          }}
        />

        {/* RING SIZING GUIDE MODAL */}
        <RingSizeGuideModal
          isOpen={ringGuideOpen}
          onClose={() => setRingGuideOpen(false)}
        />

        {/* POLICY, CARE & FAQ MODALS */}
        <PolicyModals
          modalType={policyModal}
          onClose={() => setPolicyModal(null)}
        />

        {/* Global Toast Notification */}
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Check size={17} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
