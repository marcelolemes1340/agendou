'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { getAuthHeaders, getUsuarioLogado, verifyToken, forceNewLogin } from '../../lib/auth';
import { cores } from '../../lib/cores';

interface Avaliacao {
    id: number;
    nota: number;
    comentario?: string;
    criadoEm: string;
    agendamento: {
        servico: string;
        profissional: string;
        data: string;
        horario: string;
        status: string;
    };
}

export default function MinhasAvaliacoes() {
    const router = useRouter();
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [excluindo, setExcluindo] = useState<number | null>(null);

    useEffect(() => {
        setIsVisible(true);
        checkAuthAndLoadAvaliacoes();
    }, [router]);

    const checkAuthAndLoadAvaliacoes = async () => {
        try {
            console.log('🔍 Verificando autenticação...');

            const usuarioLocal = getUsuarioLogado();
            const token = localStorage.getItem('token');

            if (!usuarioLocal || !token) {
                console.log('❌ Não autenticado, redirecionando para login');
                await Swal.fire({
                    title: 'Acesso não autorizado',
                    text: 'Você precisa fazer login para ver suas avaliações',
                    icon: 'warning',
                    confirmButtonText: 'Ir para Login',
                    confirmButtonColor: cores.primary.accent,
                });
                router.push('/login');
                return;
            }

            const isValid = await verifyToken();
            if (!isValid) {
                console.log('❌ Token inválido, redirecionando para login');
                await Swal.fire({
                    title: 'Sessão expirada',
                    text: 'Sua sessão expirou. Faça login novamente.',
                    icon: 'warning',
                    confirmButtonText: 'Ir para Login',
                    confirmButtonColor: cores.primary.accent,
                });
                router.push('/login');
                return;
            }

            setUsuario(usuarioLocal);
            await fetchMinhasAvaliacoes();

        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            router.push('/login');
        }
    };

    const fetchMinhasAvaliacoes = async () => {
        try {
            console.log('⭐ Buscando minhas avaliações...');

            const headers = getAuthHeaders();
            const response = await fetch('https://agendou-back-9dr1.vercel.app/api/avaliacoes/minhas-avaliacoes', {
                method: 'GET',
                headers: headers
            });

            console.log('📥 Resposta do servidor:', response.status);

            if (response.ok) {
                const data = await response.json();
                setAvaliacoes(data);
                console.log(`✅ ${data.length} avaliações carregadas`);
            } else {
                const errorText = await response.text();
                console.error('❌ Erro ao buscar avaliações:', response.status, errorText);
                
                await Swal.fire({
                    title: 'Erro',
                    text: 'Não foi possível carregar suas avaliações.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.accent,
                });
            }
        } catch (error) {
            console.error('❌ Erro de conexão ao buscar avaliações:', error);
            
            await Swal.fire({
                title: 'Erro de Conexão',
                text: 'Não foi possível conectar ao servidor.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: cores.primary.accent,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExcluirAvaliacao = async (avaliacaoId: number) => {
        const result = await Swal.fire({
            title: 'Excluir Avaliação?',
            text: 'Esta ação não pode ser desfeita. Tem certeza que deseja excluir esta avaliação?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: cores.status.error,
            cancelButtonColor: cores.neutral.medium,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
            background: cores.background.card,
            color: cores.neutral.white,
        });

        if (result.isConfirmed) {
            setExcluindo(avaliacaoId);
            try {
                const headers = getAuthHeaders();
                const response = await fetch(`https://agendou-back-9dr1.vercel.app/api/avaliacoes/${avaliacaoId}`, {
                    method: 'DELETE',
                    headers: headers
                });

                if (response.ok) {
                    setAvaliacoes(prev => prev.filter(av => av.id !== avaliacaoId));

                    await Swal.fire({
                        title: 'Excluída! ✅',
                        text: 'Avaliação excluída com sucesso.',
                        icon: 'success',
                        confirmButtonColor: cores.primary.accent,
                    });
                } else {
                    const errorData = await response.json();
                    await Swal.fire({
                        title: 'Erro!',
                        text: errorData.error || 'Não foi possível excluir a avaliação.',
                        icon: 'error',
                        confirmButtonColor: cores.primary.accent,
                    });
                }
            } catch (error) {
                console.error('❌ Erro ao excluir avaliação:', error);
                await Swal.fire({
                    title: 'Erro de Conexão!',
                    text: 'Não foi possível conectar ao servidor.',
                    icon: 'error',
                    confirmButtonColor: cores.primary.accent,
                });
            } finally {
                setExcluindo(null);
            }
        }
    };

    const renderEstrelas = (nota: number, tamanho: 'sm' | 'md' | 'lg' = 'md') => {
        const tamanhos = {
            sm: 'text-lg',
            md: 'text-xl',
            lg: 'text-2xl'
        };

        return (
            <div className={`flex space-x-1 ${tamanhos[tamanho]}`}>
                {[1, 2, 3, 4, 5].map((estrela) => (
                    <span
                        key={estrela}
                        className={estrela <= nota ? 'text-yellow-400' : 'text-gray-400'}
                    >
                        {estrela <= nota ? '⭐' : '☆'}
                    </span>
                ))}
            </div>
        );
    };

    const formatarData = (dataString: string) => {
        return new Date(dataString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatarDataAgendamento = (data: string) => {
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    };

    const avaliacoesOrdenadas = [...avaliacoes].sort((a, b) => 
        new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    );

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`
                }}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto" style={{ borderColor: cores.primary.accent }}></div>
                    <p className="mt-4 text-lg" style={{ color: cores.neutral.light }}>Carregando suas avaliações...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen py-6 relative overflow-hidden"
            style={{
                background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`
            }}
        >
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-48 h-48 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#3B82F6] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#10B981] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float animation-delay-4000"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                <div
                    className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl shadow-lg p-6 mb-6 border border-white/20 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                >
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div className="text-center lg:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] bg-clip-text text-transparent font-sans">
                                ⭐ Minhas Avaliações
                            </h1>
                            <p className="text-gray-300 text-sm mt-1">
                                Sua opinião é muito importante para nós
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => router.push('/meus-agendamentos')}
                                className="group relative bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer overflow-hidden text-sm w-full sm:w-auto"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative z-10 flex items-center space-x-2 justify-center">
                                    <span>📅</span>
                                    <span>Ver Agendamentos</span>
                                </span>
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg font-medium text-sm w-full sm:w-auto"
                            >
                                ↩️ Voltar
                            </button>
                        </div>
                    </div>
                </div>

                {avaliacoesOrdenadas.length === 0 ? (
                    <div
                        className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl shadow-lg p-8 text-center border border-white/20 transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <div className="text-6xl mb-4">⭐</div>
                        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] bg-clip-text text-transparent font-sans mb-3">
                            Nenhuma avaliação ainda
                        </h2>
                        <p className="text-gray-300 text-sm sm:text-base mb-6 max-w-md mx-auto">
                            Você ainda não avaliou nenhum serviço. Após a conclusão de um agendamento, você poderá deixar sua avaliação.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => router.push('/meus-agendamentos')}
                                className="group relative bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-6 sm:px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer overflow-hidden text-sm sm:text-base"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative z-10 flex items-center space-x-2 justify-center">
                                    <span>📅</span>
                                    <span>Ver Meus Agendamentos</span>
                                </span>
                            </button>
                            <button
                                onClick={() => router.push('/agendamento')}
                                className="cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg font-semibold text-sm sm:text-base"
                            >
                                ✂️ Fazer Novo Agendamento
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div
                            className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/20 transition-all duration-700 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}
                        >
                            <p className="text-gray-300 text-sm sm:text-base text-center">
                                📋 Total de <strong className="text-lg sm:text-xl text-[#D4AF37]">{avaliacoesOrdenadas.length}</strong> avaliação(ões)
                            </p>
                        </div>

                        {avaliacoesOrdenadas.map((avaliacao, index) => (
                            <div
                                key={avaliacao.id}
                                className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-[#D4AF37]/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                    }`}
                                style={{ transitionDelay: `${index * 50}ms` }}
                            >
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                {renderEstrelas(avaliacao.nota, 'lg')}
                                                <span className="text-lg font-bold text-white">
                                                    {avaliacao.nota}/5 estrelas
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-400">
                                                Avaliado em {formatarData(avaliacao.criadoEm)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm mb-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">✂️</span>
                                                    <div>
                                                        <strong className="text-[#D4AF37] text-xs">Serviço:</strong>
                                                        <div className="font-medium">{avaliacao.agendamento.servico}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">👤</span>
                                                    <div>
                                                        <strong className="text-[#D4AF37] text-xs">Profissional:</strong>
                                                        <div className="font-medium">{avaliacao.agendamento.profissional}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">📅</span>
                                                    <div>
                                                        <strong className="text-[#D4AF37] text-xs">Data do Serviço:</strong>
                                                        <div className="font-medium">{formatarDataAgendamento(avaliacao.agendamento.data)}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">⏰</span>
                                                    <div>
                                                        <strong className="text-[#D4AF37] text-xs">Horário:</strong>
                                                        <div className="font-medium">{avaliacao.agendamento.horario}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {avaliacao.comentario && (
                                            <div className="mt-4 p-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#F7EF8A]/5 rounded-lg border border-[#D4AF37]/20">
                                                <h4 className="text-sm font-semibold text-[#D4AF37] mb-2 flex items-center gap-2">
                                                    <span>💬</span>
                                                    Seu Comentário:
                                                </h4>
                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                    "{avaliacao.comentario}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                                        <button
                                            onClick={() => handleExcluirAvaliacao(avaliacao.id)}
                                            disabled={excluindo === avaliacao.id}
                                            className="group cursor-pointer bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 hover:border-red-500/60 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium w-full lg:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {excluindo === avaliacao.id ? (
                                                <>
                                                    <span className="animate-spin inline-block mr-2">⏳</span>
                                                    Excluindo...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="group-hover:scale-110 transition-transform duration-300">🗑️</span>
                                                    <span> Excluir</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {avaliacoesOrdenadas.length > 0 && (
                    <div
                        className={`mt-6 bg-gradient-to-r from-[#D4AF37]/10 to-[#F7EF8A]/10 backdrop-blur-lg rounded-xl p-4 border border-[#D4AF37]/20 transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <p className="text-[#D4AF37] text-sm text-center">
                            💡 Dica: Suas avaliações ajudam outros clientes e nossos profissionais a melhorarem cada vez mais!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}