import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PublicLayout, Layout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CommunityPage from './pages/CommunityPage';
import CommunityPostDetail from './pages/CommunityPostDetail';
import WritePost from './pages/WritePost';
import ConsumerHome from './pages/consumer/ConsumerHome';
import QuoteRequestForm from './pages/consumer/QuoteRequestForm';
import QuoteList from './pages/consumer/QuoteList';
import QuoteDetail from './pages/consumer/QuoteDetail';
import BookingList from './pages/consumer/BookingList';
import WriteReview from './pages/consumer/WriteReview';
import ChatList from './pages/consumer/ChatList';
import ChatRoom from './pages/consumer/ChatRoom';
import ConsumerProfile from './pages/consumer/ConsumerProfile';
import ProviderHome from './pages/provider/ProviderHome';
import BidPool from './pages/provider/BidPool';
import BidDetail from './pages/provider/BidDetail';
import ProviderBookings from './pages/provider/ProviderBookings';
import ProviderPortfolio from './pages/provider/ProviderPortfolio';
import ProviderSettlement from './pages/provider/ProviderSettlement';
import ProviderProfile from './pages/provider/ProviderProfile';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/:id" element={<CommunityPostDetail />} />
          <Route path="/community/write" element={<WritePost />} />

          <Route path="/consumer" element={<ProtectedRoute requiredUserType="consumer"><Layout><ConsumerHome /></Layout></ProtectedRoute>} />
          <Route path="/consumer/quotes" element={<ProtectedRoute requiredUserType="consumer"><Layout><QuoteList /></Layout></ProtectedRoute>} />
          <Route path="/consumer/quotes/new" element={<ProtectedRoute requiredUserType="consumer"><Layout><QuoteRequestForm /></Layout></ProtectedRoute>} />
          <Route path="/consumer/quotes/:id" element={<ProtectedRoute requiredUserType="consumer"><Layout><QuoteDetail /></Layout></ProtectedRoute>} />
          <Route path="/consumer/bookings" element={<ProtectedRoute requiredUserType="consumer"><Layout><BookingList /></Layout></ProtectedRoute>} />
          <Route path="/consumer/review/:bookingId" element={<ProtectedRoute requiredUserType="consumer"><Layout><WriteReview /></Layout></ProtectedRoute>} />
          <Route path="/consumer/chats" element={<ProtectedRoute requiredUserType="consumer"><Layout><ChatList /></Layout></ProtectedRoute>} />
          <Route path="/consumer/chats/:chatId" element={<ProtectedRoute requiredUserType="consumer"><Layout><ChatRoom /></Layout></ProtectedRoute>} />
          <Route path="/consumer/profile" element={<ProtectedRoute requiredUserType="consumer"><Layout><ConsumerProfile /></Layout></ProtectedRoute>} />

          <Route path="/provider" element={<ProtectedRoute requiredUserType="provider"><Layout><ProviderHome /></Layout></ProtectedRoute>} />
          <Route path="/provider/bids" element={<ProtectedRoute requiredUserType="provider"><Layout><BidPool /></Layout></ProtectedRoute>} />
          <Route path="/provider/bids/:id" element={<ProtectedRoute requiredUserType="provider"><Layout><BidDetail /></Layout></ProtectedRoute>} />
          <Route path="/provider/bookings" element={<ProtectedRoute requiredUserType="provider"><Layout><ProviderBookings /></Layout></ProtectedRoute>} />
          <Route path="/provider/portfolio" element={<ProtectedRoute requiredUserType="provider"><Layout><ProviderPortfolio /></Layout></ProtectedRoute>} />
          <Route path="/provider/settlement" element={<ProtectedRoute requiredUserType="provider"><Layout><ProviderSettlement /></Layout></ProtectedRoute>} />
          <Route path="/provider/chats" element={<ProtectedRoute requiredUserType="provider"><Layout><ChatList /></Layout></ProtectedRoute>} />
          <Route path="/provider/chats/:chatId" element={<ProtectedRoute requiredUserType="provider"><Layout><ChatRoom /></Layout></ProtectedRoute>} />
          <Route path="/provider/profile" element={<ProtectedRoute requiredUserType="provider"><Layout><ProviderProfile /></Layout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
