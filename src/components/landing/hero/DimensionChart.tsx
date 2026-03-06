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
  value >= 70 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444'

const dataWithColors = DIMENSION_DATA.map((d) => ({
  ...d,
  fill: getBarColor(d.value),
}))

export function DimensionChart() {
  return (
    <div className="h-[140px] w-full" role="img" aria-label="Gráfico de resultado por dimensão HSE-IT em percentual">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dataWithColors}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 100, bottom: 4 }}
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
              border: '1px solid #e2e8f0',
            }}
            formatter={(value: number | undefined) => [value != null ? `${value}%` : '—', 'Score']}
            labelStyle={{ color: '#0f172a' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={10}>
            <LabelList dataKey="name" position="left" style={{ fontSize: 10, fill: '#64748b' }} />
            <LabelList dataKey="value" position="right" formatter={(value) => (typeof value === 'number' ? `${value}%` : '')} style={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} />
            {dataWithColors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
