import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Euro, Tag } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  default_price: number;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading services:', error);
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Manicura': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Pedicura': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Extras': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getServicesByCategory = () => {
    return services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, Service[]>);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </Layout>
    );
  }

  const servicesByCategory = getServicesByCategory();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Servicios</h1>
          <p className="text-muted-foreground">Catálogo completo de servicios y precios</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Servicios Disponibles ({services.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay servicios</h3>
                <p className="text-muted-foreground">Los servicios se configuran desde la base de datos</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">{category}</h3>
                      <Badge className={getCategoryBadge(category)}>
                        {categoryServices.length} servicios
                      </Badge>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Servicio</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryServices.map((service) => (
                          <TableRow key={service.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              <div className="flex items-center justify-end gap-1">
                                <Euro className="h-4 w-4" />
                                {service.default_price.toFixed(2)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {services.length > 0 && (
          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Servicios</p>
                  <p className="text-2xl font-bold text-primary">{services.length}</p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Categorías</p>
                  <p className="text-2xl font-bold text-accent">{Object.keys(servicesByCategory).length}</p>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Precio Promedio</p>
                  <p className="text-2xl font-bold text-foreground">
                    €{(services.reduce((sum, service) => sum + service.default_price, 0) / services.length).toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Precio Máximo</p>
                  <p className="text-2xl font-bold text-green-600">
                    €{Math.max(...services.map(s => s.default_price)).toFixed(2)}
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

export default Services;