/**
 * Tabelas dinâmicas (pivot tables) de verdade num .xlsx gerado pelo ExcelJS, que não as cria.
 * Escreve as partes do padrão Office Open XML (cache com registros + definição de cada dinâmica) e as
 * ligações entre elas. As dinâmicas pedem atualização ao abrir (refreshOnLoad): o Excel monta a tabela
 * sozinho, e quem abrir pode arrastar os campos como em qualquer dinâmica.
 */
import type JSZip from 'jszip'

const NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const NS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const NS_PKG_REL = 'http://schemas.openxmlformats.org/package/2006/relationships'
const REL_CACHE = `${NS_REL}/pivotCacheDefinition`
const REL_RECORDS = `${NS_REL}/pivotCacheRecords`
const REL_TABLE = `${NS_REL}/pivotTable`
const CT = 'application/vnd.openxmlformats-officedocument.spreadsheetml'

export type PivotSource = {
  /** Nome da aba com os dados (cabeçalho na linha 1, dados a partir da linha 2, a partir da coluna A). */
  sheetName: string
  headers: string[]
  rows: (string | number | null)[][]
  /** Ordem dos itens de campos de texto (o resto vai na ordem em que aparece). */
  itemOrder?: Record<number, string[]>
}

export type PivotSpec = {
  name: string
  /** Número da aba no ExcelJS (worksheet.id): xl/worksheets/sheet{n}.xml. */
  sheetId: number
  /** Primeira linha da tabela (com filtro, ele fica duas linhas acima). */
  top: number
  rows: number[]
  cols?: number[]
  page?: { field: number; item: string }
  /** Itens escondidos (ficam fora da tabela e das contas). */
  hide?: { field: number; items: string[] }[]
  data: { field: number; name: string; percentOfRow?: boolean }
  rowCaption?: string
  colCaption?: string
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function colLetter(n: number): string {
  let s = ''
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) s = String.fromCharCode(65 + ((x - 1) % 26)) + s
  return s
}

type Field =
  | { kind: 'text'; items: string[]; index: Map<string, number> }
  | { kind: 'number'; min: number; max: number; integer: boolean; blank: boolean }

function analyze(source: PivotSource): Field[] {
  return source.headers.map((_, f) => {
    const values = source.rows.map((r) => r[f])
    if (values.every((v) => v == null || typeof v === 'number')) {
      const nums = values.filter((v): v is number => typeof v === 'number')
      return {
        kind: 'number',
        min: nums.length ? Math.min(...nums) : 0,
        max: nums.length ? Math.max(...nums) : 0,
        integer: nums.every(Number.isInteger),
        blank: values.some((v) => v == null),
      }
    }
    const items: string[] = []
    const seen = new Set<string>()
    for (const v of [...(source.itemOrder?.[f] ?? []), ...values.map((x) => (x == null ? '' : String(x)))]) {
      if (!seen.has(v) && values.some((x) => (x == null ? '' : String(x)) === v)) {
        seen.add(v)
        items.push(v)
      }
    }
    return { kind: 'text', items, index: new Map(items.map((v, i) => [v, i])) }
  })
}

function cacheDefinitionXml(source: PivotSource, fields: Field[]): string {
  const ref = `A1:${colLetter(source.headers.length)}${source.rows.length + 1}`
  const cacheFields = fields
    .map((f, i) => {
      const name = esc(source.headers[i])
      if (f.kind === 'text') {
        return `<cacheField name="${name}" numFmtId="0"><sharedItems count="${f.items.length}">${f.items.map((v) => `<s v="${esc(v)}"/>`).join('')}</sharedItems></cacheField>`
      }
      const attrs = [
        f.blank ? 'containsString="0" containsBlank="1"' : 'containsSemiMixedTypes="0" containsString="0"',
        'containsNumber="1"',
        f.integer ? 'containsInteger="1"' : '',
        `minValue="${f.min}" maxValue="${f.max}"`,
      ]
        .filter(Boolean)
        .join(' ')
      return `<cacheField name="${name}" numFmtId="0"><sharedItems ${attrs}/></cacheField>`
    })
    .join('')
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<pivotCacheDefinition xmlns="${NS_MAIN}" xmlns:r="${NS_REL}" r:id="rId1" refreshOnLoad="1" createdVersion="6" refreshedVersion="6" minRefreshableVersion="3" recordCount="${source.rows.length}">` +
    `<cacheSource type="worksheet"><worksheetSource ref="${ref}" sheet="${esc(source.sheetName)}"/></cacheSource>` +
    `<cacheFields count="${fields.length}">${cacheFields}</cacheFields>` +
    `</pivotCacheDefinition>`
  )
}

function cacheRecordsXml(source: PivotSource, fields: Field[]): string {
  const records = source.rows
    .map(
      (r) =>
        `<r>${fields
          .map((f, i) => {
            const v = r[i]
            if (f.kind === 'text') return `<x v="${f.index.get(v == null ? '' : String(v)) ?? 0}"/>`
            return v == null ? '<m/>' : `<n v="${v}"/>`
          })
          .join('')}</r>`
    )
    .join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<pivotCacheRecords xmlns="${NS_MAIN}" xmlns:r="${NS_REL}" count="${source.rows.length}">${records}</pivotCacheRecords>`
}

