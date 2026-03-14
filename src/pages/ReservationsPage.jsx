import React from 'react';
import Reservation from '../components/sections/Reservation';
import MyBookings from '../components/sections/MyBookings';

export default function ReservationsPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <Reservation />
      <MyBookings />
    </div>
  );
}
