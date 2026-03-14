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
      setOrderMode('online');
      setActiveTable(null);
    }
  }, [tableId, setOrderMode, setActiveTable]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <MenuSection tableId={tableId} />
    </div>
  );
}
