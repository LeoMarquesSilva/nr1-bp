import { HeroContent } from './HeroContent'
import { HeroDashboard } from './HeroDashboard'

type Props = {
  onFazerRelato: () => void
}

export function HeroSection({ onFazerRelato }: Props) {
  return (
    <section
      aria-label="Apresentação da plataforma"
      className="w-full landing-premium-bg min-h-[calc(100vh-3.75rem)] lg:min-h-[calc(100vh-4rem)] flex items-center py-16 lg:py-24"
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
