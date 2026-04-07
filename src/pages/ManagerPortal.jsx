import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getMenu, getAllOrders, updateMenuItem, updateOrderStatus, addMenuItem, 
  getAllReservations, updateReservationStatus, confirmCashPayment, confirmReservationCashPayment 
} from '../services/api';
import { showToast } from '../components/ui/ToastContainer';
import { QRCodeCanvas } from 'qrcode.react';
import TableStatusGrid from '../components/sections/TableStatusGrid';
import { useSocket } from '../context/SocketContext';

export default function ManagerPortal() {
  const { user, loading } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Real-time refresh when socket event received
  useEffect(() => {
    if (socket && user?.role === 'manager') {
      socket.on('new-order-alert', (data) => {
        fetchData(); // Refresh all data when new order arrives
      });

      socket.on('order-status-update', () => {
        fetchData(); // Also refresh on status updates
      });

      return () => {
        socket.off('new-order-alert');
        socket.off('order-status-update');
      };
    }
  }, [socket, user]);
  const [newItemData, setNewItemData] = useState({ name: '', category: 'starters', price: '', description: '', emoji: '🍽️', veg: true });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [qrTableNumber, setQrTableNumber] = useState('1');

  const filteredOrders = showCompleted 
    ? orders 
    : orders.filter(o => !['Delivered', 'Ready', 'Cancelled'].includes(o.status));

  // Redirect if not manager
  useEffect(() => {
    if (loading) return; // Wait for initial auth state

    if (!user) {
      navigate('/');
    } else if (user.role !== 'manager') {
      showToast('Unauthorized access. Manager role required.', 'error');
      navigate('/');
    }
  }, [user, navigate, loading]);

  const fetchData = async () => {
    if (user?.role !== 'manager') return;
    setLoadingData(true);
    try {
      const [orderRes, menuRes, resRes] = await Promise.all([
        getAllOrders(),
        getMenu(),
        getAllReservations()
      ]);
      setOrders(orderRes.data);
      setMenuItems(menuRes.data);
      setReservations(resRes.data);
    } catch (err) {
      showToast('Failed to fetch manager data', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [user]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleReservationStatus = async (id, status) => {
    try {
      await updateReservationStatus(id, status);
      showToast(`Reservation ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (err) {
      showToast('Failed to update reservation', 'error');
    }
  };

  const handlePriceUpdate = async (menuId, currentPrice) => {
    const newPrice = prompt(`Enter new price:`, currentPrice);
    if (newPrice && !isNaN(newPrice)) {
      try {
        await updateMenuItem(menuId, { price: Number(newPrice) });
        showToast('Price updated successfully');
        fetchData();
      } catch (err) {
        showToast('Failed to update price', 'error');
      }
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemData.name || !newItemData.price) {
      showToast('Name and price are required', 'error');
      return;
    }
    try {
      await addMenuItem({ ...newItemData, price: Number(newItemData.price) });
      showToast('Menu item added successfully!');
      setNewItemData({ name: '', category: 'starters', price: '', description: '', emoji: '🍽️', veg: true });
      setIsAddingItem(false);
      fetchData();
    } catch (err) {
      showToast('Failed to add menu item', 'error');
    }
  };

  const handleConfirmCash = async (orderId) => {
    try {
      await confirmCashPayment({ orderId });
      showToast('Cash payment confirmed');
      fetchData();
    } catch (err) {
      showToast('Failed to confirm cash payment', 'error');
    }
  };

  const handleConfirmReservationCash = async (reservationId) => {
    try {
      await confirmReservationCashPayment({ reservationId });
      showToast('Reservation cash payment confirmed');
      fetchData();
    } catch (err) {
      showToast('Failed to confirm reservation payment', 'error');
    }
  };

  if (!user || user.role !== 'manager') return null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-stone-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 gap-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900">Manager Dashboard</h1>
            <p className="text-stone-500">Welcome back, {user.name}</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex-1 min-w-[140px] lg:flex-none px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'orders' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              className={`flex-1 min-w-[140px] lg:flex-none px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'menu' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}
            >
              Menu
            </button>
            <button 
              onClick={() => setActiveTab('reservations')}
              className={`flex-1 min-w-[140px] lg:flex-none px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'reservations' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}
            >
              Bookings
            </button>
            <button 
              onClick={() => setActiveTab('tables')}
              className={`flex-1 min-w-[140px] lg:flex-none px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'tables' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}
            >
              Tables
            </button>
            <button 
              onClick={() => setActiveTab('qrcodes')}
              className={`flex-1 min-w-[140px] lg:flex-none px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'qrcodes' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}
            >
              QR Codes
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500 text-xl font-bold">Loading dashboard data...</div>
        ) : (
          <>
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex justify-end pr-2">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-600 font-medium">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-amber-600"
                      checked={showCompleted}
                      onChange={(e) => setShowCompleted(e.target.checked)}
                    />
                    Show Completed/Cancelled Orders
                  </label>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm uppercase">
                      <tr>
                        <th className="px-3 sm:px-6 py-4 font-bold">Order ID</th>
                        <th className="px-3 sm:px-6 py-4 font-bold">Customer</th>
                        <th className="px-3 sm:px-6 py-4 font-bold">Type</th>
                        <th className="px-3 sm:px-6 py-4 font-bold">Items</th>
                        <th className="px-3 sm:px-6 py-4 font-bold">Total</th>
                        <th className="px-3 sm:px-6 py-4 font-bold">Payment</th>
                        <th className="px-3 sm:px-6 py-4 font-bold">Status</th>
                        <th className="px-3 sm:px-6 py-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 placeholder-stone-400">
                      {filteredOrders.map(order => (
                        <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-3 sm:px-6 py-4 font-mono text-sm text-stone-600 font-bold">#{order._id.slice(-6)}</td>
                          <td className="px-3 sm:px-6 py-4">
                            <div className="font-medium text-stone-900">{order.name}</div>
                            <div className="text-xs text-stone-500 truncate max-w-[100px]">{order.userEmail}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            {order.type === 'delivery' ? (
                              <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-bold">
                                🛵 Delivery
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-1 rounded text-xs font-bold">
                                🍽️ Table {order.tableNumber}
                              </span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm">
                            <div className="flex flex-col gap-1 max-w-[150px] sm:max-w-[250px]">
                              {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-stone-50 px-2 py-1 rounded border border-stone-100">
                                  <span className="truncate flex-1 font-medium text-stone-700 text-xs">
                                    <span className="mr-1">{item.emoji}</span>
                                    {item.name}
                                  </span>
                                  <span className="ml-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    x{item.quantity}
                                  </span>
                                </div>
                              ))}
                              {order.items.length > 2 && <div className="text-[10px] text-stone-400 font-bold ml-1">+{order.items.length - 2} more...</div>}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 font-bold text-amber-600">₹{order.total}</td>
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-500'}`}>
                                {order.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                              </span>
                              <span className="text-[9px] text-stone-400 font-medium">via {order.paymentMethod || 'Cash'}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold ${
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              order.status === 'Delivered' || order.status === 'Ready' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-right">
                            <div className="flex flex-col items-end gap-2">
                              <select 
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                className="px-3 py-1 bg-white border border-stone-300 rounded shadow-sm text-sm focus:outline-none focus:border-amber-500 text-stone-900"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Preparing">Preparing</option>
                                {order.type === 'delivery' ? (
                                  <>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                  </>
                                ) : (
                                  <option value="Ready">Ready</option>
                                )}
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              {order.paymentMethod === 'Cash' && order.paymentStatus === 'Pending' && order.status !== 'Cancelled' && (
                                <button 
                                  onClick={() => handleConfirmCash(order._id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-[10px] font-bold hover:bg-green-700 transition-colors shadow-sm"
                                >
                                  Confirm Cash
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr><td colSpan="8" className="px-6 py-8 text-center text-stone-500">No active orders found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )}

            {/* Menu Pricing Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button 
                    onClick={() => setIsAddingItem(!isAddingItem)} 
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-sm transition-colors"
                  >
                    {isAddingItem ? 'Cancel' : '+ Add New Item'}
                  </button>
                </div>

                {isAddingItem && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 fade-in">
                    <h3 className="font-display font-bold text-xl text-stone-900 mb-4">Add New Menu Item</h3>
                    <form onSubmit={handleAddItem} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Name */}
                      <input type="text" placeholder="Item Name *" required value={newItemData.name} onChange={(e) => setNewItemData({...newItemData, name: e.target.value})} className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-stone-900" />
                      {/* Price */}
                      <input type="number" placeholder="Price (₹) *" required value={newItemData.price} onChange={(e) => setNewItemData({...newItemData, price: e.target.value})} className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-stone-900" />
                      {/* Category */}
                      <select value={newItemData.category} onChange={(e) => setNewItemData({...newItemData, category: e.target.value})} className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-stone-900">
                        <option value="starters">Starters</option>
                        <option value="mains">Mains</option>
                        <option value="desserts">Desserts</option>
                        <option value="drinks">Drinks</option>
                      </select>
                      {/* Emoji */}
                      <input type="text" placeholder="Emoji (e.g. 🍕)" value={newItemData.emoji} onChange={(e) => setNewItemData({...newItemData, emoji: e.target.value})} className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-stone-900" />
                      {/* Veg */}
                      <div className="flex items-center gap-2 px-2">
                        <label className="text-stone-700 font-bold">Vegetarian?</label>
                        <input type="checkbox" checked={newItemData.veg} onChange={(e) => setNewItemData({...newItemData, veg: e.target.checked})} className="w-5 h-5 accent-amber-600 rounded" />
                      </div>
                      {/* Description */}
                      <input type="text" placeholder="Short Description" value={newItemData.description} onChange={(e) => setNewItemData({...newItemData, description: e.target.value})} className="md:col-span-2 lg:col-span-3 px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500 text-stone-900" />
                      
                      <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
                        <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-sm">
                          Save Item
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {menuItems.map(item => (
                  <div key={item._id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center text-center">
                    <span className="text-5xl mb-3">{item.emoji}</span>
                    <h3 className="font-display font-bold text-stone-900 mb-1 leading-tight">{item.name}</h3>
                    <div className="text-xs text-stone-400 uppercase tracking-widest mb-4">{item.category}</div>
                    
                    <div className="mt-auto w-full pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xl font-bold text-amber-600">₹{item.price}</span>
                      <button 
                        onClick={() => handlePriceUpdate(item._id, item.price)}
                        className="px-4 py-2 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-700 rounded-lg text-sm font-bold transition-colors"
                      >
                        Edit Price
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm uppercase">
                        <tr>
                          <th className="px-3 sm:px-6 py-4 font-bold">Table</th>
                          <th className="px-3 sm:px-6 py-4 font-bold">Customer</th>
                          <th className="px-3 sm:px-6 py-4 font-bold">Time Slot</th>
                          <th className="px-3 sm:px-6 py-4 font-bold">Guests</th>
                          <th className="px-3 sm:px-6 py-4 font-bold">Status</th>
                          <th className="px-3 sm:px-6 py-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {reservations.map(res => (
                          <tr key={res._id} className="hover:bg-stone-50 transition-colors">
                            <td className="px-3 sm:px-6 py-4">
                              <span className="font-bold text-lg text-amber-600">#{res.tableNumber}</span>
                            </td>
                            <td className="px-3 sm:px-6 py-4">
                              <div className="font-medium text-stone-900 text-sm">{res.name}</div>
                              <div className="text-[10px] text-stone-500">{res.phone}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-[10px] sm:text-sm text-stone-600">
                              <div>{new Date(res.date).toLocaleDateString()}</div>
                              <div className="font-bold">{res.time}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-stone-700 font-medium text-xs sm:text-base">
                              {res.guests} <span className="hidden sm:inline">Guests</span>
                            </td>
                            <td className="px-3 sm:px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold ${
                                res.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                res.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {res.status}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-right">
                              <div className="flex flex-col items-end gap-2">
                                {res.status === 'Confirmed' && (
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => handleReservationStatus(res._id, 'Completed')}
                                      className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 rounded text-xs font-bold transition-all"
                                    >
                                      Mark Complete
                                    </button>
                                    <button 
                                      onClick={() => handleReservationStatus(res._id, 'Cancelled')}
                                      className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 rounded text-xs font-bold transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                                {res.status === 'Confirmed' && orders.some(o => o.reservationId === res._id && o.paymentMethod === 'Cash' && o.paymentStatus === 'Pending' && o.status !== 'Cancelled') && (
                                  <button 
                                    onClick={() => handleConfirmReservationCash(res._id)}
                                    className="px-3 py-1 bg-amber-600 text-white hover:bg-amber-700 rounded text-xs font-bold transition-colors shadow-sm"
                                  >
                                    Confirm Cash Payment
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {reservations.length === 0 && (
                          <tr><td colSpan="6" className="px-6 py-8 text-center text-stone-500">No reservations found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Table Status Tab */}
            {activeTab === 'tables' && (
              <div className="fade-in">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                  <h3 className="font-display font-bold text-xl text-stone-900 mb-6">Live Table Occupancy</h3>
                  <TableStatusGrid reservations={reservations} />
                </div>
              </div>
            )}

            {/* QR Codes Tab */}
            {activeTab === 'qrcodes' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
                  <h3 className="font-display font-bold text-2xl text-stone-900 mb-6">Table QR Generator</h3>
                  
                  <div className="max-w-xs mx-auto mb-8">
                    <label className="block text-stone-600 font-bold mb-2 text-left">Table Number</label>
                    <input 
                      type="number" 
                      min="1"
                      value={qrTableNumber} 
                      onChange={(e) => setQrTableNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 text-xl font-bold text-center"
                      placeholder="Enter Table #"
                    />
                  </div>

                  <div className="bg-stone-50 p-10 rounded-3xl border-2 border-dashed border-stone-200 inline-block mb-8 relative group">
                    <div id="printable-qr" className="bg-white p-4 rounded-xl shadow-md transition-transform group-hover:scale-105 duration-300">
                      <QRCodeCanvas 
                        id="qr-canvas"
                        value={`${window.location.origin}/menu/${qrTableNumber}`}
                        size={256}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: "/favicon.ico",
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                      <div className="mt-4 text-stone-900 font-display font-bold text-xl uppercase tracking-widest">
                        Table {qrTableNumber}
                      </div>
                      <div className="text-stone-400 text-xs font-medium uppercase tracking-tighter mt-1">
                        Scan to Order • Savoria
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => {
                        const canvas = document.getElementById('qr-canvas');
                        const url = canvas.toDataURL('image/png');
                        const link = document.createElement('a');
                        link.download = `Savoria-Table-${qrTableNumber}.png`;
                        link.href = url;
                        link.click();
                      }}
                      className="px-6 py-4 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg"
                    >
                      <span>📥</span> Download PNG
                    </button>
                    <button 
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        const qrContent = document.getElementById('printable-qr').innerHTML;
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Print Table QR - Table ${qrTableNumber}</title>
                              <style>
                                body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; text-align: center; }
                                .qr-container { border: 2px solid #e7e5e4; padding: 40px; border-radius: 40px; }
                                @media print { .no-print { display: none; } }
                              </style>
                            </head>
                            <body>
                              <div class="qr-container">${qrContent}</div>
                              <div class="no-print" style="margin-top: 20px;">
                                <button onclick="window.print()" style="padding: 10px 20px; background: #d97706; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Print Now</button>
                              </div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }}
                      className="px-6 py-4 bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors shadow-lg"
                    >
                      <span>🖨️</span> Print Card
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h4 className="font-bold text-amber-900">Pro Tip</h4>
                    <p className="text-amber-800 text-sm">
                      Place these QR codes in a nice acrylic stand or on a sticker at each table. 
                      Customers will automatically be set to <strong>Dine-In mode</strong> for <strong>Table #{qrTableNumber}</strong> when they scan.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
