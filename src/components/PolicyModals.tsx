import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, ShieldCheck, Sparkles, HelpCircle, FileText, ChevronDown } from 'lucide-react';

export type PolicyModalType = 'shipping' | 'care' | 'legal' | 'faq' | null;

interface PolicyModalsProps {
  modalType: PolicyModalType;
  onClose: () => void;
}

export default function PolicyModals({ modalType, onClose }: PolicyModalsProps) {
  if (!modalType) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
        style={{ zIndex: 130 }}
      >
        <motion.div
          className="account-modal max-w-xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button className="close" onClick={onClose}>
            <X size={18} />
          </button>

          {/* 1. SHIPPING & RETURNS */}
          {modalType === 'shipping' && (
            <div className="space-y-5 text-xs text-zinc-700">
              <div>
                <p className="kicker dark flex items-center gap-1.5">
                  <Truck size={14} />
                  <span>Nationwide Logistics</span>
                </p>
                <h2 className="text-3xl font-serif text-[#1c1d1e] mt-1">Delivery & 7-Day Exchange</h2>
              </div>

              <div className="bg-[#f5f5f3] p-4 rounded-xl space-y-3 border border-black/5">
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <span className="font-semibold text-zinc-900">Complimentary Courier</span>
                  <span className="text-emerald-800 font-semibold">Orders over PKR 25,000</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <span className="font-semibold text-zinc-900">Standard Delivery Fee</span>
                  <span>PKR 450 (Nationwide Tracked)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-zinc-900">Dispatch Timeline</span>
                  <span>2–4 business days with signature box</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px]">
                  7-Day Complimentary Exchange Policy
                </h4>
                <p className="leading-relaxed">
                  We take pride in our precision silversmithing. If your piece requires ring resizing, a chain length adjustment, or you wish to exchange for an alternative design, you may request an exchange within 7 calendar days of receipt.
                </p>
                <p className="leading-relaxed">
                  Items must be in pristine, unworn condition with the original tamper-proof presentation box and authenticity certificate card intact.
                </p>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-500">
                Courier Partners: TCS Express, Leopards Courier, Trax Logistics with tamper-evident tracking seals.
              </div>
            </div>
          )}

          {/* 2. JEWELRY CARE GUIDE */}
          {modalType === 'care' && (
            <div className="space-y-5 text-xs text-zinc-700">
              <div>
                <p className="kicker dark flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>Atelier Silversmith Maintenance</span>
                </p>
                <h2 className="text-3xl font-serif text-[#1c1d1e] mt-1">925 Sterling Silver Care</h2>
              </div>

              <p className="leading-relaxed">
                Genuine 925 sterling silver is a precious noble metal designed to be worn daily. The natural oils of your skin actually help maintain its protective barrier. Follow these atelier principles:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-[#f5f5f3] rounded-xl border border-black/5 space-y-1">
                  <strong className="text-zinc-900 block font-semibold">Microfiber Silver Cloth</strong>
                  <p className="text-[11px] text-zinc-600">
                    Use the Genzo polishing cloth included in your order. Gently buff in back-and-forth strokes rather than circular motions.
                  </p>
                </div>
                <div className="p-4 bg-[#f5f5f3] rounded-xl border border-black/5 space-y-1">
                  <strong className="text-zinc-900 block font-semibold">Chemical Exposure</strong>
                  <p className="text-[11px] text-zinc-600">
                    Avoid spraying concentrated perfumes or applying hand sanitizers directly onto your silver pieces.
                  </p>
                </div>
                <div className="p-4 bg-[#f5f5f3] rounded-xl border border-black/5 space-y-1">
                  <strong className="text-zinc-900 block font-semibold">Anti-Tarnish Atelier Pouch</strong>
                  <p className="text-[11px] text-zinc-600">
                    When traveling or storing, place each piece in its individual micro-suede pouch to prevent contact friction.
                  </p>
                </div>
                <div className="p-4 bg-[#f5f5f3] rounded-xl border border-black/5 space-y-1">
                  <strong className="text-zinc-900 block font-semibold">One-Year Atelier Warranty</strong>
                  <p className="text-[11px] text-zinc-600">
                    Complimentary ultrasonic cleaning, repolishing, and hallmark verification at our Lahore atelier for 12 months.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. PRIVACY & TERMS */}
          {modalType === 'legal' && (
            <div className="space-y-5 text-xs text-zinc-700">
              <div>
                <p className="kicker dark flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>Trust & Transparency</span>
                </p>
                <h2 className="text-3xl font-serif text-[#1c1d1e] mt-1">Privacy & Client Terms</h2>
              </div>

              <div className="space-y-3 leading-relaxed">
                <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px]">
                  01. Data Protection & Security
                </h4>
                <p>
                  GENZO SILVER strictly protects client information. Your passwords are encrypted with bcrypt, checkout sessions utilize 256-bit TLS encryption, and payment proofs are stored securely on private cloud infrastructure. We never sell customer records to third parties.
                </p>

                <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px] pt-2">
                  02. 925 Hallmark Authenticity Guarantee
                </h4>
                <p>
                  Every piece crafted under the GENZO atelier imprint is certified solid 925 sterling silver (92.5% pure elemental silver). Each piece bears the authorized Genzo hallmark stamp.
                </p>

                <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px] pt-2">
                  03. Payment Verification Terms
                </h4>
                <p>
                  Orders placed through JazzCash, Easypaisa, or Direct Bank Transfer are verified against uploaded transaction receipts or bank reference IDs prior to atelier packaging.
                </p>
              </div>
            </div>
          )}

          {/* 4. FAQ */}
          {modalType === 'faq' && <FaqContent />}

          <button
            className="button dark w-full mt-6 py-3 text-xs uppercase tracking-wider font-semibold"
            onClick={onClose}
          >
            Close Notice
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FaqContent() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is Genzo Silver solid 925 sterling silver or silver plated?',
      a: 'All Genzo pieces are cast in solid 925 sterling silver (92.5% pure silver with 7.5% hardening noble alloys). We never produce plated or copper-base jewelry.',
    },
    {
      q: 'Will my silver jewelry tarnish over time?',
      a: 'Pure sterling silver naturally oxidizes slightly over months of exposure to sulfur in the air. However, regular wear and a quick swipe with the provided silver microfiber cloth restores factory mirror shine in seconds.',
    },
    {
      q: 'Can I wear my pieces in the shower or gym?',
      a: 'Freshwater will not harm solid 925 sterling silver. However, we recommend removing jewelry prior to chlorinated swimming pools, spas, or heavy weightlifting to avoid surface scratching.',
    },
    {
      q: 'How does Cash on Delivery (COD) work?',
      a: 'Select Cash on Delivery at checkout. Once confirmed, your package is dispatched with our verified courier. You simply pay the exact total amount in cash upon receiving your signature box.',
    },
    {
      q: 'How can I request a custom ring size or bespoke piece?',
      a: 'Select "Custom ring sizing / Bespoke" through our Client Concierge modal or message us on WhatsApp with your exact finger measurements.',
    },
  ];

  return (
    <div className="space-y-4 text-xs text-zinc-700">
      <div>
        <p className="kicker dark flex items-center gap-1.5">
          <HelpCircle size={14} />
          <span>Knowledge Base</span>
        </p>
        <h2 className="text-3xl font-serif text-[#1c1d1e] mt-1">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-2.5">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border border-black/10 rounded-xl overflow-hidden bg-[#fafaf8]"
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full text-left p-3.5 flex justify-between items-center font-medium text-zinc-900 text-xs"
            >
              <span>{faq.q}</span>
              <ChevronDown
                size={14}
                className={`transition-transform shrink-0 ml-2 ${
                  openIdx === i ? 'rotate-180 text-black' : 'text-zinc-400'
                }`}
              />
            </button>
            {openIdx === i && (
              <div className="p-3.5 pt-0 text-[11px] text-zinc-600 leading-relaxed border-t border-black/5">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
