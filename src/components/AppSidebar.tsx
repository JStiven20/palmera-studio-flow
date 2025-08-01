import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Users, 
  Settings,
  PlusCircle,
  FileText
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useUserRole } from '@/hooks/useUserRole';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home, adminOnly: true },
  { title: 'Registrar Ingreso', url: '/income/new', icon: PlusCircle, adminOnly: false },
  { title: 'Registrar Gasto', url: '/expense/new', icon: TrendingDown, adminOnly: false },
  { title: 'Ingresos', url: '/income', icon: TrendingUp, adminOnly: true },
  { title: 'Gastos', url: '/expenses', icon: TrendingDown, adminOnly: true },
  { title: 'Reportes', url: '/reports', icon: BarChart3, adminOnly: true },
  { title: 'Manicuristas', url: '/staff', icon: Users, adminOnly: true },
  { title: 'Servicios', url: '/services', icon: FileText, adminOnly: true },
  { title: 'Configuración', url: '/settings', icon: Settings, adminOnly: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const { isAdmin, loading } = useUserRole();

  const isActive = (path: string) => currentPath === path;
  
  const getNavClassName = (path: string) => {
    const baseClass = "w-full justify-start transition-elegant";
    return isActive(path) 
      ? `${baseClass} bg-primary text-primary-foreground shadow-sm` 
      : `${baseClass} hover:bg-accent/10 hover:text-accent-foreground`;
  };

  return (
    <Sidebar className={`${collapsed ? 'w-16' : 'w-64'} border-r border-border bg-card/30 backdrop-blur-sm`}>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? 'sr-only' : ''} text-primary font-semibold`}>
            Gestión
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {loading ? (
                <div className="p-2 text-sm text-muted-foreground">Cargando...</div>
              ) : (
                menuItems
                  .filter(item => !item.adminOnly || isAdmin)
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={getNavClassName(item.url)}
                          title={collapsed ? item.title : undefined}
                        >
                          <item.icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                          {!collapsed && <span className="font-medium">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}