/**
 * Modelo embutido: pesquisa de cultura e clima organizacional, no padrão aplicado no Bismarchi | Pires
 * (registrado no ORQESTRAI, módulo Clima): 46 afirmações em escala de concordância de 5 pontos, agrupadas
 * em 5 dimensões e seus temas, e 7 indicadores com escalas próprias (incluindo felicidade de 0 a 10).
 * Leitura: % favorável (4 e 5), com referência de 70% por afirmação, tema e dimensão.
 * Os ids seguem os do ORQESTRAI, para comparar com a aplicação anterior.
 */
import { SCALE_PRESETS, type SurveyQuestion } from './pesquisas'

/** Referência de mercado para % favorável (abaixo de 50%, crítico). */
export const FAVORABLE_TARGET = 0.7
export const FAVORABLE_CRITICAL = 0.5

const CONCORDANCIA = [...(SCALE_PRESETS.find((p) => p.id === 'concordancia')?.labels ?? [])]
const FREQUENCIA_5 = [...(SCALE_PRESETS.find((p) => p.id === 'frequencia')?.labels ?? [])]
const QUALIDADE = [...(SCALE_PRESETS.find((p) => p.id === 'qualidade')?.labels ?? [])]

type Afirmacao = [id: string, theme: string, text: string]

const DIMENSOES: { section: string; items: Afirmacao[] }[] = [
  {
    section: 'Credibilidade',
    items: [
      ['p1', 'Comunicação da liderança', 'Os gestores me mantêm informados sobre mudanças na empresa.'],
      ['p2', 'Comunicação da liderança', 'Os gestores deixam claras suas expectativas.'],
      ['p3', 'Comunicação da liderança', 'É fácil se aproximar dos gestores e falar com eles.'],
      ['p5', 'Comunicação da liderança', 'Posso fazer qualquer pergunta razoável e obter respostas diretas.'],
      ['p4', 'Competência da liderança', 'Os gestores são competentes para tocar o negócio.'],
      ['p6', 'Competência da liderança', 'Os gestores contratam pessoas que se enquadram bem aqui.'],
      ['p7', 'Competência da liderança', 'Os gestores sabem coordenar e distribuir tarefas.'],
      ['p8', 'Competência da liderança', 'Os gestores confiam que as pessoas fazem bom trabalho sem vigiá-las.'],
      ['p9', 'Competência da liderança', 'Os gestores dão autonomia às pessoas.'],
      ['p10', 'Competência da liderança', 'Os gestores têm visão clara de para onde estamos indo.'],
      ['p11', 'Integridade da liderança', 'Os gestores cumprem o que prometem.'],
      ['p12', 'Integridade da liderança', 'Os gestores agem de acordo com o que falam.'],
      ['p13', 'Integridade da liderança', 'Os gestores só promoveriam reduções de quadro como último recurso.'],
      ['p14', 'Integridade da liderança', 'Os gestores são honestos e éticos na condução dos negócios.'],
    ],
  },
  {
    section: 'Respeito',
    items: [
      ['p15', 'Apoio e desenvolvimento', 'A empresa oferece treinamento ou outras formas de desenvolvimento.'],
      ['p16', 'Apoio e desenvolvimento', 'Recebo os equipamentos e recursos necessários para o meu trabalho.'],
      ['r9', 'Apoio e desenvolvimento', 'Os gestores agradecem o bom trabalho e o esforço extra.'],
      ['r10', 'Apoio e desenvolvimento', 'Meu superior me encoraja a contribuir com ideias.'],
      ['s1', 'Cuidado e bem-estar', 'Este é um lugar fisicamente seguro para trabalhar.'],
      ['s2', 'Cuidado e bem-estar', 'Este é um lugar psicológica e emocionalmente saudável.'],
      ['s3', 'Cuidado e bem-estar', 'Nossas instalações contribuem para um bom ambiente.'],
      ['s4', 'Cuidado e bem-estar', 'Posso me ausentar do trabalho quando necessário.'],
      ['s5', 'Cuidado e bem-estar', 'A liderança me incentiva a equilibrar vida pessoal e profissional.'],
      ['s6', 'Cuidado e bem-estar', 'A liderança me trata com respeito como profissional e como pessoa.'],
      ['r3', 'Reconhecimento', 'Sinto-me valorizado(a) pelo trabalho que realizo.'],
      ['r4', 'Reconhecimento', 'Recebo reconhecimento adequado pelo meu desempenho no trabalho.'],
      ['r5', 'Equilíbrio vida/trabalho', 'Consigo equilibrar bem minhas responsabilidades profissionais e pessoais.'],
      ['r6', 'Equilíbrio vida/trabalho', 'A empresa promove um bom equilíbrio entre trabalho e vida pessoal.'],
    ],
  },
  {
    section: 'Imparcialidade',
    items: [
      ['s7', 'Remuneração e benefícios', 'Meu salário é justo pelo trabalho que executo.'],
      ['q2', 'Remuneração e benefícios', 'A quantia que recebo como participação nos resultados é justa.'],
      ['q3', 'Remuneração e benefícios', 'Temos benefícios especiais e diferenciados aqui.'],
      ['q4', 'Remuneração e benefícios', 'Todos têm a oportunidade de receber um reconhecimento especial.'],
      ['q5', 'Meritocracia', 'Sou considerado(a) importante independentemente da minha posição.'],
      ['q6', 'Meritocracia', 'As promoções são dadas às pessoas que realmente mais merecem.'],
      ['q7', 'Meritocracia', 'Os gestores evitam o favoritismo.'],
      ['q8', 'Meritocracia', 'As pessoas evitam “politicagem” e intrigas.'],
      ['d1', 'Diversidade e justiça', 'As pessoas são bem tratadas independentemente de cor ou etnia.'],
      ['d2', 'Diversidade e justiça', 'As pessoas são bem tratadas independentemente da idade.'],
      ['d3', 'Diversidade e justiça', 'As pessoas são bem tratadas independentemente do sexo.'],
      ['d4', 'Diversidade e justiça', 'As pessoas são bem tratadas independentemente da orientação sexual.'],
      ['d5', 'Diversidade e justiça', 'Se for tratado(a) injustamente, serei ouvido(a) e receberei tratamento justo.'],
      ['d6', 'Diversidade e justiça', 'A empresa tem um ambiente que respeita a diversidade e a inclusão.'],
    ],
  },
  {
    section: 'Orgulho',
    items: [
      ['r1', 'Propósito do trabalho', 'Sinto que o meu trabalho tem um propósito significativo.'],
      ['r2', 'Propósito do trabalho', 'As atividades que realizo no meu trabalho são importantes para mim.'],
    ],
  },
  {
    section: 'Camaradagem',
    items: [
      ['r7', 'Relações entre colegas', 'Tenho boas relações interpessoais no meu ambiente de trabalho.'],
      ['r8', 'Relações entre colegas', 'O ambiente de trabalho é saudável e colaborativo.'],
    ],
  },
]

