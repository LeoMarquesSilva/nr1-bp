import path from 'path'
import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const SEO_DESCRIPTION =
  'Confiara: canal de denúncias e diagnóstico de riscos psicossociais com confiança total. Compliance trabalhista e cuidado humano em um só lugar.'

function buildAbsoluteSeoBlock(originRaw: string): string {
  const base = originRaw.trim().replace(/\/$/, '')
  if (!base) {
    return '    <meta name="twitter:card" content="summary" />'
  }
  const abs = `${base}/`
  const img = `${base}/android-chrome-512x512.png`
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${abs}#organization`,
        name: 'Confiara',
        url: abs,
        logo: `${base}/android-chrome-512x512.png`,
        email: 'contato@bismarchipires.com.br',
        telephone: '+5511900000000',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Rua Coronel Quirino, 1266 - Cambuí',
          addressLocality: 'Campinas',
          addressRegion: 'SP',
          postalCode: '13025-002',
          addressCountry: 'BR',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${abs}#website`,
        url: abs,
        name: 'Confiara',
        description: SEO_DESCRIPTION,
        publisher: { '@id': `${abs}#organization` },
      },
    ],
  }
  const lines = [
    `<link rel="canonical" href="${abs}" />`,
    `<meta property="og:url" content="${abs}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="512" />`,
    `<meta property="og:image:height" content="512" />`,
    `<meta property="og:image:alt" content="Confiara — identidade visual" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<script type="application/ld+json">${JSON.stringify(graph)}</script>`,
  ]
  return lines.map((line) => `    ${line}`).join('\n')
}

function seoIndexHtmlPlugin(origin: string): Plugin {
  return {
    name: 'seo-index-html',
    transformIndexHtml(html) {
      const block = buildAbsoluteSeoBlock(origin)
      return html.replace(/\n\s*<!-- __SEO_ABSOLUTE_BLOCK__ -->\s*\n/, `\n${block}\n`)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteOrigin = (env.VITE_PUBLIC_SITE_URL || '').trim()

  return {
    plugins: [tailwindcss(), react(), seoIndexHtmlPlugin(siteOrigin)],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  }
})
