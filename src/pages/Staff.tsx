import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Staff = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Manicuristas</h1>
          <p className="text-muted-foreground">Gestión del equipo de trabajo</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Equipo de Trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Gestión de manicuristas en desarrollo...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Staff;