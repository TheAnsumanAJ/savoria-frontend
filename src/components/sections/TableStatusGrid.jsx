import React from 'react';

const TableStatusGrid = ({ reservations }) => {
  // Assume 20 tables for now
  const totalTables = 20;
  const tables = Array.from({ length: totalTables }, (_, i) => i + 1);

  // Get current active reservations (Confirmed status)
  const activeReservations = reservations.filter(res => res.status === 'Confirmed');

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
          <span className="text-sm font-medium text-stone-600">Free</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
          <span className="text-sm font-medium text-stone-600">Occupied</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map(tableNum => {
          const reservation = activeReservations.find(res => res.tableNumber === tableNum);
          const isOccupied = !!reservation;

          return (
            <div 
              key={tableNum}
              className={`relative h-32 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                isOccupied 
                  ? 'bg-red-50 border-red-200 text-red-900 shadow-sm' 
                  : 'bg-green-50 border-green-200 text-green-900'
              }`}
            >
              <div className="text-3xl font-display font-bold mb-1">
                {tableNum}
              </div>
              <div className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                isOccupied ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
              }`}>
                {isOccupied ? 'Occupied' : 'Available'}
              </div>

              {isOccupied && (
                <div className="absolute inset-x-0 bottom-0 p-2 text-center bg-red-100/50 rounded-b-2xl border-t border-red-200/50">
                  <div className="text-[10px] font-bold truncate px-1">
                    {reservation.name}
                  </div>
                  <div className="text-[9px] font-medium opacity-75">
                    {reservation.guests} Guests • {reservation.time}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableStatusGrid;
