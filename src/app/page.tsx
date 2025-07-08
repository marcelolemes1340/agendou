'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Service = {
  name: string;
  icon: string;
  duration: string;
  type: 'service';
};

type Professional = {
  name: string;
  specialty: string;
  rating: string;
  type: 'professional';
  photo: string; 
};

type SearchResult = Service | Professional;

export default function Principal() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('usuarioLogado');
    if (userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setUserName(user.nome.split(' ')[0]);
    }
  }, []);

  const services: Service[] = [
    { name: 'Corte de Cabelo', icon: '✂️', duration: '30 min', type: 'service' },
    { name: 'Barba', icon: '🧔', duration: '20 min', type: 'service' },
    { name: 'Massagem', icon: '💆', duration: '30 min', type: 'service' },
    { name: 'Manicure', icon: '💅', duration: '45 min', type: 'service' }
  ];

  const professionals: Professional[] = [
    { name: 'Roberto', specialty: 'Cortes Clássicos', rating: '⭐ 4.9', type: 'professional', photo: '/barbeiro.jpg' },
    { name: 'Marcelo', specialty: 'Barba e Design', rating: '⭐ 5.0', type: 'professional', photo: '/barbeiro2.jpg' },
    { name: 'Lucas', specialty: 'Estilos Modernos', rating: '⭐ 4.8', type: 'professional', photo: '/barbeiro3.jpg' }
  ];

  const testimonials = [
    {
      quote: "Melhor barbearia da região! O Marcelo faz a barba mais perfeita que já tive.",
      author: "Carlos Silva",
      role: "Cliente há 3 anos"
    },
    {
      quote: "Sempre saio satisfeito. Ambiente limpo e profissionais qualificados.",
      author: "João Mendes",
      role: "Cliente mensal"
    }
  ];

  const handleAgendamentoClick = (e: React.MouseEvent, serviceName?: string, professionalName?: string) => {
    const isLoggedIn = localStorage.getItem('usuarioLogado');
    if (!isLoggedIn) {
      e.preventDefault();
      router.push('/login');
    } else if (serviceName || professionalName) {
      e.preventDefault();
      const params = new URLSearchParams();
      if (serviceName) params.append('service', serviceName);
      if (professionalName) params.append('professional', professionalName);
      router.push(`/agendamento?${params.toString()}`);
    }
  };

  const filteredResults = (): SearchResult[] => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();

    const matchedServices = services.filter(service =>
      service.name.toLowerCase().includes(term)
    );

    const matchedProfessionals = professionals.filter(professional =>
      professional.name.toLowerCase().includes(term)
    );

    return [...matchedServices, ...matchedProfessionals];
  };

  const isService = (result: SearchResult): result is Service => {
    return result.type === 'service';
  };


  return (
    <main className="flex flex-col min-w-full">
      <section className="relative flex justify-center items-center bg-gradient-to-br from-gray-50 to-indigo-50 overflow-hidden py-12 px-4">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 sm:p-12 rounded-3xl mt-10 mb-16 text-center w-full max-w-2xl shadow-lg border border-white/20 relative z-10 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-800 leading-tight">
            Barbearia Premium
          </h1>

          <p className="mb-8 mt-4 text-lg sm:text-xl text-gray-600 font-medium">
            Estilo, tradição e modernidade em cada corte. Sua melhor versão começa aqui.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/agendamento"
              onClick={(e) => handleAgendamentoClick(e)}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white border-none px-8 py-3 sm:px-10 sm:py-4 rounded-full text-lg font-semibold cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg transform"
            >
              Agendar Agora
            </Link>
          </div>

          <div className="mt-10 relative z-30" style={{ marginBottom: searchTerm ? '200px' : '0' }}>
            <input
              type="text"
              placeholder="Pesquisar por serviço ou profissional..."
              className="w-full p-4 border border-gray-200 rounded-full text-base sm:text-lg bg-white transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:bg-white outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <div className="absolute z-40 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                {filteredResults().length > 0 ? (
                  filteredResults().map((item, index) => (
                    <Link
                      key={index}
                      href={isService(item)
                        ? `/agendamento?service=${encodeURIComponent(item.name)}`
                        : `/agendamento?professional=${encodeURIComponent(item.name)}`}
                      onClick={(e) => handleAgendamentoClick(e, isService(item) ? item.name : undefined, !isService(item) ? item.name : undefined)}
                      className="block p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      {isService(item) ? (
                        <div>
                          <span className="text-xl mr-2">{item.icon}</span>
                          <span className="text-indigo-600 font-medium">{item.name}</span>
                          <span className="text-gray-500 text-sm ml-2">({item.duration})</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-purple-600 font-medium">{item.name}</span>
                          <div className="text-sm text-gray-600">{item.specialty} • {item.rating}</div>
                        </div>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="p-3 text-gray-500">Nenhum resultado encontrado</div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nossos Serviços</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">Duração: {service.duration}</p>
                <Link
                  href={`/agendamento?service=${encodeURIComponent(service.name)}`}
                  onClick={(e) => handleAgendamentoClick(e, service.name)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                >
                  Agendar este serviço →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nossos Barbeiros</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {professionals.map((professional, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="h-48 bg-indigo-100 flex items-center justify-center relative overflow-hidden">
                  <Image
                    src={professional.photo}
                    alt={`Foto de ${professional.name}`}
                    width={300}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{professional.name}</h3>
                  <p className="text-gray-600 mb-2">{professional.specialty}</p>
                  <p className="text-yellow-500 font-medium">{professional.rating}</p>
                  <Link
                    href={`/agendamento?professional=${encodeURIComponent(professional.name)}`}
                    onClick={(e) => handleAgendamentoClick(e, undefined, professional.name)}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium text-sm block"
                  >
                    Agendar com {professional.name.split(' ')[0]} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">O Que Nossos Clientes Dizem</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-indigo-700 p-6 rounded-lg">
                <p className="italic mb-4">"{testimonial.quote}"</p>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-indigo-200 text-sm">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Pronto para Sua Transformação?</h2>
          <p className="text-xl text-gray-600 mb-8">Agende seu horário agora mesmo e experimente o melhor serviço de barbearia da cidade.</p>

          <Link
            href="/agendamento"
            onClick={handleAgendamentoClick}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-semibold cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg transform"
          >
            Agendar Agora
          </Link>
        </div>
      </section>
    </main>
  );
}