const INDICADORES: SurveyQuestion[] = [
  { id: 'ind_comunicacao', type: 'escala', required: true, labels: QUALIDADE, section: 'Indicadores', theme: 'Comunicação interna', text: 'Como você avalia a comunicação interna na empresa?' },
  { id: 'ind_motivacao', type: 'escala', required: true, labels: FREQUENCIA_5, section: 'Indicadores', theme: 'Motivação', text: 'Você se sente motivado(a) no seu trabalho diário?' },
  {
    id: 'ind_feedback_lideranca',
    type: 'escala',
    required: true,
    labels: FREQUENCIA_5,
    section: 'Indicadores',
    theme: 'Abertura a feedback',
    text: 'A liderança está aberta a feedback e sugestões das pessoas?',
  },
  {
    id: 'ind_feedback_construtivo',
    type: 'escala',
    required: true,
    labels: FREQUENCIA_5,
    section: 'Indicadores',
    theme: 'Feedback construtivo',
    text: 'Você tem acesso a feedback construtivo sobre o seu desempenho?',
  },
  {
    id: 'ind_saude_mental',
    type: 'escala',
    required: true,
    labels: FREQUENCIA_5,
    section: 'Indicadores',
    theme: 'Saúde mental',
    text: 'A empresa oferece suporte adequado para a saúde mental e o bem-estar das pessoas?',
  },
  {
    id: 'ind_equilibrio',
    type: 'escala',
    required: true,
    labels: ['Muito desequilibrado', 'Pouco desequilibrado', 'Equilibrado', 'Bem equilibrado', 'Excelentemente equilibrado'],
    section: 'Indicadores',
    theme: 'Equilíbrio vida/trabalho',
    text: 'Como você classificaria o equilíbrio entre trabalho e vida pessoal na empresa?',
  },
  { id: 'ind_felicidade', type: 'nota', required: true, section: 'Indicadores', theme: 'Felicidade', text: 'De 0 a 10, que nota você daria para a sua felicidade geral no trabalho?' },
]

export const TEMPLATE_CULTURA = {
  key: 'cultura-organizacional',
  name: 'Cultura organizacional',
  description:
    'Pesquisa de clima e cultura com 46 afirmações em 5 dimensões (credibilidade, respeito, imparcialidade, orgulho e camaradagem) e 7 indicadores, incluindo felicidade de 0 a 10.',
  intro:
    'Esta pesquisa ajuda a entender como as pessoas percebem a cultura e o clima da empresa: liderança, respeito, justiça, orgulho do trabalho e relação entre colegas. É anônima: não pedimos nome, e-mail, cargo nem setor, e as respostas são analisadas apenas em conjunto. Responda com sinceridade: não há respostas certas ou erradas.',
  questions: [
    ...DIMENSOES.flatMap(({ section, items }) =>
      items.map(([id, theme, text]): SurveyQuestion => ({ id, type: 'escala', required: true, labels: CONCORDANCIA, section, theme, text }))
    ),
    ...INDICADORES,
  ] satisfies SurveyQuestion[],
}
