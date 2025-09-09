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
import { Euro, Plus, Calendar, User, CreditCard, Trash2, Edit, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IncomeRecord {
  id: string;
  client_name: string;
  price: number;
  manicurist: string;
  payment_method: string;
  date: string;
  created_at: string;
  service_type?: string;
}

const Income = () => {
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'manicurist'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const [editForm, setEditForm] = useState({
    client_name: '',
    price: '',
    manicurist: '',
    payment_method: '',
    date: ''
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadIncomes();
    }
  }, [user]);

  useEffect(() => {
    sortIncomes();
  }, [incomes, sortBy, sortOrder]);

  const loadIncomes = async () => {
    try {
      const { data, error } = await supabase
        .from('income_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncomes(data || []);
    } catch (error) {
      console.error('Error loading incomes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los ingresos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sortIncomes = () => {
    const sorted = [...incomes].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'manicurist') {
        comparison = a.manicurist.localeCompare(b.manicurist);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredIncomes(sorted);
  };

  const handleSort = (newSortBy: 'date' | 'manicurist') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      const { error } = await supabase
        .from('income_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Ingreso eliminado',
        description: 'El registro se ha eliminado correctamente',
      });

      setIncomes(incomes.filter(income => income.id !== id));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startEdit = (income: IncomeRecord) => {
    setEditingIncome(income);
    setEditForm({
      client_name: income.client_name,
      price: income.price.toString(),
      manicurist: income.manicurist,
      payment_method: income.payment_method,
      date: income.date
    });
  };

  const updateIncome = async () => {
    if (!editingIncome) return;

    try {
      const { error } = await supabase
        .from('income_records')
        .update({
          client_name: editForm.client_name,
          price: parseFloat(editForm.price),
          manicurist: editForm.manicurist as any,
          payment_method: editForm.payment_method,
          date: editForm.date
        })
        .eq('id', editingIncome.id);

      if (error) throw error;

      toast({
        title: 'Ingreso actualizado',
        description: 'El registro se ha actualizado correctamente',
      });

      setIncomes(incomes.map(income => 
        income.id === editingIncome.id 
          ? { ...income, ...editForm, price: parseFloat(editForm.price) }
          : income
      ));
      setEditingIncome(null);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Ingresos</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Historial y gestión de ingresos</p>
          </div>
          <Button 
            onClick={() => navigate('/income/new')}
            className="gradient-primary text-white shadow-elegant hover:shadow-glow w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="sm:inline">Nuevo Ingreso</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Euro className="h-5 w-5 text-primary" />
              Lista de Ingresos ({filteredIncomes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIncomes.length === 0 ? (
              <div className="text-center py-12">
                <Euro className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay ingresos registrados</h3>
                <p className="text-muted-foreground mb-4">Comienza registrando tu primer servicio</p>
                <Button onClick={() => navigate('/income/new')} className="gradient-primary text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Ingreso
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Cliente</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[140px]">Servicio</TableHead>
                      <TableHead className="min-w-[80px]">Precio</TableHead>
                      <TableHead 
                        className="hidden md:table-cell min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('manicurist')}
                      >
                        <div className="flex items-center gap-1">
                          Manicurista
                          {sortBy === 'manicurist' && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                          {sortBy === 'manicurist' && sortOrder === 'desc' && <span className="text-xs">↓</span>}
                          {sortBy === 'manicurist' && sortOrder === 'asc' && <span className="text-xs">↑</span>}
                        </div>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[100px]">Pago</TableHead>
                      <TableHead 
                        className="min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-1">
                          Fecha
                          {sortBy === 'date' && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                          {sortBy === 'date' && sortOrder === 'desc' && <span className="text-xs">↓</span>}
                          {sortBy === 'date' && sortOrder === 'asc' && <span className="text-xs">↑</span>}
                        </div>
                      </TableHead>
                      <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncomes.map((income) => (
                      <TableRow key={income.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{income.client_name}</span>
                          </div>
                          <div className="sm:hidden mt-1">
                            <p className="text-sm font-medium text-primary">€{income.price.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{income.service_type || 'Sin servicio'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div>
                            <p className="font-medium truncate">{income.service_type || 'Sin servicio'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-primary hidden sm:table-cell">€{income.price.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell">{income.manicurist}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge className={getPaymentMethodBadge(income.payment_method)}>
                            <CreditCard className="h-3 w-3 mr-1" />
                            {income.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">{format(new Date(income.date), 'dd/MM', { locale: es })}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Dialog open={editingIncome?.id === income.id} onOpenChange={(open) => !open && setEditingIncome(null)}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEdit(income)}
                                  className="text-primary hover:bg-primary hover:text-primary-foreground h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>Editar Ingreso</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="client_name">Nombre del Cliente</Label>
                                    <Input
                                      id="client_name"
                                      value={editForm.client_name}
                                      onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                                      placeholder="Nombre del cliente"
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="price">Precio (€)</Label>
                                    <Input
                                      id="price"
                                      type="number"
                                      step="0.01"
                                      value={editForm.price}
                                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="manicurist">Manicurista</Label>
                                    <Select
                                      value={editForm.manicurist}
                                      onValueChange={(value) => setEditForm({ ...editForm, manicurist: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona manicurista" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Tamar">Tamar</SelectItem>
                                        <SelectItem value="Anna">Anna</SelectItem>
                                        <SelectItem value="Yuli">Yuli</SelectItem>
                                        <SelectItem value="Genesis">Genesis</SelectItem>
                                        <SelectItem value="Invitada">Invitada</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="payment_method">Método de Pago</Label>
                                    <Select
                                      value={editForm.payment_method}
                                      onValueChange={(value) => setEditForm({ ...editForm, payment_method: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona método de pago" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                        <SelectItem value="bizum">Bizum</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="date">Fecha</Label>
                                    <Input
                                      id="date"
                                      type="date"
                                      value={editForm.date}
                                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setEditingIncome(null)}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={updateIncome} className="gradient-primary text-white">
                                    Actualizar
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteIncome(income.id)}
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {incomes.length > 0 && (
          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total de Ingresos</p>
                  <p className="text-2xl font-bold text-primary">
                    €{incomes.reduce((sum, income) => sum + income.price, 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Servicios Realizados</p>
                  <p className="text-2xl font-bold text-accent">{incomes.length}</p>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Precio Promedio</p>
                  <p className="text-2xl font-bold text-foreground">
                    €{incomes.length > 0 ? (incomes.reduce((sum, income) => sum + income.price, 0) / incomes.length).toFixed(2) : '0.00'}
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

export default Income;