function pivotTableXml(spec: PivotSpec, fields: Field[], cacheId: number): string {
  const axisOf = (i: number) =>
    spec.rows.includes(i) ? 'axisRow' : spec.cols?.includes(i) ? 'axisCol' : spec.page?.field === i ? 'axisPage' : null
  const hidden = (i: number) => new Set(spec.hide?.find((h) => h.field === i)?.items ?? [])

  const pivotFields = fields
    .map((f, i) => {
      const axis = axisOf(i)
      const isData = spec.data.field === i
      if (!axis || f.kind !== 'text') return `<pivotField${isData ? ' dataField="1"' : ''} showAll="0"/>`
      const h = hidden(i)
      const items = f.items.map((v, x) => `<item x="${x}"${h.has(v) ? ' h="1"' : ''}/>`).join('') + '<item t="default"/>'
      return `<pivotField axis="${axis}"${isData ? ' dataField="1"' : ''} showAll="0"><items count="${f.items.length + 1}">${items}</items></pivotField>`
    })
    .join('')

  // Tamanho inicial aproximado; com refreshOnLoad o Excel reposiciona ao montar.
  const textItems = (i: number) => (fields[i].kind === 'text' ? (fields[i] as Extract<Field, { kind: 'text' }>).items.length : 1)
  const rowCount = spec.rows.reduce((acc, i) => acc + textItems(i), 0)
  const colCount = spec.cols?.length ? spec.cols.reduce((acc, i) => acc * textItems(i), 1) + 1 : 1
  const headerRows = spec.cols?.length ? 2 : 1
  const bottom = spec.top + headerRows + rowCount
  const ref = `A${spec.top}:${colLetter(1 + colCount)}${bottom}`
  const location = spec.cols?.length
    ? `<location ref="${ref}" firstHeaderRow="1" firstDataRow="2" firstDataCol="1"${spec.page ? ' rowPageCount="1" colPageCount="1"' : ''}/>`
    : `<location ref="${ref}" firstHeaderRow="1" firstDataRow="1" firstDataCol="1"${spec.page ? ' rowPageCount="1" colPageCount="1"' : ''}/>`

  const rowFields = `<rowFields count="${spec.rows.length}">${spec.rows.map((i) => `<field x="${i}"/>`).join('')}</rowFields>`
  const colFields = spec.cols?.length ? `<colFields count="${spec.cols.length}">${spec.cols.map((i) => `<field x="${i}"/>`).join('')}</colFields>` : ''
  const colItems = spec.cols?.length ? '' : '<colItems count="1"><i/></colItems>'
  let pageFields = ''
  if (spec.page) {
    const f = fields[spec.page.field]
    const item = f.kind === 'text' ? (f.index.get(spec.page.item) ?? 0) : 0
    pageFields = `<pageFields count="1"><pageField fld="${spec.page.field}" item="${item}" hier="-1"/></pageFields>`
  }
  const d = spec.data
  const dataFields = `<dataFields count="1"><dataField name="${esc(d.name)}" fld="${d.field}"${d.percentOfRow ? ' showDataAs="percentOfRow"' : ''} baseField="0" baseItem="0"${d.percentOfRow ? ' numFmtId="9"' : ''}/></dataFields>`
  const captions = `${spec.rowCaption ? ` rowHeaderCaption="${esc(spec.rowCaption)}"` : ''}${spec.colCaption ? ` colHeaderCaption="${esc(spec.colCaption)}"` : ''}`

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<pivotTableDefinition xmlns="${NS_MAIN}" name="${esc(spec.name)}" cacheId="${cacheId}" applyNumberFormats="0" applyBorderFormats="0" applyFontFormats="0" applyPatternFormats="0" applyAlignmentFormats="0" applyWidthHeightFormats="1" dataCaption="Valores" updatedVersion="6" minRefreshableVersion="3" useAutoFormatting="1" itemPrintTitles="1" createdVersion="6" indent="0" outline="1" outlineData="1" multipleFieldFilters="0"${captions}>` +
    location +
    `<pivotFields count="${fields.length}">${pivotFields}</pivotFields>` +
    rowFields +
    colFields +
    colItems +
    pageFields +
    dataFields +
    `<pivotTableStyleInfo name="PivotStyleMedium9" showRowHeaders="1" showColHeaders="1" showRowStripes="0" showColStripes="0" showLastColumn="1"/>` +
    `</pivotTableDefinition>`
  )
}

function addRelationship(xml: string | null, id: string, type: string, target: string): string {
  const rel = `<Relationship Id="${id}" Type="${type}" Target="${target}"/>`
  if (!xml) return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="${NS_PKG_REL}">${rel}</Relationships>`
  return xml.replace('</Relationships>', `${rel}</Relationships>`)
}

