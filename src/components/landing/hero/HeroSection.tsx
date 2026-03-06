import { HeroContent } from './HeroContent'
import { HeroDashboard } from './HeroDashboard'

type Props = {
  onFazerRelato: () => void
}

export function HeroSection({ onFazerRelato }: Props) {
  return (
    <section
      aria-label="Apresentação da plataforma"
      className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <HeroContent onFazerRelato={onFazerRelato} />
          <HeroDashboard />
        </div>
      </div>
    </section>
  )
}
