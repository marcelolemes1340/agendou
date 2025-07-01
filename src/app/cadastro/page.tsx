'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './cadastro.css';

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
                alert('Cadastro realizado com sucesso!');
                router.push('/login'); // redireciona para a tela de login
            } else {
                alert(data.error || 'Erro ao cadastrar usuário');
            }
        } catch (err) {
            alert('Erro de conexão com o servidor');
        }
    }

    return (
        <div className="cadastro-container">
            <div className="cadastro-left">
                <img src="/logo_agendou.png" alt="Logo Agendou" className="cadastro-logo" />
            </div>
            <div className="cadastro-right">
                <h2>Seus dados</h2>
                <form className="cadastro-form" onSubmit={handleCadastro}>
                    <input
                        type="text"
                        placeholder="Nome e sobrenome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="nome@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="tel"
                        placeholder="(99) 9 99999999"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="999.999.999-99"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Digite uma senha forte"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                    <button type="submit">Criar minha conta</button>
                </form>
            </div>
        </div>
    );
}
