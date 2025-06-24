import React from 'react';
import './cadastro.css';



export default function Cadastro() {
    return (
        <div className="cadastro-container">
            <div className="cadastro-left">
                <img src="/logo_agendou.png" alt="Logo Agendou" className="cadastro-logo" />
            </div>
            <div className="cadastro-right">
                <h2>Seus dados</h2>
                <form className="cadastro-form">
                    <input type="text" placeholder="Nome e sobrenome" />
                    <input type="email" placeholder="nome@gmail.com" />
                    <input type="tel" placeholder="(99) 9 99999999" />
                    <input type="text" placeholder="999.999.999-99" />
                    <input type="password" placeholder="Digite uma senha forte" />
                    <button type="submit">Criar minha conta</button>
                </form>
            </div>
        </div>
    );
}
