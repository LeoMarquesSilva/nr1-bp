import { useState } from "react"
import { motion } from "motion/react"
import { Mail, MessageSquare, Send } from "lucide-react"

interface ContatoProps {
  onVoltar: () => void
}

export function Contato({ onVoltar }: ContatoProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder: send to API or mailto
    setSent(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-xl"
    >
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-900)] sm:text-3xl">
          Entre em contato
        </h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Envie uma mensagem e retornaremos o mais breve possível.
        </p>
      </div>

      {sent ? (
        <div className="bg-card-escritorio rounded-2xl border border-[var(--border)] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-50)] text-[var(--color-success-700)]">
            <Mail className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[var(--color-brand-900)]">
            Mensagem enviada
          </h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Responderemos ao seu e-mail em breve.
          </p>
          <button
            type="button"
            onClick={onVoltar}
            className="mt-6 rounded-full border-2 border-[var(--color-brand-300)] bg-white px-6 py-2.5 font-semibold text-[var(--color-brand-700)] transition hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)]"
          >
            Voltar
          </button>
        </div>
      ) : (
        <div className="bg-card-escritorio rounded-2xl border border-[var(--border)] p-8 shadow-[var(--shadow-sm)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="contato-name" className="block text-sm font-medium text-[var(--color-brand-900)] mb-1.5">
                Nome
              </label>
              <input
                id="contato-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                className="input-escritorio w-full rounded-xl border bg-white px-4 py-3 text-[var(--color-brand-900)] transition"
              />
            </div>
            <div>
              <label htmlFor="contato-email" className="block text-sm font-medium text-[var(--color-brand-900)] mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  id="contato-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="input-escritorio w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-[var(--color-brand-900)] transition"
                />
              </div>
            </div>
            <div>
              <label htmlFor="contato-message" className="block text-sm font-medium text-[var(--color-brand-900)] mb-1.5">
                Mensagem
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
                <textarea
                  id="contato-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Sua mensagem..."
                  required
                  rows={4}
                  className="input-escritorio w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-[var(--color-brand-900)] transition resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onVoltar}
                className="flex-1 rounded-full border-2 border-[var(--color-brand-300)] bg-white py-3 font-semibold text-[var(--color-brand-700)] transition hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)]"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="btn-escritorio flex flex-1 items-center justify-center gap-2 rounded-full py-3 font-semibold transition"
              >
                <Send className="h-4 w-4" />
                Enviar
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  )
}
