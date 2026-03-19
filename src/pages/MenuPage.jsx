import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MenuSection from '../components/sections/MenuSection';
import { useCart } from '../context/CartContext';

export default function MenuPage() {
  const { tableId } = useParams();
  const { setOrderMode, setActiveTable } = useCart();

  useEffect(() => {
    if (tableId) {
      setOrderMode('dine-in');
      setActiveTable(tableId);
    } else {
      // If we are already in dine-in mode (from a previous QR scan), keep it
      // Don't reset to online unless there's no active session
      const savedMode = localStorage.getItem('savoria_order_mode');
      const savedTable = localStorage.getItem('savoria_active_table');
      
      if (savedMode === 'dine-in' && savedTable) {
        setOrderMode('dine-in');
        setActiveTable(savedTable);
      } else {
        setOrderMode('online');
        setActiveTable(null);
      }
    }
  }, [tableId, setOrderMode, setActiveTable]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <MenuSection tableId={tableId} />
    </div>
  );
}
