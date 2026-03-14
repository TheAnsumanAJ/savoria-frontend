import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { cancelReservation, updateReservationStatus, cancelOrder } from '../../services/api';
import { showToast } from '../ui/ToastContainer';

export default function MyBookings() {
  const { user } = useAuth();
  const { reservations, orders, loading, refreshData } = useBooking();
  const [activeTab, setActiveTab] = useState('orders');
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

  const handleTableOrder = (tableId) => {
    navigate(`/menu/${tableId}`);
  };

  return (
    <section id="my-bookings" className="py-20 bg-white text-stone-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 fade-in">
          <p className="text-amber-600 font-medium tracking-widest uppercase mb-2">Track Your Activity</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900">My Orders & Reservations</h2>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'orders' ? 'tab-active text-amber-700 border-amber-700' : 'text-stone-500 hover:text-amber-600'}`}
          >
            My Orders
          </button>
          <button 
            onClick={() => setActiveTab('reservations')} 
            className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'reservations' ? 'tab-active text-amber-700 border-amber-700' : 'text-stone-500 hover:text-amber-600'}`}
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
                      {/* Badge indicator for order type */}
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
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                          <h4 className="font-display text-xl font-bold text-stone-900">Order #{order._id.slice(-6)}</h4>
                          <p className="text-stone-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-600">₹{order.total}</p>
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

                      {order.status === 'Pending' && (
                        <button 
                          onClick={() => handleCancelOrder(order._id)} 
                          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors border border-red-200"
                        >
                          Cancel Order
                        </button>
                      )}
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
                    // Find all orders that belong to this reservation
                    const sessionOrders = orders.filter(o => o.reservationId === res._id && !['Ready', 'Delivered', 'Cancelled'].includes(o.status));

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

                        {/* Interactive Section for Active Reservations */}
                        {res.status === 'Confirmed' && (
                          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-stone-200">
                            <button 
                              onClick={() => handleTableOrder(res.tableNumber)}
                              className="px-6 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                            >
                              <span>🍽️</span> Order Food for Table
                            </button>
                            <button 
                              onClick={() => handleCompleteReservation(res._id)}
                              className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                            >
                              <span>✅</span> Complete Session
                            </button>
                            <button 
                              onClick={() => handleCancelReservation(res._id)} 
                              className="px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors border border-red-200"
                            >
                              Cancel Reservation
                            </button>
                          </div>
                        )}

                        {/* Display Orders for this Reservation */}
                        {sessionOrders.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-stone-200">
                            <h5 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                              <span>🧾</span> Table Orders
                            </h5>
                            <div className="space-y-3">
                              {sessionOrders.map(o => (
                                <div key={o._id} className="text-sm bg-white p-3 rounded border border-amber-100">
                                  <div className="flex justify-between font-medium text-stone-700 mb-1">
                                    <span>{new Date(o.createdAt).toLocaleTimeString()} ({o.status})</span>
                                    <span className="text-amber-600">₹{o.total}</span>
                                  </div>
                                  <p className="text-stone-500">
                                    {o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                  </p>
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
