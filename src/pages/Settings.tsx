import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
          <p className="text-muted-foreground">Ajustes del sistema</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configuración del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Opciones de configuración en desarrollo...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;