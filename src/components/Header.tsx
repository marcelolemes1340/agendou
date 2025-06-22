import Link from "next/link";
import "./header.css"; // importa o CSS puro

export function Header() {
    return (
        <nav className="header">
            <div className="header-container">
                <Link href="/" className="header-logo">
                    <img src="./logo_agendou.png" className="header-img" alt="Revenda" />

                </Link>
                <div className="header-links">
                    <span className="header-link">Login</span>
                    <Link href="/login" className="header-link">Cadastro</Link>
                </div>
            </div>
        </nav>
    );
}
