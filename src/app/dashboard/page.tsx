'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsuarioLogado, logout, verifyToken } from '../../lib/auth';
import { cores } from '@/lib/cores';
import Swal from 'sweetalert2';

interface Usuario {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    tipo: string;
    isAdmin: boolean;
}

export default function Dashboard() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            console.log('🔍 Verificando autenticação...');
            
            const usuarioLocal = getUsuarioLogado();
            const token = localStorage.getItem('token');
            
            console.log('📦 Dados do localStorage:', {
                usuario: !!usuarioLocal,
                token: !!token
            });

            if (!usuarioLocal || !token) {
                console.log('❌ Não autenticado, redirecionando para login');
                router.push('/login');
                return;
            }

            const isValid = await verifyToken();
            
            if (!isValid) {
                console.log('❌ Token inválido, redirecionando para login');
                router.push('/login');
                return;
            }

            const usuarioAtualizado = getUsuarioLogado();
            setUsuario(usuarioAtualizado);
            setLoading(false);
            setIsVisible(true);
            
            console.log('✅ Autenticação válida:', usuarioAtualizado.nome);
        }

        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Sair?',
            text: 'Deseja realmente sair da sua conta?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: cores.primary.accent,
            cancelButtonColor: cores.neutral.medium,
            confirmButtonText: 'Sim, sair',
            cancelButtonText: 'Cancelar',
            background: cores.background.card,
            color: cores.neutral.white,
        });

        if (result.isConfirmed) {
            logout();
        }
    };

    const handleVerAgendamentos = () => {
        router.push('/meus-agendamentos');
    };

    const handleEditarPerfil = () => {
        router.push('/perfil');
    };

    const handleFazerAgendamento = () => {
        router.push('/agendamento');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ 
                background: `linear-gradient(135deg, ${cores.background.primary}, ${cores.background.secondary})` 
            }}>
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#3B82F6] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float animation-delay-2000"></div>
                </div>
                
                <div className="text-center relative z-10">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto" style={{ borderColor: cores.primary.accent }}></div>
                    <p className="mt-4 text-lg" style={{ color: cores.neutral.light }}>Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ 
            background: `linear-gradient(135deg, ${cores.background.primary}, ${cores.background.secondary})` 
        }}>
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#3B82F6] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#10B981] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float animation-delay-4000"></div>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className={`transition-all duration-1000 transform ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                    <div className="text-center mb-12">
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
                            <h2 className="text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] bg-clip-text text-transparent">
                                👋 Olá, {usuario?.nome}!
                            </h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                Esta é sua área pessoal. Gerencie seus agendamentos e mantenha seu perfil atualizado.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            <div 
                                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-[#D4AF37]/50 transition-all duration-500  transform hover:scale-105 hover:shadow-2xl"
                                onClick={handleVerAgendamentos}
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500">📅</div>
                                <h3 className="font-bold text-xl mb-3 text-white">Meus Agendamentos</h3>
                                <p className="text-gray-300 mb-4 text-sm leading-relaxed">Visualize e gerencie todos os seus agendamentos</p>
                                <button className=" cursor-pointer w-full py-3 rounded-lg transition-all duration-500 shadow-lg hover:shadow-xl text-base font-bold transform hover:scale-105 group relative overflow-hidden"
                                        style={{ 
                                            background: `linear-gradient(135deg, ${cores.primary.accent} 0%, #F7EF8A 100%)` 
                                        }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <span className="relative z-10 text-black">Ver Agendamentos</span>
                                </button>
                            </div>

                            <div 
                                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-[#D4AF37]/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                                onClick={handleEditarPerfil}
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500">👤</div>
                                <h3 className="font-bold text-xl mb-3 text-white">Meu Perfil</h3>
                                <p className="text-gray-300 mb-4 text-sm leading-relaxed">Atualize suas informações pessoais e preferências</p>
                                <button className=" cursor-pointer w-full py-3 rounded-lg transition-all duration-500 shadow-lg hover:shadow-xl text-base font-bold transform hover:scale-105 group relative overflow-hidden"
                                        style={{ 
                                            background: `linear-gradient(135deg, ${cores.primary.accent} 0%, #F7EF8A 100%)` 
                                        }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <span className="relative z-10 text-black">Editar Perfil</span>
                                </button>
                            </div>

                            <div 
                                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-[#D4AF37]/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                                onClick={handleFazerAgendamento}
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500">✂️</div>
                                <h3 className="font-bold text-xl mb-3 text-white">Novo Agendamento</h3>
                                <p className="text-gray-300 mb-4 text-sm leading-relaxed">Agende um novo serviço com nossos profissionais</p>
                                <button className="cursor-pointer w-full py-3 rounded-lg transition-all duration-500 shadow-lg hover:shadow-xl text-base font-bold transform hover:scale-105 group relative overflow-hidden"
                                        style={{ 
                                            background: `linear-gradient(135deg, ${cores.primary.accent} 0%, #F7EF8A 100%)` 
                                        }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <span className="relative z-10 text-black">Fazer Agendamento</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 transition-all duration-1000 delay-300 transform ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}>
                        <h3 className="text-2xl lg:text-3xl font-black text-center mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            📊 Sua Experiência Conosco
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-[#D4AF37]/50 transition-all duration-500 transform hover:scale-105 text-center">
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-500" style={{ color: cores.primary.accent }}>⭐</div>
                                <p className="text-white font-semibold">Cliente Premium</p>
                                <p className="text-gray-300 text-sm mt-2">Experiência exclusiva e prioridade</p>
                            </div>
                            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-[#D4AF37]/50 transition-all duration-500 transform hover:scale-105 text-center">
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-500" style={{ color: cores.primary.accent }}>🎯</div>
                                <p className="text-white font-semibold">Atendimento Personalizado</p>
                                <p className="text-gray-300 text-sm mt-2">Serviços sob medida para você</p>
                            </div>
                            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-[#D4AF37]/50 transition-all duration-500 transform hover:scale-105 text-center">
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-500" style={{ color: cores.primary.accent }}>💎</div>
                                <p className="text-white font-semibold">Qualidade Garantida</p>
                                <p className="text-gray-300 text-sm mt-2">Padrão de excelência em cada serviço</p>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#F7EF8A]/5 backdrop-blur-lg rounded-xl p-6 border border-[#D4AF37]/20">
                                <h4 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                                    <span>🚀</span>
                                    <span>Próximos Passos</span>
                                </h4>
                                <ul className="text-gray-300 text-sm space-y-2">
                                    <li className="flex items-center space-x-2">
                                        <span className="text-[#D4AF37]">•</span>
                                        <span>Complete seu primeiro agendamento</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-[#D4AF37]">•</span>
                                        <span>Atualize suas informações de perfil</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-[#D4AF37]">•</span>
                                        <span>Explore nossos serviços premium</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-gradient-to-br from-[#3B82F6]/10 to-[#60A5FA]/5 backdrop-blur-lg rounded-xl p-6 border border-[#3B82F6]/20">
                                <h4 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                                    <span>💫</span>
                                    <span>Vantagens Exclusivas</span>
                                </h4>
                                <ul className="text-gray-300 text-sm space-y-2">
                                    <li className="flex items-center space-x-2">
                                        <span className="text-[#3B82F6]">•</span>
                                        <span>Agendamento rápido e fácil</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-[#3B82F6]">•</span>
                                        <span>Lembretes automáticos</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <span className="text-[#3B82F6]">•</span>
                                        <span>Histórico completo de serviços</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className={`mt-8 text-center transition-all duration-1000 delay-500 transform ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}>
                        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <p className="text-gray-300 mb-4">
                                Precisa de ajuda? Nossa equipe está sempre disponível para você!
                            </p>
                            <button 
                                className="cursor-pointer inline-flex items-center space-x-2 px-6 py-3 rounded-lg border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 transform hover:scale-105"
                                onClick={() => router.push('/contato')}
                            >
                                <span>💬</span>
                                <span>Falar com Suporte</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}