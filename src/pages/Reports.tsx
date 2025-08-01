import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Reports = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reportes</h1>
          <p className="text-muted-foreground">Análisis y estadísticas del negocio</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Análisis Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Reportes y análisis en desarrollo...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;