import Image from 'next/image';
import Link from 'next/link';

const ALEXA_SKILL_URL = 'https://alexa-skill-placeholder'; // Substituir após publicação na Amazon

const alexaFeatures = [
  { icon: '🍼', title: 'Mamada', desc: 'Registre amamentações com lado (esquerdo/direito) e duração. Consulte a última mamada a qualquer hora.' },
  { icon: '🩲', title: 'Fraldas', desc: 'Registre trocas de fralda informando xixi ou cocô. Veja quando foi a última troca.' },
  { icon: '🌙', title: 'Sono', desc: 'Inicie e encerre períodos de sono. Pergunte quanto tempo o bebê dormiu.' },
  { icon: '⚖️', title: 'Peso', desc: 'Registre o peso do bebê e acompanhe a evolução com o tempo.' },
  { icon: '💊', title: 'Remédios', desc: 'Registre administração de medicamentos com horário e dosagem.' },
  { icon: '🏥', title: 'Consultas', desc: 'Registre a próxima consulta com o pediatra e seja lembrado quando perguntar.' },
  { icon: '📋', title: 'Resumo do dia', desc: 'Peça um resumo completo de tudo que aconteceu no dia — mamadas, fraldas, sono e mais.' },
];

const siteFeatures = [
  { icon: '📊', title: 'Dashboard', desc: 'Visão geral do dia com todos os eventos mais recentes do bebê em um só lugar.' },
  { icon: '🍼', title: 'Histórico de alimentação', desc: 'Lista completa de mamadas com filtros por período, lado e duração.' },
  { icon: '🩲', title: 'Histórico de fraldas', desc: 'Acompanhe trocas de fralda com gráficos por tipo ao longo do tempo.' },
  { icon: '🌙', title: 'Histórico de sono', desc: 'Veja a duração e os horários de cada período de sono registrado.' },
  { icon: '⚖️', title: 'Curva de peso', desc: 'Gráfico da evolução do peso do bebê para mostrar ao pediatra.' },
  { icon: '💊', title: 'Controle de remédios', desc: 'Histórico completo de medicamentos administrados com horários.' },
  { icon: '⚙️', title: 'Configurações', desc: 'Personalize o nome do bebê, data de nascimento e preferências do app.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f1e3a 0%, #1b2d4f 40%, #1e3560 100%)' }}>
      {/* Estrelas decorativas */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: i % 5 === 0 ? 3 : 2,
              height: i % 5 === 0 ? 3 : 2,
              top: `${(i * 37 + 5) % 80}%`,
              left: `${(i * 53 + 10) % 95}%`,
              opacity: 0.3 + (i % 4) * 0.15,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Diário do Bebê" width={36} height={36} className="rounded-full" />
          <span className="font-bold text-white text-sm">Diário do Bebê</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-20 text-center">
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="Diário do Bebê" width={120} height={120} className="rounded-full shadow-2xl" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Diário do Bebê
        </h1>
        <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
          Acompanhe amamentações, fraldas, sono, peso e muito mais — com a Alexa ou pelo site, com tudo sincronizado automaticamente.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={ALEXA_SKILL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-[#0f1e3a] transition-colors"
            style={{ background: '#f5c842' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14.5v-2H9v-5h4V7.5l4.5 4.5-4.5 4.5z"/>
            </svg>
            Ativar na Alexa
          </a>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors"
          >
            Acessar o site
          </Link>
        </div>
      </section>

      {/* Seção Alexa */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔊</span>
            <h2 className="text-xl font-bold text-white">O que você pode fazer com a Alexa</h2>
          </div>
          <p className="text-white/50 text-sm mb-8">
            Diga <span className="text-white/80 italic">"Alexa, abrir Diário do Bebê"</span> e use comandos de voz para registrar tudo sem precisar parar o que estiver fazendo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {alexaFeatures.map((f) => (
              <div key={f.title} className="flex gap-3">
                <span className="text-xl mt-0.5">{f.icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{f.title}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Site */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💻</span>
            <h2 className="text-xl font-bold text-white">O que você pode acompanhar no site</h2>
          </div>
          <p className="text-white/50 text-sm mb-8">
            Use a mesma conta da Alexa — todos os dados registrados por voz aparecem automaticamente no site.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {siteFeatures.map((f) => (
              <div key={f.title} className="flex gap-3">
                <span className="text-xl mt-0.5">{f.icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{f.title}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Pronto para começar?</h2>
        <p className="text-white/60 mb-8 text-sm">Acesse com a mesma conta da Amazon — sem cadastro extra.</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-[#0f1e3a] text-base transition-colors"
          style={{ background: '#f5c842' }}
        >
          Entrar com Amazon
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t text-center py-8 px-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <a
          href="https://desenvbr.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/30 hover:text-white/60 text-xs transition-colors"
        >
          © {new Date().getFullYear()} DesenvBR Group
        </a>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/termos" className="text-white/40 hover:text-white/70 text-xs transition-colors">
            Termos de Uso
          </Link>
          <Link href="/privacidade" className="text-white/40 hover:text-white/70 text-xs transition-colors">
            Política de Privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}
