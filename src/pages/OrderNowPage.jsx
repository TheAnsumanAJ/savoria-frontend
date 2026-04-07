import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderOnline from '../components/sections/OrderOnline';
import { useCart } from '../context/CartContext';

export default function OrderNowPage() {
  const { tableId, resId } = useParams();
  const { setOrderMode, setActiveTable, activeTable, setActiveReservationId } = useCart();

  useEffect(() => {
    if (tableId) {
      setOrderMode('dine-in');
      setActiveTable(tableId);
      if (resId) {
        setActiveReservationId(resId);
      }
      localStorage.setItem('savoria_order_mode', 'dine-in');
      localStorage.setItem('savoria_active_table', tableId);
    } else {
      const savedMode = localStorage.getItem('savoria_order_mode');
      const savedTable = localStorage.getItem('savoria_active_table');
      if (savedMode === 'dine-in' && savedTable) {
        setOrderMode('dine-in');
        setActiveTable(savedTable);
      } else {
        setOrderMode('online');
        setActiveTable(null);
        localStorage.setItem('savoria_order_mode', 'online');
        localStorage.removeItem('savoria_active_table');
      }
    }
  }, [tableId, setOrderMode, setActiveTable]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <OrderOnline tableId={tableId || activeTable} />
    </div>
  );
}
