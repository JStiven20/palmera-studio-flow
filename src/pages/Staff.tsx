import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Euro, TrendingUp, Star } from 'lucide-react';

interface ManicuristStats {
  name: string;
  servicesCount: number;
  totalEarnings: number;
  avgServicePrice: number;
}

const Staff = () => {
  const [manicurists, setManicurists] = useState<ManicuristStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadManicuristStats();
    }
  }, [user]);

  const loadManicuristStats = async () => {
    try {
      const { data: incomes } = await supabase
        .from('income_records')
        .select('manicurist, price')
        .eq('user_id', user?.id);

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
          <div className="grid grid-cols-5 gap-4">
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
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Manicuristas</h1>
          <p className="text-muted-foreground">Facturación individual de cada manicurista</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {allManicurists.map((name) => {
            const stats = manicurists.find(m => m.name === name);
            const isTop = manicurists[0]?.name === name && stats;
            
            return (
              <Card key={name} className={`shadow-elegant border-border/50 bg-card/70 backdrop-blur-sm ${isTop ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-center flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isTop ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
                      {isTop ? <Star className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                    </div>
                    <span className="text-lg font-semibold">{name}</span>
                    {isTop && <span className="text-xs text-primary font-medium">⭐ Top</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      €{(stats?.totalEarnings || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Facturado</p>
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold text-accent">
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