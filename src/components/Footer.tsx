"use client";
import Link from 'next/link';
import React from 'react';

export default function Footer() { 
    const categories = [
        { name: 'Massagem', icon: '/massagem.jpg', color: 'from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300' },
        { name: 'Cabelo', icon: '/tesoura.jpeg', color: 'from-green-100 to-green-200 hover:from-green-200 hover:to-green-300' },
        { name: 'Barba', icon: '/barba.jpeg', color: 'from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300' },
        { name: 'Manicure', icon: '/unha.jpeg', color: 'from-pink-100 to-pink-200 hover:from-pink-200 hover:to-pink-300' },
    ];

    return (
        <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold mb-6">Nossos Serviços</h2>
                    <div className="flex justify-center gap-6 flex-wrap">
                        {categories.map((category, index) => (
                            <div key={index} className="flex flex-col items-center group">
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} transition-all group-hover:scale-110 group-hover:shadow-lg flex items-center justify-center mb-2`}>
                                    <img 
                                        src={category.icon} 
                                        alt={`Ícone ${category.name}`} 
                                        className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <span className="text-sm font-medium">{category.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="border-t border-indigo-400 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <img
                            src="/agendou.png"
                            className="h-14 w-auto drop-shadow-lg transition-transform duration-200 hover:scale-105"
                            alt="Agendou Logo"
                        />
                        <span className="text-white text-2xl font-bold tracking-wide drop-shadow-md">
                            Agendou
                        </span>
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="text-indigo-100 hover:text-white transition-colors">Termos</a>
                        <a href="#" className="text-indigo-100 hover:text-white transition-colors">Privacidade</a>
                        <Link href="/desenvolvedores" className="text-indigo-100 hover:text-white transition-colors">Desenvolvedores</Link>
                    </div>
                </div>
                <div className="mt-6 text-center text-sm text-indigo-100">
                    © {new Date().getFullYear()} Agendou. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
};

