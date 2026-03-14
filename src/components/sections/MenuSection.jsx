import React, { useState, useEffect } from 'react';
import { getMenu } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { showToast } from '../ui/ToastContainer';

export default function MenuSection({ tableId = null }) {
  const [menuItems, setMenuItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

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

  const filteredMenu = filter === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === filter);

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast(`${item.name} added to cart!`);
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

        <div className="flex flex-wrap justify-center gap-4 mb-12 fade-in">
          <TabButton category="all" label="All" />
          <TabButton category="starters" label="Starters" />
          <TabButton category="mains" label="Main Course" />
          <TabButton category="desserts" label="Desserts" />
          <TabButton category="drinks" label="Drinks" />
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
    </section>
  );
}
