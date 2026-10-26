import { describe, expect, it } from 'vitest'
import { departmentNameError, normalizeDepartmentName } from './equipe'

const lista = [
  { id: '1', name: 'Recursos Humanos' },
  { id: '2', name: 'Cível' },
]

describe('nome de departamento', () => {
  it('tira espaços sobrando', () => {
    expect(normalizeDepartmentName('  Recursos   Humanos ')).toBe('Recursos Humanos')
  })

  it('recusa nome curto, longo ou repetido (sem diferenciar maiúsculas)', () => {
    expect(departmentNameError(' a ', lista)).toContain('pelo menos')
    expect(departmentNameError('x'.repeat(81), lista)).toContain('no máximo')
    expect(departmentNameError('recursos  humanos', lista)).toContain('Já existe')
    expect(departmentNameError('CÍVEL', lista)).toContain('Já existe')
  })

  it('aceita nome novo e o próprio nome ao renomear', () => {
    expect(departmentNameError('Tributário', lista)).toBeNull()
    expect(departmentNameError('Recursos Humanos', lista, '1')).toBeNull()
  })
})
