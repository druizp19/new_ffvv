"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authService } from "@/services/auth.service";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [contraseñaActual, setContraseñaActual] = useState("");
    const [contraseñaNueva, setContraseñaNueva] = useState("");
    const [confirmarContraseña, setConfirmarContraseña] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const token = authService.getToken();
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        // Validar que las contraseñas coincidan
        if (contraseñaNueva !== confirmarContraseña) {
            setErrorMessage("Las contraseñas no coinciden");
            setIsLoading(false);
            return;
        }

        // Validar longitud mínima
        if (contraseñaNueva.length < 6) {
            setErrorMessage("La contraseña debe tener al menos 6 caracteres");
            setIsLoading(false);
            return;
        }

        try {
            const response = await authService.changePassword({
                contraseñaActual,
                contraseñaNueva,
            });

            setSuccessMessage(response.message);
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                router.push("/dashboard/products");
            }, 2000);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || "Error al cambiar la contraseña");
        } finally {
            setIsLoading(false);
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <div className="flex min-h-screen overflow-hidden">
            {/* Lado izquierdo con gradiente */}
            <div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-16"
                style={{ background: 'linear-gradient(135deg, #f03535 0%, #7e4feb 50%, #0162ff 100%)' }}
            >
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
                        Cambio de Contraseña
                    </h1>
                    <p className="text-xl font-normal opacity-95 tracking-wide">
                        Actualiza tu contraseña
                    </p>
                </div>
            </div>

            {/* Lado derecho con formulario */}
            <div className="flex-1 bg-white flex items-center justify-center p-10 lg:p-16">
                <div className="w-full max-w-[440px] animate-[slideIn_0.6s_ease-out]">
                    {/* Header */}
                    <div className="mb-12">
                        <div className="lg:hidden mb-8 text-center">
                            <img
                                src="/logo.png"
                                alt="Medifarma"
                                className="h-14 w-auto mx-auto object-contain"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Cambiar Contraseña</h1>
                        <p className="text-base text-slate-500">Es necesario cambiar tu contraseña por seguridad</p>
                    </div>

                    {/* Alerts */}
                    {errorMessage && (
                        <div className="mb-8 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium animate-[fadeIn_0.4s_ease-out] flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-8 p-4 rounded-xl border border-green-200 bg-green-50 text-green-600 text-sm font-medium animate-[fadeIn_0.4s_ease-out]">
                            {successMessage}
                        </div>
                    )}

                    {/* Change Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                Contraseña Actual
                            </label>
                            <div className="relative">
                                <input
                                    id="currentPassword"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={contraseñaActual}
                                    onChange={(e) => setContraseñaActual(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-colors pr-12"
                                    placeholder="Ingresa tu contraseña actual"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={contraseñaNueva}
                                    onChange={(e) => setContraseñaNueva(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-colors pr-12"
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    disabled={isLoading}
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                Confirmar Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmarContraseña}
                                    onChange={(e) => setConfirmarContraseña(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-colors pr-12"
                                    placeholder="Repite la nueva contraseña"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-[18px] px-6 rounded-xl text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? "Cambiando contraseña..." : "Cambiar Contraseña"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-8 text-slate-400 text-sm">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="px-4 flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" />
                            Seguridad
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Info Box */}
                    <div
                        className="rounded-xl p-5 border border-purple-200"
                        style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)' }}
                    >
                        <p className="text-sm text-purple-800 leading-relaxed">
                            <strong>🔒 Recomendaciones de seguridad</strong><br />
                            • Usa al menos 6 caracteres<br />
                            • Combina letras, números y símbolos<br />
                            • No uses contraseñas obvias
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center text-slate-400 text-[13px]">
                        © {currentYear} Medifarma S.A. - Todos los derechos reservados
                    </div>
                </div>
            </div>

            {/* Animaciones */}
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
