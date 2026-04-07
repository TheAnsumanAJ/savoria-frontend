import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import OrderNowPage from './pages/OrderNowPage';
import ReservationsPage from './pages/ReservationsPage';
import EntertainmentPage from './pages/EntertainmentPage';
import Login from './pages/Login';
import ManagerPortal from './pages/ManagerPortal';
import BillPage from './pages/BillPage';
import ReservationBillPage from './pages/ReservationBillPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/menu/:tableId" element={<MenuPage />} />
      <Route path="/ordernow" element={<OrderNowPage />} />
      <Route path="/ordernow/:tableId" element={<OrderNowPage />} />
      <Route path="/ordernow/:tableId/:resId" element={<OrderNowPage />} />
      <Route path="/reservations" element={<ReservationsPage />} />
      <Route path="/entertainment" element={<EntertainmentPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/manager" element={<ManagerPortal />} />
      <Route path="/bill/reservation/:reservationId" element={<ReservationBillPage />} />
      <Route path="/bill/:orderId" element={<BillPage />} />
    </Routes>
  );
}

export default AppRoutes;
