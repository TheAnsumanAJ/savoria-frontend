import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, orderMode, activeTable } = useCart();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const cartLink = orderMode === 'dine-in' && activeTable ? `/ordernow/${activeTable}` : '/ordernow';

  const NavLinks = ({ mobile = false }) => {
    const baseClasses = mobile 
      ? "block text-stone-700 hover:text-amber-700" 
      : "nav-link text-stone-700 hover:text-amber-700 transition-colors";
      
    return (
      <>
        <Link to="/" className={`${baseClasses} ${isActive('/') ? 'text-amber-700 font-bold' : ''}`}>Home</Link>
        <Link to="/menu" className={`${baseClasses} ${isActive('/menu') ? 'text-amber-700 font-bold' : ''}`}>Menu</Link>
        <Link to="/ordernow" className={`${baseClasses} ${isActive('/ordernow') ? 'text-amber-700 font-bold' : ''}`}>Order Online</Link>
        <Link to="/reservations" className={`${baseClasses} ${isActive('/reservations') ? 'text-amber-700 font-bold' : ''}`}>Book & Dine</Link>
        <Link to="/entertainment" className={`${baseClasses} ${isActive('/entertainment') ? 'text-amber-700 font-bold' : ''}`}>Entertainment</Link>
        
        {user?.role === 'manager' && (
          <Link to="/manager" className={`${baseClasses} ${isActive('/manager') ? 'text-amber-700 font-bold' : ''}`}>Edit Menu</Link>
        )}
      </>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass text-stone-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🍽️</span> 
            <span className="font-display text-2xl font-bold text-amber-700">Savoria</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <NavLinks />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to={cartLink} className="relative text-2xl" aria-label="Cart">
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-stone-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button 
                  onClick={logout}
                  className="px-4 py-2 border border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors font-medium">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-4">
            <Link to={cartLink} className="relative text-2xl" aria-label="Cart">
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-stone-800"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-stone-200 px-4 py-4 space-y-4">
            <NavLinks mobile={true} />
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              {user ? (
                <>
                  <span className="text-stone-700 font-medium">Hi, {user.name}</span>
                  <button 
                    onClick={logout}
                    className="px-4 py-2 text-amber-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="block text-center w-full py-2 bg-amber-600 text-white rounded-lg font-medium">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
