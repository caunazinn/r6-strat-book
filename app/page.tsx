import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-bold tracking-tight">R6 Strat-Book</h1>
      <p className="text-lg text-slate-300">
        Desenhe rotas de ataque e defesa, posicione operadores, marque paredes reforçadas e breaches, e compartilhe a
        tática com o time por link.
      </p>
      <div>
        <Link href="/editor" className="inline-block rounded bg-amber px-5 py-2.5 font-semibold text-ink">
          Abrir o editor
        </Link>
      </div>
      <p className="text-xs text-slate-500">Projeto de fã, sem vínculo com a Ubisoft. Rainbow Six Siege é marca da Ubisoft.</p>
    </main>
  );
}
