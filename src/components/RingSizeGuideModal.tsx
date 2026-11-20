import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Check, HelpCircle } from 'lucide-react';

interface RingSizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RingSizeGuideModal({ isOpen, onClose }: RingSizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'guide'>('chart');

  if (!isOpen) return null;

  const sizeChartData = [
    { pkSize: '16', innerDiameter: '17.8 mm', circumference: '56.0 mm', usSize: '7.5', ukSize: 'P' },
    { pkSize: '18', innerDiameter: '18.5 mm', circumference: '58.2 mm', usSize: '8.5', ukSize: 'R' },
    { pkSize: '20', innerDiameter: '19.2 mm', circumference: '60.3 mm', usSize: '9.5', ukSize: 'T' },
    { pkSize: '22', innerDiameter: '20.0 mm', circumference: '62.8 mm', usSize: '10.5', ukSize: 'V' },
  ];

  return (
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

        <p className="kicker dark flex items-center gap-1.5">
          <Sparkles size={13} />
          <span>Atelier Silversmith Guide</span>
        </p>
        <h2 className="text-3xl font-serif mb-2">Ring Sizing Chart</h2>
        <p className="text-xs text-zinc-600 mb-5 leading-relaxed">
          Every GENZO band and signet ring is hand-sculpted in solid 925 sterling silver with comfort-fit beveled interior edges.
        </p>

        {/* Tab Switcher */}
        <div className="flex border-b border-black/10 mb-5 text-xs font-semibold uppercase tracking-wider">
          <button
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'chart'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-400 hover:text-black'
            }`}
            onClick={() => setActiveTab('chart')}
          >
            Size Conversion Table
          </button>
          <button
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-400 hover:text-black'
            }`}
            onClick={() => setActiveTab('guide')}
          >
            How to Measure at Home
          </button>
        </div>

        {activeTab === 'chart' ? (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-black/10 rounded-xl bg-white shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f5f5f3] text-zinc-700 uppercase tracking-wider text-[10px] font-semibold border-b border-black/10">
                  <tr>
                    <th className="py-3 px-3">Genzo Size (PK)</th>
                    <th className="py-3 px-3">Inner Diameter</th>
                    <th className="py-3 px-3">Circumference</th>
                    <th className="py-3 px-3">US Size</th>
                    <th className="py-3 px-3">UK / Aus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-mono text-[11px]">
                  {sizeChartData.map((row) => (
                    <tr key={row.pkSize} className="hover:bg-zinc-50/70 transition">
                      <td className="py-2.5 px-3 font-bold text-zinc-900 font-sans">{row.pkSize}</td>
                      <td className="py-2.5 px-3 text-zinc-700">{row.innerDiameter}</td>
                      <td className="py-2.5 px-3 text-zinc-700">{row.circumference}</td>
                      <td className="py-2.5 px-3 text-zinc-500">{row.usSize}</td>
                      <td className="py-2.5 px-3 text-zinc-500">{row.ukSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-[#f5f5f3] rounded-lg border border-black/5 text-xs text-zinc-600 space-y-1">
              <p className="font-semibold text-zinc-800">Need a custom or intermediate ring size?</p>
              <p className="text-[11px] leading-relaxed">
                We handcraft bespoke sizes (15, 17, 19, 21, 23+) upon request with zero sizing surcharge.
                Simply specify your requirement in order delivery notes or speak with concierge.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-zinc-700 leading-relaxed">
            <div className="flex gap-3 bg-[#f5f5f3] p-4 rounded-xl border border-black/5">
              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold shrink-0 text-xs">
                1
              </div>
              <div>
                <strong className="block text-zinc-900 font-semibold mb-1">
                  The Strip of Paper Method
                </strong>
                <p className="text-zinc-600 text-[11px]">
                  Wrap a narrow strip of paper or non-stretchy string snugly around the base of the intended finger.
                  Make sure it can slide smoothly over your knuckle.
                </p>
              </div>
            </div>

            <div className="flex gap-3 bg-[#f5f5f3] p-4 rounded-xl border border-black/5">
              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold shrink-0 text-xs">
                2
              </div>
              <div>
                <strong className="block text-zinc-900 font-semibold mb-1">
                  Mark and Measure
                </strong>
                <p className="text-zinc-600 text-[11px]">
                  With a fine pen, mark where the paper overlaps. Lay the strip flat against a metric millimeter ruler to get your circumference in mm.
                </p>
              </div>
            </div>

            <div className="flex gap-3 bg-[#f5f5f3] p-4 rounded-xl border border-black/5">
              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold shrink-0 text-xs">
                3
              </div>
              <div>
                <strong className="block text-zinc-900 font-semibold mb-1">
                  Complimentary 7-Day Resizing & Exchange
                </strong>
                <p className="text-zinc-600 text-[11px]">
                  If your ring does not fit like a glove, our studio provides complimentary size exchange across Pakistan within 7 days of delivery.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          className="button dark w-full mt-6 py-3 text-xs uppercase tracking-wider font-semibold"
          onClick={onClose}
        >
          Got it, Close Guide
        </button>
      </motion.div>
    </motion.div>
  );
}
