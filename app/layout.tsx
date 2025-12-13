import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Minha Agenda Bio - Sistema de Agendamento para Beleza",
  description: "Sistema SaaS completo de agendamento para negócios de beleza. Gerencie sua agenda, funcionários, serviços e clientes em um só lugar.",
  keywords: "agendamento, beleza, salão, barbearia, spa, estética, gestão",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
