import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Euro, Users } from 'lucide-react';

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  servicesCount: number;
  clientsCount: number;
  topManicurist: string;
  topService: string;
}

const Reports = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    servicesCount: 0,
    clientsCount: 0,
    topManicurist: '',
    topService: ''
  });
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, selectedPeriod]);

  const loadReportData = async () => {
    try {
      const { data: incomes } = await supabase
        .from('income_records')
        .select('*, services:service_id(name)')
        .eq('user_id', user?.id);

      const { data: expenses } = await supabase
        .from('expense_records')
        .select('*')
        .eq('user_id', user?.id);

      const totalIncome = incomes?.reduce((sum, income) => sum + income.price, 0) || 0;
      const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const uniqueClients = new Set(incomes?.map(income => income.client_name) || []).size;

      setReportData({
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        servicesCount: incomes?.length || 0,
        clientsCount: uniqueClients,
        topManicurist: 'Tamar',
        topService: 'Manicura Completa'
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Reportes</h1>
            <p className="text-muted-foreground">Análisis y estadísticas del negocio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">€{reportData.totalIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total facturado</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">€{reportData.totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total gastado</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
              <Euro className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                €{reportData.netProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Ganancia total</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servicios Realizados</CardTitle>
              <BarChart3 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{reportData.servicesCount}</div>
              <p className="text-xs text-muted-foreground">Total de servicios</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{reportData.clientsCount}</div>
              <p className="text-xs text-muted-foreground">Clientes atendidos</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Servicio</CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                €{reportData.servicesCount > 0 ? (reportData.totalIncome / reportData.servicesCount).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Precio promedio</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;