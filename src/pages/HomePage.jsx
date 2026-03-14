import React from 'react';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import Contact from '../components/sections/Contact';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <Contact />
    </div>
  );
}
