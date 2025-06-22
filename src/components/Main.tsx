import React from 'react';
import './main.css';

const Main = () => {
    return (
        <main className="main-container">
            <div className="card">
                <h1>Agende Serviços de Negócios</h1>
                <p>Marque corte de cabelo, unha e muito mais</p>
                <button className="main-button">Agendar agora</button>
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
