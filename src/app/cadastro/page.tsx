'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function Cadastro() {
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');

    async function handleCadastro(e: React.FormEvent) {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/usuarios/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha }),
            });

            const data = await response.json();

            if (response.ok) {
                await Swal.fire({
                    title: 'Sucesso!',
                    text: 'Cadastro realizado com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#4f46e5',
                });
                router.push('/login');
            } else {
                await Swal.fire({
                    title: 'Erro!',
                    text: data.error || 'Erro ao cadastrar usuário',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#4f46e5',
                });
            }
        } catch {
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
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-10 text-center">
                    <div className="flex justify-center">
                        <img 
                            src="/logo.png" 
                            alt="Logo Agendou" 
                            className="h-24 w-24 rounded-full shadow-lg border-4 border-white bg-white object-contain"
                            style={{ maxWidth: 96, maxHeight: 96 }}
                        />
                    </div>
                    <h1 className="mt-6 text-3xl font-extrabold text-white drop-shadow-lg">Crie sua conta</h1>
                    <p className="mt-3 text-lg text-indigo-100">Preencha seus dados para começar</p>
                </div>
                <div className="p-8">
                    <form className="space-y-4" onSubmit={handleCadastro}>
                        <div>
                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                                Nome completo
                            </label>
                            <input
                                id="nome"
                                type="text"
                                placeholder="Nome e sobrenome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
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
                            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                                Telefone
                            </label>
                            <input
                                id="telefone"
                                type="tel"
                                placeholder="(99) 9 9999-9999"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                                CPF
                            </label>
                            <input
                                id="cpf"
                                type="text"
                                placeholder="999.999.999-99"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
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
                                placeholder="Digite uma senha forte"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Criar minha conta
                            </button>
                        </div>
                    </form>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Já tem uma conta?{' '}
                            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Faça login
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}