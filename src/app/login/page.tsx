import React from 'react';
import './login.css';


export default function Login() {
    return (
        <div className="login-container">
            <div className="login-left">
                <img src="/logo_agendou.png" alt="Logo Agendou" className="login-logo" />
            </div>
            <div className="login-right">
                <h2>Entre na sua Conta</h2>
                <form className="login-form">
                    <label>
                        Seu E-mail
                        <input type="email" placeholder="nome@gmail.com" />
                    </label>
                    <label>
                        Sua senha
                        <input type="password" placeholder="Digite uma senha forte" />
                    </label>
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    );
}
