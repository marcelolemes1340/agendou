'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { getAuthHeaders, getUsuarioLogado, verifyToken, debugToken} from '../../lib/auth';
import { cores } from '../../lib/cores';

interface Agendamento {
    id: number;
    servico: string;
    profissional: string;
    data: string;
    horario: string;
    status: string;
    criadoEm: string;
    telefone?: string;
    email?: string;
    avaliacao?: {
        id: number;
        nota: number;
        comentario?: string;
        criadoEm: string;
    };
}

interface AvaliacaoData {
    agendamentoId: number;
    nota: number;
    comentario?: string;
}

export default function MeusAgendamentos() {
    const router = useRouter();
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setUsuario] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [avaliando, setAvaliando] = useState<number | null>(null);
    const [avaliacaoForm, setAvaliacaoForm] = useState<AvaliacaoData>({
        agendamentoId: 0,
        nota: 5,
        comentario: ''
    });

    useEffect(() => {
        setIsVisible(true);
        checkAuthAndLoadAgendamentos();
    }, [router]);

    const checkAuthAndLoadAgendamentos = async () => {
        try {
            console.log('🔍 Verificando autenticação...');

            await debugToken();

            const usuarioLocal = getUsuarioLogado();
            const token = localStorage.getItem('token');

            if (!usuarioLocal || !token) {
                console.log('❌ Não autenticado, redirecionando para login');
                await Swal.fire({
                    title: 'Acesso não autorizado',
                    text: 'Você precisa fazer login para ver seus agendamentos',
                    icon: 'warning',
                    confirmButtonText: 'Ir para Login',
                    confirmButtonColor: cores.primary.main,
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
                    confirmButtonColor: cores.primary.main,
                });
                router.push('/login');
                return;
            }

            setUsuario(usuarioLocal);
            await fetchMeusAgendamentos();

        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            router.push('/login');
        }
    };

    const fetchMeusAgendamentos = async () => {
        try {
            console.log('📋 Buscando meus agendamentos...');

            const headers = getAuthHeaders();
            const response = await fetch('https://agendou-back-9dr1.vercel.app/api/agendamentos/meus-agendamentos', {
                method: 'GET',
                headers: headers
            });

            console.log('📥 Resposta do servidor:', response.status);

            if (response.ok) {
                const data = await response.json();
                
                const agendamentosComAvaliacoes = await Promise.all(
                    data.map(async (agendamento: Agendamento) => {
                        if (agendamento.status === 'concluido') {
                            try {
                                const avaliacaoResponse = await fetch(
                                    `https://agendou-back-9dr1.vercel.app/api/avaliacoes/agendamento/${agendamento.id}`,
                                    { method: 'GET', headers }
                                );
                                
                                if (avaliacaoResponse.ok) {
                                    const avaliacaoData = await avaliacaoResponse.json();
                                    return { ...agendamento, avaliacao: avaliacaoData };
                                }
                            } catch (error) {
                                console.log(`❌ Erro ao buscar avaliação do agendamento ${agendamento.id}:`, error);
                            }
                        }
                        return agendamento;
                    })
                );
                
                setAgendamentos(agendamentosComAvaliacoes);
                console.log(`✅ ${agendamentosComAvaliacoes.length} agendamentos carregados`);
            } else {
                console.error('❌ Erro ao buscar agendamentos:', response.status);
                await tryAlternativeMethod();
            }
        } catch (error) {
            console.error('❌ Erro de conexão ao buscar agendamentos:', error);
            await tryAlternativeMethod();
        } finally {
            setLoading(false);
        }
    };

    const tryAlternativeMethod = async () => {
    };

    const handleAbrirAvaliacao = (agendamento: Agendamento) => {
        setAvaliando(agendamento.id);
        setAvaliacaoForm({
            agendamentoId: agendamento.id,
            nota: 5,
            comentario: ''
        });
    };

    const handleEnviarAvaliacao = async () => {
        if (!avaliacaoForm.nota) {
            await Swal.fire({
                title: 'Atenção!',
                text: 'Por favor, selecione uma nota.',
                icon: 'warning',
                confirmButtonColor: cores.primary.main,
            });
            return;
        }

        try {
            console.log('⭐ Enviando avaliação:', avaliacaoForm);

            const headers = getAuthHeaders();
            const response = await fetch('https://agendou-back-9dr1.vercel.app/api/avaliacoes', {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(avaliacaoForm)
            });

            if (response.ok) {
                const data = await response.json();
                
                setAgendamentos(prev =>
                    prev.map(ag =>
                        ag.id === avaliacaoForm.agendamentoId 
                            ? { ...ag, avaliacao: data.avaliacao }
                            : ag
                    )
                );

                setAvaliando(null);
                
                await Swal.fire({
                    title: 'Avaliação Enviada! ⭐',
                    text: 'Sua avaliação foi registrada com sucesso!',
                    icon: 'success',
                    confirmButtonColor: cores.primary.main,
                });
            } else {
                const errorData = await response.json();
                await Swal.fire({
                    title: 'Erro!',
                    text: errorData.error || 'Não foi possível enviar a avaliação.',
                    icon: 'error',
                    confirmButtonColor: cores.primary.main,
                });
            }
        } catch (error) {
            console.error('❌ Erro ao enviar avaliação:', error);
            await Swal.fire({
                title: 'Erro de Conexão!',
                text: 'Não foi possível conectar ao servidor.',
                icon: 'error',
                confirmButtonColor: cores.primary.main,
            });
        }
    };

    const handleExcluirAvaliacao = async (avaliacaoId: number, agendamentoId: number) => {
        const result = await Swal.fire({
            title: 'Excluir Avaliação?',
            text: 'Tem certeza que deseja excluir esta avaliação?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: cores.primary.main,
            cancelButtonColor: cores.neutral.medium,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Manter'
        });

        if (result.isConfirmed) {
            try {
                const headers = getAuthHeaders();
                const response = await fetch(`https://agendou-back-9dr1.vercel.app/api/avaliacoes/${avaliacaoId}`, {
                    method: 'DELETE',
                    headers: headers
                });

                if (response.ok) {
                    setAgendamentos(prev =>
                        prev.map(ag =>
                            ag.id === agendamentoId 
                                ? { ...ag, avaliacao: undefined }
                                : ag
                        )
                    );

                    await Swal.fire({
                        title: 'Excluída! ✅',
                        text: 'Avaliação excluída com sucesso.',
                        icon: 'success',
                        confirmButtonColor: cores.primary.main,
                    });
                } else {
                    const errorData = await response.json();
                    await Swal.fire({
                        title: 'Erro!',
                        text: errorData.error || 'Não foi possível excluir a avaliação.',
                        icon: 'error',
                        confirmButtonColor: cores.primary.main,
                    });
                }
            } catch (error) {
                console.error('❌ Erro ao excluir avaliação:', error);
                await Swal.fire({
                    title: 'Erro de Conexão!',
                    text: 'Não foi possível conectar ao servidor.',
                    icon: 'error',
                    confirmButtonColor: cores.primary.main,
                });
            }
        }
    };

    const handleCancelarAgendamento = async (id: number) => {
        const result = await Swal.fire({
            title: 'Cancelar Agendamento?',
            text: 'Tem certeza que deseja cancelar este agendamento?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: cores.primary.main,
            cancelButtonColor: cores.neutral.medium,
            confirmButtonText: 'Sim, cancelar',
            cancelButtonText: 'Manter'
        });

        if (result.isConfirmed) {
            try {
                console.log(`🗑️ Cancelando agendamento ${id}...`);

                const headers = getAuthHeaders();
                const response = await fetch(`https://agendou-back-9dr1.vercel.app/api/agendamentos/${id}/cancelar`, {
                    method: 'PATCH',
                    headers: headers
                });

                console.log('📥 Resposta do cancelamento:', response.status);

                if (response.ok) {
                    const data = await response.json();

                    setAgendamentos(prev =>
                        prev.map(ag =>
                            ag.id === id ? { ...ag, status: 'cancelado' } : ag
                        )
                    );

                    await Swal.fire({
                        title: 'Cancelado! ✅',
                        text: data.message || 'Agendamento cancelado com sucesso.',
                        icon: 'success',
                        confirmButtonColor: cores.primary.main,
                    });
                } else {
                    const errorData = await response.json();
                    await Swal.fire({
                        title: 'Erro!',
                        text: errorData.error || 'Não foi possível cancelar o agendamento.',
                        icon: 'error',
                        confirmButtonColor: cores.primary.main,
                    });
                }
            } catch (error) {
                console.error('❌ Erro ao cancelar agendamento:', error);
                await Swal.fire({
                    title: 'Erro de Conexão!',
                    text: 'Não foi possível conectar ao servidor.',
                    icon: 'error',
                    confirmButtonColor: cores.primary.main,
                });
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmado': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'cancelado': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'concluido': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmado': return '✅ Confirmado';
            case 'cancelado': return '❌ Cancelado';
            case 'concluido': return '🎉 Concluído';
            default: return '⏳ Pendente';
        }
    };

    const formatarData = (data: string) => {
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    };

    const formatarDataHora = (dataString: string) => {
        return new Date(dataString).toLocaleString('pt-BR');
    };

     const renderEstrelas = (nota: number, interativo = false, onNotaChange?: (nota: number) => void) => {
        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((estrela) => (
                    <button
                        key={estrela}
                        type={interativo ? "button" : "button"}
                        onClick={() => interativo && onNotaChange && onNotaChange(estrela)}
                        className={`text-2xl ${interativo ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
                            estrela <= nota ? 'text-yellow-400' : 'text-gray-400'
                        }`}
                        disabled={!interativo}
                    >
                        {estrela <= nota ? '⭐' : '☆'}
                    </button>
                ))}
            </div>
        );
    };

    const agendamentosOrdenados = [...agendamentos].sort((a, b) => {
        const dataA = new Date(a.data + 'T' + a.horario);
        const dataB = new Date(b.data + 'T' + b.horario);
        return dataB.getTime() - dataA.getTime();
    });


    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`
                }}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto border-[#D4AF37]"></div>
                    <p className="mt-4 text-lg text-gray-300">Carregando seus agendamentos...</p>
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
                                📅 Meus Agendamentos
                            </h1>
                            <p className="text-gray-300 text-sm mt-1">
                                Gerencie seus agendamentos e avalie serviços concluídos
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => router.push('/agendamento')}
                                className="group relative bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer overflow-hidden text-sm w-full sm:w-auto"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative z-10 flex items-center space-x-2 justify-center">
                                    <span>✂️</span>
                                    <span>Novo Agendamento</span>
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

                {avaliando && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 max-w-md w-full border border-[#D4AF37]/30 shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4 text-center">
                                ⭐ Avaliar Serviço
                            </h3>
                            
                            <div className="mb-6 text-center">
                                <p className="text-gray-300 mb-4">
                                    Como foi sua experiência com o serviço?
                                </p>
                                
                                <div className="flex justify-center mb-4">
                                    {renderEstrelas(
                                        avaliacaoForm.nota, 
                                        true, 
                                        (nota) => setAvaliacaoForm(prev => ({ ...prev, nota }))
                                    )}
                                </div>
                                <p className="text-sm text-gray-400">
                                    {avaliacaoForm.nota} estrela{avaliacaoForm.nota !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Comentário (opcional)
                                </label>
                                <textarea
                                    value={avaliacaoForm.comentario}
                                    onChange={(e) => setAvaliacaoForm(prev => ({ ...prev, comentario: e.target.value }))}
                                    placeholder="Conte como foi sua experiência..."
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setAvaliando(null)}
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleEnviarAvaliacao}
                                    className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                                >
                                    Enviar Avaliação
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {agendamentosOrdenados.length === 0 ? (
                    <div
                        className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl shadow-lg p-8 text-center border border-white/20 transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <div className="text-6xl mb-4">📅</div>
                        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] bg-clip-text text-transparent font-sans mb-3">
                            Nenhum agendamento
                        </h2>
                        <p className="text-gray-300 text-sm sm:text-base mb-6 max-w-md mx-auto">
                            Você ainda não possui agendamentos. Que tal agendar seu primeiro serviço?
                        </p>
                        <button
                            onClick={() => router.push('/agendamento')}
                            className="group relative bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-6 sm:px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer overflow-hidden text-sm sm:text-base w-full sm:w-auto"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 flex items-center space-x-2 justify-center">
                                <span>✂️</span>
                                <span>Fazer Primeiro Agendamento</span>
                            </span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div
                            className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/20 transition-all duration-700 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}
                        >
                            <p className="text-gray-300 text-sm sm:text-base text-center">
                                📊 Total de <strong className="text-lg sm:text-xl text-[#D4AF37]">{agendamentosOrdenados.length}</strong> agendamento(s)
                            </p>
                        </div>

                        {agendamentosOrdenados.map((agendamento, index) => (
                            <div
                                key={agendamento.id}
                                className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-[#D4AF37]/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                    }`}
                                style={{ transitionDelay: `${index * 50}ms` }}
                            >
                                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                            <h3 className="text-lg sm:text-xl font-bold text-white font-sans">
                                                {agendamento.servico}
                                            </h3>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(agendamento.status)}`}>
                                                {getStatusText(agendamento.status)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">👤</span>
                                                    <div>
                                                        <strong className="text-[#D4AF37] text-xs">Profissional:</strong>
                                                        <div className="font-medium">{agendamento.profissional}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">📅</span>
                                                    <div>
                                                        <strong className="text-[#D4AF37] text-xs">Data:</strong>
                                                        <div className="font-medium">{formatarData(agendamento.data)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">⏰</span>
                                                    <div>
                                                        <strong className="text-[#D4AF37] text-xs">Horário:</strong>
                                                        <div className="font-medium">{agendamento.horario}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">🕒</span>
                                                    <div>
                                                        <strong className="text-[#D4AF37] text-xs">Criado em:</strong>
                                                        <div className="font-medium">{formatarDataHora(agendamento.criadoEm)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {agendamento.status === 'concluido' && (
                                            <div className="mt-4 p-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#F7EF8A]/10 rounded-lg border border-[#D4AF37]/20">
                                                {agendamento.avaliacao ? (
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-sm font-medium text-[#D4AF37]">
                                                                    Sua avaliação:
                                                                </span>
                                                                {renderEstrelas(agendamento.avaliacao.nota)}
                                                            </div>
                                                            {agendamento.avaliacao.comentario && (
                                                                <p className="text-gray-300 text-sm">
                                                                    {agendamento.avaliacao.comentario}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Avaliado em {formatarDataHora(agendamento.avaliacao.criadoEm)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleExcluirAvaliacao(agendamento.avaliacao!.id, agendamento.id)}
                                                            className="cursor-pointer bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-sm border border-red-500/30 transition-colors"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-300 mb-3">
                                                            Como foi sua experiência com este serviço?
                                                        </p>
                                                        <button
                                                            onClick={() => handleAbrirAvaliacao(agendamento)}
                                                            className="cursor-pointer bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                                                        >
                                                            ⭐ Avaliar Serviço
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                                        {agendamento.status === 'pendente' && (
                                            <button
                                                onClick={() => handleCancelarAgendamento(agendamento.id)}
                                                className="group cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium w-full xl:w-auto"
                                            >
                                                ❌ Cancelar
                                            </button>
                                        )}
                                        {(agendamento.status === 'confirmado' || agendamento.status === 'concluido') && (
                                            <button
                                                onClick={() => router.push('/agendamento')}
                                                className="group relative bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer overflow-hidden text-sm w-full xl:w-auto"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <span className="relative z-10 flex items-center space-x-2 justify-center">
                                                    <span>✂️</span>
                                                    <span>Novo</span>
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {agendamentosOrdenados.length > 0 && (
                    <div
                        className={`mt-6 bg-gradient-to-r from-[#D4AF37]/10 to-[#F7EF8A]/10 backdrop-blur-lg rounded-xl p-4 border border-[#D4AF37]/20 transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <p className="text-[#D4AF37] text-sm text-center">
                            💡 Dica: Avalie os serviços concluídos para nos ajudar a melhorar!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}