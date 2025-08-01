import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ExpenseNew = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Registrar Gasto</h1>
          <p className="text-muted-foreground">Nuevo gasto del negocio</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Formulario de Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Formulario para registrar nuevos gastos en desarrollo...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ExpenseNew;