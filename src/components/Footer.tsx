import React from 'react';
import './footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <p className="footer-title">Categorias</p>
            <div className="icon-group">
                <button>
                    <img src="massagem.jpg" alt="Ícone massagem" />
                </button>

                <button>
                    <img src="tesoura.jpeg" alt="Ícone tesoura" />
                </button>
                <button>
                    <img src="barba.jpeg" alt="Ícone barba" />

                </button>
                <button>
                    <img src="unha.jpeg" alt="Ícone unha" />

                </button>

            </div>
        </footer>
    );
};

export default Footer;
