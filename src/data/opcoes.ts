/**
 * Opções fixas para Setor (identificação antes do formulário).
 * Não há campo de função/cargo.
 */

export const SETORES = [
  'Diretoria / Alta Gestão / Administração Geral',
  'Administrativo / Escritório',
  'Financeiro / Contábil / Fiscal',
  'Recursos Humanos / Departamento Pessoal',
  'Jurídico / Compliance',
  'Comercial / Vendas',
  'Atendimento ao Cliente / SAC',
  'Produção / Operação / Prestação de Serviços',
  'Engenharia / Técnico / Manutenção',
  'Qualidade / Processos / Laboratório',
  'Logística / Estoque / Almoxarifado / Transporte',
  'Compras / Suprimentos',
  'Tecnologia da Informação (TI) / Sistemas',
  'Marketing / Comunicação',
  'Segurança do Trabalho / SESMT / Saúde Ocupacional',
  'Segurança Patrimonial / Portaria / Vigilância',
  'Serviços Gerais / Limpeza / Copa / Facilities',
] as const

export type Setor = (typeof SETORES)[number]
