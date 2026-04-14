import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diário do Bebê',
  description: 'Acompanhe amamentações, fraldas, sono e peso do seu bebê.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
