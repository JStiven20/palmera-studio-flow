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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Euro, Save, Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const incomeSchema = z.object({
  client_name: z.string().min(1, 'El nombre del cliente es requerido'),
  manicurist: z.enum(['Tamar', 'Anna', 'Yuli', 'Genesis', 'Invitada']),
  payment_method: z.enum(['efectivo', 'tarjeta', 'transferencia', 'bizum']),
  date: z.string().min(1, 'La fecha es requerida'),
  services: z.array(z.object({
    service_id: z.string().min(1, 'Selecciona un servicio'),
    price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  })).min(1, 'Debe agregar al menos un servicio'),
  extras_price: z.number().min(0, 'El precio de extras no puede ser negativo').optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface ServiceItem {
  service_id: string;
  price: number;
}

interface Service {
  id: string;
  name: string;
  category: string;
  default_price: number;
}

const IncomeNew = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [openComboboxes, setOpenComboboxes] = useState<{[key: number]: boolean}>({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      client_name: '',
      manicurist: 'Tamar',
      payment_method: 'efectivo',
      date: new Date().toISOString().split('T')[0],
      services: [{ service_id: '', price: 0 }],
      extras_price: 0,
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
      // Prepare records for each service
      const records = [];
      
      // Add regular services
      for (const service of data.services) {
        if (service.service_id && service.price > 0) {
          records.push({
            client_name: data.client_name,
            service_id: service.service_id,
            price: service.price,
            manicurist: data.manicurist,
            payment_method: data.payment_method,
            date: data.date,
            user_id: user.id,
          });
        }
      }

      // Add extras if there's a price
      if (data.extras_price && data.extras_price > 0) {
        records.push({
          client_name: data.client_name,
          service_id: null, // No specific service for extras
          price: data.extras_price,
          manicurist: data.manicurist,
          payment_method: data.payment_method,
          date: data.date,
          user_id: user.id,
        });
      }

      if (records.length === 0) {
        toast({
          title: 'Error',
          description: 'Debe agregar al menos un servicio o un precio de extras',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('income_records')
        .insert(records);

      if (error) throw error;

      const totalAmount = records.reduce((sum, record) => sum + record.price, 0);
      
      toast({
        title: '¡Ingresos registrados!',
        description: `Se registraron ${records.length} servicios por un total de €${totalAmount.toFixed(2)}`,
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

  const addService = () => {
    const currentServices = form.getValues('services');
    form.setValue('services', [...currentServices, { service_id: '', price: 0 }]);
  };

  const removeService = (index: number) => {
    const currentServices = form.getValues('services');
    if (currentServices.length > 1) {
      const newServices = currentServices.filter((_, i) => i !== index);
      form.setValue('services', newServices);
    }
  };

  const handleServiceChange = (serviceId: string, index: number) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const currentServices = form.getValues('services');
      currentServices[index].price = service.default_price;
      form.setValue('services', currentServices);
    }
  };

  const getTotalAmount = () => {
    const formServices = form.watch('services') || [];
    const extrasPrice = form.watch('extras_price') || 0;
    const servicesTotal = formServices.reduce((sum, service) => sum + (service.price || 0), 0);
    return servicesTotal + extrasPrice;
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

                  {/* Services Section */}
                  <div className="md:col-span-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-base font-medium">Servicios</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addService}
                          className="border-border/50 hover:bg-secondary/50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Servicio
                        </Button>
                      </div>
                      
                      {form.watch('services')?.map((_, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-border/50 rounded-lg bg-card/30">
                           <FormField
                             control={form.control}
                             name={`services.${index}.service_id`}
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Servicio {index + 1}</FormLabel>
                                 <Popover 
                                   open={openComboboxes[index] || false} 
                                   onOpenChange={(open) => setOpenComboboxes(prev => ({ ...prev, [index]: open }))}
                                 >
                                   <PopoverTrigger asChild>
                                     <FormControl>
                                       <Button
                                         variant="outline"
                                         role="combobox"
                                         aria-expanded={openComboboxes[index] || false}
                                         className={cn(
                                           "w-full justify-between form-input-elegant",
                                           !field.value && "text-muted-foreground"
                                         )}
                                       >
                                         {field.value
                                           ? services.find((service) => service.id === field.value)
                                             ? `${services.find((service) => service.id === field.value)?.name} - ${services.find((service) => service.id === field.value)?.category} (€${services.find((service) => service.id === field.value)?.default_price})`
                                             : "Selecciona un servicio"
                                           : "Selecciona un servicio"
                                         }
                                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                       </Button>
                                     </FormControl>
                                   </PopoverTrigger>
                                   <PopoverContent className="w-full p-0 bg-card border-border/50 shadow-elegant z-50">
                                     <Command>
                                       <CommandInput placeholder="Buscar servicio..." className="h-9" />
                                       <CommandList>
                                         <CommandEmpty>No se encontró ningún servicio.</CommandEmpty>
                                         <CommandGroup>
                                           {services.map((service) => (
                                             <CommandItem
                                               key={service.id}
                                               value={`${service.name} ${service.category}`}
                                               onSelect={() => {
                                                 field.onChange(service.id);
                                                 handleServiceChange(service.id, index);
                                                 setOpenComboboxes(prev => ({ ...prev, [index]: false }));
                                               }}
                                             >
                                               {service.name} - {service.category} (€{service.default_price})
                                               <Check
                                                 className={cn(
                                                   "ml-auto h-4 w-4",
                                                   field.value === service.id ? "opacity-100" : "opacity-0"
                                                 )}
                                               />
                                             </CommandItem>
                                           ))}
                                         </CommandGroup>
                                       </CommandList>
                                     </Command>
                                   </PopoverContent>
                                 </Popover>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />

                          <FormField
                            control={form.control}
                            name={`services.${index}.price`}
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

                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeService(index)}
                              disabled={form.watch('services')?.length <= 1}
                              className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extras Section */}
                  <FormField
                    control={form.control}
                    name="extras_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extras (€)</FormLabel>
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

                  {/* Total Display */}
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <div className="text-lg font-semibold text-foreground">
                      Total: €{getTotalAmount().toFixed(2)}
                    </div>
                  </div>

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
                            <SelectItem value="Tamar">Tamar</SelectItem>
                            <SelectItem value="Anna">Anna</SelectItem>
                            <SelectItem value="Yuli">Yuli</SelectItem>
                            <SelectItem value="Genesis">Genesis</SelectItem>
                            <SelectItem value="Invitada">Invitada</SelectItem>
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