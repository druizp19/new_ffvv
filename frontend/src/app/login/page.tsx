"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
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

    const currentYear = new Date().getFullYear();

    return (
        <div className="flex min-h-screen overflow-hidden">
            {/* Lado izquierdo con gradiente rojo-morado-azul */}
            <div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-16"
                style={{ background: 'linear-gradient(135deg, #f03535 0%, #7e4feb 50%, #0162ff 100%)' }}
            >
                {/* Elementos decorativos flotantes */}
                <div
                    className="absolute w-[500px] h-[500px] -top-[100px] -left-[100px] rounded-full animate-[float_20s_ease-in-out_infinite]"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }}
                />
                <div
                    className="absolute w-[400px] h-[400px] -bottom-[80px] -right-[80px] rounded-full animate-[float_15s_ease-in-out_infinite_reverse]"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }}
                />

                <div className="relative z-10 text-center text-white">
                    <div className="mb-10">
                        <img
                            src="/logo.png"
                            alt="Medifarma"
                            className="max-w-[280px] h-auto mx-auto brightness-0 invert drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                        />
                    </div>
                    <h1 className="text-5xl font-bold mb-4 tracking-tight">
                        Configuración de Mercado
                    </h1>
                    <p className="text-xl font-normal opacity-95 tracking-wide">
                        Sistema de Gestión
                    </p>
                </div>
            </div>

            {/* Lado derecho con formulario */}
            <div className="flex-1 bg-white flex items-center justify-center p-10 lg:p-16">
                <div className="w-full max-w-[440px] animate-[slideIn_0.6s_ease-out]">
                    {/* Header */}
                    <div className="mb-12">
                        {/* Mobile logo */}
                        <div className="lg:hidden mb-8 text-center">
                            <img
                                src="/logo.png"
                                alt="Medifarma"
                                className="h-14 w-auto mx-auto object-contain"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Bienvenido</h1>
                        <p className="text-base text-slate-500">Inicia sesión para continuar</p>
                    </div>

                    {/* Alerts */}
                    {(error || errorMessage) && (
                        <div className="mb-8 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium animate-[fadeIn_0.4s_ease-out]">
                            {errorMessage || decodeURIComponent(error!)}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="login" className="block text-sm font-medium text-slate-700 mb-2">
                                Usuario
                            </label>
                            <input
                                id="login"
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-colors"
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
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-colors pr-12"
                                    placeholder="Ingresa tu contraseña"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-[18px] px-6 rounded-xl text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-8 text-slate-400 text-sm">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="px-4 flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" />
                            Acceso seguro
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Info Box */}
                    <div
                        className="rounded-xl p-5 border border-purple-200 mt-8"
                        style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)' }}
                    >
                        <p className="text-sm text-purple-800 leading-relaxed">
                            <strong>🔒 Autenticación corporativa</strong><br />
                            Usa tu cuenta de Medifarma para acceder de forma segura al sistema.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center text-slate-400 text-[13px]">
                        © {currentYear} Medifarma S.A. - Todos los derechos reservados
                    </div>
                </div>
            </div>

            {/* Añadir keyframes para las animaciones */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, 30px); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
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
