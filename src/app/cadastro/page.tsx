'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { cores } from '@/lib/cores';
import Link from 'next/link';

export default function Cadastro() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        senha: ''
    });
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const formatarTelefone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            if (numbers.length <= 10) {
                return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return value;
    };

    const formatarCPF = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return value;
    };

    const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatarTelefone(e.target.value);
        setFormData(prev => ({ ...prev, telefone: formatted }));
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatarCPF(e.target.value);
        setFormData(prev => ({ ...prev, cpf: formatted }));
    };

    const validarFormulario = () => {
        if (!formData.nome.trim()) {
            Swal.fire({
                title: 'Erro!',
                text: 'Por favor, informe seu nome completo.',
                icon: 'error',
                confirmButtonColor: cores.primary.accent,
                background: cores.background.card,
                color: cores.neutral.white,
            });
            return false;
        }

        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            Swal.fire({
                title: 'Erro!',
                text: 'Por favor, informe um email válido.',
                icon: 'error',
                confirmButtonColor: cores.primary.accent,
                background: cores.background.card,
                color: cores.neutral.white,
            });
            return false;
        }

        if (!formData.senha || formData.senha.length < 6) {
            Swal.fire({
                title: 'Erro!',
                text: 'A senha deve ter pelo menos 6 caracteres.',
                icon: 'error',
                confirmButtonColor: cores.primary.accent,
                background: cores.background.card,
                color: cores.neutral.white,
            });
            return false;
        }

        return true;
    };

    async function handleCadastro(e: React.FormEvent) {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        setLoading(true);

        try {
            console.log('📤 Enviando dados para cadastro:', formData);
            
            const response = await fetch('https://agendou-back-9dr1.vercel.app/api/usuarios', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: formData.nome.trim(),
                    email: formData.email.trim().toLowerCase(),
                    senha: formData.senha,
                    telefone: formData.telefone.trim() || null,
                    cpf: formData.cpf.replace(/\D/g, '') || null
                }),
            });

            console.log('📥 Resposta recebida:', response.status);

            const data = await response.json().catch(async () => {
                const text = await response.text();
                console.error('❌ Erro ao parsear resposta:', text);
                throw new Error('Resposta inválida do servidor');
            });

            console.log('📋 Dados da resposta:', data);

            if (response.ok) {
                await Swal.fire({
                    title: 'Sucesso! 🎉',
                    text: data.message || 'Cadastro realizado com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'Fazer Login',
                    confirmButtonColor: cores.primary.accent,
                    background: cores.background.card,
                    color: cores.neutral.white,
                });
                
                setFormData({
                    nome: '',
                    email: '',
                    telefone: '',
                    cpf: '',
                    senha: ''
                });

                router.push('/login');

            } else {
                console.error('❌ Erro na resposta:', data);
                await Swal.fire({
                    title: 'Erro!',
                    text: data.error || `Erro ${response.status}: ${response.statusText}`,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.accent,
                    background: cores.background.card,
                    color: cores.neutral.white,
                });
            }
        } catch (error: any) {
            console.error('💥 Erro no cadastro:', error);
            await Swal.fire({
                title: 'Erro de Conexão!',
                text: error.message || 'Não foi possível conectar ao servidor. Verifique se o servidor está rodando.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: cores.primary.accent,
                background: cores.background.card,
                color: cores.neutral.white,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ 
                background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)` 
            }}
        >
            <div className="absolute inset-0">
                <div className="absolute top-10 right-10 w-72 h-72 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float"></div>
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#3B82F6] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float animation-delay-2000"></div>
            </div>

            <div className={`w-full max-w-sm transition-all duration-1000 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
                <div 
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 hover:border-[#D4AF37]/30 transition-all duration-500 group"
                >
                    <div 
                        className="p-6 text-center relative overflow-hidden"
                        style={{ 
                            background: `linear-gradient(135deg, ${cores.primary.main} 0%, ${cores.primary.light} 100%)` 
                        }}
                    >
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative z-10">
                            <div className="flex justify-center mb-3">
                                <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-md border-2 border-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-xl">👤</span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white font-sans drop-shadow-lg">
                                Crie sua conta
                            </h1>
                            <p className="mt-1 text-gray-300 text-sm">
                                Preencha seus dados para começar
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <form className="space-y-4" onSubmit={handleCadastro}>
                            <div className="space-y-2">
                                <label htmlFor="nome" className="text-sm font-medium text-white flex items-center space-x-2">
                                    <span>👤</span>
                                    <span>Nome completo *</span>
                                </label>
                                <input
                                    id="nome"
                                    type="text"
                                    placeholder="Seu nome completo"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-white flex items-center space-x-2">
                                    <span>📧</span>
                                    <span>E-mail *</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="telefone" className="text-sm font-medium text-white flex items-center space-x-2">
                                    <span>📞</span>
                                    <span>Telefone</span>
                                </label>
                                <input
                                    id="telefone"
                                    type="tel"
                                    placeholder="(11) 99999-9999"
                                    value={formData.telefone}
                                    onChange={handleTelefoneChange}
                                    disabled={loading}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="cpf" className="text-sm font-medium text-white flex items-center space-x-2">
                                    <span>🆔</span>
                                    <span>CPF</span>
                                </label>
                                <input
                                    id="cpf"
                                    type="text"
                                    placeholder="123.456.789-00"
                                    value={formData.cpf}
                                    onChange={handleCpfChange}
                                    disabled={loading}
                                    maxLength={14}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="senha" className="text-sm font-medium text-white flex items-center space-x-2">
                                    <span>🔒</span>
                                    <span>Senha *</span>
                                </label>
                                <input
                                    id="senha"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.senha}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    minLength={6}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                />
                                <p className="mt-1 text-xs text-[#D4AF37]">
                                    A senha deve ter pelo menos 6 caracteres
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-base font-bold text-black transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-xl group relative overflow-hidden"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${cores.primary.accent} 0%, #F7EF8A 100%)` 
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <span className="relative z-10 flex items-center space-x-2">
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                                <span>Cadastrando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>🚀</span>
                                                <span>Criar minha conta</span>
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-300">
                                Já tem uma conta?{' '}
                                <Link 
                                    href="/login" 
                                    className="font-bold text-[#D4AF37] hover:text-[#F7EF8A] transition-colors duration-300 hover:underline"
                                >
                                    Faça login aqui
                                </Link>
                            </p>
                        </div>

                        <div 
                            className="mt-4 p-3 rounded-lg border backdrop-blur-sm"
                            style={{ 
                                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                borderColor: cores.primary.accent
                            }}
                        >
                            <p className="text-xs text-center text-[#D4AF37] flex items-center justify-center space-x-2">
                                <span>🔒</span>
                                <span>Seus dados estão protegidos e serão usados apenas para agendamentos</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}