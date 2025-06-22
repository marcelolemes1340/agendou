import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import Main from '@/components/Main';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Revenda Avenida",
  description: "Revenda de veiculos em Pelotas-RS",
  keywords: ['Revenda', 'Carros', 'Veículos', 'Veículos usados']
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        <Header />
        <Main />
        <Footer />
        {children}
      </body>
    </html>
  );
}
