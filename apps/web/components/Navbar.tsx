"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => { setToken(localStorage.getItem("token")); }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        router.push("/login");
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-black">
            <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-xl bg-yellow-300 border-2 border-black shadow-[3px_3px_0_#1a1a1a] flex items-center justify-center group-hover:translate-y-[-2px] transition-transform">
                        <Zap className="w-5 h-5 text-black fill-black" />
                    </div>
                    <span className="font-black text-xl text-black tracking-tight">FlowMate</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-2">
                    {!token ? (
                        <>
                            <Link href="/" className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${pathname === "/" ? "bg-yellow-300 border-black shadow-[2px_2px_0_#1a1a1a]" : "border-transparent hover:bg-yellow-100 text-black"}`}>
                                Home
                            </Link>
                            <Link href="/login" className="px-4 py-2 rounded-xl font-bold text-sm border-2 border-transparent hover:bg-yellow-100 text-black transition-all">
                                Sign In
                            </Link>
                            <Link href="/signup" className="px-5 py-2 rounded-xl font-bold text-sm bg-black text-white border-2 border-black shadow-[3px_3px_0_#FF4D6D] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#FF4D6D] transition-all">
                                Get Started →
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${pathname === "/dashboard" ? "bg-cyan-300 border-black shadow-[2px_2px_0_#1a1a1a]" : "border-transparent hover:bg-yellow-100 text-black"}`}>
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link href="/zap/create" className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${pathname === "/zap/create" ? "bg-pink-300 border-black shadow-[2px_2px_0_#1a1a1a]" : "border-transparent hover:bg-yellow-100 text-black"}`}>
                                + New Zap
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-red-500 border-2 border-transparent hover:bg-red-100 transition-all">
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl border-2 border-black bg-yellow-300 shadow-[2px_2px_0_#1a1a1a]">
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t-2 border-black bg-yellow-50 px-5 py-4 flex flex-col gap-2">
                    {!token ? (
                        <>
                            <Link href="/" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl font-bold text-black border-2 border-black bg-white shadow-[3px_3px_0_#1a1a1a]">Home</Link>
                            <Link href="/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl font-bold text-black border-2 border-black bg-white shadow-[3px_3px_0_#1a1a1a]">Sign In</Link>
                            <Link href="/signup" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl font-bold text-white bg-black border-2 border-black text-center shadow-[3px_3px_0_#FF4D6D]">Get Started →</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl font-bold text-black border-2 border-black bg-cyan-200 shadow-[3px_3px_0_#1a1a1a]">Dashboard</Link>
                            <Link href="/zap/create" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl font-bold text-black border-2 border-black bg-pink-200 shadow-[3px_3px_0_#1a1a1a]">+ New Zap</Link>
                            <button onClick={handleLogout} className="px-4 py-3 rounded-xl font-bold text-red-600 border-2 border-black bg-red-100 text-left shadow-[3px_3px_0_#1a1a1a]">Logout</button>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};
