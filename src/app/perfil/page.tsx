'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { getAuthHeaders, getUsuarioLogado, verifyToken } from '../../lib/auth';
import { cores } from '../../lib/cores';

interface Usuario {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    cpf: string | null;
    tipo: string;
    isAdmin: boolean;
    criadoEm: string;
}

export default function Perfil() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(false);
    const [alterandoSenha, setAlterandoSenha] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    
    const [form, setForm] = useState({
        nome: '',
        telefone: '',
        cpf: ''
    });

    const [senhaForm, setSenhaForm] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });

    useEffect(() => {
        setIsVisible(true);
        const checkAuthAndLoadUsuario = async () => {
            try {
                const usuarioLocal = getUsuarioLogado();
                const token = localStorage.getItem('token');
                
                if (!usuarioLocal || !token) {
                    await Swal.fire({
                        title: 'Acesso não autorizado',
                        text: 'Você precisa fazer login para acessar seu perfil',
                        icon: 'warning',
                        confirmButtonText: 'Ir para Login',
                        confirmButtonColor: cores.primary.main,
                    });
                    router.push('/login');
                    return;
                }

                const isValid = await verifyToken();
                if (!isValid) {
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

                const usuarioAtualizado = getUsuarioLogado();
                setUsuario(usuarioAtualizado);
                setForm({
                    nome: usuarioAtualizado.nome || '',
                    telefone: usuarioAtualizado.telefone || '',
                    cpf: usuarioAtualizado.cpf || ''
                });

            } catch (error) {
                console.error('Erro ao carregar o perfil:', error);
                await Swal.fire({
                    title: 'Erro!',
                    text: 'Erro ao carregar perfil. Tente novamente.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.main,
                });
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndLoadUsuario();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'telefone') {
            const numbers = value.replace(/\D/g, '');
            let formatted = value;
            if (numbers.length <= 11) {
                if (numbers.length <= 2) {
                    formatted = numbers;
                } else if (numbers.length <= 6) {
                    formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
                } else if (numbers.length <= 10) {
                    formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
                } else {
                    formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
                }
            }
            setForm(prev => ({ ...prev, [name]: formatted }));
        } 
        else if (name === 'cpf') {
            const numbers = value.replace(/\D/g, '');
            let formatted = value;
            if (numbers.length <= 11) {
                if (numbers.length <= 3) {
                    formatted = numbers;
                } else if (numbers.length <= 6) {
                    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
                } else if (numbers.length <= 9) {
                    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
                } else {
                    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
                }
            }
            setForm(prev => ({ ...prev, [name]: formatted }));
        }
        else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSenhaForm(prev => ({ ...prev, [name]: value }));
    };

    const formatarCPF = (cpf: string) => {
        if (!cpf) return '';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const formatarTelefone = (telefone: string) => {
        if (!telefone) return '';
        return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    const handleSalvarPerfil = async () => {
        if (!form.nome.trim()) {
            await Swal.fire({
                title: 'Campo obrigatório',
                text: 'O nome é obrigatório.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: cores.primary.main,
            });
            return;
        }

        setSalvando(true);

        try {
            const dadosParaEnviar = {
                nome: form.nome.trim(),
                telefone: form.telefone ? form.telefone.replace(/\D/g, '') : null,
                cpf: form.cpf ? form.cpf.replace(/\D/g, '') : null
            };

            const response = await fetch('https://agendou-back-9dr1.vercel.app/api/usuarios/meu-perfil', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(dadosParaEnviar)
            });

            if (response.ok) {
                const data = await response.json();
                
                localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                
                setUsuario(data.usuario);
                setEditando(false);
                
                await Swal.fire({
                    title: 'Sucesso! 🎉',
                    text: data.message || 'Perfil atualizado com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.main,
                });
            } else {
                const errorText = await response.text();
                let errorMessage = 'Erro ao atualizar perfil';
                
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                
                await Swal.fire({
                    title: 'Erro!',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.main,
                });
            }
        } catch (error) {
            console.error('Erro ao atualizar o perfil:', error);
            await Swal.fire({
                title: 'Erro de Conexão!',
                text: 'Não foi possível conectar ao servidor.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: cores.primary.main,
            });
        } finally {
            setSalvando(false);
        }
    };

    const handleAlterarSenha = async () => {
        if (!senhaForm.senhaAtual || !senhaForm.novaSenha || !senhaForm.confirmarSenha) {
            await Swal.fire({
                title: 'Campos obrigatórios',
                text: 'Todos os campos de senha são obrigatórios.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: cores.primary.main,
            });
            return;
        }

        if (senhaForm.novaSenha.length < 6) {
            await Swal.fire({
                title: 'Senha muito curta',
                text: 'A nova senha deve ter pelo menos 6 caracteres.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: cores.primary.main,
            });
            return;
        }

        if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
            await Swal.fire({
                title: 'Senhas não coincidem',
                text: 'A nova senha e a confirmação não coincidem.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: cores.primary.main,
            });
            return;
        }

        setSalvando(true);

        try {
            const response = await fetch('https://agendou-back-9dr1.vercel.app/api/usuarios/minha-senha', {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    senhaAtual: senhaForm.senhaAtual,
                    novaSenha: senhaForm.novaSenha
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                setSenhaForm({
                    senhaAtual: '',
                    novaSenha: '',
                    confirmarSenha: ''
                });
                setAlterandoSenha(false);
                
                await Swal.fire({
                    title: 'Sucesso! 🔒',
                    text: data.message || 'Senha alterada com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.main,
                });
            } else {
                const errorText = await response.text();
                let errorMessage = 'Erro ao alterar senha';
                
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                
                await Swal.fire({
                    title: 'Erro!',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.main,
                });
            }
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            await Swal.fire({
                title: 'Erro de Conexão!',
                text: 'Não foi possível conectar ao servidor.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: cores.primary.main,
            });
        } finally {
            setSalvando(false);
        }
    };

    const handleCancelarEdicao = () => {
        setEditando(false);
        if (usuario) {
            setForm({
                nome: usuario.nome || '',
                telefone: usuario.telefone || '',
                cpf: usuario.cpf || ''
            });
        }
    };

    const handleCancelarSenha = () => {
        setAlterandoSenha(false);
        setSenhaForm({
            senhaAtual: '',
            novaSenha: '',
            confirmarSenha: ''
        });
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)` }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto border-[#D4AF37]"></div>
                    <p className="mt-4 text-lg text-gray-300">Carregando seu perfil...</p>
                </div>
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)` }}>
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-semibold text-white mb-2">Usuário não encontrado</h2>
                    <p className="text-gray-300 mb-6">Não foi possível carregar seus dados.</p>
                    <button 
                        onClick={() => router.push('/login')}
                        className="cursor-pointer bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                        🔐 Fazer Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)` }}>
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-48 h-48 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#3B82F6] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#10B981] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float animation-delay-4000"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                <div className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl shadow-lg p-6 mb-6 border border-white/20 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div className="text-center lg:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] bg-clip-text text-transparent font-sans">
                                👤 Meu Perfil
                            </h1>
                            <p className="text-gray-300 text-sm mt-1">
                                Gerencie suas informações pessoais
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <button 
                                onClick={() => router.push('/dashboard')}
                                className="cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg font-medium text-sm w-full sm:w-auto"
                            >
                                ↩️ Voltar
                            </button>
                            {!editando && !alterandoSenha && (
                                <button 
                                    onClick={() => setEditando(true)}
                                    className="cursor-pointer bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden group relative w-full sm:w-auto"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative z-10 flex items-center space-x-2 justify-center">
                                        <span>✏️</span>
                                        <span>Editar Perfil</span>
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl shadow-lg p-6 mb-6 border border-white/20 transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="text-xl font-bold text-white font-sans mb-6 flex items-center space-x-3">
                        <span>📋</span>
                        <span>Informações Pessoais</span>
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                                <span>👤</span>
                                <span>Nome Completo *</span>
                            </label>
                            {editando ? (
                                <div>
                                    <input
                                        type="text"
                                        name="nome"
                                        value={form.nome}
                                        onChange={handleInputChange}
                                        maxLength={50}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 text-base"
                                        placeholder="Seu nome completo"
                                    />
                                    <p className="text-xs text-gray-400 text-right mt-1">{form.nome.length}/50</p>
                                </div>
                            ) : (
                                <p className="text-white text-lg font-semibold">{usuario.nome}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                                <span>📧</span>
                                <span>Email</span>
                            </label>
                            <div className="flex items-center space-x-3">
                                <p className="text-white text-lg font-semibold">{usuario.email}</p>
                                <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded-full text-xs font-medium border border-[#D4AF37]/30">
                                    Não editável
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                                <span>📞</span>
                                <span>Telefone</span>
                            </label>
                            {editando ? (
                                <div>
                                    <input
                                        type="tel"
                                        name="telefone"
                                        value={form.telefone}
                                        onChange={handleInputChange}
                                        maxLength={15}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 text-base"
                                        placeholder="(00) 00000-0000"
                                    />
                                    <p className="text-xs text-gray-400 text-right mt-1">{form.telefone.length}/15</p>
                                </div>
                            ) : (
                                <p className="text-white text-lg font-semibold">
                                    {usuario.telefone ? formatarTelefone(usuario.telefone) : 'Não informado'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                                <span>🆔</span>
                                <span>CPF</span>
                            </label>
                            {editando ? (
                                <div>
                                    <input
                                        type="text"
                                        name="cpf"
                                        value={form.cpf}
                                        onChange={handleInputChange}
                                        maxLength={14}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 text-base"
                                        placeholder="000.000.000-00"
                                    />
                                    <p className="text-xs text-gray-400 text-right mt-1">{form.cpf.length}/14</p>
                                </div>
                            ) : (
                                <p className="text-white text-lg font-semibold">
                                    {usuario.cpf ? formatarCPF(usuario.cpf) : 'Não informado'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                                <span>📅</span>
                                <span>Membro desde</span>
                            </label>
                            <p className="text-[#D4AF37] text-lg font-semibold">{formatarData(usuario.criadoEm)}</p>
                        </div>

                        {editando && (
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    onClick={handleSalvarPerfil}
                                    disabled={salvando}
                                    className="cursor-pointer bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden flex-1"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative z-10 flex items-center space-x-2 justify-center">
                                        {salvando ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div> : <span>💾</span>}
                                        <span>{salvando ? 'Salvando...' : 'Salvar'}</span>
                                    </span>
                                </button>
                                <button
                                    onClick={handleCancelarEdicao}
                                    disabled={salvando}
                                    className="cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium flex-1"
                                >
                                    ❌ Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20 transition-all duration-700 delay-400 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="text-xl font-bold text-white font-sans mb-6 flex items-center space-x-3">
                        <span>🔒</span>
                        <span>Segurança</span>
                    </h2>
                    
                    {!alterandoSenha ? (
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-gray-300 text-sm">
                                    Altere sua senha periodicamente para manter a segurança
                                </p>
                            </div>
                            <button 
                                onClick={() => setAlterandoSenha(true)}
                                className="cursor-pointer bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden group relative w-full lg:w-auto"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative z-10 flex items-center space-x-2 justify-center">
                                    <span>🔑</span>
                                    <span>Alterar Senha</span>
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                                    <span>🔐</span>
                                    <span>Senha Atual *</span>
                                </label>
                                <input
                                    type="password"
                                    name="senhaAtual"
                                    value={senhaForm.senhaAtual}
                                    onChange={handleSenhaChange}
                                    maxLength={50}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 text-base"
                                    placeholder="Digite sua senha atual"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                                    <span>🆕</span>
                                    <span>Nova Senha *</span>
                                </label>
                                <input
                                    type="password"
                                    name="novaSenha"
                                    value={senhaForm.novaSenha}
                                    onChange={handleSenhaChange}
                                    maxLength={50}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 text-base"
                                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                                    <span>✅</span>
                                    <span>Confirmar Nova Senha *</span>
                                </label>
                                <input
                                    type="password"
                                    name="confirmarSenha"
                                    value={senhaForm.confirmarSenha}
                                    onChange={handleSenhaChange}
                                    maxLength={50}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 text-base"
                                    placeholder="Confirme a nova senha"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    onClick={handleAlterarSenha}
                                    disabled={salvando}
                                    className="cursor-pointer bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden flex-1"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative z-10 flex items-center space-x-2 justify-center">
                                        {salvando ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div> : <span>✅</span>}
                                        <span>{salvando ? 'Alterando...' : 'Alterar Senha'}</span>
                                    </span>
                                </button>
                                <button
                                    onClick={handleCancelarSenha}
                                    disabled={salvando}
                                    className="cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium flex-1"
                                >
                                    ❌ Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}