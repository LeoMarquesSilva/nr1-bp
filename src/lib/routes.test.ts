import { describe, expect, it } from 'vitest'
import { buildDenunciaUrl, buildDiagnosticOrgUrl, getPathForView, getViewFromPath } from './routes'

describe('routes', () => {
  it('maps public views to path', () => {
    expect(getPathForView('landing')).toBe('/')
    expect(getViewFromPath('/sobre')).toBe('sobre')
  })

  it('builds diagnostic and denuncia URLs', () => {
    expect(buildDiagnosticOrgUrl('https://example.com/', 'empresa-alpha')).toBe('https://example.com/?org=empresa-alpha')
    expect(buildDenunciaUrl('https://example.com/', 'empresa-alpha', 'form')).toBe(
      'https://example.com/?org=empresa-alpha&channel=denuncia&form=1'
    )
  })
})

