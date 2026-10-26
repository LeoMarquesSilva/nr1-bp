/**
 * Exporta os resultados de uma pesquisa para Excel (.xlsx), com as mesmas regras de anonimato do painel:
 * resumo da reunião, tabelas estilizadas por tipo de pergunta, respostas abertas, uma base sem
 * identificação (uma linha por resposta, embaralhada) e tabelas dinâmicas montadas sobre ela.
 */
import ExcelJS from 'exceljs'
import JSZip from 'jszip'
import { ESCALA_OPTIONS, NR_OPTION, type SurveyAnswers, type SurveyQuestion } from '@/data/pesquisas'
import {
  buildAnswerRows,
  buildMeetingSummary,
  computeStats,
  noiseFor,
  perguntaLabel,
  respostaOrder,
  resultsGate,
  type ChoiceStat,
  type MultiStat,
  type OpenStat,
} from '@/data/resultados'
import { addPivotTables } from './pivot'

export type ExportInput = {
  title: string
  companyName: string
  status: string
  /** "26/10/2026" ou "de 03/11/2026 a 28/11/2026". */
  period: string | null
  minResponses: number
  questions: SurveyQuestion[]
  answers: SurveyAnswers[]
  generatedAt?: Date
}

// Cores da marca (ARGB)
const C = {
  ink: 'FF040C1E',
  navy: 'FF0D1F38',
  blue700: 'FF122C4F',
  blue600: 'FF294F7A',
  blue400: 'FF5B88B2',
  line: 'FFCEDEED',
  soft: 'FFF7F9FC',
  good: 'FF256ABF',
  bad: 'FFC63C3B',
  alert: 'FFB91C1C',
  white: 'FFFFFFFF',
}
const FONT = 'Calibri'
const TABLE_STYLE = 'TableStyleMedium2'

const pct = (x: number | null | undefined) => x ?? 0

function sheet(wb: ExcelJS.Workbook, name: string, widths: number[]): ExcelJS.Worksheet {
  const ws = wb.addWorksheet(name, { views: [{ showGridLines: false }], properties: { tabColor: { argb: C.navy } } })
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w))
  return ws
}

function title(ws: ExcelJS.Worksheet, row: number, text: string, sub?: string) {
  const t = ws.getCell(row, 1)
  t.value = text
  t.font = { name: FONT, size: 16, bold: true, color: { argb: C.ink } }
  if (sub) {
    const s = ws.getCell(row + 1, 1)
    s.value = sub
    s.font = { name: FONT, size: 10, color: { argb: C.blue600 } }
  }
}

function section(ws: ExcelJS.Worksheet, row: number, text: string, cols: number) {
  const c = ws.getCell(row, 1)
  c.value = text
  c.font = { name: FONT, size: 12, bold: true, color: { argb: C.navy } }
  for (let i = 1; i <= cols; i++) ws.getCell(row, i).border = { bottom: { style: 'thin', color: { argb: C.line } } }
}

function note(ws: ExcelJS.Worksheet, row: number, text: string, cols: number, color = C.blue600) {
  ws.mergeCells(row, 1, row, cols)
  const c = ws.getCell(row, 1)
  c.value = text
  c.font = { name: FONT, size: 10, italic: true, color: { argb: color } }
  c.alignment = { wrapText: true, vertical: 'top' }
  ws.getRow(row).height = Math.max(15, Math.ceil(text.length / (cols * 11)) * 14)
}

function dataBar(ws: ExcelJS.Worksheet, ref: string, argb: string) {
  ws.addConditionalFormatting({
    ref,
    rules: [{ type: 'dataBar', priority: 1, gradient: false, minLength: 0, maxLength: 100, cfvo: [{ type: 'num', value: 0 }, { type: 'num', value: 1 }], color: { argb } } as ExcelJS.DataBarRuleType],
  })
}

