import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Plus, Calendar, CreditCard, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExpenseRecord {
  id: string;
  reason: string;
  description?: string;
  amount: number;
  payment_method: string;
  date: string;
  created_at: string;
}

const Expenses = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los gastos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expense_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Gasto eliminado',
        description: 'El registro se ha eliminado correctamente',
      });

      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      efectivo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      tarjeta: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      transferencia: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      bizum: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-muted rounded"></div>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Gastos</h1>
            <p className="text-muted-foreground">Historial y gestión de gastos</p>
          </div>
          <Button 
            onClick={() => navigate('/expense/new')}
            className="gradient-primary text-white shadow-elegant hover:shadow-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Lista de Gastos ({expenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay gastos registrados</h3>
                <p className="text-muted-foreground mb-4">Comienza registrando tu primer gasto</p>
                <Button onClick={() => navigate('/expense/new')} className="gradient-primary text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Gasto
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Importe</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {expense.reason}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {expense.description || 'Sin descripción'}
                        </TableCell>
                        <TableCell className="font-semibold text-destructive">€{expense.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getPaymentMethodBadge(expense.payment_method)}>
                            <CreditCard className="h-3 w-3 mr-1" />
                            {expense.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(expense.date), 'dd/MM/yyyy', { locale: es })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteExpense(expense.id)}
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {expenses.length > 0 && (
          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total de Gastos</p>
                  <p className="text-2xl font-bold text-destructive">
                    €{expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Gastos Registrados</p>
                  <p className="text-2xl font-bold text-accent">{expenses.length}</p>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Gasto Promedio</p>
                  <p className="text-2xl font-bold text-foreground">
                    €{expenses.length > 0 ? (expenses.reduce((sum, expense) => sum + expense.amount, 0) / expenses.length).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Expenses;