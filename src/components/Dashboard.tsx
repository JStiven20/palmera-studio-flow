import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Users, Calendar, Euro, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  todayIncome: number;
  todayExpenses: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalClients: number;
  topManicurist: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayIncome: 0,
    todayExpenses: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalClients: 0,
    topManicurist: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // For now, we'll use placeholder data since the database is empty
      // Real data loading will be implemented once users start using the system
      setStats({
        todayIncome: 0,
        todayExpenses: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        totalClients: 0,
        topManicurist: 'Sistema listo'
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Registrar Ingreso',
      description: 'Nuevo servicio realizado',
      icon: TrendingUp,
      action: () => navigate('/income/new'),
      className: 'gradient-primary text-primary-foreground'
    },
    {
      title: 'Registrar Gasto',
      description: 'Nuevo gasto del negocio',
      icon: TrendingDown,
      action: () => navigate('/expense/new'),
      className: 'bg-secondary text-secondary-foreground'
    },
    {
      title: 'Ver Reportes',
      description: 'Análisis y estadísticas',
      icon: Target,
      action: () => navigate('/reports'),
      className: 'bg-accent text-accent-foreground'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Control</h1>
        <p className="text-muted-foreground">Resumen de la actividad de Palmera Estudio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-card transition-elegant hover:shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <Euro className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">€{stats.todayIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Servicios realizados hoy</p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-elegant hover:shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Hoy</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">€{stats.todayExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Gastos registrados hoy</p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-elegant hover:shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Hoy</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats.todayIncome - stats.todayExpenses) >= 0 ? 'text-primary' : 'text-destructive'}`}>
              €{(stats.todayIncome - stats.todayExpenses).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Beneficio del día</p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-elegant hover:shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">€{stats.monthlyIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total facturado este mes</p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-elegant hover:shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">€{stats.monthlyExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total gastado este mes</p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-elegant hover:shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes del Mes</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Clientes únicos atendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="shadow-card transition-elegant hover:shadow-elegant cursor-pointer" onClick={action.action}>
              <CardHeader className={`${action.className} rounded-t-lg`}>
                <div className="flex items-center gap-3">
                  <action.icon className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription className="text-current/80">{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Los registros recientes aparecerán aquí
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;