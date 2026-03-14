import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { createReservation } from '../../services/api';
import { showToast } from '../ui/ToastContainer';

export default function Reservation() {
  const { user } = useAuth();
  const { refreshData } = useBooking();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [bookedTable, setBookedTable] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    guests: '',
    date: '',
    time: '',
    specialRequests: ''
  });

  // Get today's date in YYYY-MM-DD format for the date picker minimum
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await createReservation({ ...formData, userEmail: user?.email || formData.email });
      const tableNumber = response.data.tableNumber;
      
      setBookedTable(tableNumber);
      setShowDialog(true);
      
      showToast('Table reserved successfully! 🎉 Check My Bookings.');
      refreshData();
      
      // Reset non-user fields
      setFormData(prev => ({
        ...prev,
        phone: '',
        guests: '',
        date: '',
        time: '',
        specialRequests: ''
      }));
    } catch (err) {
      if (err.response?.status === 409) {
        showToast(err.response.data.message, 'error'); // Fully booked
      } else {
        showToast('Failed to make reservation. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-stone-100 text-stone-800">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12 fade-in">
          <p className="text-amber-600 font-medium tracking-widest uppercase mb-2">Reserve Your Spot</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900">Book a Table</h2>
          <p className="text-stone-600 mt-4 max-w-xl mx-auto">
            Experience fine dining in our elegant atmosphere. Reserve your table and create unforgettable memories.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-200 fade-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-stone-700 font-medium mb-2 text-sm">Full Name *</label>
                <input 
                  type="text" name="name" required value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-800 focus:border-amber-500 focus:outline-none transition-colors bg-stone-50 focus:bg-white" 
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-2 text-sm">Email *</label>
                <input 
                  type="email" name="email" required value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-800 focus:border-amber-500 focus:outline-none transition-colors bg-stone-50 focus:bg-white" 
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-2 text-sm">Phone *</label>
                <input 
                  type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-800 focus:border-amber-500 focus:outline-none transition-colors bg-stone-50 focus:bg-white" 
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-2 text-sm">Number of Guests *</label>
                <select 
                  name="guests" required value={formData.guests} onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-800 focus:border-amber-500 focus:outline-none transition-colors bg-stone-50 focus:bg-white"
                >
                  <option value="">Select guests</option>
                  {[1, 2, 3, 4, 5, 6, 7, '8+'].map(num => (
                    <option key={num} value={num === '8+' ? 8 : num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-2 text-sm">Date *</label>
                <input 
                  type="date" name="date" required min={today} value={formData.date} onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-800 focus:border-amber-500 focus:outline-none transition-colors bg-stone-50 focus:bg-white custom-date-input"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-2 text-sm">Time *</label>
                <select 
                  name="time" required value={formData.time} onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-800 focus:border-amber-500 focus:outline-none transition-colors bg-stone-50 focus:bg-white"
                >
                  <option value="">Select time</option>
                  {['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
                    <option key={t} value={t}>{new Date(`2000-01-01T${t}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-stone-700 font-medium mb-2 text-sm">Special Requests</label>
              <textarea 
                name="specialRequests" value={formData.specialRequests} onChange={handleChange} rows="3" 
                className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-800 focus:border-amber-500 focus:outline-none transition-colors resize-none bg-stone-50 focus:bg-white" 
                placeholder="Any special occasions, dietary requirements, or seating preferences?"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 text-white font-bold rounded-lg transition-all text-lg transform hover:scale-[1.02] shadow-md ${
                loading ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {loading ? 'Processing...' : 'Reserve Table'}
            </button>
          </form>
        </div>
      </div>

      {/* Booking Success Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center fade-in">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              🎉
            </div>
            <h3 className="font-display text-3xl font-bold text-stone-900 mb-2">Table Booked!</h3>
            <p className="text-stone-600 mb-6 text-lg">
              You've successfully reserved <strong className="text-amber-600">Table #{bookedTable}</strong>.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/menu/${bookedTable}`)}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>🍽️</span> Order Food Now
              </button>
              <button 
                onClick={() => {
                  setShowDialog(false);
                  document.getElementById('my-bookings')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg transition-colors border border-stone-200"
              >
                Skip, Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
