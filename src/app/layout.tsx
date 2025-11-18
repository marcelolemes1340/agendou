import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Agendou - Barbearia Premium",
  description: "Barbearia de elite em Pelotas-RS. Cortes precisos, estilo único e experiência premium.",
  keywords: ["Barbearia", "Agendamento", "Corte Premium", "Pelotas", "Estilo"],
  openGraph: {
    title: "Agendou - Barbearia Premium",
    description: "Transformando estilo em experiência. Sua barbearia de elite em Pelotas.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="scroll-smooth">
      <body suppressHydrationWarning={true} className="antialiased">
        <Header />
        <main className="pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}