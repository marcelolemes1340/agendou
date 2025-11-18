'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cores } from '@/lib/cores';

type Service = {
  name: string;
  icon: string;
  duration: string;
  description: string;
  type: 'service';
};

type Professional = {
  name: string;
  specialty: string;
  rating: string;
  type: 'professional';
  photo: string;
  experience: string;
};

type SearchResult = Service | Professional;

export default function Principal() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('usuarioLogado');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          setUserName(user.nome.split(' ')[0]);
        } catch (error) {
          console.error('Erro ao analisar os dados do usuário:', error);
          setIsLoggedIn(false);
          setUserName('');
        }
      } else {
        setIsLoggedIn(false);
        setUserName('');
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePosition({ x, y });
      }
    };

    checkAuth();
    setIsVisible(true);

    if (heroRef.current) {
      heroRef.current.addEventListener('mousemove', handleMouseMove);
    }

    window.addEventListener('storage', checkAuth);

    return () => {
      if (heroRef.current) {
        heroRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const services: Service[] = [
    {
      name: 'Corte Premium',
      icon: '✂️',
      duration: '30 min',
      description: 'Corte preciso com técnicas modernas e produtos premium',
      type: 'service'
    },
    {
      name: 'Design de Barba',
      icon: '🧔',
      duration: '20 min',
      description: 'Modelagem e acabamento profissional para sua barba',
      type: 'service'
    },
    {
      name: 'Relaxamento',
      icon: '💆',
      duration: '30 min',
      description: 'Massagem relaxante com óleos essenciais',
      type: 'service'
    },
    {
      name: 'Acabamento',
      icon: '✨',
      duration: '15 min',
      description: 'Detalhes finais e produtos de fixação',
      type: 'service'
    }
  ];

  const professionals: Professional[] = [
    {
      name: 'Roberto',
      specialty: 'Cortes Clássicos',
      rating: '⭐ 4.9',
      type: 'professional',
      photo: '/Barbeiro.jpg',
      experience: '8 anos'
    },
    {
      name: 'Marcelo',
      specialty: 'Barba e Design',
      rating: '⭐ 5.0',
      type: 'professional',
      photo: '/barbeiro2.jpg',
      experience: '10 anos'
    },
    {
      name: 'Lucas',
      specialty: 'Estilos Modernos',
      rating: '⭐ 4.8',
      type: 'professional',
      photo: '/barbeiro3.jpg',
      experience: '6 anos'
    }
  ];

  const testimonials = [
    {
      quote: "Melhor barbearia da região! O Marcelo faz a barba mais perfeita que já tive. Ambiente incrível e atendimento excepcional.",
      author: "Carlos Silva",
      role: "Cliente há 3 anos"
    },
    {
      quote: "Sempre saio satisfeito. Ambiente limpo, profissionais qualificados e atenção aos detalhes impressionante.",
      author: "João Mendes",
      role: "Cliente mensal"
    },
    {
      quote: "Transformação completa! Não é só um corte, é uma experiência. Recomendo para todos.",
      author: "Pedro Santos",
      role: "Primeira visita"
    }
  ];

  const stats = [
    { number: '500+', label: 'Clientes Satisfeitos' },
    { number: '95%', label: 'Taxa de Retorno' },
    { number: '4.9', label: 'Avaliação Média' },
    { number: '15min', label: 'Tempo de Espera' }
  ];

  const handleAgendamentoClick = (e: React.MouseEvent, serviceName?: string, professionalName?: string) => {
    const userData = localStorage.getItem('usuarioLogado');
    if (!userData) {
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
      service.name.toLowerCase().includes(term) ||
      service.description.toLowerCase().includes(term)
    );

    const matchedProfessionals = professionals.filter(professional =>
      professional.name.toLowerCase().includes(term) ||
      professional.specialty.toLowerCase().includes(term)
    );

    return [...matchedServices, ...matchedProfessionals];
  };

  const isService = (result: SearchResult): result is Service => {
    return result.type === 'service';
  };

  return (
    <main className="flex flex-col min-w-full text-white" style={{ background: cores.background.primary }}>
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${cores.primary.main} 0%, ${cores.background.primary} 70%)`
        }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#3B82F6] rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-float animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-[#D4AF37] via-[#F7EF8A] to-[#D4AF37] bg-clip-text text-transparent animate-gradient">
              AGENDOU
            </h1>

            <p className="text-xl sm:text-2xl lg:text-3xl mb-8 font-light text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Onde <span className="text-[#D4AF37] font-semibold">estilo</span> encontra{' '}
              <span className="text-[#D4AF37] font-semibold">precisão</span>. Sua experiência premium em barbearia.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link
                href="/agendamento"
                onClick={(e) => handleAgendamentoClick(e)}
                className="group relative bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-12 py-4 rounded-full text-lg font-bold cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl transform overflow-hidden"
              >
                <span className="relative z-10">
                  {isLoggedIn ? 'Agendar Agora' : 'Fazer Login para Agendar'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>

              {isLoggedIn && (
                <Link
                  href="/dashboard"
                  className="group border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black px-8 py-4 rounded-full text-lg font-semibold cursor-pointer transition-all duration-500 hover:scale-105 transform"
                >
                  👋 Minha Área, {userName}
                </Link>
              )}
            </div>
          </div>

          <div className={`mt-12 max-w-2xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Pesquisar serviços ou profissionais..."
                className="w-full p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-lg text-white placeholder-gray-400 transition-all duration-300 focus:bg-white/15 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/20 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <div className="absolute z-40 w-full mt-4 bg-black/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-h-80 overflow-auto">
                  {filteredResults().length > 0 ? (
                    filteredResults().map((item, index) => (
                      <Link
                        key={index}
                        href={isService(item)
                          ? `/agendamento?service=${encodeURIComponent(item.name)}`
                          : `/agendamento?professional=${encodeURIComponent(item.name)}`}
                        onClick={(e) => handleAgendamentoClick(e, isService(item) ? item.name : undefined, !isService(item) ? item.name : undefined)}
                        className="block p-4 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-b-0 transition-all duration-300 group"
                      >
                        {isService(item) ? (
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                            <div className="flex-1">
                              <div className="text-white font-semibold group-hover:text-[#D4AF37] transition-colors duration-300">
                                {item.name}
                              </div>
                              <div className="text-gray-400 text-sm">{item.description}</div>
                              <div className="text-[#D4AF37] text-xs font-medium mt-1">{item.duration}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] rounded-full flex items-center justify-center text-black font-bold">
                              {item.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-semibold group-hover:text-[#D4AF37] transition-colors duration-300">
                                {item.name}
                              </div>
                              <div className="text-gray-400 text-sm">{item.specialty}</div>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-yellow-400 text-sm">{item.rating}</span>
                                <span className="text-[#D4AF37] text-xs font-medium">{item.experience}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-gray-400 text-center">Nenhum resultado encontrado</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#D4AF37] rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#D4AF37] rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: cores.background.secondary }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">
                  {stat.number}
                </div>
                <div className="text-gray-400 mt-2 font-medium group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden" style={{ background: cores.background.primary }}>
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-float"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-float animation-delay-3000"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Nossos Serviços
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubra nossa gama completa de serviços premium, projetados para elevar sua experiência
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-[#D4AF37]/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <div className="flex items-start space-x-6">
                  <div className="text-5xl group-hover:scale-110 transition-transform duration-500">
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">{service.name}</h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#D4AF37] font-semibold">{service.duration}</span>
                      <Link
                        href={`/agendamento?service=${encodeURIComponent(service.name)}`}
                        onClick={(e) => handleAgendamentoClick(e, service.name)}
                        className="text-[#D4AF37] hover:text-[#F7EF8A] font-semibold text-sm flex items-center space-x-2 group"
                      >
                        <span>Agendar</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: cores.background.secondary }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Nossos Especialistas
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Conheça nossa equipe de profissionais altamente qualificados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {professionals.map((professional, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/20 hover:border-[#D4AF37]/50 transition-all duration-500 hover:scale-105"
              >
                <div className="h-64 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
                  <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#F7EF8A] flex items-center justify-center">
                    <Image
                      src={professional.photo}
                      alt={`Foto de ${professional.name}`}
                      width={300}
                      height={256}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-[#D4AF37] text-sm font-semibold">{professional.experience} experiência</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{professional.name}</h3>
                  <p className="text-gray-300 mb-3">{professional.specialty}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-yellow-400 font-semibold">{professional.rating}</span>
                  </div>
                  <Link
                    href={`/agendamento?professional=${encodeURIComponent(professional.name)}`}
                    onClick={(e) => handleAgendamentoClick(e, undefined, professional.name)}
                    className="block w-full bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black text-center py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Agendar com {professional.name.split(' ')[0]}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden" style={{ background: cores.background.primary }}>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-56 h-56 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-float animation-delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              O Que Dizem
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A opinião de quem já experimentou nossos serviços
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-500 hover:scale-105"
              >
                <div className="text-4xl mb-4 text-[#D4AF37]">❝</div>
                <p className="text-gray-300 mb-6 leading-relaxed italic">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-[#D4AF37] text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${cores.primary.main} 0%, ${cores.primary.light} 100%)` }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] bg-clip-text text-transparent">
            Pronto para Sua Transformação?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Agende seu horário agora mesmo e experimente o padrão de excelência que só a Agendou oferece
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/agendamento"
              onClick={handleAgendamentoClick}
              className="group relative bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] text-black px-12 py-4 rounded-full text-lg font-bold cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl transform overflow-hidden"
            >
              <span className="relative z-10">
                {isLoggedIn ? 'Agendar Agora' : 'Fazer Login para Agendar'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#F7EF8A] to-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>

            <Link
              href="/cadastro"
              className="group border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black px-8 py-4 rounded-full text-lg font-semibold cursor-pointer transition-all duration-500 hover:scale-105 transform"
            >
              📝 Criar Conta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}