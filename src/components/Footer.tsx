"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { cores } from '@/lib/cores';

export default function Footer() {
    const [currentYear] = useState(new Date().getFullYear());
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <footer 
            className={`relative overflow-hidden transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ 
                backgroundColor: cores.background.primary,
                borderTop: `1px solid ${cores.primary.light}`
            }}
        >
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-48 h-48 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#3B82F6] rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8">
                    
                    <div className="text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] rounded-full opacity-20 blur"></div>
                                    <img
                                        src="/agendou.png"
                                        className="h-12 w-auto relative z-10"
                                        alt="Agendou Logo"
                                    />
                                </div>
                                <span className="text-white text-xl font-bold tracking-wide font-sans">
                                    Agendou
                                </span>
                            </div>
                            <p style={{ color: cores.neutral.light }} className="text-sm leading-relaxed max-w-md">
                                Transformando estilo em experiência. Sua barbearia de elite em Pelotas.
                            </p>
                            <div className="flex space-x-3 pt-2">
                                {['📱', '📷', '📘'].map((icon, index) => (
                                    <div 
                                        key={index}
                                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 hover:shadow-lg transform backdrop-blur-sm border border-white/10 hover:border-[#D4AF37]"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                    >
                                        <span className="text-sm">{icon}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h3 style={{ color: cores.neutral.white }} className="text-base font-bold mb-4 font-sans">Links Rápidos</h3>
                        <div className="space-y-2">
                            {[
                                { href: '/agendamento', label: '✂️ Fazer Agendamento' },
                                { href: '/meus-agendamentos', label: '📅 Meus Agendamentos' },
                                { href: '/login', label: '🔐 Área do Cliente' },
                                { href: '/desenvolvedores', label: '👨‍💻 Desenvolvedores' }
                            ].map((link, index) => (
                                <Link 
                                    key={index}
                                    href={link.href}
                                    className="block transition-all duration-300 text-sm hover:translate-x-1 transform group"
                                    style={{ color: cores.neutral.light }}
                                >
                                    <span className="group-hover:text-[#D4AF37] transition-colors duration-300">
                                        {link.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h3 style={{ color: cores.neutral.white }} className="text-base font-bold mb-4 font-sans">Serviços</h3>
                        <div className="space-y-2">
                            {[
                                '💇 Corte Premium',
                                '🧔 Design de Barba',
                                '💆 Relaxamento',
                                '✨ Acabamento'
                            ].map((service, index) => (
                                <div 
                                    key={index}
                                    className="transition-all duration-300 text-sm group cursor-pointer"
                                    style={{ color: cores.neutral.light }}
                                >
                                    <span className="group-hover:text-[#D4AF37] transition-colors duration-300">
                                        {service}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h3 style={{ color: cores.neutral.white }} className="text-base font-bold mb-4 font-sans">Contato</h3>
                        <div className="space-y-2 text-sm">
                            {[
                                { icon: '📍', text: 'Pelotas, RS' },
                                { icon: '📞', text: '(53) 99999-9999' },
                                { icon: '✉️', text: 'contato@agendou.com' },
                                { icon: '🕒', text: 'Seg - Sáb: 9h - 19h' }
                            ].map((contact, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center justify-center md:justify-start space-x-2 group"
                                >
                                    <span style={{ color: '#D4AF37' }} className="text-sm">{contact.icon}</span>
                                    <span style={{ color: cores.neutral.light }} className="group-hover:text-white transition-colors duration-300 text-sm">
                                        {contact.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div 
                    className="py-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 border-t"
                    style={{ borderColor: cores.primary.light }}
                >
                    
                    <div className="text-center md:text-left">
                        <p style={{ color: cores.neutral.light }} className="text-sm">
                            © {currentYear} Barbearia Agendou. Todos os direitos reservados.
                        </p>
                    </div>

                    <div className="flex space-x-6">
                        {['Termos', 'Privacidade', 'Desenvolvedores'].map((item, index) => (
                            <a 
                                key={index}
                                href="#"
                                style={{ color: cores.neutral.light }}
                                className="hover:text-[#D4AF37] transition-colors duration-300 text-sm"
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <p style={{ color: cores.neutral.light }} className="text-xs">
                        Feito com ❤️ para amantes de um bom corte
                    </p>
                </div>
            </div>
        </footer>
    );
}