import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'R6 Strat-Book',
  description: 'Planejador tático para Rainbow Six Siege: desenhe rotas, posicione operadores e compartilhe suas strats.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
