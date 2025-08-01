import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Services = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Servicios</h1>
          <p className="text-muted-foreground">Catálogo de servicios ofrecidos</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Catálogo de Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Gestión de servicios en desarrollo...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Services;