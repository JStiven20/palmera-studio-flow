import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import EmployeeDashboard from './EmployeeDashboard';
import { useUserRole } from '@/hooks/useUserRole';

const Index = () => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) {
    return <div className="min-h-screen gradient-hero flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isAdmin) {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }

  return <EmployeeDashboard />;
};

export default Index;
