import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { LogOut, Trees } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Trees className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 sm:h-16 border-b border-border bg-card/70 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-1 sm:gap-2">
                <Trees className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h1 className="text-lg sm:text-xl font-semibold text-foreground hidden sm:block">Palmera Estudio</h1>
                <h1 className="text-base font-semibold text-foreground sm:hidden">Palmera</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-muted-foreground hidden md:block">
                Bienvenido, {user.user_metadata?.name || user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-1 sm:gap-2 hover:bg-destructive hover:text-destructive-foreground border-border/50 h-8 sm:h-9 px-2 sm:px-3"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden text-xs">Salir</span>
              </Button>
            </div>
          </header>
          
          <main className="flex-1 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-background via-background to-secondary/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;