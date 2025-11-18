"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cores } from "@/lib/cores";

export function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = () => {
            const userData = localStorage.getItem("usuarioLogado") || localStorage.getItem("usuario");
            
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    setIsLoggedIn(true);
                    const firstName = user.nome.split(" ")[0];
                    setUserName(firstName);
                } catch (error) {
                    console.error('Erro ao parsear usuário:', error);
                    setIsLoggedIn(false);
                    setUserName("");
                }
            } else {
                setIsLoggedIn(false);
                setUserName("");
            }
        };

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        checkAuth();
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('storage', checkAuth);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('storage', checkAuth);
        };
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUserName("");
        setIsMenuOpen(false);
        
        window.dispatchEvent(new Event('storage'));
        
        router.push("/");
        router.refresh();
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                isScrolled 
                    ? 'py-2 bg-black/95 backdrop-blur-lg shadow-xl' 
                    : 'py-4 bg-black/80 backdrop-blur-md'
            }`}
            style={{ 
                borderBottom: `1px solid ${cores.primary.light}`
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link 
                        href="/"
                        className="flex items-center space-x-3 group relative"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                            <img
                                src="/agendou.png"
                                className="h-12 sm:h-14 w-auto relative z-10 transition-transform duration-300 group-hover:scale-110"
                                alt="Agendou Logo"
                            />
                        </div>
                        <span className="text-white text-2xl sm:text-3xl font-bold tracking-wide font-sans relative">
                            Agendou
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] transition-all duration-300 group-hover:w-full"></span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex space-x-4 lg:space-x-6 items-center">
                        {isLoggedIn ? (
                            <>
                                {pathname !== '/dashboard' && (
                                    <Link 
                                        href="/dashboard" 
                                        className="text-white hover:text-[#D4AF37] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 relative group"
                                    >
                                        📊 Dashboard
                                        <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-4/5 group-hover:left-1/10"></span>
                                    </Link>
                                )}

                                <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                                    <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                                    <span className="text-white text-sm font-medium">
                                        👋 Olá, {userName}
                                    </span>
                                </div>

                                <Link 
                                    href="/agendamento" 
                                    className="text-white hover:text-[#D4AF37] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 relative group"
                                >
                                    ✂️ Agendar
                                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-4/5 group-hover:left-1/10"></span>
                                </Link>

                                <Link 
                                    href="/meus-agendamentos" 
                                    className="text-white hover:text-[#D4AF37] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 relative group"
                                >
                                    📅 Agendamentos
                                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-4/5 group-hover:left-1/10"></span>
                                </Link>

                                <Link 
                                    href="/minhas-avaliacoes" 
                                    className="text-white hover:text-[#D4AF37] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 relative group"
                                >
                                    ⭐ Avaliações
                                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-4/5 group-hover:left-1/10"></span>
                                </Link>
                                
                                <button
                                    onClick={handleLogout}
                                    className="bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black hover:from-[#F7EF8A] hover:to-[#D4AF37] px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                                >
                                    🚪 Sair
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    href="/agendamento" 
                                    className="text-white hover:text-[#D4AF37] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 relative group"
                                >
                                    ✂️ Agendar
                                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-4/5 group-hover:left-1/10"></span>
                                </Link>
                                <Link 
                                    href="/login" 
                                    className="text-white hover:text-[#D4AF37] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 relative group"
                                >
                                    🔐 Login
                                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#D4AF37] transition-all duration-300 group-hover:w-4/5 group-hover:left-1/10"></span>
                                </Link>
                                <Link 
                                    href="/cadastro" 
                                    className="bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black hover:from-[#F7EF8A] hover:to-[#D4AF37] px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                                >
                                    📝 Cadastre-se
                                </Link>
                            </>
                        )}
                    </nav>

                    <button 
                        onClick={toggleMenu}
                        className="md:hidden text-white focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
                        aria-label="Menu"
                    >
                        <div className="w-6 h-6 relative">
                            <span className={`absolute left-0 top-1 w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-3' : ''}`}></span>
                            <span className={`absolute left-0 top-3 w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`absolute left-0 top-5 w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-3' : ''}`}></span>
                        </div>
                    </button>
                </div>

                <div className={`md:hidden transition-all duration-500 overflow-hidden ${
                    isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}>
                    <div className="bg-black/95 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
                        <div className="flex flex-col space-y-2">
                            {isLoggedIn ? (
                                <>
                                    <div className="text-white px-4 py-3 text-sm font-medium rounded-lg text-center bg-white/5 border border-white/10">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                                            <span>👋 Olá, {userName}</span>
                                        </div>
                                    </div>

                                    {pathname !== '/dashboard' && (
                                        <Link 
                                            href="/dashboard" 
                                            className="text-white hover:text-[#D4AF37] px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5 flex items-center space-x-2"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <span>📊</span>
                                            <span>Dashboard</span>
                                        </Link>
                                    )}

                                    <Link 
                                        href="/agendamento" 
                                        className="text-white hover:text-[#D4AF37] px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5 flex items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>✂️</span>
                                        <span>Agendar Corte</span>
                                    </Link>

                                    <Link 
                                        href="/meus-agendamentos" 
                                        className="text-white hover:text-[#D4AF37] px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5 flex items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>📅</span>
                                        <span>Meus Agendamentos</span>
                                    </Link>

                                    <Link 
                                        href="/minhas-avaliacoes" 
                                        className="text-white hover:text-[#D4AF37] px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5 flex items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>⭐</span>
                                        <span>Minhas Avaliações</span>
                                    </Link>
                                    
                                    <button
                                        onClick={handleLogout}
                                        className="bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg text-center hover:scale-105 transform"
                                    >
                                        🚪 Sair
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        href="/agendamento" 
                                        className="text-white hover:text-[#D4AF37] px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5 flex items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>✂️</span>
                                        <span>Agendar</span>
                                    </Link>
                                    <Link 
                                        href="/login" 
                                        className="text-white hover:text-[#D4AF37] px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5 flex items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>🔐</span>
                                        <span>Login</span>
                                    </Link>
                                    <Link 
                                        href="/cadastro" 
                                        className="bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg text-center hover:scale-105 transform"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        📝 Cadastre-se
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}