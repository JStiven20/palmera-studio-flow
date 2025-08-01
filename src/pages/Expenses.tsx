import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Expenses = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gastos</h1>
          <p className="text-muted-foreground">Historial y gestión de gastos</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Lista de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Lista de gastos registrados en desarrollo...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Expenses;