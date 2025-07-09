"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem("usuarioLogado");
        if (userData) {
            const user = JSON.parse(userData);
            setIsLoggedIn(true);
            const firstName = user.nome.split(" ")[0];
            setUserName(firstName);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogado");
        setIsLoggedIn(false);
        setUserName("");
        setIsMenuOpen(false);
        router.push("/login");
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/agendou.png"
                            className="h-10 sm:h-14 w-auto drop-shadow-lg transition-transform duration-200 hover:scale-105"
                            alt="Agendou Logo"
                        />
                        <span className="text-white text-xl sm:text-2xl font-bold tracking-wide drop-shadow-md ml-2">
                            Agendou
                        </span>
                    </Link>

                    <nav className="hidden md:flex space-x-4 lg:space-x-8 items-center">
                        {isLoggedIn ? (
                            <>
                                <span className="text-white px-2 py-1 sm:px-3 sm:py-2 text-sm font-medium">
                                    Olá, {userName}
                                </span>

                                <Link 
                                    href="/agendamento" 
                                    className="text-white hover:text-indigo-100 px-2 py-1 sm:px-3 sm:py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Agendar Corte
                                </Link>
                                
                                <button
                                    onClick={handleLogout}
                                    className="bg-white cursor-pointer text-indigo-600 hover:bg-indigo-50 px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sair
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    href="/login" 
                                    className="text-white hover:text-indigo-100 px-2 py-1 sm:px-3 sm:py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link 
                                    href="/cadastro" 
                                    className="bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Cadastre-se
                                </Link>
                            </>
                        )}
                    </nav>

                    <button 
                        onClick={toggleMenu}
                        className="md:hidden text-white focus:outline-none"
                        aria-label="Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden pb-4">
                        <div className="flex flex-col space-y-2 mt-2">
                            {isLoggedIn ? (
                                <>
                                    <div className="text-white px-3 py-2 text-sm font-medium rounded-md w-max">
                                        Olá, {userName}
                                    </div>

                                    <Link 
                                        href="/agendamento" 
                                        className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-indigo-600 w-max"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Agendar Corte
                                    </Link>
                                    
                                    <button
                                        onClick={handleLogout}
                                        className="text-left bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium transition-colors w-max"
                                    >
                                        Sair
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        href="/login" 
                                        className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-indigo-600 w-max"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        href="/cadastro" 
                                        className="bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium transition-colors w-max"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Cadastre-se
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}