import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso — Diário do Bebê',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Diário do Bebê" width={32} height={32} className="rounded-full" />
            <span className="font-bold text-slate-800 text-sm">Diário do Bebê</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Termos de Uso</h1>
        <p className="text-slate-500 text-sm mb-10">Última atualização: maio de 2025</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao utilizar o aplicativo <strong>Diário do Bebê</strong> — seja pela Skill da Alexa ou pelo site{' '}
              <a href="https://babytracker.desenvbr.com" className="text-blue-600 underline">babytracker.desenvbr.com</a>{' '}
              — você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">2. Descrição do Serviço</h2>
            <p>
              O Diário do Bebê é um aplicativo de acompanhamento de bebês que permite registrar e consultar:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Sessões de amamentação (lado, duração e horário)</li>
              <li>Trocas de fralda (tipo e horário)</li>
              <li>Períodos de sono</li>
              <li>Peso do bebê</li>
              <li>Administração de remédios</li>
              <li>Consultas com pediatra</li>
              <li>Resumo diário de atividades</li>
            </ul>
            <p className="mt-3">
              O serviço está disponível como Skill da Amazon Alexa e como aplicativo web, com dados sincronizados entre as duas plataformas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">3. Conta e Autenticação</h2>
            <p>
              O acesso ao Diário do Bebê é feito por meio da conta Amazon (Login with Amazon). Não criamos uma conta separada — usamos a autenticação Amazon para identificar você com segurança.
            </p>
            <p className="mt-2">
              Você é responsável por manter a segurança da sua conta Amazon. Não compartilhe suas credenciais com terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">4. Uso Adequado</h2>
            <p>Você concorda em utilizar o serviço apenas para fins pessoais e lícitos. É proibido:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Utilizar o serviço para fins comerciais sem autorização</li>
              <li>Tentar acessar dados de outros usuários</li>
              <li>Realizar engenharia reversa ou explorar vulnerabilidades do sistema</li>
              <li>Inserir dados falsos com intenção de prejudicar o serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Dados de Saúde</h2>
            <p>
              O Diário do Bebê armazena informações relacionadas à saúde e rotina do seu bebê. Esses dados são de uso exclusivamente pessoal e <strong>não substituem orientação médica profissional</strong>. Sempre consulte um pediatra para decisões sobre a saúde do seu filho.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Disponibilidade do Serviço</h2>
            <p>
              Fazemos o possível para manter o serviço disponível, mas não garantimos disponibilidade ininterrupta. Podemos realizar manutenções, atualizações ou encerrar o serviço a qualquer momento, com aviso prévio razoável quando possível.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Limitação de Responsabilidade</h2>
            <p>
              O Diário do Bebê é fornecido "como está". Não nos responsabilizamos por perdas de dados, decisões tomadas com base nas informações registradas, ou danos decorrentes do uso ou indisponibilidade do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">8. Alterações nos Termos</h2>
            <p>
              Podemos atualizar estes Termos a qualquer momento. A data da última atualização aparece no topo desta página. O uso contínuo do serviço após alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">9. Contato</h2>
            <p>
              Dúvidas sobre estes Termos? Entre em contato pelo e-mail:{' '}
              <a href="mailto:allanmoto@gmail.com" className="text-blue-600 underline">allanmoto@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 px-6 text-center mt-12">
        <div className="flex justify-center gap-6">
          <Link href="/" className="text-slate-400 hover:text-slate-600 text-xs">Página inicial</Link>
          <Link href="/privacidade" className="text-slate-400 hover:text-slate-600 text-xs">Política de Privacidade</Link>
        </div>
      </footer>
    </div>
  );
}
