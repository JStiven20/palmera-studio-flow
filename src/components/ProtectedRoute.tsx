import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return <div className="min-h-screen gradient-hero flex items-center justify-center">Cargando...</div>;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/income/new" replace />;
  }

  return <>{children}</>;
};