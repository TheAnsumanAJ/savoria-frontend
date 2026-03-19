import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenu } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { showToast } from '../ui/ToastContainer';

export default function MenuSection({ tableId = null }) {
  const [menuItems, setMenuItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [vegFilter, setVegFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [recentlyAddedItem, setRecentlyAddedItem] = useState(null);
  const { addToCart, cart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await getMenu();
        setMenuItems(res.data);
      } catch (err) {
        showToast('Failed to load menu items', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filteredMenu = menuItems.filter(item => {
    const matchesCategory = filter === 'all' || item.category === filter;
    const matchesVeg = vegFilter === 'all' || 
                      (vegFilter === 'veg' && item.veg === true) || 
                      (vegFilter === 'non-veg' && item.veg === false);
    return matchesCategory && matchesVeg;
  });

  const handleAddToCart = (item) => {
    addToCart(item);
    setRecentlyAddedItem(item);
  };

  const TabButton = ({ category, label }) => (
    <button 
      onClick={() => setFilter(category)} 
      className={`px-6 py-3 font-semibold transition-colors ${
        filter === category 
          ? 'tab-active text-amber-700 border-amber-700' 
          : 'text-stone-500 hover:text-amber-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="py-20 bg-white text-stone-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 fade-in">
          {tableId && (
            <div className="mb-6 inline-block bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold">
              🛎️ Ordering for Table #{tableId}
            </div>
          )}
          <p className="text-amber-600 font-medium tracking-widest uppercase mb-2">Our Specialties</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900">Explore Our Menu</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-4 fade-in">
          <TabButton category="all" label="All" />
          <TabButton category="starters" label="Starters" />
          <TabButton category="mains" label="Main Course" />
          <TabButton category="desserts" label="Desserts" />
          <TabButton category="drinks" label="Drinks" />
        </div>

        {/* Veg/Non-Veg Filter */}
        <div className="flex justify-center gap-3 mb-12 fade-in">
          <button 
            onClick={() => setVegFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              vegFilter === 'all' 
                ? 'bg-stone-800 text-white border-stone-800 shadow-md' 
                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
            }`}
          >
            All Items
          </button>
          <button 
            onClick={() => setVegFilter('veg')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
              vegFilter === 'veg' 
                ? 'bg-green-600 text-white border-green-600 shadow-md' 
                : 'bg-white text-green-600 border-green-200 hover:border-green-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Veg Only
          </button>
          <button 
            onClick={() => setVegFilter('non-veg')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
              vegFilter === 'non-veg' 
                ? 'bg-red-600 text-white border-red-600 shadow-md' 
                : 'bg-white text-red-600 border-red-200 hover:border-red-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Non-Veg
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500">Loading menu...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMenu.map((item, index) => (
              <div 
                key={item._id} 
                className="menu-card bg-stone-50 rounded-2xl overflow-hidden shadow-lg fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="h-40 bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center relative">
                  <span className="text-7xl">{item.emoji}</span>
                  {item.popular && (
                    <span className="absolute top-4 right-4 bg-amber-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                      Popular
                    </span>
                  )}
                  {item.veg === false && (
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                      Non-Veg
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-xl font-bold text-stone-900 leading-tight pr-2">{item.name}</h3>
                    <span className="text-amber-600 font-bold text-lg">₹{item.price}</span>
                  </div>
                  <p className="text-stone-600 text-sm mb-4 min-h-[40px]">{item.description}</p>
                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Add to Cart</span>
                    <span className="text-xl leading-none">+</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Proceed to Order Bridge (Compact) */}
      {cart.length > 0 && !recentlyAddedItem && (
        <div className="fixed bottom-8 left-4 right-4 z-[90] md:left-auto md:right-8 md:w-80 animate-slide-up">
          <button 
            onClick={() => navigate(tableId ? `/ordernow/${tableId}` : '/ordernow')}
            className="w-full bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border border-amber-500/30 flex items-center justify-between group hover:border-amber-500 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="bg-amber-600 text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">{totalItems}</span>
              <span className="font-bold">View Order</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">₹{totalPrice}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>
      )}

      {/* Item Added "Pop Box" Modal */}
      {recentlyAddedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-pop-in border border-stone-200">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              {recentlyAddedItem.emoji}
            </div>
            <h3 className="font-display text-2xl font-bold text-stone-900 mb-2">Added to Cart!</h3>
            <p className="text-stone-600 mb-6">
              <strong>{recentlyAddedItem.name}</strong> has been added to your order for <strong>Table #{tableId || 'Delivery'}</strong>.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate(tableId ? `/ordernow/${tableId}` : '/ordernow')}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>🛒</span> Proceed to Order (₹{totalPrice})
              </button>
              <button 
                onClick={() => setRecentlyAddedItem(null)}
                className="w-full py-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-all"
              >
                + Add More Items
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
