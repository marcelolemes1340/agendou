import React from 'react';
import './main.css';
import Link from 'next/link';
const Main = () => {
    return (
        <main className="main-container">
            <div className="card">
                <h1>Agende Serviços de Negócios</h1>
                <p>Marque corte de cabelo, unha e muito mais</p>
                <Link href="/agendamento" className="seu-estilo-do-botao">
                    Agendar Agora
                </Link>
                <input
                    type="text"
                    placeholder="Pesquisar por serviço ou profissional"
                    className="search-input"
                />
            </div>
        </main>
    );
};

export default Main;
