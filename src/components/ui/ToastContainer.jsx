import React, { useState, useEffect } from 'react';

export const toastEvent = new EventTarget();

export const showToast = (message, type = 'success') => {
  const event = new CustomEvent('show-toast', { detail: { message, type } });
  toastEvent.dispatchEvent(event);
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const newToast = { id: Date.now(), ...e.detail };
      setToasts((prev) => [...prev, newToast]);
      
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3000); // 3 seconds total display
    };

    toastEvent.addEventListener('show-toast', handleToast);
    return () => toastEvent.removeEventListener('show-toast', handleToast);
  }, []);

  return (
    <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const bgColor = toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-amber-600';
        return (
          <div key={toast.id} className={`toast ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg font-medium pointer-events-auto`}>
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
