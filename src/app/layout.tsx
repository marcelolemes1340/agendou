import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Barbearia Agendou",
  description: "Barbearia em Pelotas-RS",
  keywords: ["Barbearia", "Agendamento", "Serviços", "Corte de Cabelo", "Barba"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body suppressHydrationWarning={true}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}


