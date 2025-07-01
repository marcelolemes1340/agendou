'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './agendamento.css';

export default function Agendamento() {
    const router = useRouter();

    const [form, setForm] = useState({
        servico: 'Corte de cabelo',
        profissional: 'Roberto',
        data: '2025-05-25',
        horario: '10:00',
        nome: 'Ana',
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleAgendar(e: React.FormEvent) {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3001/agendamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await response.json();
            alert(data.message);
            router.push('/home'); // redireciona após agendar
        } catch (error) {
            console.error('Erro ao agendar:', error);
            alert('Erro ao enviar agendamento');
        }
    }

    return (
        <div className="agendamento-container">
            <h1>Agendar Serviço</h1>
            <form onSubmit={handleAgendar}>
            <label>Serviço</label>
                <select name="servico" value={form.servico} onChange={handleChange}>
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
                <input type="hidden" name="profissional" value="Roberto" />

                <label>Data</label>
                <input type="date" name="data" value={form.data} onChange={handleChange} />

                <label>Horário</label>
                <input type="time" name="horario" value={form.horario} onChange={handleChange} />

                <label>Nome</label>
                <input type="text" name="nome" value={form.nome} onChange={handleChange} />

                <button type="submit">Agendar Agora</button>
            </form>
        </div>
    );
}
