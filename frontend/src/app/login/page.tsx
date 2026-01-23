"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/auth.service";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const [login, setLogin] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            const token = authService.getToken();
            if (token) {
                // Validar el token con el backend
                const isValid = await authService.validateToken();
                if (isValid) {
                    router.push("/dashboard/products");
                    return;
                }
                // Si no es válido, el authService.validateToken() ya limpió el localStorage
            }
            setIsCheckingAuth(false);
        };
        
        checkAuth();
    }, [router]);

    // Mostrar loader mientras se verifica la autenticación
    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await authService.login({ login, contraseña });
            
            // Guardar token y usuario
            authService.setToken(response.token);
            authService.setUser(response.usuario);

            // Si debe cambiar contraseña, redirigir a página de cambio
            if (response.debeCambiarPassword) {
                router.push("/auth/change-password");
            } else {
                router.push("/dashboard/products");
            }
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || "Credenciales inválidas");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Lado izquierdo con logo */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-50 to-slate-100 items-center justify-center p-16">
                <div className="text-center">
                    <img
                        src="/humanova-logo.png"
                        alt="Humanova"
                        className="max-w-[400px] h-auto mx-auto"
                    />
                </div>
            </div>

            {/* Lado derecho con formulario */}
            <div className="flex-1 bg-white flex items-center justify-center p-10 lg:p-16">
                <div className="w-full max-w-[440px]">
                    {/* Mobile logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <img
                            src="/humanova-logo.png"
                            alt="Humanova"
                            className="h-16 w-auto mx-auto object-contain"
                        />
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Iniciar Sesión</h1>
                        <p className="text-sm text-slate-600">Ingresa tus credenciales para acceder</p>
                    </div>

                    {/* Alerts */}
                    {(error || errorMessage) && (
                        <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm">
                            {errorMessage || decodeURIComponent(error!)}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="login" className="block text-sm font-medium text-slate-700 mb-2">
                                Usuario
                            </label>
                            <input
                                id="login"
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-colors"
                                placeholder="Ingresa tu usuario"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={contraseña}
                                    onChange={(e) => setContraseña(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-colors pr-12"
                                    placeholder="Ingresa tu contraseña"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-6 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="animate-pulse text-slate-400">Cargando...</div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
