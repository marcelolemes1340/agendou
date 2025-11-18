'use client';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { cores } from '@/lib/cores';
import Link from 'next/link';

interface FormData {
    nome: string;
    email: string;
    telefone: string;
    assunto: string;
    mensagem: string;
}

export default function Contato() {
    
    const [formData, setFormData] = useState<FormData>({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: ''
    });
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

    const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatarTelefone(e.target.value);
        setFormData(prev => ({ ...prev, telefone: formatted }));
    };

    const validarFormulario = () => {
        if (!formData.nome.trim()) {
            Swal.fire({
                title: 'Campo obrigatório',
                text: 'Por favor, informe seu nome completo.',
                icon: 'warning',
                confirmButtonColor: cores.primary.accent,
                background: cores.background.card,
                color: cores.neutral.white,
            });
            return false;
        }

        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            Swal.fire({
                title: 'Email inválido',
                text: 'Por favor, informe um email válido.',
                icon: 'warning',
                confirmButtonColor: cores.primary.accent,
                background: cores.background.card,
                color: cores.neutral.white,
            });
            return false;
        }

        if (!formData.assunto.trim()) {
            Swal.fire({
                title: 'Campo obrigatório',
                text: 'Por favor, selecione um assunto.',
                icon: 'warning',
                confirmButtonColor: cores.primary.accent,
                background: cores.background.card,
                color: cores.neutral.white,
            });
            return false;
        }

        if (!formData.mensagem.trim() || formData.mensagem.length < 10) {
            Swal.fire({
                title: 'Mensagem muito curta',
                text: 'Por favor, escreva uma mensagem com pelo menos 10 caracteres.',
                icon: 'warning',
                confirmButtonColor: cores.primary.accent,
                background: cores.background.card,
                color: cores.neutral.white,
            });
            return false;
        }

        if (formData.mensagem.length > 300) {
            Swal.fire({
                title: 'Mensagem muito longa',
                text: 'A mensagem não pode ter mais de 300 caracteres.',
                icon: 'warning',
                confirmButtonColor: cores.primary.accent,
                background: cores.background.card,
                color: cores.neutral.white,
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://agendou-back-9dr1.vercel.app/api/email/contato', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                await Swal.fire({
                    title: 'Mensagem Enviada! 🎉',
                    text: data.message || 'Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.',
                    icon: 'success',
                    confirmButtonText: 'Ótimo!',
                    confirmButtonColor: cores.primary.accent,
                    background: cores.background.card,
                    color: cores.neutral.white,
                });

                setFormData({
                    nome: '',
                    email: '',
                    telefone: '',
                    assunto: '',
                    mensagem: ''
                });

            } else {
                await Swal.fire({
                    title: 'Erro ao Enviar',
                    text: data.message || 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.',
                    icon: 'error',
                    confirmButtonText: 'Entendi',
                    confirmButtonColor: cores.primary.accent,
                    background: cores.background.card,
                    color: cores.neutral.white,
                });
            }
        } catch (error ) {
            await Swal.fire({
                title: 'Erro de Conexão',
                text: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
                icon: 'error',
                confirmButtonText: 'Entendi',
                confirmButtonColor: cores.primary.accent,
                background: cores.background.card,
                color: cores.neutral.white,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`
            }}
        >
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-72 h-72 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#3B82F6] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#10B981] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float animation-delay-4000"></div>
            </div>

            <div className={`w-full max-w-2xl transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                <div
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 hover:border-[#D4AF37]/30 transition-all duration-500 group"
                >
                    <div
                        className="p-8 text-center relative overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${cores.primary.main} 0%, ${cores.primary.light} 100%)`
                        }}
                    >
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative z-10">
                            <div className="flex justify-center mb-4">
                                <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md border-2 border-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-2xl">💬</span>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-white font-sans drop-shadow-lg">
                                Fale Conosco
                            </h1>
                            <p className="mt-2 text-gray-300 text-lg">
                                Estamos aqui para ajudar. Envie sua mensagem!
                            </p>
                        </div>
                    </div>

                    <div className="p-8">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="nome" className="text-sm font-medium text-white flex items-center space-x-2">
                                        <span>👤</span>
                                        <span>Nome completo *</span>
                                    </label>
                                    <input
                                        id="nome"
                                        name="nome"
                                        type="text"
                                        placeholder="Seu nome completo"
                                        value={formData.nome}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-white flex items-center space-x-2">
                                        <span>📧</span>
                                        <span>E-mail *</span>
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="telefone" className="text-sm font-medium text-white flex items-center space-x-2">
                                        <span>📞</span>
                                        <span>Telefone</span>
                                    </label>
                                    <input
                                        id="telefone"
                                        name="telefone"
                                        type="tel"
                                        placeholder="(11) 99999-9999"
                                        value={formData.telefone}
                                        onChange={handleTelefoneChange}
                                        disabled={loading}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="assunto" className="text-sm font-medium text-white flex items-center space-x-2">
                                        <span>🎯</span>
                                        <span>Assunto *</span>
                                    </label>
                                    <select
                                        id="assunto"
                                        name="assunto"
                                        value={formData.assunto}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                    >
                                        <option value="" className="bg-gray-700 text-white">Selecione um assunto</option>
                                        <option value="Dúvida sobre serviços" className="text-white bg-gray-800">Dúvida sobre serviços</option>
                                        <option value="Agendamento" className="text-white bg-gray-800">Agendamento</option>
                                        <option value="Cancelamento" className="text-white bg-gray-800">Cancelamento</option>
                                        <option value="Reclamação" className="text-white bg-gray-800">Reclamação</option>
                                        <option value="Sugestão" className="text-white bg-gray-800">Sugestão</option>
                                        <option value="Parceria" className="text-white bg-gray-800">Parceria</option>
                                        <option value="Outro" className="text-white bg-gray-800">Outro</option>
                                    </select>
                                </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="mensagem" className="text-sm font-medium text-white flex items-center space-x-2">
                                        <span>💬</span>
                                        <span>Mensagem *</span>
                                    </label>
                                    <textarea
                                        id="mensagem"
                                        name="mensagem"
                                        placeholder="Escreva sua mensagem aqui... (mínimo 10 caracteres, máximo 300)"
                                        value={formData.mensagem}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        rows={6}
                                        minLength={10}
                                        maxLength={300}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base resize-none"
                                    />
                                    <p className="text-xs text-gray-400">
                                        {formData.mensagem.length}/300 caracteres
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="cursor-pointer w-full flex justify-center items-center py-4 px-4 rounded-xl text-lg font-bold text-black transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
                                        style={{
                                            background: `linear-gradient(135deg, ${cores.primary.accent} 0%, #F7EF8A 100%)`
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <span className="relative z-10 flex items-center space-x-2">
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                                    <span>Enviando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>🚀</span>
                                                    <span>Enviar Mensagem</span>
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </div>
                        </form>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                className="p-4 rounded-xl border backdrop-blur-sm"
                                style={{
                                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                    borderColor: cores.primary.accent
                                }}
                            >
                                <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
                                    <span>📞</span>
                                    <span>Telefone</span>
                                </h3>
                                <p className="text-gray-300">(53) 99999-9999</p>
                            </div>
                            <div
                                className="p-4 rounded-xl border backdrop-blur-sm"
                                style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    borderColor: cores.secondary.main
                                }}
                            >
                                <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
                                    <span>📧</span>
                                    <span>Email</span>
                                </h3>
                                <p className="text-gray-300">contato@agendou.com</p>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-300">
                                Voltar para{' '}
                                <Link
                                    href="/"
                                    className="font-bold text-[#D4AF37] hover:text-[#F7EF8A] transition-colors duration-300 hover:underline"
                                >
                                    página inicial
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}