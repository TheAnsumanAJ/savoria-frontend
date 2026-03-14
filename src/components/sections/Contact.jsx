import React from 'react';

export default function Contact() {
  return (
    <section className="py-20 bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 fade-in">
          <p className="text-amber-500 font-medium tracking-widest uppercase mb-2">Get in Touch</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Contact Us</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-stone-800 rounded-2xl fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="text-4xl mb-4 block">📍</span>
            <h3 className="font-display text-xl font-bold mb-2">Location</h3>
            <p className="text-stone-400">Foodie Zone<br />Foodie District, FL 12345</p>
          </div>
          <div className="text-center p-8 bg-stone-800 rounded-2xl fade-in" style={{ animationDelay: '0.2s' }}>
            <span className="text-4xl mb-4 block">📞</span>
            <h3 className="font-display text-xl font-bold mb-2">Phone</h3>
            <p className="text-stone-400">+1 (555) 123-4567<br />+1 (555) 987-6543</p>
          </div>
          <div className="text-center p-8 bg-stone-800 rounded-2xl fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="text-4xl mb-4 block">🕐</span>
            <h3 className="font-display text-xl font-bold mb-2">Hours</h3>
            <p className="text-stone-400">Mon-Fri: 11am - 10pm<br />Sat-Sun: 10am - 11pm</p>
          </div>
        </div>
      </div>
    </section>
  );
}
