'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import './agendamento.css';

export default function Agendamento() {
    const router = useRouter();

    function handleAgendar(e: React.FormEvent) {
        e.preventDefault();
        alert('Serviço agendado com sucesso!');
        // Aqui futuramente você envia os dados para a API
        router.push('/home'); // redireciona após agendamento, se quiser
    }

    return (
        <div className="agendamento-container">
            <h1>Agendar Serviço</h1>
            <form onSubmit={handleAgendar}>
                <label>Serviço</label>
                <select>
                    <option>Corte de cabelo</option>
                    <option>Barba</option>
                    <option>Unhas</option>
                    <option>Massagem</option>
                </select>

                <label>Profissional</label>
                <div className="profissional-box">
                    <span>Roberto</span>
                    <span className="estrela">5.0 ⭐</span>
                </div>

                <label>Data</label>
                <input type="date" defaultValue="2025-05-25" />

                <label>Horário</label>
                <input type="time" defaultValue="10:00" />

                <label>Nome</label>
                <input type="text" defaultValue="Ana" />

                <button type="submit">Agendar Agora</button>
            </form>
        </div>
    );
}
