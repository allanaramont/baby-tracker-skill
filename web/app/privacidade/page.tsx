import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade — Diário do Bebê',
};

export default function PrivacidadePage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidade</h1>
        <p className="text-slate-500 text-sm mb-10">Última atualização: maio de 2025</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Introdução</h2>
            <p>
              O <strong>Diário do Bebê</strong> respeita sua privacidade e a de sua família. Esta Política de Privacidade explica quais informações coletamos, como as utilizamos e como você pode controlá-las.
            </p>
            <p className="mt-2">
              Esta política se aplica ao uso da Skill da Amazon Alexa e do site{' '}
              <a href="https://babytracker.desenvbr.com" className="text-blue-600 underline">babytracker.desenvbr.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">2. Dados que Coletamos</h2>

            <h3 className="font-semibold text-slate-700 mt-4 mb-2">2.1 Dados de identificação (via Login with Amazon)</h3>
            <p>Quando você faz login com sua conta Amazon, recebemos:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>ID de usuário Amazon</strong> — identificador único para vincular seus dados</li>
              <li><strong>Nome</strong> — exibido na interface do site</li>
              <li><strong>E-mail</strong> — para identificação da conta</li>
            </ul>
            <p className="mt-2 text-sm text-slate-500">Não armazenamos sua senha. A autenticação é gerenciada integralmente pela Amazon.</p>

            <h3 className="font-semibold text-slate-700 mt-4 mb-2">2.2 Dados do bebê (inseridos por você)</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nome e data de nascimento do bebê</li>
              <li>Registros de amamentação: data, hora, lado e duração</li>
              <li>Registros de fraldas: data, hora e tipo</li>
              <li>Registros de sono: hora de início e fim</li>
              <li>Registros de peso com data</li>
              <li>Registros de remédios: nome, dose e horário</li>
              <li>Datas de consultas pediátricas</li>
            </ul>

            <h3 className="font-semibold text-slate-700 mt-4 mb-2">2.3 Dados técnicos</h3>
            <p>Registramos logs básicos de acesso (sem dados pessoais identificáveis) para diagnóstico de erros e manutenção do serviço.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">3. Como Usamos os Dados</h2>
            <p>Seus dados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Fornecer o serviço de registro e consulta de rotina do bebê</li>
              <li>Sincronizar dados entre a Skill da Alexa e o site</li>
              <li>Exibir históricos e resumos na interface do site</li>
              <li>Manter a sessão autenticada com segurança</li>
            </ul>
            <p className="mt-3">
              <strong>Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">4. Armazenamento e Segurança</h2>
            <p>
              Os dados são armazenados na <strong>AWS DynamoDB</strong> (Amazon Web Services), com controle de acesso restrito. A sessão do site é mantida via cookie <code className="text-sm bg-slate-100 px-1 rounded">httpOnly</code> e criptografado, que expira em 30 dias.
            </p>
            <p className="mt-2">
              Adotamos medidas técnicas razoáveis para proteger seus dados, mas nenhum sistema é 100% seguro. Use o serviço ciente desse risco.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Compartilhamento de Dados</h2>
            <p>Seus dados são processados pelos seguintes serviços de infraestrutura:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Amazon Web Services (AWS)</strong> — banco de dados e hospedagem da Skill</li>
              <li><strong>Vercel</strong> — hospedagem do site</li>
              <li><strong>Amazon Alexa</strong> — plataforma de voz (apenas para identificação via userId da Alexa)</li>
            </ul>
            <p className="mt-2">Esses provedores atuam como processadores de dados e estão sujeitos às suas próprias políticas de privacidade.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Privacidade de Crianças</h2>
            <p>
              O Diário do Bebê é destinado a <strong>pais e responsáveis adultos</strong> para registrar informações sobre seus bebês. Não coletamos dados diretamente de crianças. As informações inseridas sobre o bebê são de responsabilidade do responsável que utiliza o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Seus Direitos</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Acessar</strong> os dados que armazenamos sobre você e seu bebê</li>
              <li><strong>Corrigir</strong> informações incorretas</li>
              <li><strong>Excluir</strong> sua conta e todos os dados associados</li>
              <li><strong>Exportar</strong> seus dados (mediante solicitação)</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer desses direitos, entre em contato pelo e-mail:{' '}
              <a href="mailto:allanmoto@gmail.com" className="text-blue-600 underline">allanmoto@gmail.com</a>.
              Atenderemos sua solicitação em até 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">8. Retenção de Dados</h2>
            <p>
              Seus dados ficam armazenados enquanto sua conta estiver ativa. Se você solicitar a exclusão, removeremos todos os seus dados em até 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">9. Cookies</h2>
            <p>
              O site utiliza um único cookie de sessão (<code className="text-sm bg-slate-100 px-1 rounded">diario_session</code>) para manter você autenticado. Esse cookie é <code className="text-sm bg-slate-100 px-1 rounded">httpOnly</code>, seguro e expira em 30 dias. Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">10. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade. A data da última atualização aparece no topo da página. Para alterações relevantes, notificaremos por e-mail quando possível.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">11. Contato</h2>
            <p>
              Para dúvidas, solicitações ou reclamações sobre privacidade, entre em contato:
            </p>
            <p className="mt-2">
              <strong>E-mail:</strong>{' '}
              <a href="mailto:allanmoto@gmail.com" className="text-blue-600 underline">allanmoto@gmail.com</a>
            </p>
            <p>
              <strong>Site:</strong>{' '}
              <a href="https://babytracker.desenvbr.com" className="text-blue-600 underline">babytracker.desenvbr.com</a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 px-6 text-center mt-12">
        <div className="flex justify-center gap-6">
          <Link href="/" className="text-slate-400 hover:text-slate-600 text-xs">Página inicial</Link>
          <Link href="/termos" className="text-slate-400 hover:text-slate-600 text-xs">Termos de Uso</Link>
        </div>
      </footer>
    </div>
  );
}
