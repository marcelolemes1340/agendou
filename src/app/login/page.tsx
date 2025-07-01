'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3001/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Login realizado com sucesso!');
                // Aqui você pode salvar o nome ou token no localStorage, por exemplo
                localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                router.push('/home'); // Redireciona para a home
            } else {
                alert(data.error || 'Email ou senha incorretos');
            }
        } catch (err) {
            alert('Erro de conexão com o servidor');
        }
    }

    return (
        <div className="login-container">
            <div className="login-left">
                <img src="/logo_agendou.png" alt="Logo Agendou" className="login-logo" />
            </div>
            <div className="login-right">
                <h2>Entre na sua Conta</h2>
                <form className="login-form" onSubmit={handleLogin}>
                    <label>
                        Seu E-mail
                        <input
                            type="email"
                            placeholder="nome@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Sua senha
                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    );
}
