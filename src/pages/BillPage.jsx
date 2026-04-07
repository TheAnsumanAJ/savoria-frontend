import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/api';
import { showToast } from '../components/ui/ToastContainer';

export default function BillPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(orderId);
        setOrder(res.data);
      } catch (err) {
        showToast('Failed to load bill details', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-500 font-medium">Loading your bill...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Bill Not Found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold"
        >
          Go Home
        </button>
      </div>
    );
  }

  const date = new Date(order.createdAt).toLocaleString();
  const subtotal = order.total / 1.05; // Assuming 5% GST was included
  const gst = order.total - subtotal;

  return (
    <div className="min-h-screen bg-stone-100 py-10 px-4">
      <div className="max-w-[450px] mx-auto bg-white p-6 sm:p-10 border border-stone-200 rounded-lg shadow-xl relative overflow-hidden">
        {/* Receipt Header Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
        
        <div className="text-center mb-8">
          <div className="text-3xl font-black text-stone-900 tracking-tighter">SAVORIA</div>
          <div className="text-[10px] tracking-[3px] text-amber-600 font-bold uppercase mb-2">Fine Dining & Bistro</div>
          <div className="text-xs text-stone-500 leading-tight">
            Food Galaxy<br />
            Rourkela, Odisha 769014<br />
            Tel: +91 674 234 5678
          </div>
        </div>

        <div className="border-y border-dashed border-stone-300 py-4 mb-6 grid grid-cols-2 gap-y-2 text-xs">
          <div className="text-stone-500 uppercase font-bold text-[10px]">Order ID</div>
          <div className="text-right font-mono font-bold text-stone-800">#{order._id.slice(-8).toUpperCase()}</div>
          
          <div className="text-stone-500 uppercase font-bold text-[10px]">Date & Time</div>
          <div className="text-right text-stone-800">{date}</div>
          
          <div className="text-stone-500 uppercase font-bold text-[10px]">Customer</div>
          <div className="text-right text-stone-800 font-medium">{order.name}</div>

          <div className="text-stone-500 uppercase font-bold text-[10px]">Order Type</div>
          <div className="text-right text-stone-800 font-bold uppercase">
            {order.type === 'table_order' ? `Dine-In (Table ${order.tableNumber})` : 'Delivery'}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-[10px] font-black text-stone-400 uppercase tracking-widest border-b pb-2">
            <span>Item Description</span>
            <span>Amount</span>
          </div>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm">
              <div className="flex-1 pr-4">
                <div className="font-bold text-stone-800">{item.name}</div>
                <div className="text-xs text-stone-500">{item.quantity} x ₹{item.price.toFixed(2)}</div>
              </div>
              <span className="font-mono font-bold text-stone-900">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 pt-4 space-y-2 mb-6">
          <div className="flex justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-stone-600">
            <span>GST (5%)</span>
            <span className="font-mono">₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-black text-stone-900 pt-2 border-t-2 border-stone-800">
            <span>TOTAL</span>
            <span className="font-mono text-amber-700">₹{order.total.toFixed(2)}</span>
          </div>
        </div>

        {order.paymentStatus === 'Paid' && (
          <div className="mb-8 p-4 bg-stone-50 rounded-lg border border-dashed border-stone-300">
            <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 text-center">Payment Information</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Method</span>
                <span className="font-bold text-stone-800 uppercase">{order.paymentMethod}</span>
              </div>
              {order.paymentMethod === 'Online' && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Transaction ID</span>
                  <span className="font-mono text-stone-800">{order.razorpayPaymentId || 'N/A'}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Status</span>
                <span className="font-bold text-green-600 uppercase">Success / Paid</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-4 mb-4">
          
          <div className="text-[10px] text-stone-400 font-medium italic">
            Thank you for your visit!<br />
            Team Savoria 🫶
          </div>
        </div>

        <div className="flex flex-col gap-3 no-print mt-10">
          <button 
            onClick={() => window.print()}
            className="w-full py-4 bg-stone-900 text-white font-black rounded-xl hover:bg-stone-800 transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95"
          >
            <span>📥</span> DOWNLOAD / PRINT RECEIPT
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-3 bg-stone-100 text-stone-500 font-bold rounded-xl hover:bg-stone-200 transition-colors text-sm"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        .font-mono { font-family: 'Space+Mono', monospace; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .max-w-[450px] { border: none !important; shadow: none !important; margin: 0 auto !important; width: 100% !important; max-width: 100% !important; }
          .shadow-xl { box-shadow: none !important; }
        }
      `}} />
    </div>
  );
}
