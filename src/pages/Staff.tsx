import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Euro, TrendingUp, Star, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ManicuristStats {
  name: string;
  servicesCount: number;
  totalEarnings: number;
  avgServicePrice: number;
}

const Staff = () => {
  const [manicurists, setManicurists] = useState<ManicuristStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadManicuristStats();
    }
  }, [user, dateFrom, dateTo]);

  const loadManicuristStats = async () => {
    try {
      let query = supabase
        .from('income_records')
        .select('manicurist, price, date')
        .eq('user_id', user?.id);

      if (dateFrom) {
        query = query.gte('date', format(dateFrom, 'yyyy-MM-dd'));
      }
      if (dateTo) {
        query = query.lte('date', format(dateTo, 'yyyy-MM-dd'));
      }

      const { data: incomes } = await query;

      const stats = incomes?.reduce((acc: Record<string, any>, income) => {
        const manicurist = income.manicurist;
        if (!acc[manicurist]) {
          acc[manicurist] = {
            name: manicurist,
            servicesCount: 0,
            totalEarnings: 0
          };
        }
        
        acc[manicurist].servicesCount += 1;
        acc[manicurist].totalEarnings += income.price;
        
        return acc;
      }, {}) || {};

      const manicuristList = Object.values(stats).map((manicurist: any) => ({
        name: manicurist.name,
        servicesCount: manicurist.servicesCount,
        totalEarnings: manicurist.totalEarnings,
        avgServicePrice: manicurist.servicesCount > 0 ? manicurist.totalEarnings / manicurist.servicesCount : 0
      }));

      manicuristList.sort((a, b) => b.totalEarnings - a.totalEarnings);
      setManicurists(manicuristList);
    } catch (error) {
      console.error('Error loading manicurist stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const allManicurists = ['Tamar', 'Anna', 'Yuli', 'Genesis', 'Invitada'];

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {allManicurists.map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Manicuristas</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Facturación individual de cada manicurista</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span className="text-sm font-medium">Filtrar por fechas:</span>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy") : "Hasta"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDateFrom(undefined);
                    setDateTo(undefined);
                  }}
                  className="text-sm"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {allManicurists.map((name) => {
            const stats = manicurists.find(m => m.name === name);
            const isTop = manicurists[0]?.name === name && stats;
            
            return (
              <Card key={name} className={`shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm ${isTop ? 'ring-2 ring-primary' : ''} transition-all hover:shadow-glow`}>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-center flex flex-col items-center gap-1 sm:gap-2">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${isTop ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
                      {isTop ? <Star className="h-5 w-5 sm:h-6 sm:w-6" /> : <Users className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </div>
                    <span className="text-base sm:text-lg font-semibold leading-tight">{name}</span>
                    {isTop && <span className="text-xs text-primary font-medium">⭐ Top</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 text-center px-3 sm:px-6">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      €{(stats?.totalEarnings || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Facturado</p>
                  </div>
                  
                  <div>
                    <p className="text-base sm:text-lg font-semibold text-accent">
                      {stats?.servicesCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Servicios</p>
                  </div>
                  
                  {stats && (
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        €{stats.avgServicePrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Promedio</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {manicurists.length === 0 && (
          <Card className="shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Sin estadísticas</h3>
              <p className="text-muted-foreground">
                Las estadísticas aparecerán cuando se registren servicios
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Staff;