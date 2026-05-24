import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'consumer' | 'provider';
}

export default function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005088]" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredUserType && profile?.user_type !== requiredUserType) {
    const redirectPath = profile?.user_type === 'provider' ? '/provider' : '/consumer';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
