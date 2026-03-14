import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BookingProvider } from './context/BookingContext';
import ToastContainer from './components/ui/ToastContainer';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <BookingProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pt-20">
                <AppRoutes />
              </main>
              <Footer />
            </div>
            <ToastContainer />
          </BookingProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
