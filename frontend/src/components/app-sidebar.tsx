"use client";

import * as React from "react";
import {
    LayoutDashboard,
    Package,
    Tags,
    LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface UserData {
    name: string;
    email: string;
}

export function AppSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = React.useState<UserData | null>(null);

    React.useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                setUser({
                    name: decoded.name || "Usuario",
                    email: decoded.email || "",
                });
            } catch (e) {
                console.error("Error decoding token", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    const menuItems = [
        {
            title: "Base Productos",
            url: "/dashboard/products",
            icon: Package,
        },
        {
            title: "Marcas",
            url: "/dashboard/brands",
            icon: Tags,
        },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-4 py-4">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <img
                        src="/humanova-logo.png"
                        alt="Humanova Logo"
                        className="h-8 w-auto object-contain"
                    />
                    <span className="font-semibold text-slate-900">Humanova</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-xs font-bold">
                            {user?.name?.substring(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-red-600"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}