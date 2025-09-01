import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TrendingDown, Save } from 'lucide-react';

const expenseSchema = z.object({
  reason: z.string().min(1, 'La razón del gasto es requerida'),
  description: z.string().optional(),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  payment_method: z.enum(['efectivo', 'tarjeta', 'transferencia', 'bizum']),
  date: z.string().min(1, 'La fecha es requerida'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const ExpenseNew = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      reason: '',
      description: '',
      amount: 0,
      payment_method: 'efectivo',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('expense_records' as any)
        .insert({
          reason: data.reason,
          description: data.description || null,
          amount: data.amount,
          payment_method: data.payment_method,
          date: data.date,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: '¡Gasto registrado!',
        description: 'El gasto se ha registrado correctamente',
      });

      navigate('/expenses');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Registrar Gasto</h1>
          <p className="text-muted-foreground">Registra un nuevo gasto del negocio</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Formulario de Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón del Gasto</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ej: Productos de uñas, Alquiler, Servicios"
                            className="form-input-elegant"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            className="form-input-elegant"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto (€)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            className="form-input-elegant"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pago</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="form-input-elegant">
                              <SelectValue placeholder="Selecciona método de pago" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border/50 shadow-elegant z-50">
                            <SelectItem value="efectivo">Efectivo</SelectItem>
                            <SelectItem value="tarjeta">Tarjeta</SelectItem>
                            <SelectItem value="transferencia">Transferencia</SelectItem>
                            <SelectItem value="bizum">Bizum</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Detalles adicionales del gasto..."
                          className="form-input-elegant min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="gradient-primary text-white shadow-elegant hover:shadow-glow transition-all"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : 'Registrar Gasto'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/expenses')}
                    className="border-border/50 hover:bg-secondary/50"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ExpenseNew;