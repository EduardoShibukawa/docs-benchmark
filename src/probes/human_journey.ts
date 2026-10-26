export interface HumanJourneyQuestion {
  id: string;
  stage: "onboarding" | "usage" | "architecture" | "decisions" | "extension";
  question: string;
  developerIntent: string;
  evaluationCriteria: {
    clarityWeight: number; // 0 to 20
    pedagogicalValue: string;
  };
}

export const HUMAN_JOURNEY_QUESTIONS: HumanJourneyQuestion[] = [
  {
    id: "q1-purpose",
    stage: "onboarding",
    question: "Qual é o objetivo principal deste projeto? Qual problema de negócio ele resolve no mundo real?",
    developerIntent: "Entender o 'Porquê' e o propósito do sistema antes de abrir qualquer arquivo de código.",
    evaluationCriteria: {
      clarityWeight: 25,
      pedagogicalValue: "Uso de analogias, foco em valor humano vs despejo de jargões técnicos de compilação.",
    },
  },
  {
    id: "q2-quickstart",
    stage: "usage",
    question: "Como eu utilizo ou inicializo o projeto pela primeira vez? Qual é o fluxo principal (happy path)?",
    developerIntent: "Ter um percurso de 2 minutos para ver o sistema funcionando sem frustração.",
    evaluationCriteria: {
      clarityWeight: 20,
      pedagogicalValue: "Passo a passo testável, sem flags fantasmas ou pré-requisitos ocultos.",
    },
  },
  {
    id: "q3-flow-diagram",
    stage: "architecture",
    question: "Me mostre como os componentes conversam entre si e o fluxo visual do comando principal.",
    developerIntent: "Formar um mapa mental visual de causa e efeito entre os serviços.",
    evaluationCriteria: {
      clarityWeight: 20,
      pedagogicalValue: "Diagrama limpo com direção clara de fluxo de negócio em vez de emaranhado de imports.",
    },
  },
  {
    id: "q4-design-rationale",
    stage: "decisions",
    question: "Por que o sistema foi estruturado dessa forma? Onde ficam as regras de negócio vs infraestrutura?",
    developerIntent: "Compreender os limites arquiteturais para não violar padrões do time.",
    evaluationCriteria: {
      clarityWeight: 20,
      pedagogicalValue: "Separação evidente de responsabilidades e registro das decisões (ADRs).",
    },
  },
  {
    id: "q5-extension",
    stage: "extension",
    question: "Se eu precisar criar uma nova funcionalidade, onde eu começo e como garanto que não quebrei nada?",
    developerIntent: "Segurança para desenvolver no dia a dia com feedback rápido.",
    evaluationCriteria: {
      clarityWeight: 15,
      pedagogicalValue: "Exemplos claros de extensão e mecanismos de verificação antes do deploy.",
    },
  },
];
