'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthButton() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabase) return <span className="text-xs text-slate-500">Modo local (sem Supabase)</span>;
  if (user)
    return (
      <button className="btn" onClick={() => supabase!.auth.signOut()}>
        Sair ({user})
      </button>
    );
  if (sent) return <span className="text-xs text-slate-400">Link enviado. Confira seu e-mail.</span>;
  return (
    <span className="flex gap-2">
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="rounded border border-line bg-ink px-2 py-1 text-sm" />
      <button className="btn" onClick={async () => { await supabase!.auth.signInWithOtp({ email }); setSent(true); }}>
        Entrar
      </button>
    </span>
  );
}
