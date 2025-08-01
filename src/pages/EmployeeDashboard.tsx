import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Empleado</h1>
          <p className="text-muted-foreground mt-2">Registra tus ingresos y gastos</p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PlusCircle className="h-5 w-5 text-primary" />
                Registrar Ingreso
              </CardTitle>
              <CardDescription>
                Registra un nuevo ingreso por servicio realizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/income/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nuevo Ingreso
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Registrar Gasto
              </CardTitle>
              <CardDescription>
                Registra un nuevo gasto de operación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/expense/new">
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Nuevo Gasto
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
            <CardDescription>
              Como empleado, puedes registrar ingresos y gastos. Los administradores pueden ver todos los reportes y configuraciones.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;