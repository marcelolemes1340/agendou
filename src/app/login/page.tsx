'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

     async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        try {
            const response = await fetch('https://back-theta-nine.vercel.app/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            if (response.ok) {
                await Swal.fire({
                    title: 'Sucesso!',
                    text: 'Login realizado com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#4f46e5',
                });
                localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                router.push('/');
                setTimeout(() => {
                    window.location.reload();
                }, 300);
            } else {
                await Swal.fire({
                    title: 'Erro!',
                    text: data.error || 'Email ou senha incorretos',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#4f46e5',
                });
            }
        } catch (err) {
            console.error('Erro ao fazer login:', err);
            await Swal.fire({
                title: 'Erro!',
                text: 'Erro de conexão com o servidor',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#4f46e5',
            });
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-center">
                    <div className="flex justify-center">
                        <img 
                            src="/logo.png" 
                            alt="Logo Agendou" 
                            className="h-24 w-24 rounded-full shadow-lg border-4 border-white bg-white object-contain"
                            style={{ maxWidth: 96, maxHeight: 96 }}
                        />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-white">Bem-vindo de volta!</h1>
                    <p className="mt-2 text-indigo-100">Entre para gerenciar seus agendamentos</p>
                </div>
                <div className="p-8">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                                Senha
                            </label>
                            <input
                                id="senha"
                                type="password"
                                placeholder="Digite sua senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Entrar
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Não tem uma conta?{' '}
                            <a href="/cadastro" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Cadastre-se
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}