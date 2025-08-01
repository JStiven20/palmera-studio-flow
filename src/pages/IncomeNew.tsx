import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Euro, Save } from 'lucide-react';

const incomeSchema = z.object({
  client_name: z.string().min(1, 'El nombre del cliente es requerido'),
  service_id: z.string().min(1, 'Selecciona un servicio'),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  manicurist: z.enum(['Maria', 'Carmen', 'Sofia', 'Ana']),
  payment_method: z.enum(['efectivo', 'tarjeta', 'transferencia', 'bizum']),
  date: z.string().min(1, 'La fecha es requerida'),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface Service {
  id: string;
  name: string;
  category: string;
  default_price: number;
}

const IncomeNew = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      client_name: '',
      service_id: '',
      price: 0,
      manicurist: 'Maria',
      payment_method: 'efectivo',
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los servicios',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: IncomeFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('income_records')
        .insert({
          client_name: data.client_name,
          service_id: data.service_id,
          price: data.price,
          manicurist: data.manicurist,
          payment_method: data.payment_method,
          date: data.date,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: '¡Ingreso registrado!',
        description: 'El servicio se ha registrado correctamente',
      });

      navigate('/income');
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

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      form.setValue('price', service.default_price);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Registrar Ingreso</h1>
          <p className="text-muted-foreground">Registra un nuevo servicio realizado</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Euro className="h-5 w-5 text-primary" />
              Formulario de Ingreso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="client_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Cliente</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ej: María García"
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
                    name="service_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Servicio</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleServiceChange(value);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="form-input-elegant">
                              <SelectValue placeholder="Selecciona un servicio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border/50 shadow-elegant z-50">
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} - {service.category} (€{service.default_price})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio (€)</FormLabel>
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
                    name="manicurist"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manicurista</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="form-input-elegant">
                              <SelectValue placeholder="Selecciona manicurista" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border/50 shadow-elegant z-50">
                            <SelectItem value="Maria">María</SelectItem>
                            <SelectItem value="Carmen">Carmen</SelectItem>
                            <SelectItem value="Sofia">Sofía</SelectItem>
                            <SelectItem value="Ana">Ana</SelectItem>
                          </SelectContent>
                        </Select>
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

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="gradient-primary text-white shadow-elegant hover:shadow-glow transition-all"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : 'Registrar Ingreso'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/income')}
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

export default IncomeNew;