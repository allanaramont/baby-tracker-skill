type Comando = {
  titulo: string;
  descricao: string;
  exemplos: string[];
  resposta?: string;
  fluxo?: string[];
};

type Categoria = {
  id: string;
  label: string;
  icone: string;
  comandos: Comando[];
};

const categorias: Categoria[] = [
  {
    id: 'geral',
    label: 'Geral',
    icone: '🎙️',
    comandos: [
      {
        titulo: 'Abrir a skill',
        descricao: 'Abre o Diário do Bebê para registrar ou consultar.',
        exemplos: ['Alexa, abrir diario do bebe', 'Alexa, abrir diário do bebê'],
        resposta: 'A Alexa cumprimentos e fica pronta para o próximo comando.',
      },
      {
        titulo: 'Nome do bebê',
        descricao: 'Define ou altera o nome usado nas respostas da Alexa.',
        exemplos: ['o nome é Ravi', 'alterar nome para Maria', 'trocar nome para Helena'],
        resposta: 'A Alexa confirma e passa a usar o nome nas respostas.',
      },
      {
        titulo: 'Ajuda',
        descricao: 'Lista as principais ações disponíveis.',
        exemplos: ['ajuda', 'o que você sabe fazer', 'o que você pode fazer'],
      },
      {
        titulo: 'Resumo do dia',
        descricao: 'Resume amamentações, fraldas e sono do dia atual.',
        exemplos: ['resumo de hoje', 'como foi o dia', 'relatório do dia'],
      },
      {
        titulo: 'Encerrar',
        descricao: 'Fecha a skill.',
        exemplos: ['cancelar', 'parar', 'fechar', 'encerrar'],
        resposta: 'A Alexa responde "Fechando diário {nome}, até logo."',
      },
    ],
  },
  {
    id: 'alimentacao',
    label: 'Alimentação',
    icone: '🍼',
    comandos: [
      {
        titulo: 'Iniciar amamentação',
        descricao: 'Começa uma amamentação no seio e, se necessário, pergunta o lado.',
        exemplos: [
          'iniciar amamentação',
          'iniciar amamentação no esquerdo',
          'dar de mamar',
          'dar de mamar no direito',
        ],
        fluxo: [
          'Se faltar o lado, a Alexa pergunta: "Qual lado? Esquerdo ou direito?"',
          'Responda: esquerdo, direito, peito esquerdo, peito direito, lado esquerdo ou lado direito.',
        ],
      },
      {
        titulo: 'Finalizar amamentação',
        descricao: 'Finaliza a amamentação em andamento ou registra uma amamentação que já aconteceu.',
        exemplos: [
          'finalizar amamentação',
          'mamou 12 minutos',
          'finalizar amamentação no direito',
        ],
        fluxo: [
          'Se não houver amamentação em andamento, a Alexa pergunta se quer registrar atrasado.',
          'Depois diga: "há 20 minutos" ou "começou às 8:15".',
        ],
      },
      {
        titulo: 'Consultar última amamentação',
        descricao: 'Informa quando foi a última amamentação registrada.',
        exemplos: [
          'última amamentação',
          'quando foi a última amamentação',
          'há quanto tempo mamou',
          'quando foi alimentado',
        ],
      },
      {
        titulo: 'Registrar mamadeira',
        descricao: 'Registra que o bebê tomou mamadeira agora.',
        exemplos: [
          'registrar mamadeira',
          'mamadeira',
          'deu mamadeira',
          'tomou mamadeira',
          'bebê tomou mamadeira',
        ],
        resposta: 'A Alexa confirma a mamadeira com a hora atual.',
      },
      {
        titulo: 'Registrar mamadeira atrasada',
        descricao: 'Registra uma mamadeira que aconteceu há um tempo atrás.',
        exemplos: [
          'registrar mamadeira atrasada',
          'mamadeira atrasada',
          'deu mamadeira antes',
          'tomou mamadeira antes',
        ],
        fluxo: [
          'A Alexa pergunta: "Pode dizer há quanto tempo foi a mamadeira, ou que horas foi."',
          'Responda: "há 30 minutos" ou "foi às 9 e meia".',
        ],
      },
    ],
  },
  {
    id: 'fraldas',
    label: 'Fraldas',
    icone: '🩲',
    comandos: [
      {
        titulo: 'Trocar fralda',
        descricao: 'Registra troca de fralda de xixi, cocô ou os dois.',
        exemplos: [
          'trocar fralda',
          'trocar fralda de xixi',
          'trocar fralda de cocô',
          'bebê fez xixi',
          'bebê fez cocô',
        ],
        fluxo: [
          'Se faltar o tipo, a Alexa pergunta: "Diga: xixi, cocô ou os dois."',
          'Responda: xixi, cocô, os dois, teve cocô também.',
        ],
      },
      {
        titulo: 'Consultar última fralda',
        descricao: 'Informa quando foi a última troca de fralda.',
        exemplos: ['última fralda', 'última troca', 'quando foi a última troca'],
      },
    ],
  },
  {
    id: 'sono',
    label: 'Sono',
    icone: '🌙',
    comandos: [
      {
        titulo: 'Iniciar sono',
        descricao: 'Marca que o bebê começou a dormir agora.',
        exemplos: [
          'bebê dormiu',
          'dormiu',
          'foi dormir',
          'está dormindo',
          'iniciar sono',
        ],
        resposta: 'A Alexa confirma o horário de início do sono.',
      },
      {
        titulo: 'Finalizar sono',
        descricao: 'Marca que o bebê acordou. Também permite registrar um sono que já terminou.',
        exemplos: [
          'acordou',
          'bebê acordou',
          'finalizar sono',
        ],
        fluxo: [
          'Se não houver sono em andamento, a Alexa pergunta se quer registrar atrasado.',
          'Depois diga: "há 40 minutos" ou "começou às 9:30".',
        ],
      },
    ],
  },
  {
    id: 'peso',
    label: 'Peso',
    icone: '⚖️',
    comandos: [
      {
        titulo: 'Registrar peso',
        descricao: 'Salva o peso atual do bebê.',
        exemplos: [
          'registrar peso',
          'peso 3 quilos e 200 gramas',
          'o peso é 4 quilos e 500 gramas',
          'pesou 5 quilos',
        ],
        resposta: 'Se faltar o valor, a Alexa pede o peso em quilos e gramas.',
      },
    ],
  },
  {
    id: 'remedios',
    label: 'Remédios',
    icone: '💊',
    comandos: [
      {
        titulo: 'Registrar remédio',
        descricao: 'Salva remédio, dose e unidade administrados.',
        exemplos: [
          'dar remédio luftal',
          'registrar remédio luftal',
          'dar remédio luftal 5 gotas',
          'tomou tylenol 2 ml',
        ],
        fluxo: [
          'Se faltar alguma informação, a Alexa pergunta o nome do remédio ou a dose.',
          'Você pode dizer a dose com unidade: gotas, ml, comprimido.',
        ],
      },
      {
        titulo: 'Consultar último remédio',
        descricao: 'Informa o último remédio registrado.',
        exemplos: [
          'último remédio',
          'quando foi o último remédio',
          'quando foi o luftal',
        ],
      },
    ],
  },
];

