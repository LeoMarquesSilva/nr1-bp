import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  LabelList,
} from 'recharts'

const DIMENSION_DATA = [
  { name: 'Demandas', value: 72 },
  { name: 'Controle', value: 65 },
  { name: 'Apoio da Chefia', value: 58 },
  { name: 'Apoio dos Colegas', value: 81 },
  { name: 'Relacionamentos', value: 44 },
  { name: 'Cargo/Papel', value: 69 },
  { name: 'Comunicação/Mudanças', value: 53 },
]

const getBarColor = (value: number): string =>
  value >= 70 ? 'var(--color-success-500)' : value >= 50 ? 'var(--color-warning-500)' : 'var(--color-error-500)'

const dataWithColors = DIMENSION_DATA.map((d) => ({
  ...d,
  fill: getBarColor(d.value),
}))

export function DimensionChart() {
  return (
    <div className="h-[150px] w-full" role="img" aria-label="Gráfico de resultado por dimensão HSE-IT em percentual">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dataWithColors}
          layout="vertical"
          margin={{ top: 4, right: 38, left: 110, bottom: 4 }}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={0}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}
            formatter={(value: number | undefined) => [value != null ? `${value}%` : '—', 'Score']}
            labelStyle={{ color: 'var(--color-brand-900)' }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={10}>
            <LabelList dataKey="name" position="left" style={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <LabelList dataKey="value" position="right" formatter={(value) => (typeof value === 'number' ? `${value}%` : '')} style={{ fontSize: 10, fill: 'var(--color-brand-700)', fontWeight: 700 }} />
            {dataWithColors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
