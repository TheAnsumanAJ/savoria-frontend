import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center pt-20" 
      style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)' }}
    >
      <div 
        className="absolute inset-0 opacity-20" 
        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 80% 50%, #d97706 0%, transparent 50%)' }}
      ></div>
      
      <div className="relative text-center px-4 max-w-4xl mx-auto fade-in">
        <p className="text-amber-500 font-medium tracking-widest uppercase mb-4">Fine Dining Experience</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Savor Every<br />Moment
        </h1>
        <p className="text-stone-400 text-xl md:text-2xl mb-10 max-w-2xl mx-auto">
          Discover culinary excellence with our chef's signature dishes crafted from the finest ingredients
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/ordernow" 
            className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg"
          >
            Order Online
          </Link>
          <Link 
            to="/reservations" 
            className="px-8 py-4 bg-transparent border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white font-semibold rounded-full transition-all"
          >
            Book a Table
          </Link>
        </div>
      </div>
    </section>
  );
}