/** Altura da linha para um texto quebrado numa coluna de `width` caracteres. */
const rowHeight = (text: string, width: number, min = 22) => Math.max(min, Math.ceil(text.length / (width * 1.05)) * 15 + 7)

/** Cabeçalho de tabela em duas linhas quando precisa, centralizado no meio. */
function headerRow(ws: ExcelJS.Worksheet, row: number, height = 32) {
  ws.getRow(row).height = height
  ws.getRow(row).eachCell((c) => (c.alignment = { wrapText: true, vertical: 'middle' }))
}

const statusLabel = (status: string) => (status === 'aberta' ? 'aberta (resultados parciais)' : status === 'encerrada' ? 'encerrada' : status)

export async function buildSurveyWorkbook(input: ExportInput): Promise<Uint8Array> {
  const { questions, answers, minResponses: min } = input
  const total = answers.length
  const gate = resultsGate(input.status, total, min)
  if (gate.state !== 'liberado') throw new Error('Os resultados ainda não podem ser exportados: estão protegidos pelas regras de anonimato.')

  const stats = computeStats(questions, answers, min)
  const summary = buildMeetingSummary(stats, total)
  const noise = noiseFor(total)
  const generatedAt = input.generatedAt ?? new Date()

  const wb = new ExcelJS.Workbook()
  wb.creator = 'CONFIARA'
  wb.created = generatedAt
  wb.title = input.title

  // ---------- Resumo ----------
  const ws = sheet(wb, 'Resumo', [11, 34, 4, 11, 34, 4, 11, 34])
  const eyebrow = ws.getCell('A1')
  eyebrow.value = `CONFIARA · RESULTADO DA PESQUISA · ${input.companyName.toUpperCase()}`
  eyebrow.font = { name: FONT, size: 9, bold: true, color: { argb: C.blue600 } }
  const t = ws.getCell('A2')
  t.value = input.title
  t.font = { name: FONT, size: 22, bold: true, color: { argb: C.ink } }
  const meta = ws.getCell('A3')
  meta.value = `${total} respostas${input.period ? ` · ${input.period}` : ''} · pesquisa ${statusLabel(input.status)} · gerado em ${generatedAt.toLocaleString('pt-BR')}`
  meta.font = { name: FONT, size: 10, color: { argb: C.blue600 } }

  const cards: { value: string | number; label: string; detail?: string; numFmt?: string; alert?: boolean }[] = [{ value: total, label: 'pessoas responderam', detail: input.period ?? undefined }]
  if (summary.keyYesNo) {
    cards.push({ value: (summary.keyYesNo.counts.sim ?? 0) / (summary.keyYesNo.valid || 1), numFmt: '0%', label: 'responderam “Sim”', detail: perguntaLabel(summary.keyYesNo.n, summary.keyYesNo.question.text) })
  }
  if (summary.keyIncidence) {
    cards.push({ value: pct(summary.keyIncidence.incidence), numFmt: '0%', label: 'disseram que aconteceu ao menos raramente (quanto maior, pior)', detail: perguntaLabel(summary.keyIncidence.n, summary.keyIncidence.question.text), alert: true })
  }
  cards.forEach((card, i) => {
    const col = 1 + i * 3
    ws.mergeCells(5, col, 5, col + 1)
    ws.mergeCells(6, col, 6, col + 1)
    ws.mergeCells(7, col, 7, col + 1)
    const v = ws.getCell(5, col)
    v.value = card.value
    if (card.numFmt) v.numFmt = card.numFmt
    v.font = { name: FONT, size: 28, bold: true, color: { argb: card.alert ? C.alert : C.ink } }
    v.alignment = { horizontal: 'left', vertical: 'bottom', indent: 1 }
    const l = ws.getCell(6, col)
    l.value = card.label
    l.font = { name: FONT, size: 11, bold: true, color: { argb: C.navy } }
    l.alignment = { wrapText: true, vertical: 'top', indent: 1 }
    const d = ws.getCell(7, col)
    d.value = card.detail ?? ''
    d.font = { name: FONT, size: 9, color: { argb: C.blue600 } }
    d.alignment = { wrapText: true, vertical: 'top', indent: 1 }
    for (let r = 5; r <= 7; r++)
      for (let c = col; c <= col + 1; c++)
        ws.getCell(r, c).border = {
          top: r === 5 ? { style: 'thin', color: { argb: C.line } } : undefined,
          bottom: r === 7 ? { style: 'thin', color: { argb: C.line } } : undefined,
          left: c === col ? { style: 'thin', color: { argb: C.line } } : undefined,
          right: c === col + 1 ? { style: 'thin', color: { argb: C.line } } : undefined,
        }
  })
  ws.getRow(5).height = 40
  ws.getRow(6).height = 30
  ws.getRow(7).height = 42

  let r = 9
  const rankBlock = (label: string, items: ChoiceStat[]) => {
    section(ws, r, label, 8)
    r++
    for (const s of items) {
      const p = ws.getCell(r, 1)
      p.value = pct(s.favorable)
      p.numFmt = '0%'
      p.font = { name: FONT, size: 14, bold: true, color: { argb: C.ink } }
      p.alignment = { vertical: 'top' }
      ws.mergeCells(r, 2, r, 8)
      const q = ws.getCell(r, 2)
      q.value = perguntaLabel(s.n, s.question.text)
      q.font = { name: FONT, size: 11, color: { argb: C.navy } }
      q.alignment = { wrapText: true, vertical: 'top' }
      ws.getRow(r).height = 30
      r++
    }
    r++
  }
  if (summary.ranking.length >= 2) {
    rankBlock('Pontos fortes (% que concorda: 4 ou 5)', summary.strengths)
    rankBlock('Pontos de atenção (% que concorda: 4 ou 5)', summary.attention)
    note(ws, r, `Com ${total} respostas, cada pessoa vale cerca de ${Math.round(noise.perPerson)} pontos percentuais; diferenças de até ~${Math.round(noise.margin)} pontos podem ser só variação.${summary.withinNoise ? ' Aqui a distância entre o melhor e o pior item cabe nessa margem: trate a ordem com cautela.' : ''}`, 8)
    r += 2
  }

  if (summary.alerts.length > 0) {
    section(ws, r, 'Sinais de alerta', 8)
    r++
    for (const a of summary.alerts) {
      ws.mergeCells(r, 1, r, 8)
      const c = ws.getCell(r, 1)
      c.value = { richText: [{ text: `${perguntaLabel(a.stat.n, a.stat.question.text)}\n`, font: { name: FONT, size: 11, color: { argb: C.navy } } }, { text: a.text, font: { name: FONT, size: 11, bold: true, color: { argb: C.alert } } }] }
      c.alignment = { wrapText: true, vertical: 'top' }
      ws.getRow(r).height = 44
      r++
    }
    r++
  }

  section(ws, r, 'Sobre estes dados', 8)
  r++
  const sobre = [
    'Pesquisa anônima: não há nome, e-mail, cargo, setor nem horário de resposta. Nenhuma aba permite ligar as respostas de uma mesma pessoa.',
    `Perguntas com menos de ${min} respostas (inclusive as que dependem de uma resposta anterior) ficam de fora. Textos abertos só aparecem com 10 ou mais respostas na pesquisa; textos de “Outros” não são exportados.`,
    'Abas: Escalas (% que concorda em destaque), Outras perguntas, Respostas abertas (ordem aleatória), Dinâmica respostas e Dinâmica escalas (tabelas dinâmicas: arraste os campos para montar outras visões) e Base (uma linha por resposta, sem identificação).',
    'Se as dinâmicas aparecerem vazias, clique em “Habilitar edição” no topo do Excel: elas são montadas ao abrir.',
    'Material do comitê: não compartilhe fora dele. Antes de projetar respostas abertas, leia: um texto pode trazer detalhes que identificam alguém.',
  ]
  for (const s of sobre) {
    note(ws, r, `• ${s}`, 8, C.navy)
    r++
  }

  // ---------- Escalas ----------
  const scales = stats.filter((s): s is ChoiceStat => s.kind === 'escolha' && s.question.type === 'escala')
  const visibleScales = scales.filter((s) => !s.hidden).sort((a, b) => pct(b.favorable) - pct(a.favorable))
  if (scales.length > 0) {
    const es = sheet(wb, 'Escalas', [6, 72, 13, 11, 13, 10, 7, 7, 7, 11, 13, 11, 9])
    title(es, 1, 'Escalas de 1 a 5', 'Ordenadas pelo % que concorda (4 ou 5). “Prefiro não responder” fica fora dos percentuais e da média.')
    if (visibleScales.length > 0) {
      es.addTable({
        name: 'Escalas',
        ref: 'A4',
        headerRow: true,
        style: { theme: TABLE_STYLE, showRowStripes: true },
        columns: [
          { name: 'Nº' },
          { name: 'Pergunta' },
          { name: '% concordam' },
          { name: '% neutros' },
          { name: '% discordam' },
          ...ESCALA_OPTIONS.map((o) => ({ name: o.key === '1' ? '1 (discordo)' : o.key === '5' ? '5 (concordo)' : o.label })),
          { name: NR_OPTION.label },
          { name: 'Respostas válidas' },
          { name: 'Média' },
        ],
        rows: visibleScales.map((s) => [
          s.n,
          s.question.text,
          pct(s.favorable),
          pct(s.neutral),
          pct(s.unfavorable),
          ...ESCALA_OPTIONS.map((o) => s.counts[o.key] ?? 0),
          s.nr,
          s.valid,
          s.mean == null ? null : Math.round(s.mean * 10) / 10,
        ]),
      })
      const last = 4 + visibleScales.length
      headerRow(es, 4)
      visibleScales.forEach((s, k) => {
        const row = 5 + k
        es.getRow(row).height = rowHeight(s.question.text, 72)
        es.getRow(row).eachCell({ includeEmpty: true }, (c) => (c.alignment = { vertical: 'middle' }))
        es.getCell(row, 2).alignment = { wrapText: true, vertical: 'middle' }
        for (const c of [3, 4, 5]) es.getCell(row, c).numFmt = '0%'
        es.getCell(row, 3).font = { name: FONT, bold: true }
        es.getCell(row, 13).numFmt = '0.0'
      })
      dataBar(es, `C5:C${last}`, C.good)
      dataBar(es, `E5:E${last}`, C.bad)
      es.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }]
    }
    const hidden = scales.filter((s) => s.hidden)
    if (hidden.length > 0) note(es, 6 + visibleScales.length, `Ocultas por terem menos de ${min} respostas válidas: ${hidden.map((s) => `${s.n}`).join(', ')}.`, 6)
  }

  // ---------- Outras perguntas ----------
  const others = stats.filter((s): s is ChoiceStat | MultiStat => (s.kind === 'escolha' && s.question.type !== 'escala') || s.kind === 'multipla')
  if (others.length > 0) {
    const os = sheet(wb, 'Outras perguntas', [46, 14, 18, 60])
    title(os, 1, 'Frequência, sim ou não e múltipla escolha')
    let row = 4
    others.forEach((s) => {
      section(os, row, perguntaLabel(s.n, s.question.text), 4)
      os.getCell(row, 1).alignment = { wrapText: true }
      os.getRow(row).height = 32
      os.mergeCells(row, 1, row, 4)
      row++
      if (s.gate) {
        note(os, row, s.hidden ? s.gate : `${s.gate.replace(/\.$/, '')}: ${s.reached} pessoas.`, 4)
        row++
      }
      if (s.hidden) {
        note(os, row, `Oculta: menos de ${min} respostas.`, 4)
        row += 2
        return
      }
      if (s.kind === 'multipla') {
        const max = s.question.maxSelections ?? 1
        os.addTable({
          name: `Pergunta${s.n}`,
          ref: `A${row}`,
          headerRow: true,
          style: { theme: TABLE_STYLE, showRowStripes: true },
          columns: [{ name: 'Tema' }, { name: 'Escolhas' }, { name: '% das pessoas' }],
          rows: s.options.map((o) => [o.label, o.count, o.share]),
        })
        const first = row + 1
        const last = row + s.options.length
        for (let i = first; i <= last; i++) os.getCell(i, 3).numFmt = '0%'
        dataBar(os, `C${first}:C${last}`, C.blue600)
        row = last + 1
        note(os, row, `Percentuais sobre ${s.respondents} pessoas.${max > 1 ? ` Cada pessoa pôde escolher até ${max}, por isso a soma passa de 100%.` : ''}${s.otherCount > 0 ? ` ${s.otherCount} escreveram em “Outros”; os textos não são exportados.` : ''}`, 4)
        row += 2
        return
      }
      const opts = s.question.type === 'frequencia' ? ['nunca', 'raramente', 'as_vezes', 'frequentemente'] : ['sim', 'nao']
      const labels: Record<string, string> = { nunca: 'Nunca', raramente: 'Raramente', as_vezes: 'Às vezes', frequentemente: 'Frequentemente', sim: 'Sim', nao: 'Não' }
      os.addTable({
        name: `Pergunta${s.n}`,
        ref: `A${row}`,
        headerRow: true,
        style: { theme: TABLE_STYLE, showRowStripes: true },
        columns: [{ name: 'Resposta' }, { name: 'Respostas' }, { name: '% das respostas' }],
        rows: opts.map((key) => [labels[key], s.counts[key] ?? 0, s.valid ? (s.counts[key] ?? 0) / s.valid : 0]),
      })
      const first = row + 1
      const last = row + opts.length
      for (let i = first; i <= last; i++) os.getCell(i, 3).numFmt = '0%'
      dataBar(os, `C${first}:C${last}`, C.blue600)
      row = last + 1
      const extra = s.incidence != null ? `${Math.round(s.incidence * 100)}% disseram que aconteceu ao menos raramente (quanto maior, pior). ` : ''
      note(os, row, `${extra}${s.valid} respostas, sem contar “prefiro não responder”${s.nr ? ` (${s.nr})` : ''}.`, 4, s.incidence != null ? C.alert : C.blue600)
      row += 2
    })
  }

  // ---------- Respostas abertas ----------
  const opens = stats.filter((s): s is OpenStat => s.kind === 'aberta')
  if (opens.length > 0) {
    const ab = sheet(wb, 'Respostas abertas', [8, 110])
    title(ab, 1, 'Respostas abertas', 'Ordem aleatória em cada pergunta. Leia antes de projetar: um texto pode trazer detalhes que identificam alguém.')
    let row = 4
    for (const s of opens) {
      section(ab, row, perguntaLabel(s.n, s.question.text), 2)
      ab.mergeCells(row, 1, row, 2)
      ab.getCell(row, 1).alignment = { wrapText: true }
      ab.getRow(row).height = 32
      row++
      if (s.hidden) {
        note(ab, row, s.hiddenReason === 'pesquisa' ? 'Os textos aparecem a partir de 10 respostas na pesquisa.' : `Oculta: menos de ${min} pessoas escreveram.`, 2)
        row += 2
        continue
      }
      const texts = [...s.texts]
      for (let i = texts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[texts[i], texts[j]] = [texts[j], texts[i]]
      }
      ab.addTable({
        name: `Abertas${s.n}`,
        ref: `A${row}`,
        headerRow: true,
        style: { theme: TABLE_STYLE, showRowStripes: true },
        columns: [{ name: '#' }, { name: 'Resposta' }],
        rows: texts.map((txt, i) => [i + 1, txt]),
      })
      texts.forEach((txt, k) => {
        const i = row + 1 + k
        ab.getRow(i).height = rowHeight(txt, 110, 18)
        ab.getCell(i, 2).alignment = { wrapText: true, vertical: 'top' }
        ab.getCell(i, 1).alignment = { vertical: 'top' }
      })
      row += texts.length + 3
    }
  }

  // ---------- Dinâmicas (as tabelas são montadas depois, no XML) ----------
  const baseRows = buildAnswerRows(questions, answers, stats)
  const dynA = sheet(wb, 'Dinâmica respostas', [70, 14, 14, 14, 14, 14])
  title(dynA, 1, 'Dinâmica: respostas por pergunta', 'Tabela dinâmica sobre a aba Base. Arraste os campos (Pergunta, Resposta, Grupo, Tipo) para montar outras visões.')
  const dynB = sheet(wb, 'Dinâmica escalas', [70, 16, 14, 16, 16, 14])
  title(dynB, 1, 'Dinâmica: escalas por grupo', '% de cada pergunta que discorda, fica neutra ou concorda (sem “prefiro não responder”).')

  // ---------- Base ----------
  const base = sheet(wb, 'Base', [6, 70, 18, 30, 22, 8, 11])
  const headers = ['Nº', 'Pergunta', 'Tipo', 'Resposta', 'Grupo', 'Valor', 'Contagem']
  base.addTable({
    name: 'BaseRespostas',
    ref: 'A1',
    headerRow: true,
    style: { theme: TABLE_STYLE, showRowStripes: true },
    columns: headers.map((name) => ({ name, filterButton: true })),
    rows: baseRows.map((row) => [row.n, row.pergunta, row.tipo, row.resposta, row.grupo, row.valor, 1]),
  })
  base.views = [{ state: 'frozen', ySplit: 1, showGridLines: false }]

  const buffer = await wb.xlsx.writeBuffer()
  const zip = await JSZip.loadAsync(buffer as ArrayBuffer)

  if (baseRows.length > 0) {
    const perguntaOrder = questions.map((q, i) => perguntaLabel(i + 1, q.text))
    const grupoOrder = ['Discorda (1–2)', 'Neutro (3)', 'Concorda (4–5)', NR_OPTION.label, 'Não aconteceu', 'Aconteceu', 'Sim', 'Não', 'Tema escolhido']
    const hasScales = baseRows.some((row) => row.tipo === 'Escala de 1 a 5')
    await addPivotTables(
      zip,
      {
        sheetName: 'Base',
        headers,
        rows: baseRows.map((row) => [row.n, row.pergunta, row.tipo, row.resposta, row.grupo, row.valor, 1]),
        itemOrder: { 1: perguntaOrder, 3: respostaOrder(questions), 4: grupoOrder },
      },
      [
        { name: 'DinamicaRespostas', sheetId: dynA.id, top: 4, rows: [1, 3], data: { field: 6, name: 'Respostas' }, rowCaption: 'Pergunta e resposta' },
        ...(hasScales
          ? [
              {
                name: 'DinamicaEscalas',
                sheetId: dynB.id,
                top: 6,
                rows: [1],
                cols: [4],
                page: { field: 2, item: 'Escala de 1 a 5' },
                hide: [{ field: 4, items: [NR_OPTION.label] }],
                data: { field: 6, name: '% das respostas', percentOfRow: true },
                rowCaption: 'Pergunta',
                colCaption: 'Grupo',
              },
            ]
          : []),
      ]
    )
  }

  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
}

/** Nome do arquivo: "pesquisa-diversidade-e-inclusao-2026-2026-10-26.xlsx". */
export function exportFileName(title: string, date = new Date()): string {
  const slug = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  const d = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return `pesquisa-${slug || 'resultados'}-${d}.xlsx`
}
