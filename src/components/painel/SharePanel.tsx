import { useId, useState } from 'react'
import { cn } from '@/lib/utils'
import { QRCodeCanvas } from 'qrcode.react'
import { Check, Copy, Download, ExternalLink, Image as ImageIcon, Mail } from 'lucide-react'
import { feedback } from '@/lib/feedback'
import { Button, Notice, Panel, inputCls } from './ui'

const QR_LOGO = '/logos/elemento-logo-azul.png'
const QR_EXPORT_SIZE = 640

type Props = {
  title: string
  description?: string
  url: string
  /** Nome do arquivo PNG do QR Code (sem extensão). */
  fileName: string
  emailSubject: string
  emailIntro: string
  /** Quando preenchido, o link existe mas ainda não funciona (ex.: pesquisa em rascunho). */
  unavailableReason?: string | null
}

/** Link, QR Code e e-mail de um formulário público, no mesmo formato para diagnóstico, canal e pesquisas. */
export function SharePanel({ title, description, url, fileName, emailSubject, emailIntro, unavailableReason }: Props) {
  const [copied, setCopied] = useState(false)
  const canvasId = useId().replace(/:/g, '')
  const inputId = `${canvasId}-link`

  const getCanvas = () => {
    const el = document.getElementById(canvasId)
    return el instanceof HTMLCanvasElement ? el : null
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      feedback.error('Não foi possível copiar. Selecione o link e copie manualmente.')
    }
  }

  const downloadQr = () => {
    const canvas = getCanvas()
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `${fileName}.png`
    a.click()
  }

  const copyQr = async () => {
    const canvas = getCanvas()
    if (!canvas) return
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      feedback.info('Seu navegador não copia imagens. Use “Baixar PNG”.')
      return
    }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      feedback.success('QR Code copiado como imagem.')
    } catch {
      feedback.error('Não foi possível copiar a imagem. Use “Baixar PNG”.')
    }
  }

  const mailto = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(`${emailIntro}\n\n${url}\n`)}`

  return (
    <Panel title={title} description={description}>
      <div className="space-y-5">
        {unavailableReason && <Notice tone="warning">{unavailableReason}</Notice>}
        <div>
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[var(--color-brand-900)]">
            Link
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input id={inputId} readOnly value={url} onFocus={(e) => e.target.select()} className={cn(inputCls, 'font-mono text-xs')} />
            <div className="flex gap-2">
              <Button type="button" onClick={copyLink} className="min-w-[8.5rem]">
                {copied ? <Check /> : <Copy />}
                {copied ? 'Copiado' : 'Copiar link'}
              </Button>
              <Button asChild variant="outline" size="icon" aria-label="Abrir link em nova aba">
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center">
          <div className="w-fit rounded-xl border border-[var(--border)] bg-white p-3">
            <QRCodeCanvas
              id={canvasId}
              value={url}
              size={QR_EXPORT_SIZE}
              style={{ width: 132, height: 132 }}
              level="H"
              imageSettings={{ src: QR_LOGO, height: 138, width: 138, excavate: true }}
            />
          </div>
          <div className="min-w-0 space-y-3">
            <p className="max-w-sm text-sm leading-relaxed text-[var(--color-brand-700)]">
              QR Code para cartazes, apresentações e acesso pelo celular. O PNG sai em alta resolução.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={downloadQr}>
                <Download />
                Baixar PNG
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={copyQr}>
                <ImageIcon />
                Copiar imagem
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={mailto}>
                  <Mail />
                  Enviar por e-mail
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
