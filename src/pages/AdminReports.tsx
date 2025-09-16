import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart3, Calendar as CalendarIcon, Users, Euro, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ManicuristReport {
  manicurist_name: string;
  total_income: number;
  services_count: number;
  user_id: string;
}

const AdminReports = () => {
  const [reports, setReports] = useState<ManicuristReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, [dateFrom, dateTo]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('income_records')
        .select('*');

      // Apply date filters if set
      if (dateFrom) {
        query = query.gte('date', format(dateFrom, 'yyyy-MM-dd'));
      }
      if (dateTo) {
        query = query.lte('date', format(dateTo, 'yyyy-MM-dd'));
      }

      const { data: incomeData, error: incomeError } = await query;

      if (incomeError) throw incomeError;

      // Get user profiles to map user_id to manicurist names
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, manicurist_name');

      if (profilesError) throw profilesError;

      // Group income by manicurist
      const manicuristStats = new Map<string, ManicuristReport>();

      incomeData?.forEach(record => {
        const profile = profilesData?.find(p => p.user_id === record.user_id);
        const manicuristName = profile?.manicurist_name || 'Desconocido';

        if (!manicuristStats.has(manicuristName)) {
          manicuristStats.set(manicuristName, {
            manicurist_name: manicuristName,
            total_income: 0,
            services_count: 0,
            user_id: record.user_id,
          });
        }

        const current = manicuristStats.get(manicuristName)!;
        current.total_income += Number(record.price);
        current.services_count += 1;
      });

      const reportsArray = Array.from(manicuristStats.values())
        .sort((a, b) => b.total_income - a.total_income);

      setReports(reportsArray);
      setTotalIncome(reportsArray.reduce((sum, report) => sum + report.total_income, 0));
      setTotalServices(reportsArray.reduce((sum, report) => sum + report.services_count, 0));

    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del reporte',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const getPeriodText = () => {
    if (dateFrom && dateTo) {
      return `del ${format(dateFrom, 'dd/MM/yyyy', { locale: es })} al ${format(dateTo, 'dd/MM/yyyy', { locale: es })}`;
    } else if (dateFrom) {
      return `desde el ${format(dateFrom, 'dd/MM/yyyy', { locale: es })}`;
    } else if (dateTo) {
      return `hasta el ${format(dateTo, 'dd/MM/yyyy', { locale: es })}`;
    }
    return 'de todos los tiempos';
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reportes de Manicuristas</h1>
            <p className="text-muted-foreground">Ingresos detallados por manicurista {getPeriodText()}</p>
          </div>
        </div>

        {/* Date Filters */}
        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros de Fecha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Desde</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Hasta</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Manicuristas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{reports.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">€{totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalServices}</div>
            </CardContent>
          </Card>
        </div>

        {/* Manicurists Report Table */}
        <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Reporte Detallado por Manicurista
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos para el período seleccionado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manicurista</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                    <TableHead className="text-right">Servicios</TableHead>
                    <TableHead className="text-right">Promedio por Servicio</TableHead>
                    <TableHead className="text-right">% del Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report, index) => (
                    <TableRow key={report.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-muted'}`}></div>
                          <span className="font-medium">{report.manicurist_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        €{report.total_income.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">{report.services_count}</TableCell>
                      <TableCell className="text-right">
                        €{(report.total_income / report.services_count).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {((report.total_income / totalIncome) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-primary/20 bg-muted/30">
                    <TableCell className="font-bold">TOTAL</TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      €{totalIncome.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-bold">{totalServices}</TableCell>
                    <TableCell className="text-right font-bold">
                      €{totalServices > 0 ? (totalIncome / totalServices).toFixed(2) : '0.00'}
                    </TableCell>
                    <TableCell className="text-right font-bold">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminReports;