'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, LogOut, User as UserIcon, ChevronDown, Shield, ClipboardCheck, Settings } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePendingCount } from '@/hooks';

interface UserData {
  name: string;
  email: string;
  rol: string;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<UserData | null>(null);
  const { count: pendingCount } = usePendingCount();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: { name?: string; email?: string; rol?: string } = jwtDecode(token);
        setUser({
          name: decoded.name || 'Usuario',
          email: decoded.email || '',
          rol: decoded.rol || 'GERENTE',
        });
      } catch (e) {
        console.error('Error decoding token', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const userRole = user?.rol?.toUpperCase().replace(/\s+/g, '_');
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isAdmin = userRole === 'ADMINISTRADOR' || isSuperAdmin;

  const navItems = [
    {
      title: 'Base Productos',
      url: '/dashboard/products',
      icon: Package,
      showAlways: true,
    },
    {
      title: 'Aprobaciones',
      url: '/dashboard/approvals',
      icon: ClipboardCheck,
      showAlways: false,
      adminOnly: true,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      title: 'Configuración',
      url: '/dashboard/settings',
      icon: Settings,
      showAlways: false,
      superAdminOnly: true,
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.showAlways) return true;
    if (item.superAdminOnly && isSuperAdmin) return true;
    if (item.adminOnly && isAdmin) return true; // isAdmin incluye SUPER_ADMIN
    return false;
  });

  const getAvatarGradient = () => {
    if (isSuperAdmin) return 'bg-gradient-to-tr from-amber-500 to-orange-600';
    if (isAdmin) return 'bg-gradient-to-tr from-purple-500 to-pink-500';
    return 'bg-gradient-to-tr from-blue-500 to-indigo-600';
  };

  const getRoleBadgeStyle = () => {
    if (isSuperAdmin) return 'bg-amber-600 hover:bg-amber-600';
    if (isAdmin) return 'bg-purple-600 hover:bg-purple-600';
    return '';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="w-full px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard/products"
              className="flex items-center gap-3 transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center p-0.5">
                <img src="/logo.png" alt="Medifarma Logo" className="h-10 w-auto object-contain" />
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <item.icon
                      className={cn('h-4 w-4', isActive ? 'text-blue-600' : 'text-slate-400')}
                    />
                    {item.title}
                    {item.badge && (
                      <Badge className="h-5 min-w-5 px-1.5 bg-red-500 hover:bg-red-500 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-auto flex items-center gap-3 px-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-[12px] font-semibold text-slate-900 leading-none">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">{user?.email}</p>
                  </div>
                  <Avatar className="h-8 w-8 border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                    <AvatarFallback
                      className={cn(
                        'text-white text-[11px] font-bold',
                        getAvatarGradient(),
                      )}
                    >
                      {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-1" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <Badge
                      variant={isAdmin ? 'default' : 'secondary'}
                      className={cn(
                        'w-fit text-[10px]',
                        getRoleBadgeStyle(),
                      )}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {user?.rol}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
