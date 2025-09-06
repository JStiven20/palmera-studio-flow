import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, DollarSign, TrendingUp, Plus, LogOut, Trees } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface IncomeRecord {
  id: string;
  client_name: string;
  price: number;
  payment_method: string;
  date: string;
  created_at: string;
}

const ManicuristDashboard = () => {
  const { user, signOut } = useAuth();
  const { userProfile, loading: profileLoading } = useUserRole();
  const [todayRecords, setTodayRecords] = useState<IncomeRecord[]>([]);
  const [todayStats, setTodayStats] = useState({ total: 0, clients: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profileLoading && userProfile) {
      loadTodayData();
    }
  }, [profileLoading, userProfile]);

  const loadTodayData = async () => {
    if (!userProfile?.manicurist_name) return;
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('income_records')
        .select('*')
        .eq('manicurist', userProfile.manicurist_name)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading today data:', error);
        return;
      }

      setTodayRecords(data || []);
      
      const total = (data || []).reduce((sum, record) => sum + record.price, 0);
      setTodayStats({
        total,
        clients: data?.length || 0
      });
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Trees className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!userProfile?.is_active) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Cuenta Inactiva</CardTitle>
            <CardDescription>Tu cuenta está desactivada. Contacta al administrador.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md border-b shadow-elegant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Trees className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Palmera Estudio</h1>
                <p className="text-sm text-muted-foreground">¡Hola, {userProfile.full_name}!</p>
              </div>
            </div>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-elegant bg-card/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">€{todayStats.total.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant bg-card/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Hoy</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{todayStats.clients}</div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant bg-card/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fecha</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">
                {format(new Date(), 'dd/MM/yyyy', { locale: es })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button 
            onClick={() => navigate('/income/new')}
            className="gradient-primary shadow-elegant text-white font-medium py-6 text-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Registrar Cliente
          </Button>
          
          <Button 
            onClick={() => navigate('/income')}
            variant="outline"
            className="py-6 text-lg border-border/50 hover:bg-accent/50"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Ver Mis Reportes
          </Button>
        </div>

        {/* Today's Records */}
        <Card className="shadow-elegant bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Registros de Hoy</span>
            </CardTitle>
            <CardDescription>
              Todos los clientes atendidos el día de hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayRecords.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay registros para hoy</p>
                <Button 
                  onClick={() => navigate('/income/new')}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Cliente
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {todayRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-accent/20 rounded-lg border border-border/50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{record.client_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(record.created_at), 'HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">€{record.price.toFixed(2)}</p>
                      <Badge variant="outline" className="text-xs">
                        {record.payment_method}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManicuristDashboard;