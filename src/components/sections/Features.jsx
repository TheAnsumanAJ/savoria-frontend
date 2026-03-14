import React from 'react';

export default function Features() {
  return (
    <section className="py-20 bg-stone-100 text-stone-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="text-5xl mb-4 block">🚗</span>
            <h3 className="font-display text-2xl font-bold mb-3 text-amber-700">Fast Delivery</h3>
            <p className="text-stone-600">Hot and fresh meals delivered to your doorstep within 30 minutes</p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow fade-in" style={{ animationDelay: '0.2s' }}>
            <span className="text-5xl mb-4 block">👨‍🍳</span>
            <h3 className="font-display text-2xl font-bold mb-3 text-amber-700">Expert Chefs</h3>
            <p className="text-stone-600">Award-winning chefs creating culinary masterpieces daily</p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="text-5xl mb-4 block">🌿</span>
            <h3 className="font-display text-2xl font-bold mb-3 text-amber-700">Fresh Ingredients</h3>
            <p className="text-stone-600">Locally sourced organic produce for authentic flavors</p>
          </div>
        </div>
      </div>
    </section>
  );
}
