"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/dashboard/products");
        }
    }, [router]);

    const handleMicrosoftLogin = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        window.location.href = `${apiUrl}/auth/microsoft`;
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
                    {error && (
                        <div className="mb-8 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium animate-[fadeIn_0.4s_ease-out]">
                            {decodeURIComponent(error)}
                        </div>
                    )}

                    {success && (
                        <div className="mb-8 p-4 rounded-xl border border-green-200 bg-green-50 text-green-600 text-sm font-medium animate-[fadeIn_0.4s_ease-out]">
                            ¡Sesión iniciada con éxito!
                        </div>
                    )}

                    {/* Microsoft Login Button */}
                    <button
                        onClick={handleMicrosoftLogin}
                        className="w-full bg-white border-2 border-slate-200 py-[18px] px-6 rounded-xl text-base font-semibold text-slate-800 flex items-center justify-center gap-3 shadow-sm transition-all duration-300 hover:border-violet-500 hover:bg-violet-50 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(139,92,246,0.15)] active:translate-y-0"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 23 23">
                            <path fill="#f35325" d="M0 0h11v11H0z" />
                            <path fill="#81bc06" d="M12 0h11v11H12z" />
                            <path fill="#05a6f0" d="M0 12h11v11H0z" />
                            <path fill="#ffba08" d="M12 12h11v11H12z" />
                        </svg>
                        Iniciar sesión con Microsoft
                    </button>

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
