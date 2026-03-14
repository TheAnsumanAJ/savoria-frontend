import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-10 bg-stone-950 text-stone-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl">🍽️</span> 
          <span className="font-display text-xl font-bold text-white">Savoria</span>
        </div>
        <p className="mb-4">Crafting culinary experiences since 2024</p>
        <div className="flex justify-center gap-6 mb-6 text-stone-300">
          <a href="#" className="hover:text-amber-500 transition-colors" aria-label="Facebook">
            <Facebook size={24} />
          </a>
          <a href="#" className="hover:text-amber-500 transition-colors" aria-label="Instagram">
            <Instagram size={24} />
          </a>
          <a href="#" className="hover:text-amber-500 transition-colors" aria-label="Twitter">
            <Twitter size={24} />
          </a>
        </div>
        <p className="text-sm">© 2024 Savoria Restaurant. All rights reserved.</p>
      </div>
    </footer>
  );
}
