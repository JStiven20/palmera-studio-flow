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
    
    // Set up real-time updates
    const incomeChannel = supabase
      .channel('income-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'income_records' }, loadDashboardStats)
      .subscribe();

    const expenseChannel = supabase
      .channel('expense-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_records' }, loadDashboardStats)
      .subscribe();

    return () => {
      supabase.removeChannel(incomeChannel);
      supabase.removeChannel(expenseChannel);
    };
  }, []);

  const loadDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Get today's income
      const { data: todayIncomes } = await supabase
        .from('income_records')
        .select('price')
        .eq('user_id', user.id)
        .eq('date', today);

      // Get today's expenses
      const { data: todayExpenses } = await supabase
        .from('expense_records')
        .select('amount')
        .eq('user_id', user.id)
        .eq('date', today);

      // Get monthly income
      const { data: monthlyIncomes } = await supabase
        .from('income_records')
        .select('price, client_name')
        .eq('user_id', user.id)
        .gte('date', firstDayOfMonth);

      // Get monthly expenses
      const { data: monthlyExpenseData } = await supabase
        .from('expense_records')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', firstDayOfMonth);

      // Get manicurists performance
      const { data: manicurists } = await supabase
        .from('income_records')
        .select('manicurist, price')
        .eq('user_id', user.id)
        .gte('date', firstDayOfMonth);

      const todayIncomeTotal = todayIncomes?.reduce((sum, record) => sum + (record.price || 0), 0) || 0;
      const todayExpenseTotal = todayExpenses?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
      const monthlyIncomeTotal = monthlyIncomes?.reduce((sum, record) => sum + (record.price || 0), 0) || 0;
      const monthlyExpenseTotal = monthlyExpenseData?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;

      // Count unique clients this month
      const uniqueClients = new Set(monthlyIncomes?.map(record => record.client_name) || []).size;

      // Find top manicurist
      const manicuristStats: Record<string, number> = {};
      manicurists?.forEach(record => {
        const name = record.manicurist || 'Sin especificar';
        manicuristStats[name] = (manicuristStats[name] || 0) + (record.price || 0);
      });

      const topManicurist = Object.entries(manicuristStats)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Sin datos';

      setStats({
        todayIncome: todayIncomeTotal,
        todayExpenses: todayExpenseTotal,
        monthlyIncome: monthlyIncomeTotal,
        monthlyExpenses: monthlyExpenseTotal,
        totalClients: uniqueClients,
        topManicurist
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
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Panel de Control</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Resumen de la actividad de Palmera Estudio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm transition-all hover:shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Ingresos Hoy</CardTitle>
            <Euro className="h-4 w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-primary">€{stats.todayIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Servicios realizados hoy</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm transition-all hover:shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Gastos Hoy</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-destructive">€{stats.todayExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Gastos registrados hoy</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm transition-all hover:shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Balance Hoy</CardTitle>
            <Target className="h-4 w-4 text-accent flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className={`text-xl sm:text-2xl font-bold ${(stats.todayIncome - stats.todayExpenses) >= 0 ? 'text-primary' : 'text-destructive'}`}>
              €{(stats.todayIncome - stats.todayExpenses).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Beneficio del día</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm transition-all hover:shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-primary">€{stats.monthlyIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total facturado este mes</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm transition-all hover:shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Gastos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-destructive">€{stats.monthlyExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total gastado este mes</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm transition-all hover:shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Clientes del Mes</CardTitle>
            <Users className="h-4 w-4 text-accent flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-accent">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Clientes únicos atendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center sm:text-left">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm transition-all hover:shadow-glow cursor-pointer transform hover:scale-105" onClick={action.action}>
              <CardHeader className={`${action.className} rounded-t-lg px-4 sm:px-6 py-3 sm:py-4`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <action.icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">{action.title}</CardTitle>
                    <CardDescription className="text-current/80 text-sm truncate">{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
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