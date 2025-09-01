import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Trash2, Plus, Edit, Users, Settings as SettingsIcon } from 'lucide-react';

interface Manicurist {
  id: string;
  name: string;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  category: string;
  default_price: number | null;
}

const Settings = () => {
  const [manicurists, setManicurists] = useState<Manicurist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [newManicuristName, setNewManicuristName] = useState('');
  const [editingManicurist, setEditingManicurist] = useState<Manicurist | null>(null);
  const [newService, setNewService] = useState({ name: '', category: '', default_price: '' });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load manicurists
      const { data: manicuristsData } = await supabase
        .from('manicurists')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      // Load services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .or(`user_id.eq.${user?.id},user_id.is.null`)
        .order('category, name');

      setManicurists(manicuristsData || []);
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addManicurist = async () => {
    if (!newManicuristName.trim()) return;

    try {
      const { error } = await supabase
        .from('manicurists')
        .insert([{ 
          user_id: user?.id, 
          name: newManicuristName.trim(),
          is_active: true 
        }]);

      if (error) throw error;

      setNewManicuristName('');
      loadData();
      toast({
        title: "Éxito",
        description: "Manicurista agregada correctamente",
      });
    } catch (error) {
      console.error('Error adding manicurist:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la manicurista",
        variant: "destructive",
      });
    }
  };

  const updateManicurist = async () => {
    if (!editingManicurist?.name.trim()) return;

    try {
      const { error } = await supabase
        .from('manicurists')
        .update({ name: editingManicurist.name.trim() })
        .eq('id', editingManicurist.id);

      if (error) throw error;

      setEditingManicurist(null);
      loadData();
      toast({
        title: "Éxito",
        description: "Manicurista actualizada correctamente",
      });
    } catch (error) {
      console.error('Error updating manicurist:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la manicurista",
        variant: "destructive",
      });
    }
  };

  const deleteManicurist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('manicurists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadData();
      toast({
        title: "Éxito",
        description: "Manicurista eliminada correctamente",
      });
    } catch (error) {
      console.error('Error deleting manicurist:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la manicurista",
        variant: "destructive",
      });
    }
  };

  const addService = async () => {
    if (!newService.name.trim() || !newService.category.trim()) return;

    try {
      const { error } = await supabase
        .from('services')
        .insert([{ 
          user_id: user?.id,
          name: newService.name.trim(),
          category: newService.category.trim(),
          default_price: newService.default_price ? parseFloat(newService.default_price) : null
        }]);

      if (error) throw error;

      setNewService({ name: '', category: '', default_price: '' });
      loadData();
      toast({
        title: "Éxito",
        description: "Servicio agregado correctamente",
      });
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el servicio",
        variant: "destructive",
      });
    }
  };

  const updateService = async () => {
    if (!editingService?.name.trim() || !editingService?.category.trim()) return;

    try {
      const { error } = await supabase
        .from('services')
        .update({ 
          name: editingService.name.trim(),
          category: editingService.category.trim(),
          default_price: editingService.default_price
        })
        .eq('id', editingService.id);

      if (error) throw error;

      setEditingService(null);
      loadData();
      toast({
        title: "Éxito",
        description: "Servicio actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el servicio",
        variant: "destructive",
      });
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadData();
      toast({
        title: "Éxito",
        description: "Servicio eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
          <p className="text-muted-foreground">Gestiona manicuristas y servicios del sistema</p>
        </div>

        {/* Manicurists Management */}
        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Users className="h-5 w-5 text-primary" />
              Gestión de Manicuristas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nombre de la manicurista"
                value={newManicuristName}
                onChange={(e) => setNewManicuristName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addManicurist()}
              />
              <Button onClick={addManicurist} className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>

            <div className="space-y-2">
              {manicurists.map((manicurist) => (
                <div key={manicurist.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{manicurist.name}</span>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingManicurist({ ...manicurist })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Manicurista</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-name">Nombre</Label>
                            <Input
                              id="edit-name"
                              value={editingManicurist?.name || ''}
                              onChange={(e) => setEditingManicurist(prev => 
                                prev ? { ...prev, name: e.target.value } : null
                              )}
                            />
                          </div>
                          <Button onClick={updateManicurist} className="w-full">
                            Actualizar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteManicurist(manicurist.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Services Management */}
        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Gestión de Servicios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                placeholder="Nombre del servicio"
                value={newService.name}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Categoría"
                value={newService.category}
                onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Precio (€)"
                value={newService.default_price}
                onChange={(e) => setNewService(prev => ({ ...prev, default_price: e.target.value }))}
              />
              <Button onClick={addService} className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>

            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <span className="font-medium">{service.name}</span>
                    <div className="text-sm text-muted-foreground">
                      {service.category} {service.default_price && `• €${service.default_price}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingService({ ...service })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Servicio</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-service-name">Nombre</Label>
                            <Input
                              id="edit-service-name"
                              value={editingService?.name || ''}
                              onChange={(e) => setEditingService(prev => 
                                prev ? { ...prev, name: e.target.value } : null
                              )}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-service-category">Categoría</Label>
                            <Input
                              id="edit-service-category"
                              value={editingService?.category || ''}
                              onChange={(e) => setEditingService(prev => 
                                prev ? { ...prev, category: e.target.value } : null
                              )}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-service-price">Precio (€)</Label>
                            <Input
                              id="edit-service-price"
                              type="number"
                              step="0.01"
                              value={editingService?.default_price || ''}
                              onChange={(e) => setEditingService(prev => 
                                prev ? { ...prev, default_price: parseFloat(e.target.value) || null } : null
                              )}
                            />
                          </div>
                          <Button onClick={updateService} className="w-full">
                            Actualizar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;