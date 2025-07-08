'use client';
import Link from 'next/link';

export default function Desenvolvedores() {
    const desenvolvedores = [
        {
            nome: 'Marcelo Lemes',
            linkedin: 'https://www.linkedin.com/in/marcelonuneslemes/',
            funcao: 'Desenvolvedor Front-End',
            foto: '/desenvolvedores/marcelo.jpg' 
        },
        {
            nome: 'Rafael Valente',
            linkedin: 'https://www.linkedin.com/in/rafael-valente-a641a126b/',
            funcao: 'Desenvolvedor Back-End',
            foto: '/desenvolvedores/rafael.png'
        }
    ];

    return (
        <main className="bg-gradient-to-br py-4 px-4 mt-20 mb-28">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Conheça nossa equipe</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {desenvolvedores.map((dev, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
                            <div className="p-6 flex flex-col items-center">
                                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-100 mb-4">
                                    <img
                                        src={dev.foto}
                                        alt={dev.nome}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <Link
                                    href={dev.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 mb-2"
                                >
                                    {dev.nome}
                                </Link>

                                <p className="text-gray-600">{dev.funcao}</p>

                                <div className="mt-4">
                                    <Link
                                        href={dev.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="#0A66C2"
                                            className="hover:opacity-80"
                                        >
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                        Voltar para Home
                    </Link>
                </div>
            </div>
        </main>
    );
}