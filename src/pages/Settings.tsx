import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRole } from '@/hooks/useUserRole';

const Settings = () => {
  const { userProfile, loading } = useUserRole();

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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
          <p className="text-muted-foreground">Información de tu perfil</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Perfil de Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre completo</label>
              <p className="text-lg">{userProfile?.full_name || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-lg">{userProfile?.email || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Nombre como manicurista</label>
              <p className="text-lg">{userProfile?.manicurist_name || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Estado</label>
              <p className="text-lg">{userProfile?.is_active ? 'Activo' : 'Inactivo'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;