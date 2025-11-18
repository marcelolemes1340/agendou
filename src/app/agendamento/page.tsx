'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { getUsuarioLogado, verifyToken } from '../../lib/auth';
import { cores } from '../../lib/cores';

interface Agendamento {
    id: number;
    servico: string;
    profissional: string;
    data: string;
    horario: string;
    status: string;
    email: string;
    nome: string;
}

interface Barbeiro {
    id: number;
    nome: string;
    especialidade: string | null;
    ativo: boolean;
    foto: string | null;
    criadoEm: string;
}

export default function Agendamento() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [dataInicializada, setDataInicializada] = useState(false);

    const generateAvailableTimes = (): string[] => {
        const times: string[] = [];
        for (let hour = 9; hour <= 18; hour++) {
            if (hour === 12) continue;
            times.push(`${hour.toString().padStart(2, '0')}:00`);
            if (hour < 18) {
                times.push(`${hour.toString().padStart(2, '0')}:30`);
            }
        }
        return times;
    };

    const availableTimes = generateAvailableTimes();

    const [form, setForm] = useState({
        servico: searchParams.get('service') || 'Corte de Cabelo',
        profissional: searchParams.get('professional') || '',
        data: '',
        horario: '09:00',
        nome: '',
        telefone: '',
        email: ''
    });

    const fetchBarbeiros = async (): Promise<boolean> => {
        try {
            console.log('🔍 Buscando barbeiros ativos (rota pública)...');

            const response = await fetch('https://agendou-back-9dr1.vercel.app/api/barbeiros/public', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('📊 Status da resposta:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${data.length} barbeiros encontrados`);
                setBarbeiros(data);

                if (!form.profissional && data.length > 0) {
                    setForm(prev => ({
                        ...prev,
                        profissional: data[0].nome
                    }));
                }

                return true;
            } else {
                const errorText = await response.text();
                console.error('❌ Erro ao buscar barbeiros:', response.status, errorText);

                if (response.status === 401) {
                    console.log('⚠️  Erro 401 - Tentando sem headers...');
                    const retryResponse = await fetch('https://agendou-back-9dr1.vercel.app/api/barbeiros/public');
                    if (retryResponse.ok) {
                        const retryData = await retryResponse.json();
                        setBarbeiros(retryData);
                        if (!form.profissional && retryData.length > 0) {
                            setForm(prev => ({
                                ...prev,
                                profissional: retryData[0].nome
                            }));
                        }
                        return true;
                    }
                }

                return false;
            }
        } catch (error) {
            console.error('❌ Erro de conexão ao buscar barbeiros:', error);
            return false;
        }
    };

    const fetchAgendamentos = async (): Promise<boolean> => {
        try {
            const response = await fetch('https://agendou-back-9dr1.vercel.app/api/agendamentos/public');

            if (response.ok) {
                const data = await response.json();
                setAgendamentos(data);
                return true;
            } else {
                const errorText = await response.text();
                console.error('Erro ao buscar agendamentos públicos:', response.status, errorText);
                return false;
            }
        } catch (error) {
            console.error('Erro de conexão ao buscar agendamentos:', error);
            return false;
        }
    };

    useEffect(() => {
        const checkAuthAndLoadData = async () => {
            try {
                const usuarioLocal = getUsuarioLogado();
                const token = localStorage.getItem('token');

                if (!usuarioLocal || !token) {
                    await Swal.fire({
                        title: 'Acesso não autorizado',
                        text: 'Você precisa fazer login para agendar um serviço',
                        icon: 'warning',
                        confirmButtonText: 'Ir para Login',
                        confirmButtonColor: cores.primary.main,
                    });
                    router.push('/login');
                    return;
                }

                const isValid = await verifyToken();
                if (!isValid) {
                    await Swal.fire({
                        title: 'Sessão expirada',
                        text: 'Sua sessão expirou. Faça login novamente.',
                        icon: 'warning',
                        confirmButtonText: 'Ir para Login',
                        confirmButtonColor: cores.primary.main,
                    });
                    router.push('/login');
                    return;
                }

                setUserName(usuarioLocal.nome);
                setUserEmail(usuarioLocal.email || '');
                setForm(prev => ({
                    ...prev,
                    nome: usuarioLocal.nome,
                    email: usuarioLocal.email || '',
                    telefone: usuarioLocal.telefone || ''
                }));

                const [barbeirosSuccess, agendamentosSuccess] = await Promise.all([
                    fetchBarbeiros(),
                    fetchAgendamentos()
                ]);

                if (!barbeirosSuccess) {
                    await Swal.fire({
                        title: 'Aviso',
                        text: 'Não foi possível carregar a lista de barbeiros. Tente novamente.',
                        icon: 'warning',
                        confirmButtonText: 'OK',
                        confirmButtonColor: cores.primary.main,
                    });
                }

                if (!agendamentosSuccess) {
                    await Swal.fire({
                        title: 'Aviso',
                        text: 'Não foi possível carregar a disponibilidade. Tente novamente.',
                        icon: 'warning',
                        confirmButtonText: 'OK',
                        confirmButtonColor: cores.primary.main,
                    });
                }

            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                await Swal.fire({
                    title: 'Erro',
                    text: 'Erro ao carregar dados. Tente novamente.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.main,
                });
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        if (!dataInicializada) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            setForm(prev => ({ ...prev, data: formattedDate }));
            setDataInicializada(true);
        }

        checkAuthAndLoadData();
    }, [router, searchParams, refreshKey, dataInicializada]); 

    useEffect(() => {
        if (form.data && form.profissional) {
            setRefreshKey(prev => prev + 1);
        }
    }, [form.data, form.profissional]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        
        if (name === 'data') {
            setDataInicializada(true);
        }
        
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function hasUserAppointmentSameDay(): boolean {
        if (!userEmail || !form.data) return false;
        return agendamentos.some(
            (ag: Agendamento) =>
                ag.email === userEmail &&
                ag.data === form.data &&
                (ag.status === 'pendente' || ag.status === 'confirmado')
        );
    }

    function isBarberAvailable(): boolean {
        if (!form.data || !form.horario || !form.profissional) return true;

        return !agendamentos.some(
            (ag: Agendamento) =>
                ag.data === form.data &&
                ag.horario === form.horario &&
                ag.profissional === form.profissional &&
                (ag.status === 'pendente' || ag.status === 'confirmado')
        );
    }

    function isTimeSlotAvailable(): boolean {
        if (!form.data || !form.horario) return true;

        const appointmentsAtSameTime = agendamentos.filter(
            (ag: Agendamento) =>
                ag.data === form.data &&
                ag.horario === form.horario &&
                (ag.status === 'pendente' || ag.status === 'confirmado')
        );

        return appointmentsAtSameTime.length < 3;
    }

    function getAvailableTimesForSelectedDate(): string[] {
        if (!form.data || !form.profissional) return availableTimes;

        return availableTimes.filter(time => {
            const appointmentsAtSameTime = agendamentos.filter(
                (ag: Agendamento) =>
                    ag.data === form.data &&
                    ag.horario === time &&
                    (ag.status === 'pendente' || ag.status === 'confirmado')
            );

            const barberOccupied = agendamentos.some(
                (ag: Agendamento) =>
                    ag.data === form.data &&
                    ag.horario === time &&
                    ag.profissional === form.profissional &&
                    (ag.status === 'pendente' || ag.status === 'confirmado')
            );

            return appointmentsAtSameTime.length < 3 && !barberOccupied;
        });
    }

    function getTimeSlotStatus(time: string): { available: boolean; reason?: string } {
        if (!form.data) return { available: true };

        const appointmentsAtSameTime = agendamentos.filter(
            (ag: Agendamento) =>
                ag.data === form.data &&
                ag.horario === time &&
                (ag.status === 'pendente' || ag.status === 'confirmado')
        );

        const barberOccupied = agendamentos.some(
            (ag: Agendamento) =>
                ag.data === form.data &&
                ag.horario === time &&
                ag.profissional === form.profissional &&
                (ag.status === 'pendente' || ag.status === 'confirmado')
        );

        if (appointmentsAtSameTime.length >= 3) {
            return { available: false, reason: 'Horário lotado' };
        }

        if (barberOccupied) {
            return { available: false, reason: `${form.profissional} ocupado` };
        }

        return { available: true };
    }

    function getEspecialidadeBarbeiro(): string {
        const barbeiroSelecionado = barbeiros.find(b => b.nome === form.profissional);
        return barbeiroSelecionado?.especialidade || 'Barbeiro Profissional';
    }

    function getFotoBarbeiro(): string | null {
        const barbeiroSelecionado = barbeiros.find(b => b.nome === form.profissional);
        return barbeiroSelecionado?.foto || null;
    }



async function handleAgendar(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    if (hasUserAppointmentSameDay()) {
        await Swal.fire({
            title: 'Agendamento não permitido',
            text: 'Você já possui um agendamento para este dia. Só é permitido um agendamento por dia.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: cores.primary.main,
        });
        setSubmitting(false);
        return;
    }

    if (!isTimeSlotAvailable()) {
        await Swal.fire({
            title: 'Horário indisponível',
            text: 'Este horário já está completamente ocupado. Por favor, escolha outro horário.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: cores.primary.main,
        });
        setSubmitting(false);
        return;
    }

    if (!isBarberAvailable()) {
        await Swal.fire({
            title: 'Barbeiro Indisponível',
            text: `${form.profissional} já está ocupado neste horário. Por favor, escolha outro horário ou outro barbeiro.`,
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: cores.primary.main,
        });
        setSubmitting(false);
        return;
    }

    try {
        const response = await fetch('https://agendou-back-9dr1.vercel.app/api/agendamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form),
        });

        const data = await response.json();

        if (response.ok) {
           

            await Swal.fire({
                title: 'Agendamento Confirmado! 🎉',
                html: `
                    <div class="text-left text-lg">
                        <p class="mb-2"><strong>✂️ Serviço:</strong> ${form.servico}</p>
                        <p class="mb-2"><strong>👤 Profissional:</strong> ${form.profissional}</p>
                        <p class="mb-2"><strong>🎯 Especialidade:</strong> ${getEspecialidadeBarbeiro()}</p>
                        <p class="mb-2"><strong>📅 Data:</strong> ${new Date(form.data).toLocaleDateString('pt-BR')}</p>
                        <p class="mb-2"><strong>⏰ Horário:</strong> ${form.horario}</p>
                        <p class="mt-4 text-[${cores.primary.main}] font-semibold">📧 Um e-mail de confirmação foi enviado para ${userEmail}</p>
                        <p class="text-sm text-gray-600 mt-2">Verifique sua caixa de entrada e spam</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: cores.primary.main,
            });

            await fetchAgendamentos();
            router.push('/');

        } else {
            if (response.status === 409) {
                await Swal.fire({
                    title: 'Horário Indisponível',
                    text: data.error || 'Este horário não está mais disponível. Por favor, escolha outro.',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.main,
                });
                await fetchAgendamentos();
            } else {
                await Swal.fire({
                    title: 'Erro!',
                    text: data.error || 'Erro ao realizar agendamento',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: cores.primary.main,
                });
            }
        }
    } catch (error) {
        console.error('Erro ao agendar:', error);
        await Swal.fire({
            title: 'Erro de Conexão!',
            text: 'Erro ao enviar agendamento. Verifique sua conexão com o servidor.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: cores.primary.main,
        });
    } finally {
        setSubmitting(false);
    }
}

    const availableTimesList = getAvailableTimesForSelectedDate();

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`
                }}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto border-[#D4AF37]"></div>
                    <p className="mt-4 text-lg text-gray-300">Carregando disponibilidade...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen py-8 px-4"
            style={{
                background: `linear-gradient(135deg, ${cores.background.primary} 0%, ${cores.background.secondary} 100%)`
            }}
        >
            <div
                className="max-w-md mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20"
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
                            <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-md border-2 border-[#D4AF37] flex items-center justify-center">
                                <span className="text-2xl">✂️</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white font-sans">Agendar Serviço</h1>
                        <p className="text-gray-200 text-sm mt-2">Escolha seu serviço e horário</p>
                        {agendamentos.length > 0 && (
                            <p className="text-gray-300 text-xs mt-2">
                                📅 {agendamentos.length} agendamentos carregados
                            </p>
                        )}
                        {barbeiros.length > 0 && (
                            <p className="text-gray-300 text-xs mt-1">
                                💈 {barbeiros.length} barbeiros disponíveis
                            </p>
                        )}
                    </div>
                </div>

                <form onSubmit={handleAgendar} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center space-x-2 text-white">
                            <span>✂️</span>
                            <span>Serviço</span>
                        </label>
                        <select
                            name="servico"
                            value={form.servico}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                            required
                            disabled={submitting}
                        >
                            <option value="Corte de Cabelo" className="text-white bg-gray-800">💇 Corte de Cabelo</option>
                            <option value="Barba" className="text-white bg-gray-800">🧔 Barba</option>
                            <option value="Massagem" className="text-white bg-gray-800">💆 Massagem</option>
                            <option value="Manicure" className="text-white bg-gray-800">💅 Manicure</option>
                            <option value="Pé e Mão" className="text-white bg-gray-800">🦶 Pé e Mão</option>
                            <option value="Sobrancelha" className="text-white bg-gray-800">👁️ Sobrancelha</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center space-x-2 text-white">
                            <span>👤</span>
                            <span>Profissional</span>
                        </label>
                        <select
                            name="profissional"
                            value={form.profissional}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                            required
                            disabled={submitting || barbeiros.length === 0}
                        >
                            {barbeiros.length > 0 ? (
                                barbeiros.map((barbeiro) => (
                                    <option
                                        key={barbeiro.id}
                                        value={barbeiro.nome}
                                        className="text-white bg-gray-800"
                                    >
                                        {barbeiro.nome}
                                        {barbeiro.especialidade && ` • ${barbeiro.especialidade}`}
                                    </option>
                                ))
                            ) : (
                                <option value="" className="text-white bg-gray-800">
                                    Nenhum barbeiro disponível
                                </option>
                            )}
                        </select>

                        {form.profissional && (
                            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                {getFotoBarbeiro() ? (
                                    <img
                                        src={getFotoBarbeiro()!}
                                        alt={form.profissional}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37]"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            img.style.display = 'none';
                                            const avatar = img.nextSibling as HTMLElement;
                                            if (avatar) avatar.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F7EF8A] flex items-center justify-center text-black font-bold text-sm ${getFotoBarbeiro() ? 'hidden' : 'flex'}`}
                                >
                                    {form.profissional.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium text-sm">{form.profissional}</p>
                                    <p className="text-gray-400 text-xs">{getEspecialidadeBarbeiro()}</p>
                                </div>
                                <span className="text-green-400 text-xs font-medium">✅ Disponível</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center space-x-2 text-white">
                                <span>📅</span>
                                <span>Data</span>
                            </label>
                            <input
                                type="date"
                                name="data"
                                value={form.data}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                min={new Date().toISOString().split('T')[0]}
                                required
                                disabled={submitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center space-x-2 text-white">
                                <span>⏰</span>
                                <span>Horário</span>
                            </label>
                            <select
                                name="horario"
                                value={form.horario}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                required
                                disabled={submitting || availableTimesList.length === 0}
                            >
                                {availableTimesList.length > 0 ? (
                                    availableTimesList.map((time, index) => {
                                        const status = getTimeSlotStatus(time);
                                        return (
                                            <option
                                                key={index}
                                                value={time}
                                                className="text-white bg-gray-800"
                                            >
                                                {time} {status.available ? '✅' : '❌'}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" className="text-white bg-gray-800">Nenhum horário disponível</option>
                                )}
                            </select>
                        </div>
                    </div>

                    {availableTimesList.length === 0 && form.data && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-xs flex items-center space-x-2 text-red-400">
                                <span>❌</span>
                                <span>Nenhum horário disponível para {form.profissional} nesta data</span>
                            </p>
                        </div>
                    )}
                    {availableTimesList.length > 0 && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-xs flex items-center space-x-2 text-green-400">
                                <span>✅</span>
                                <span>{availableTimesList.length} horários disponíveis para {form.profissional}</span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center space-x-2 text-white">
                            <span>👤</span>
                            <span>Nome Completo *</span>
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={form.nome}
                            onChange={handleChange}
                            maxLength={30}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                            required
                            disabled={submitting}
                        />
                        <p className="text-xs text-gray-400 text-right">
                            {form.nome.length}/30 caracteres
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center space-x-2 text-white">
                            <span>📞</span>
                            <span>Telefone</span>
                        </label>
                        <input
                            type="tel"
                            name="telefone"
                            value={form.telefone}
                            onChange={handleChange}
                            maxLength={19}
                            placeholder="(00) 00000-0000"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                            disabled={submitting}
                        />
                        <p className="text-xs text-gray-400 text-right">
                            {form.telefone.length}/19 caracteres
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center space-x-2 text-white">
                            <span>📧</span>
                            <span>Email *</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            maxLength={50}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                            required
                            disabled={submitting}
                        />
                        <p className="text-xs text-gray-400 text-right">
                            {form.email.length}/50 caracteres
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || availableTimesList.length === 0 || barbeiros.length === 0}
                        className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-lg font-bold text-black transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-2xl cursor-pointer group relative overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${cores.primary.accent} 0%, #F7EF8A 100%)`
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="relative z-10 flex items-center space-x-2">
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                    <span>Processando...</span>
                                </>
                            ) : (
                                <>
                                    <span>✅</span>
                                    <span>Confirmar Agendamento</span>
                                </>
                            )}
                        </span>
                    </button>

                    {barbeiros.length === 0 && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-xs text-yellow-400 text-center">
                                ⚠️ Nenhum barbeiro disponível no momento. Entre em contato conosco.
                            </p>
                        </div>
                    )}
                </form>

                <div
                    className="px-8 py-6 text-center border-t border-white/10"
                >
                    <p className="text-sm text-gray-300">
                        💈 {barbeiros.length} barbeiros profissionais disponíveis
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                        Precisa de ajuda?{' '}
                        <a
                            href="/contato"
                            className="font-medium transition-colors hover:underline text-[#D4AF37] hover:text-[#F7EF8A]"
                        >
                            Contate-nos
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}