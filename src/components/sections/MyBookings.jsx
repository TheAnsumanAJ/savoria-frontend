import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { 
  cancelReservation, 
  updateReservationStatus, 
  cancelOrder, 
  createRazorpayOrder, 
  verifyPayment, 
  markAsCashPaid,
  createRazorpayReservationOrder,
  verifyReservationPayment,
  markReservationAsCashPaid
} from '../../services/api';
import { showToast } from '../ui/ToastContainer';

export default function MyBookings() {
  const { user } = useAuth();
  const { reservations, orders, loading, refreshData } = useBooking();
  const [activeTab, setActiveTab] = useState('orders');
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [paymentReservation, setPaymentReservation] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <section id="my-bookings" className="py-20 bg-white text-stone-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-stone-900 mb-6">Track Your Activity</h2>
          <p className="text-stone-600 mb-8">Please sign in to view your orders and reservations.</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </section>
    );
  }

  const handleCancelReservation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await cancelReservation(id);
        showToast('Reservation cancelled successfully');
        refreshData();
      } catch (err) {
        showToast('Failed to cancel reservation', 'error');
      }
    }
  };

  const handleCompleteReservation = async (id) => {
    if (window.confirm('Are you finished with your meal? This will free the table for other guests.')) {
      try {
        await updateReservationStatus(id, 'Completed');
        showToast('Session completed! Thank you for dining with us. ✨');
        refreshData();
      } catch (err) {
        showToast('Failed to complete session', 'error');
      }
    }
  };

  const handleCancelOrder = async (id) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder(id);
        showToast('Order cancelled successfully');
        refreshData();
      } catch (err) {
        showToast('Failed to cancel order', 'error');
      }
    }
  };

  const handleTableOrder = (tableId, resId = null) => {
    const path = resId ? `/ordernow/${tableId}/${resId}` : `/ordernow/${tableId}`;
    navigate(path);
  };

  const handleGenerateBill = (order) => {
    window.open(`/bill/${order._id}`, '_blank');
  };

  const handlePayment = async (method) => {
    setIsPaying(true);
    try {
      if (method === 'Cash') {
        if (paymentReservation) {
          await markReservationAsCashPaid({ reservationId: paymentReservation._id });
          showToast('All table orders marked as paid via Cash.');
          setPaymentReservation(null);
        } else {
          await markAsCashPaid({ orderId: paymentOrder._id });
          showToast('Order marked as paid via Cash.');
          setPaymentOrder(null);
        }
        refreshData();
      } else if (method === 'Online') {
        let rzpOrder;
        if (paymentReservation) {
          const res = await createRazorpayReservationOrder({ reservationId: paymentReservation._id });
          rzpOrder = res.data;
        } else {
          const res = await createRazorpayOrder({ orderId: paymentOrder._id });
          rzpOrder = res.data;
        }
        
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "Savoria Restaurant",
          description: paymentReservation ? `Table #${paymentReservation.tableNumber} Payment` : `Order #${paymentOrder._id.slice(-6)}`,
          order_id: rzpOrder.id,
          handler: async (response) => {
            try {
              if (paymentReservation) {
                await verifyReservationPayment({
                  reservationId: paymentReservation._id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                showToast('Table payment successful! ✨');
                setPaymentReservation(null);
              } else {
                await verifyPayment({
                  orderId: paymentOrder._id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                showToast('Payment Successful! Thank you. ✨');
                setPaymentOrder(null);
              }
              refreshData();
            } catch (err) {
              showToast('Payment verification failed', 'error');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#b45309",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      }
    } catch (err) {
      showToast('Payment creation failed', 'error');
      console.error(err);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <section id="my-bookings" className="py-20 bg-white text-stone-800">
      <div className="max-w-6xl mx-auto px-4">
        {/* Payment Modal */}
        {(paymentOrder || paymentReservation) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl fade-in">
              <h3 className="font-display text-2xl font-bold text-stone-900 mb-2">Complete Payment</h3>
              <p className="text-stone-500 mb-6 text-sm">
                {paymentReservation 
                  ? `Pay for all table orders (Table #${paymentReservation.tableNumber})`
                  : `Select payment method for Order #${paymentOrder._id.slice(-6)}`}
              </p>
              
              <div className="flex flex-col gap-4 mb-8">
                <button 
                  disabled={isPaying}
                  onClick={() => handlePayment('Online')}
                  className="flex items-center justify-between p-4 border-2 border-stone-100 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">💳</span>
                    <div className="text-left">
                      <div className="font-bold text-stone-800">Online Payment</div>
                      <div className="text-xs text-stone-500">Card, UPI, Netbanking</div>
                    </div>
                  </div>
                  <span className="font-bold text-amber-600">
                    ₹{paymentReservation 
                      ? orders.filter(o => o.reservationId === paymentReservation._id && o.paymentStatus === 'Pending' && o.status !== 'Cancelled').reduce((s,o) => s + o.total, 0)
                      : paymentOrder.total}
                  </span>
                </button>

                <button 
                  disabled={isPaying}
                  onClick={() => handlePayment('Cash')}
                  className="flex items-center justify-between p-4 border-2 border-stone-100 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">💵</span>
                    <div className="text-left">
                      <div className="font-bold text-stone-800">Pay via Cash</div>
                      <div className="text-xs text-stone-500">Pay at the counter</div>
                    </div>
                  </div>
                  <span className="font-bold text-stone-600">
                    ₹{paymentReservation 
                      ? orders.filter(o => o.reservationId === paymentReservation._id && o.paymentStatus === 'Pending' && o.status !== 'Cancelled').reduce((s,o) => s + o.total, 0)
                      : paymentOrder.total}
                  </span>
                </button>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setPaymentOrder(null); setPaymentReservation(null); }}
                  className="flex-1 py-3 text-stone-500 font-bold text-sm hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-12 fade-in">
          <p className="text-amber-600 font-medium tracking-widest uppercase mb-2">Track Your Activity</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900">My Orders & Reservations</h2>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === 'orders' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Active Orders
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === 'history' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Past Orders
            </button>
          <button 
            onClick={() => setActiveTab('reservations')} 
            className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === 'reservations' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50' : 'text-stone-400 hover:text-stone-600'}`}
          >
            My Reservations
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-stone-500">Loading your data...</div>
        ) : (
          <>
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {orders.filter(o => !['Ready', 'Delivered', 'Cancelled'].includes(o.status)).length === 0 ? (
                  <p className="text-stone-500 text-center py-12 border border-dashed border-stone-300 rounded-2xl">
                    No active orders. Start ordering from our menu!
                  </p>
                ) : (
                  orders
                    .filter(o => !['Ready', 'Delivered', 'Cancelled'].includes(o.status))
                    .map(order => (
                    <div key={order._id} className="bg-stone-50 rounded-xl p-6 shadow-md border border-stone-200 fade-in relative overflow-hidden">
                      {order.type === 'table_order' && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                          DINE-IN (Table #{order.tableNumber})
                        </div>
                      )}
                      
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4 mt-2">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                            order.status === 'Delivered' || order.status === 'Ready' ? 'bg-green-100 text-green-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                          <h4 className="font-display text-xl font-bold text-stone-900">Order #{order._id.slice(-6)}</h4>
                          <p className="text-stone-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-stone-600">₹{order.total}</p>
                          {order.paymentStatus === 'Paid' && (
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest border border-green-600 px-2 py-0.5 rounded">Paid</span>
                          )}
                        </div>
                      </div>

                      <div className="text-stone-600 text-sm mb-4">
                        <p className="font-medium mb-1">Items:</p>
                        <ul className="list-disc pl-5 mb-3">
                          {order.items.map((item, idx) => (
                            <li key={idx}>{item.quantity}x {item.name}</li>
                          ))}
                        </ul>
                        {order.type === 'delivery' && order.address && (
                          <p><strong>Delivery Address:</strong> {order.address}</p>
                        )}
                        {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                      </div>

                        <div className="flex gap-4">
                          {order.paymentStatus === 'Paid' && order.type === 'delivery' && (
                            <button 
                              onClick={() => handleGenerateBill(order)} 
                              className="px-4 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                            >
                              <span>🧾</span> View Bill
                            </button>
                          )}
                          {order.status === 'Pending' && (
                            <button 
                              onClick={() => handleCancelOrder(order._id)} 
                              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors border border-red-200"
                            >
                              Cancel Order
                            </button>
                          )}
                          {order.paymentStatus === 'Pending' && order.status !== 'Cancelled' && order.type === 'delivery' && (
                            order.paymentMethod === 'Cash' ? (
                              <div className="px-6 py-2 bg-stone-100 text-stone-500 rounded-lg text-sm font-bold border border-stone-200 flex items-center gap-2">
                                <span>⏳</span> Awaiting Cash Confirmation
                              </div>
                            ) : order.paymentMethod === 'Online' ? (
                              <div className="px-6 py-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold border border-amber-200 flex items-center gap-2">
                                <span>🔄</span> Online Payment Pending
                              </div>
                            ) : (
                              <button 
                                onClick={() => setPaymentOrder(order)} 
                                className="px-6 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                              >
                                <span>💳</span> Pay Now
                              </button>
                            )
                          )}
                        </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                {orders.filter(o => ['Ready', 'Delivered', 'Cancelled'].includes(o.status)).length === 0 ? (
                  <p className="text-stone-500 text-center py-12 border border-dashed border-stone-300 rounded-2xl">
                    No past orders found.
                  </p>
                ) : (
                  orders
                    .filter(o => ['Ready', 'Delivered', 'Cancelled'].includes(o.status))
                    .map(order => (
                    <div key={order._id} className="bg-stone-50 rounded-xl p-6 shadow-md border border-stone-200 fade-in relative overflow-hidden hover:shadow-lg transition-all">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4 mt-2">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {order.status}
                          </span>
                          <h4 className="font-display text-xl font-bold text-stone-900">Order #{order._id.slice(-6)}</h4>
                          <p className="text-stone-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-stone-600">₹{order.total}</p>
                          {order.paymentStatus === 'Paid' && (
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest border border-green-600 px-2 py-0.5 rounded">Paid</span>
                          )}
                        </div>
                      </div>

                      <div className="text-stone-600 text-sm mb-4">
                        <p className="font-medium mb-1">Items:</p>
                        <ul className="list-disc pl-5">
                          {order.items.map((item, idx) => (
                            <li key={idx}>{item.quantity}x {item.name}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-4">
                        {order.status !== 'Cancelled' && order.type === 'delivery' && (
                          <button 
                            onClick={() => handleGenerateBill(order)} 
                            className="px-6 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                          >
                            <span>🧾</span> View Bill
                          </button>
                        )}
                        {order.paymentStatus === 'Pending' && order.status !== 'Cancelled' && (
                          order.paymentMethod === 'Cash' ? (
                            <div className="px-6 py-2 bg-stone-100 text-stone-500 rounded-lg text-sm font-bold border border-stone-200 flex items-center gap-2">
                              <span>⏳</span> Cash Confirmation Pending
                            </div>
                          ) : order.paymentMethod === 'Online' ? (
                            <div className="px-6 py-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold border border-amber-200 flex items-center gap-2">
                              <span>🔄</span> Online Payment Pending
                            </div>
                          ) : (
                            <button 
                              onClick={() => setPaymentOrder(order)} 
                              className="px-6 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                            >
                              <span>💳</span> Pay Now
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <div className="space-y-6">
                {reservations.filter(r => r.status === 'Confirmed').length === 0 ? (
                  <p className="text-stone-500 text-center py-12 border border-dashed border-stone-300 rounded-2xl">
                    No active reservations. Book a table to dine with us!
                  </p>
                ) : (
                  reservations
                    .filter(r => r.status === 'Confirmed')
                    .map(res => {
                    const sessionOrders = orders.filter(o => o.reservationId === res._id && o.status !== 'Cancelled');
                    const reservationTotal = sessionOrders.reduce((sum, order) => sum + order.total, 0);
                    const reservationUnpaidTotal = sessionOrders.filter(o => o.paymentStatus === 'Pending').reduce((sum, order) => sum + order.total, 0);

                    return (
                      <div key={res._id} className="bg-stone-50 rounded-xl p-6 shadow-md border border-stone-200 fade-in">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                          <div>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-2">
                              {res.status}
                            </span>
                            <h4 className="font-display text-xl font-bold text-stone-900">Table #{res.tableNumber}</h4>
                            <p className="text-stone-500 text-sm">Booked on {new Date(res.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-stone-700">{res.guests} Guests</p>
                            <div className="mt-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-lg inline-block font-black text-sm">
                              Table Total: ₹{reservationTotal}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-stone-600 text-sm mb-4 bg-white p-4 rounded-lg border border-stone-100">
                          <p><strong>📅 Date:</strong> {new Date(res.date).toLocaleDateString()}</p>
                          <p><strong>🕐 Time:</strong> {res.time}</p>
                          <p><strong>📧 Email:</strong> {res.email}</p>
                          <p><strong>📞 Phone:</strong> {res.phone}</p>
                        </div>

                        {res.specialRequests && (
                          <p className="text-stone-600 text-sm mb-4"><strong>Special Requests:</strong> {res.specialRequests}</p>
                        )}

                        {res.status === 'Confirmed' && (
                          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-stone-200">
                            <button 
                              onClick={() => handleTableOrder(res.tableNumber, res._id)}
                              className="px-6 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                            >
                              <span>🍽️</span> Order Food
                            </button>
                            {reservationTotal > 0 && (
                              <button 
                                onClick={() => window.open(`/bill/reservation/${res._id}`, '_blank')}
                                className="px-6 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                              >
                                <span>🧾</span> View Total Table Bill
                              </button>
                            )}
                            <button 
                              onClick={() => handleCompleteReservation(res._id)}
                              className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                            >
                              <span>✅</span> Complete Session
                            </button>
                            {reservationUnpaidTotal > 0 && (
                              sessionOrders.some(o => o.paymentMethod === 'Cash' && o.paymentStatus === 'Pending') ? (
                                <div className="px-6 py-2 bg-stone-100 text-stone-500 rounded-lg text-sm font-bold border border-stone-200 flex items-center gap-2">
                                  <span>⏳</span> Table Cash Confirmation Pending
                                </div>
                              ) : sessionOrders.some(o => o.paymentMethod === 'Online' && o.paymentStatus === 'Pending') ? (
                                <div className="px-6 py-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold border border-amber-200 flex items-center gap-2">
                                  <span>🔄</span> Online Payment Processing
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setPaymentReservation(res)}
                                  className="px-6 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                                >
                                  <span>💵</span> Pay for Table (₹{reservationUnpaidTotal})
                                </button>
                              )
                            )}
                            <button 
                              onClick={() => handleCancelReservation(res._id)} 
                              className="px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors border border-red-200"
                            >
                              Cancel Reservation
                            </button>
                          </div>
                        )}

                        {sessionOrders.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-stone-200">
                            <h5 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                              <span>🧾</span> Table Orders
                            </h5>
                            <div className="space-y-3">
                              {sessionOrders.map(o => (
                                <div key={o._id} className="text-sm bg-white p-3 rounded border border-amber-100 flex justify-between items-center">
                                  <div>
                                    <div className="font-medium text-stone-700">
                                      {new Date(o.createdAt).toLocaleTimeString()} ({o.status})
                                    </div>
                                    <p className="text-stone-500 text-xs">
                                      {o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-amber-600 font-bold">₹{o.total}</div>
                                    {o.paymentStatus === 'Paid' ? (
                                      <span className="text-[9px] text-green-600 font-bold uppercase">Paid</span>
                                    ) : (
                                      <span className="text-[9px] text-amber-500 font-bold uppercase">Unpaid</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
