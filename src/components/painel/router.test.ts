import { describe, expect, it } from 'vitest'
import { isPainelPath, parsePainelPath, paths } from './router'

describe('rotas do painel', () => {
  it('cada caminho gerado volta para a mesma rota', () => {
    const casos = [
      paths.empresas(),
      paths.empresaNova(),
      paths.empresa('bismarchi-pires'),
      paths.empresa('bismarchi-pires', 'pesquisas'),
      paths.empresa('bismarchi-pires', 'denuncias'),
      paths.empresa('bismarchi-pires', 'configuracoes'),
      paths.diagnostico('bismarchi-pires'),
      paths.diagnostico('bismarchi-pires', 'setores'),
      paths.pesquisaNova('bismarchi-pires'),
      paths.pesquisa('bismarchi-pires', 'abc'),
      paths.pesquisa('bismarchi-pires', 'abc', 'resultados'),
      paths.denuncias(),
      paths.modelos(),
      paths.modelo('xyz'),
      paths.equipe(),
      paths.perfil(),
    ]
    for (const p of casos) expect(parsePainelPath(p).name).not.toBe('nao-encontrado')
  })

  it('interpreta empresa, diagnóstico e pesquisa', () => {
    expect(parsePainelPath('/painel')).toEqual({ name: 'empresas' })
    expect(parsePainelPath('/painel/empresas/acme/')).toEqual({ name: 'empresa', slug: 'acme', section: 'visao-geral' })
    expect(parsePainelPath('/painel/empresas/acme/pesquisas/diagnostico-nr1')).toEqual({ name: 'diagnostico', slug: 'acme', tab: 'resultados' })
    expect(parsePainelPath('/painel/empresas/acme/pesquisas/123/compartilhar')).toEqual({ name: 'pesquisa', slug: 'acme', id: '123', tab: 'compartilhar' })
  })

  it('rejeita caminhos desconhecidos', () => {
    expect(parsePainelPath('/painel/xyz').name).toBe('nao-encontrado')
    expect(parsePainelPath('/painel/empresas/acme/financeiro').name).toBe('nao-encontrado')
    expect(parsePainelPath('/painel/empresas/acme/pesquisas/123/editar').name).toBe('nao-encontrado')
    expect(isPainelPath('/painelx')).toBe(false)
    expect(isPainelPath('/painel/empresas')).toBe(true)
  })
})
