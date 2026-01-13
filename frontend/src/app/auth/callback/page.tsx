"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            // Store token in localStorage or cookie
            localStorage.setItem("token", token);
            // Redirect to dashboard or home
            router.push("/dashboard/products");
        } else {
            router.push("/login?error=no_token");
        }
    }, [router, searchParams]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="mt-4 text-slate-400">Autenticando...</p>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