const primeirosPassos = [
  {
    passo: '1',
    titulo: 'Vincule sua conta',
    descricao: 'No app Alexa, acesse a skill "Diário do Bebê" e toque em "Vincular conta". Faça login com sua conta Amazon.',
  },
  {
    passo: '2',
    titulo: 'Abra a skill',
    descricao: '"Alexa, abrir diario do bebe"',
    dica: true,
  },
  {
    passo: '3',
    titulo: 'Defina o nome do bebê',
    descricao: '"o nome é [nome do bebê]"',
    dica: true,
  },
  {
    passo: '4',
    titulo: 'Registre alimentações',
    descricao: '"iniciar amamentação no esquerdo" → depois "finalizar amamentação"',
    dica: true,
  },
  {
    passo: '5',
    titulo: 'Registre fraldas',
    descricao: '"trocar fralda de xixi"',
    dica: true,
  },
  {
    passo: '6',
    titulo: 'Veja o resumo do dia',
    descricao: '"resumo de hoje"',
    dica: true,
  },
];

function CardComando({ comando }: { comando: Comando }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{comando.titulo}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{comando.descricao}</p>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">O que dizer</p>
        <div className="flex flex-wrap gap-2">
          {comando.exemplos.map((exemplo) => (
            <span
              key={exemplo}
              className="rounded-full bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1.5 text-xs font-medium"
            >
              &ldquo;{exemplo}&rdquo;
            </span>
          ))}
        </div>
      </div>

      {comando.resposta && (
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">O que acontece</p>
          <p className="text-xs text-slate-600">{comando.resposta}</p>
        </div>
      )}

      {comando.fluxo && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 mb-2">Fluxo guiado</p>
          <ol className="flex flex-col gap-1.5 list-decimal list-inside">
            {comando.fluxo.map((linha) => (
              <li key={linha} className="text-xs text-amber-800">
                {linha}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function ComoUsarPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Guia completo</p>
        <h1 className="text-2xl font-bold text-slate-800 mt-1">Como usar a skill</h1>
        <p className="text-sm text-slate-500 mt-2">
          Todos os comandos que a Alexa entende, com exemplos reais de fala e os fluxos guiados.
        </p>
      </div>

      {/* Dica de abertura */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 p-[1px]">
        <div className="rounded-2xl bg-white/95 px-5 py-4">
          <p className="text-xs font-semibold text-slate-500 mb-1">Dica de ouro</p>
          <p className="text-sm text-slate-700">
            Sempre abra a skill primeiro:{' '}
            <span className="font-semibold text-slate-900">&ldquo;Alexa, abrir diario do bebe&rdquo;</span>.
            Dentro da skill, os comandos são mais curtos e diretos.
          </p>
        </div>
      </div>

      {/* Primeiros passos */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-slate-800">Primeiros passos</h2>
        <div className="flex flex-col gap-3">
          {primeirosPassos.map((item) => (
            <div key={item.passo} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {item.passo}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.titulo}</p>
                {item.dica ? (
                  <p className="text-xs text-slate-500 mt-0.5 font-mono bg-slate-50 rounded px-2 py-1 inline-block mt-1">
                    {item.descricao}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-0.5">{item.descricao}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comandos por categoria */}
      {categorias.map((cat) => (
        <section key={cat.id} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <span className="text-lg">{cat.icone}</span>
            <h2 className="text-base font-bold text-slate-800">{cat.label}</h2>
          </div>
          <div className="flex flex-col gap-3">
            {cat.comandos.map((comando) => (
              <CardComando key={comando.titulo} comando={comando} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
