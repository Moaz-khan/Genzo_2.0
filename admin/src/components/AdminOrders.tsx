import React, { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle,
  Eye,
  X,
  Truck,
  CreditCard,
  RefreshCw,
  FileText,
  Download,
  Printer,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    orderStatus: '',
    paymentStatus: '',
    trackingCode: '',
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        status: statusFilter,
        search,
      });
      if (res.success) {
        setOrders(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openOrderModal = (order: any) => {
    setSelectedOrder(order);
    setUpdateForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingCode: order.trackingCode || '',
    });
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await adminApi.updateOrder(selectedOrder.id, updateForm);
      if (res.success) {
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Export Orders to CSV for Logistics
  const handleExportCSV = () => {
    if (orders.length === 0) return alert('No orders to export.');
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'Email',
      'Address',
      'City',
      'Total Amount (PKR)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Tracking Code',
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${o.customerEmail || ''}"`,
      `"${(o.streetAddress || '').replace(/"/g, '""')}"`,
      `"${o.city || ''}"`,
      `"${o.totalAmount || 0}"`,
      `"${o.paymentMethod || ''}"`,
      `"${o.paymentStatus || ''}"`,
      `"${o.orderStatus || ''}"`,
      `"${o.trackingCode || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `genzo_orders_manifest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Packing Slip / Invoice
  const handlePrintSlip = (order: any) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return alert('Please allow popups to print packing slips.');

    const itemsHtml = (order.items || [])
      .map(
        (i: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            <strong>${i.name}</strong><br/>
            <small style="color: #666;">Size: ${i.size || 'One size'}</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${i.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatPKR(i.price)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatPKR(i.lineTotal || i.price * i.quantity)}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Packing Slip — ${order.orderNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #111; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 20px; }
            .brand { font-size: 26px; font-weight: bold; letter-spacing: 2px; }
            .brand small { display: block; font-size: 10px; letter-spacing: 4px; color: #666; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th { text-align: left; background: #f5f5f5; padding: 10px; font-size: 11px; text-transform: uppercase; }
            .total-box { margin-top: 30px; text-align: right; }
            .total-box p { margin: 4px 0; }
            .hallmark-seal { margin-top: 40px; padding: 15px; border: 1px dashed #aaa; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">GENZO<small>SILVER ATELIER</small></div>
              <p style="font-size: 12px; color: #666; margin-top: 5px;">Certified 925 Sterling Silver</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 20px;">PACKING SLIP & INVOICE</h2>
              <p style="margin: 4px 0; font-family: monospace; font-size: 16px; font-weight: bold;">${order.orderNumber}</p>
              <small style="color: #666;">Date: ${new Date(order.createdAt).toLocaleDateString()}</small>
            </div>
          </div>

          <div class="grid">
            <div>
              <strong style="font-size: 11px; text-transform: uppercase; color: #888;">Delivery To:</strong>
              <h3 style="margin: 5px 0 3px 0;">${order.customerName}</h3>
              <p style="margin: 0; font-size: 13px; color: #444;">${order.streetAddress}</p>
              <p style="margin: 2px 0; font-size: 13px; color: #444;">${order.city}, ${order.postalCode || ''}</p>
              <p style="margin: 4px 0; font-size: 13px; font-weight: bold;">Phone: ${order.customerPhone}</p>
            </div>
            <div>
              <strong style="font-size: 11px; text-transform: uppercase; color: #888;">Dispatch Details:</strong>
              <p style="margin: 5px 0 2px 0; font-size: 13px;"><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
              <p style="margin: 2px 0; font-size: 13px;"><strong>Status:</strong> ${order.orderStatus.toUpperCase()}</p>
              ${order.trackingCode ? `<p style="margin: 2px 0; font-size: 13px;"><strong>Courier Tracking:</strong> ${order.trackingCode}</p>` : ''}
              ${order.deliveryNotes ? `<p style="margin: 4px 0; font-size: 12px; color: #666; font-style: italic;">Notes: "${order.deliveryNotes}"</p>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Piece Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="4" style="padding: 10px;">Ordered items recorded in atelier registry.</td></tr>'}
            </tbody>
          </table>

          <div class="total-box">
            <p style="font-size: 14px;">Subtotal: <strong>${formatPKR(order.subtotal || order.totalAmount)}</strong></p>
            ${order.discountAmount > 0 ? `<p style="font-size: 13px; color: #166534;">Promo Discount: -${formatPKR(order.discountAmount)}</p>` : ''}
            <p style="font-size: 14px;">Courier Delivery: <strong>${order.shippingFee ? formatPKR(order.shippingFee) : 'Complimentary'}</strong></p>
            <h3 style="margin-top: 10px; font-size: 18px;">Total: ${formatPKR(order.totalAmount)}</h3>
          </div>

          <div class="hallmark-seal">
            ★ Certified 925 Sterling Silver Authenticity Hallmark Verified ★<br/>
            Tamper-proof signature presentation box sealed by Genzo Master Silversmith.
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-white">Orders Management</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track and verify customer orders, courier status, and payment receipts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          >
            <Download size={14} />
            <span>Export CSV Manifest</span>
          </button>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          >
            <RefreshCw size={14} />
            <span>Refresh List</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-900/90 rounded-lg border border-zinc-800 text-xs">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending_verification', label: 'Pending Review' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'dispatched', label: 'Dispatched' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                statusFilter === tab.id
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[280px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by order #, client name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
          />
        </form>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-xl border silver-border overflow-hidden bg-zinc-950/40">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
            <span>Retrieving atelier orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No orders match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Order Number</th>
                  <th className="py-3.5 px-4 font-medium">Customer</th>
                  <th className="py-3.5 px-4 font-medium">Payment</th>
                  <th className="py-3.5 px-4 font-medium">Total (PKR)</th>
                  <th className="py-3.5 px-4 font-medium">Order Status</th>
                  <th className="py-3.5 px-4 font-medium">Tracking</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {orders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-white tracking-wide">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-medium text-white">{order.customerName}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {order.customerPhone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="capitalize font-medium text-zinc-200">
                          {order.paymentMethod}
                        </div>
                        {order.receiptUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5">
                            <FileText size={11} /> Receipt attached
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {formatPKR(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            order.orderStatus === 'delivered'
                              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                              : order.orderStatus === 'dispatched'
                              ? 'bg-purple-950/60 border border-purple-800 text-purple-300'
                              : order.orderStatus === 'confirmed'
                              ? 'bg-blue-950/60 border border-blue-800 text-blue-300'
                              : 'bg-amber-950/60 border border-amber-800 text-amber-300'
                          }`}
                        >
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        {order.trackingCode ? (
                          <span className="font-mono text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-[11px]">
                            {order.trackingCode}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[11px] italic">Not dispatched</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handlePrintSlip(order)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition"
                            title="Print Packing Slip"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => openOrderModal(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspection & Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121315] border border-zinc-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-xs text-zinc-300 shadow-2xl">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Order Inspection
                </span>
                <h3 className="text-xl font-bold text-white font-mono mt-0.5">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintSlip(selectedOrder)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5 text-xs font-medium"
                >
                  <Printer size={13} />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-6 pt-5">
              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                    Client Name
                  </span>
                  <span className="text-white font-medium text-sm">
                    {selectedOrder.customerName}
                  </span>
                  <span className="text-zinc-400 block text-xs mt-0.5 font-mono">
                    {selectedOrder.customerPhone}
                  </span>
                  <span className="text-zinc-400 block text-xs font-mono">
                    {selectedOrder.customerEmail}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                    Delivery Address
                  </span>
                  <span className="text-zinc-200 block">
                    {selectedOrder.streetAddress}, {selectedOrder.city}
                  </span>
                  <span className="text-zinc-400 block font-mono text-[11px]">
                    Postal Code: {selectedOrder.postalCode}
                  </span>
                  {selectedOrder.deliveryNotes && (
                    <span className="text-amber-300/80 block italic text-[11px] mt-1">
                      Note: "{selectedOrder.deliveryNotes}"
                    </span>
                  )}
                </div>
              </div>

              {/* Order Line Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="space-y-2">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider">
                    Purchased Pieces ({selectedOrder.items.length})
                  </span>
                  <div className="border border-zinc-800 rounded-xl divide-y divide-zinc-800/80 overflow-hidden bg-zinc-900/40">
                    {selectedOrder.items.map((it: any, idx: number) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {it.image && (
                            <img
                              src={it.image}
                              alt={it.name}
                              className="w-10 h-10 object-cover rounded bg-zinc-800"
                            />
                          )}
                          <div>
                            <span className="text-white font-medium block">{it.name}</span>
                            <span className="text-zinc-400 text-[11px]">
                              Size: {it.size || 'One size'} · Qty: {it.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-white font-mono">
                          {formatPKR(it.lineTotal || it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Receipt Image (if uploaded) */}
              {selectedOrder.receiptUrl && (
                <div className="space-y-2">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider flex items-center gap-1.5">
                    <FileText size={13} />
                    <span>Customer Uploaded Payment Receipt</span>
                  </span>
                  <div className="border border-zinc-800 rounded-xl p-2 bg-zinc-900/50">
                    <img
                      src={`http://localhost:5000${selectedOrder.receiptUrl}`}
                      alt="Receipt"
                      className="max-h-60 rounded-lg mx-auto object-contain cursor-pointer hover:opacity-90"
                      onClick={() =>
                        window.open(`http://localhost:5000${selectedOrder.receiptUrl}`, '_blank')
                      }
                    />
                  </div>
                </div>
              )}

              {/* Status Update Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800 pt-5">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Order Status</label>
                  <select
                    value={updateForm.orderStatus}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, orderStatus: e.target.value }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="pending_verification">Pending Verification</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing in Studio</option>
                    <option value="dispatched">Dispatched with Courier</option>
                    <option value="delivered">Delivered to Client</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Payment Status</label>
                  <select
                    value={updateForm.paymentStatus}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, paymentStatus: e.target.value }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="pending">Pending Verification</option>
                    <option value="verified">Verified (Funds Received)</option>
                    <option value="failed">Failed / Invalid Receipt</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Courier Tracking Code (TCS / Leopard / Swyft)
                  </label>
                  <div className="relative">
                    <Truck
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      type="text"
                      value={updateForm.trackingCode}
                      onChange={(e) =>
                        setUpdateForm((prev) => ({ ...prev, trackingCode: e.target.value }))
                      }
                      placeholder="e.g. TCS-7894561230"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={updating}
                  className="px-5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle size={15} />
                  <span>{updating ? 'Saving Changes...' : 'Save & Update Order'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
