import { redirect } from 'next/navigation';
import { getSessao } from './lib/auth';

export default async function Home() {
  const sessao = await getSessao();
  if (sessao) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