/** Acrescenta um cache (com todos os registros) e as dinâmicas indicadas ao .xlsx aberto no JSZip. */
export async function addPivotTables(zip: JSZip, source: PivotSource, specs: PivotSpec[]): Promise<void> {
  const fields = analyze(source)
  const cacheId = 1

  zip.file('xl/pivotCache/pivotCacheDefinition1.xml', cacheDefinitionXml(source, fields))
  zip.file('xl/pivotCache/pivotCacheRecords1.xml', cacheRecordsXml(source, fields))
  zip.file('xl/pivotCache/_rels/pivotCacheDefinition1.xml.rels', addRelationship(null, 'rId1', REL_RECORDS, 'pivotCacheRecords1.xml'))

  // Workbook: liga o cache (pivotCaches vem depois de calcPr no esquema).
  const wbRelsPath = 'xl/_rels/workbook.xml.rels'
  zip.file(wbRelsPath, addRelationship(await zip.file(wbRelsPath)!.async('string'), 'rIdPivotCache1', REL_CACHE, 'pivotCache/pivotCacheDefinition1.xml'))
  const wbPath = 'xl/workbook.xml'
  let wb = await zip.file(wbPath)!.async('string')
  const pivotCaches = `<pivotCaches><pivotCache cacheId="${cacheId}" r:id="rIdPivotCache1"/></pivotCaches>`
  if (!wb.includes('xmlns:r=')) wb = wb.replace('<workbook ', `<workbook xmlns:r="${NS_REL}" `)
  wb = /<calcPr[^>]*\/>/.test(wb) ? wb.replace(/(<calcPr[^>]*\/>)/, `$1${pivotCaches}`) : wb.replace('</workbook>', `${pivotCaches}</workbook>`)
  zip.file(wbPath, wb)

  const overrides = [
    `<Override PartName="/xl/pivotCache/pivotCacheDefinition1.xml" ContentType="${CT}.pivotCacheDefinition+xml"/>`,
    `<Override PartName="/xl/pivotCache/pivotCacheRecords1.xml" ContentType="${CT}.pivotCacheRecords+xml"/>`,
  ]

  for (const [k, spec] of specs.entries()) {
    const n = k + 1
    zip.file(`xl/pivotTables/pivotTable${n}.xml`, pivotTableXml(spec, fields, cacheId))
    zip.file(`xl/pivotTables/_rels/pivotTable${n}.xml.rels`, addRelationship(null, 'rId1', REL_CACHE, '../pivotCache/pivotCacheDefinition1.xml'))
    const sheetRels = `xl/worksheets/_rels/sheet${spec.sheetId}.xml.rels`
    const current = zip.file(sheetRels) ? await zip.file(sheetRels)!.async('string') : null
    zip.file(sheetRels, addRelationship(current, `rIdPivot${n}`, REL_TABLE, `../pivotTables/pivotTable${n}.xml`))
    overrides.push(`<Override PartName="/xl/pivotTables/pivotTable${n}.xml" ContentType="${CT}.pivotTable+xml"/>`)
  }

  const ctPath = '[Content_Types].xml'
  zip.file(ctPath, (await zip.file(ctPath)!.async('string')).replace('</Types>', `${overrides.join('')}</Types>`))
}
