import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { createOrder } from '../../services/api';
import { showToast } from '../ui/ToastContainer';

export default function OrderOnline({ tableId = null }) {
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart, activeReservationId } = useCart();
  const { user } = useAuth();
  const { refreshData, reservations } = useBooking();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      showToast('Please add items to your cart first', 'error');
      return;
    }

    setLoading(true);

    let reservationId = activeReservationId;
    if (!reservationId && tableId) {
      // Fallback search for active reservation for this table
      const activeRes = reservations.find(r => r.tableNumber === parseInt(tableId) && r.status === 'Confirmed');
      if (activeRes) {
        reservationId = activeRes._id;
      }
    }

    try {
      const orderPayload = {
        ...formData,
        items: cart,
        total: totalPrice,
        type: tableId ? 'table_order' : 'delivery',
        tableNumber: tableId ? parseInt(tableId) : null,
        reservationId,
        userEmail: user?.email || formData.email || 'guest@savoria.com'
      };
      
      // If table order, we can omit name/phone/email if empty
      if (tableId) {
        orderPayload.name = user?.name || `Table ${tableId} Guest`;
        orderPayload.email = user?.email || `table${tableId}@savoria.com`;
        orderPayload.phone = formData.phone || 'N/A';
      }

      await createOrder(orderPayload);

      showToast('Order placed successfully! 🎉');
      clearCart();
      refreshData();
      
      if (tableId) {
        setShowSuccessDialog(true);
      } else {
        navigate('/reservations'); // Redirect for delivery orders
      }
    } catch (err) {
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 fade-in">
          <p className="text-amber-500 font-medium tracking-widest uppercase mb-2">Hungry?</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            {tableId ? `Order for Table #${tableId}` : 'Order Online'}
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Section */}
          <div className="lg:col-span-2 fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-stone-800 rounded-2xl p-6">
              <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
                <span>🛒</span> Your Cart 
                <span className="bg-amber-600 text-sm px-3 py-1 rounded-full">{totalItems}</span>
              </h3>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <p className="text-stone-400 text-center py-8 border border-dashed border-stone-600 rounded-lg">
                    Your cart is empty. Add items from the menu!
                  </p>
                ) : (
                  cart.map(item => (
                    <div key={item.menuItemId} className="flex items-center gap-4 bg-stone-700 rounded-lg p-4">
                      <span className="text-3xl">{item.emoji}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-amber-500">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-3 bg-stone-800 rounded-full px-2 py-1">
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.menuItemId, -1)} 
                          className="w-8 h-8 flex items-center justify-center bg-stone-600 hover:bg-stone-500 rounded-full transition-colors font-bold text-lg"
                        >−</button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.menuItemId, 1)} 
                          className="w-8 h-8 flex items-center justify-center bg-stone-600 hover:bg-stone-500 rounded-full transition-colors font-bold text-lg"
                        >+</button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeFromCart(item.menuItemId)} 
                        className="text-red-400 hover:text-red-300 ml-2 p-2"
                        title="Remove item"
                      >✕</button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-stone-700 pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span> 
                  <span className="text-amber-500">₹{totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-stone-800 rounded-2xl p-6 hover:shadow-xl transition-shadow border border-stone-700">
              <h3 className="font-display text-2xl font-bold mb-6">
                {tableId ? 'Order Details' : 'Delivery Details'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!tableId ? (
                  <>
                    <div>
                      <label className="block text-stone-400 mb-2 text-sm font-medium">Full Name *</label>
                      <input 
                        type="text" name="name" required value={formData.name} onChange={handleChange}
                        className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors" 
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-2 text-sm font-medium">Email *</label>
                      <input 
                        type="email" name="email" required value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors" 
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-2 text-sm font-medium">Phone *</label>
                      <input 
                        type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                        className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors" 
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-2 text-sm font-medium">Delivery Address *</label>
                      <textarea 
                        name="address" required value={formData.address} onChange={handleChange} rows="2" 
                        className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors resize-none" 
                        placeholder="123 Main St, City"
                      ></textarea>
                    </div>
                  </>
                ) : null}

                <div>
                  <label className="block text-stone-400 mb-2 text-sm font-medium">Special Instructions</label>
                  <textarea 
                    name="notes" value={formData.notes} onChange={handleChange} rows="2" 
                    className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors resize-none" 
                    placeholder="Any allergies or preferences?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || cart.length === 0}
                  className={`w-full py-4 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] shadow-lg ${
                    loading || cart.length === 0 
                      ? 'bg-stone-600 cursor-not-allowed opacity-70' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {loading ? 'Processing...' : `Place Order (₹${totalPrice})`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Order Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-800 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-amber-500/30 text-center relative overflow-hidden group">
            {/* Animated background element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors duration-700"></div>
            
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg shadow-amber-600/20 animate-bounce">
              🍕
            </div>
            
            <h3 className="font-display text-3xl font-bold text-white mb-2">Order Confirmed!</h3>
            <p className="text-stone-300 mb-8">
              Your delicious meal is being prepared for <strong className="text-amber-500">Table #{tableId}</strong>.
            </p>
            
            <div className="bg-stone-700/50 rounded-2xl p-6 mb-8 border border-stone-600">
              <p className="text-amber-500 font-bold mb-2 flex items-center justify-center gap-2">
                <span>🎮</span> Bored while you wait?
              </p>
              <h4 className="text-white font-semibold text-lg mb-4">Try some fun games and win coupons!</h4>
              <button 
                onClick={() => navigate('/entertainment')}
                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-600/30 flex items-center justify-center gap-3 group/btn"
              >
                Let's Play Games <span className="group-hover/btn:translate-x-1 transition-transform">➡️</span>
              </button>
            </div>
            
            <button 
              onClick={() => navigate('/reservations')}
              className="text-stone-400 hover:text-white font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <span>🧾</span> Skip, track my order
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
