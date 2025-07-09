'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function Agendamento() {
    const router = useRouter();
//    const searchParams = useSearchParams();
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    const professionals = [
        { name: 'Roberto', rating: '4.9' },
        { name: 'Marcelo', rating: '5.0' },
        { name: 'Lucas', rating: '4.8' }
    ];

    const availableTimes: string[] = [];
    for (let hour = 9; hour <= 18; hour++) {
        if (hour === 12) continue;
        availableTimes.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 18) {
            availableTimes.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    const [form, setForm] = useState({
        servico:  'Corte de Cabelo',
        profissional:'Roberto',
        data: '',
        horario: '10:00',
        nome: '',
    });

    useEffect(() => {
        const fetchAgendamentos = async () => {
            try {
                const response = await fetch('https://back-theta-nine.vercel.app/agendamentos');
                const data = await response.json();
                setAgendamentos(data);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar agendamentos:', error);
                setLoading(false);
            }
        };

        fetchAgendamentos();

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setForm(prev => ({ ...prev, data: formattedDate }));

        const userData = localStorage.getItem('usuarioLogado');
        if (userData) {
            const user = JSON.parse(userData);
            setUserName(user.nome);
            setUserEmail(user.email || '');
            setForm(prev => ({ ...prev, nome: user.nome }));
        } else {
            Swal.fire({
                title: 'Acesso não autorizado',
                text: 'Você precisa fazer login para agendar um serviço',
                icon: 'warning',
                confirmButtonText: 'Ir para Login',
                confirmButtonColor: '#4f46e5',
            }).then(() => {
                router.push('/login');
            });
        }
    }, [router]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function hasUserAppointmentSameDay() {
        if (!userEmail || !form.data) return false;
        return agendamentos.some(
            (ag: { nome: string; data: string }) =>
                ag.nome === userName &&
                ag.data === form.data
        );
    }

    function isBarberAvailable() {
        if (!form.data || !form.horario || !form.profissional) return true;

        return !agendamentos.some(
            (ag: { data: string; horario: string; profissional: string }) =>
                ag.data === form.data &&
                ag.horario === form.horario &&
                ag.profissional === form.profissional
        );
    }

    function isTimeSlotAvailable() {
        if (!form.data || !form.horario) return true;

        const appointmentsAtSameTime = agendamentos.filter(
            (ag: { data: string; horario: string }) =>
                ag.data === form.data &&
                ag.horario === form.horario
        );

        return appointmentsAtSameTime.length < 3;
    }

    function getAvailableTimesForSelectedDate() {
        if (!form.data || !form.profissional) return availableTimes;

        return availableTimes.filter(time => {
            const appointmentsAtSameTime = agendamentos.filter(
                (ag: { data: string; horario: string }) =>
                    ag.data === form.data &&
                    ag.horario === time
            );

            const barberOccupied = agendamentos.some(
                (ag: { data: string; horario: string; profissional: string }) =>
                    ag.data === form.data &&
                    ag.horario === time &&
                    ag.profissional === form.profissional
            );

            return appointmentsAtSameTime.length < 3 && !barberOccupied;
        });
    }

    async function sendConfirmationEmail() {
        try {
            const response = await fetch('https://n8n-render-7cc2.onrender.com/webhook/agendamento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    nome: userName,
                    servico: form.servico,
                    profissional: form.profissional,
                    data: form.data,
                    horario: form.horario
                }),
            });

            if (!response.ok) {
                console.error('Erro ao enviar para n8n:', await response.text());
            }
        } catch (error) {
            console.error('Erro ao conectar com n8n:', error);
        }
    }

    async function handleAgendar(e: React.FormEvent) {
        e.preventDefault();

        if (hasUserAppointmentSameDay()) {
            await Swal.fire({
                title: 'Agendamento não permitido',
                text: 'Você já possui um agendamento para este dia. Só é permitido um agendamento por dia.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }

        if (!isTimeSlotAvailable()) {
            await Swal.fire({
                title: 'Horário indisponível',
                text: 'Este horário já está completamente ocupado. Por favor, escolha outro horário.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }

        if (!isBarberAvailable()) {
            await Swal.fire({
                title: 'Barbeiro Indisponível',
                text: `${form.profissional} já está ocupado neste horário. Por favor, escolha outro horário ou outro barbeiro.`,
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }

        try {
            const response = await fetch('https://back-theta-nine.vercel.app/agendamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (response.ok) {
                await sendConfirmationEmail();

                await Swal.fire({
                    title: 'Agendamento Confirmado!',
                    html: `
                        <div class="text-left">
                            <p><strong>Serviço:</strong> ${form.servico}</p>
                            <p><strong>Profissional:</strong> ${form.profissional}</p>
                            <p><strong>Data:</strong> ${form.data}</p>
                            <p><strong>Horário:</strong> ${form.horario}</p>
                            <p class="mt-3">Um e-mail de confirmação foi enviado para ${userEmail}</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#4f46e5',
                });

                router.push('/');
            } else {
                await Swal.fire({
                    title: 'Erro!',
                    text: data.message || 'Erro ao realizar agendamento',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#4f46e5',
                });
            }
        } catch (error) {
            console.error('Erro ao agendar:', error);
            await Swal.fire({
                title: 'Erro!',
                text: 'Erro ao enviar agendamento',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#4f46e5',
            });
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="mt-10 mb-12 py-12 px-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Agendar Serviço</h1>
                    <p className="text-indigo-100 mt-1">Escolha seu serviço e horário</p>
                </div>

                <form onSubmit={handleAgendar} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Serviço</label>
                        <select
                            name="servico"
                            value={form.servico}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                            <option>Corte de Cabelo</option>
                            <option>Barba</option>
                            <option>Massagem</option>
                            <option>Manicure</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Profissional</label>
                        <select
                            name="profissional"
                            value={form.profissional}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                            {professionals.map((pro, index) => (
                                <option key={index} value={pro.name}>
                                    {pro.name} (⭐ {pro.rating})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Data</label>
                            <input
                                type="date"
                                name="data"
                                value={form.data}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                min={form.data}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Horário</label>
                            <select
                                name="horario"
                                value={form.horario}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                required
                            >
                                {getAvailableTimesForSelectedDate().map((time, index) => (
                                    <option key={index} value={time}>
                                        {time}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input
                            type="text"
                            name="nome"
                            value={form.nome}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        Confirmar Agendamento
                    </button>
                </form>

                <div className="bg-gray-50 px-6 py-2 text-center border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Precisa de ajuda? <a href="#" className="text-indigo-600 hover:text-indigo-800">Contate-nos</a>
                    </p>
                </div>
            </div>
        </div>
    );
}