'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { cores } from '@/lib/cores';
import Link from 'next/link';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        
        if (!email || !senha) {
            await Swal.fire({
                title: 'Erro!',
                text: 'Por favor, preencha email e senha.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: cores.primary.accent,
            });
            return;
        }

        setLoading(true);

        try {
            console.log('📤 Enviando credenciais para login...');
            
            const response = await fetch('https://agendou-back-9dr1.vercel.app/api/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            console.log('📥 Resposta do login:', response.status);

            const data = await response.json().catch(async () => {
                const text = await response.text();
                console.error('❌ Erro ao parsear resposta:', text);
                throw new Error('Resposta inválida do servidor');
            });

            console.log('📋 Dados da resposta:', data);

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                
                console.log('✅ Dados salvos no localStorage:', {
                    token: !!data.token,
                    usuarioLogado: !!data.usuario,
                    usuario: !!data.usuario
                });
                
                await Swal.fire({
                    title: 'Sucesso! 🎉',
                    text: data.message || 'Login realizado com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.accent,
                    background: cores.background.card,
                    color: cores.neutral.white,
                });

                if (data.usuario.isAdmin) {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/dashboard');
                }

            } else {
                console.error('❌ Erro na resposta:', data);
                await Swal.fire({
                    title: 'Erro!',
                    text: data.error || 'Email ou senha incorretos',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.accent,
                    background: cores.background.card,
                    color: cores.neutral.white,
                });
            }
        } catch (error) {
            console.error('💥 Erro ao fazer login:', error);
            await Swal.fire({
                title: 'Erro de Conexão!',
                text: 'Não foi possível conectar ao servidor. Verifique se o servidor está rodando.',
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
                <div className="absolute top-10 left-10 w-72 h-72 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#3B82F6] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float animation-delay-2000"></div>
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
                                    <span className="text-xl">🔐</span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white font-sans drop-shadow-lg">
                                Bem-vindo de volta!
                            </h1>
                            <p className="mt-1 text-gray-300 text-sm">
                                Entre para gerenciar seus agendamentos
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        <form className="space-y-4" onSubmit={handleLogin}>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-white flex items-center space-x-2">
                                    <span>📧</span>
                                    <span>E-mail</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="senha" className="text-sm font-medium text-white flex items-center space-x-2">
                                    <span>🔒</span>
                                    <span>Senha</span>
                                </label>
                                <input
                                    id="senha"
                                    type="password"
                                    placeholder="Digite sua senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                />
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
                                                <span>Entrando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>🚀</span>
                                                <span>Entrar</span>
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-300">
                                Não tem uma conta?{' '}
                                <Link 
                                    href="/cadastro" 
                                    className="font-bold text-[#D4AF37] hover:text-[#F7EF8A] transition-colors duration-300 hover:underline"
                                >
                                    Cadastre-se aqui
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
                                <span>Seus dados estão protegidos e seguros conosco</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}