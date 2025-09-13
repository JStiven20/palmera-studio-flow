import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  PlusCircle, 
  Euro, 
  Calendar as CalendarIcon, 
  User, 
  CreditCard, 
  Edit, 
  Trash2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface IncomeRecord {
  id: string;
  client_name: string;
  price: number;
  manicurist: string;
  payment_method: string;
  date: string;
  created_at: string;
  service_type?: string;
  created_by_manicurist?: boolean;
  modified_by_manicurist?: boolean;
  original_price?: number;
  modification_notes?: string;
}

const EmployeeDashboard = () => {
  const [todayIncomes, setTodayIncomes] = useState<IncomeRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateIncomes, setDateIncomes] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const [editForm, setEditForm] = useState({
    client_name: '',
    price: '',
    payment_method: '',
    date: ''
  });
  
  const { user } = useAuth();
  const { manicuristName, userProfile } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && manicuristName) {
      loadTodayIncomes();
    }
  }, [user, manicuristName]);

  useEffect(() => {
    if (selectedDate && manicuristName) {
      loadIncomesByDate(selectedDate);
    }
  }, [selectedDate, manicuristName]);

  const loadTodayIncomes = async () => {
    if (!manicuristName) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('income_records')
        .select('id, client_name, price, manicurist, payment_method, date, created_at, service_type, created_by_manicurist, modified_by_manicurist, original_price, modification_notes')
        .eq('manicurist', manicuristName)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodayIncomes(data || []);
    } catch (error) {
      console.error('Error loading today incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIncomesByDate = async (date: Date) => {
    if (!manicuristName) return;
    
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('income_records')
        .select('id, client_name, price, manicurist, payment_method, date, created_at, service_type, created_by_manicurist, modified_by_manicurist, original_price, modification_notes')
        .eq('manicurist', manicuristName)
        .eq('date', dateStr)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDateIncomes(data || []);
    } catch (error) {
      console.error('Error loading incomes by date:', error);
    }
  };

  const startEdit = (income: IncomeRecord) => {
    setEditingIncome(income);
    setEditForm({
      client_name: income.client_name,
      price: income.price.toString(),
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
          payment_method: editForm.payment_method,
          date: editForm.date
        })
        .eq('id', editingIncome.id);

      if (error) throw error;

      toast({
        title: 'Ingreso actualizado',
        description: 'El registro se ha actualizado correctamente',
      });

      setEditingIncome(null);
      loadTodayIncomes();
      if (selectedDate) {
        loadIncomesByDate(selectedDate);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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

      loadTodayIncomes();
      if (selectedDate) {
        loadIncomesByDate(selectedDate);
      }
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

  const getTotalForDate = (incomes: IncomeRecord[]) => {
    return incomes.reduce((total, income) => total + income.price, 0);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Hola, {userProfile?.full_name || 'Manicurista'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Panel de {manicuristName} - {format(new Date(), 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
          </p>
        </div>

        {/* Resumen del día */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                €{getTotalForDate(todayIncomes).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                {todayIncomes.length} servicios
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PlusCircle className="h-5 w-5 text-primary" />
                Nuevo Ingreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full gradient-primary text-white">
                <div onClick={() => navigate('/income/new')} className="cursor-pointer">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Registrar Servicio
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Última Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {todayIncomes.length > 0 ? (
                  <>
                    <p className="font-medium">{todayIncomes[0].client_name}</p>
                    <p className="text-muted-foreground">
                      {format(new Date(todayIncomes[0].created_at), 'HH:mm')}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Sin actividad hoy</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Servicios de hoy */}
        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Servicios de Hoy ({todayIncomes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayIncomes.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay servicios registrados hoy</h3>
                <p className="text-muted-foreground mb-4">Registra tu primer servicio del día</p>
                <Button onClick={() => navigate('/income/new')} className="gradient-primary text-white">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Registrar Servicio
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                     <TableRow>
                       <TableHead>Cliente</TableHead>
                       <TableHead>Precio</TableHead>
                       <TableHead>Pago</TableHead>
                       <TableHead>Estado</TableHead>
                       <TableHead>Hora</TableHead>
                       <TableHead className="text-right">Acciones</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {todayIncomes.map((income) => (
                       <TableRow key={income.id}>
                         <TableCell className="font-medium">{income.client_name}</TableCell>
                         <TableCell className="font-semibold text-primary">
                           €{income.price.toFixed(2)}
                           {income.modified_by_manicurist && income.original_price && (
                             <div className="text-xs text-muted-foreground">
                               Original: €{income.original_price.toFixed(2)}
                             </div>
                           )}
                         </TableCell>
                         <TableCell>
                           <Badge className={getPaymentMethodBadge(income.payment_method)}>
                             {income.payment_method}
                           </Badge>
                         </TableCell>
                         <TableCell>
                           {income.created_by_manicurist ? (
                             <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                               Creado por ti
                             </Badge>
                           ) : income.modified_by_manicurist ? (
                             <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                               Modificado por ti
                             </Badge>
                           ) : (
                             <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                               Pre-cargado
                             </Badge>
                           )}
                         </TableCell>
                         <TableCell>{format(new Date(income.created_at), 'HH:mm')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Dialog open={editingIncome?.id === income.id} onOpenChange={(open) => !open && setEditingIncome(null)}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEdit(income)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Servicio</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="client_name">Cliente</Label>
                                    <Input
                                      id="client_name"
                                      value={editForm.client_name}
                                      onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
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
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="payment_method">Método de Pago</Label>
                                    <Select
                                      value={editForm.payment_method}
                                      onValueChange={(value) => setEditForm({ ...editForm, payment_method: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
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
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
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

        {/* Calendario de facturación */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Calendario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-border/50 pointer-events-auto"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-primary" />
                {selectedDate ? format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: es }) : 'Selecciona una fecha'}
              </CardTitle>
              {selectedDate && (
                <div className="text-2xl font-bold text-primary">
                  €{getTotalForDate(dateIncomes).toFixed(2)} ({dateIncomes.length} servicios)
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-muted-foreground">Selecciona una fecha en el calendario para ver los servicios</p>
              ) : dateIncomes.length === 0 ? (
                <p className="text-muted-foreground">No hay servicios registrados en esta fecha</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dateIncomes.map((income) => (
                    <div key={income.id} className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                      <div>
                        <p className="font-medium">{income.client_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(income.created_at), 'HH:mm')} • {income.payment_method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">€{income.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;