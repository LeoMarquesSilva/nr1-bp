import { describe, expect, it } from 'vitest'
import { formatCnpjDisplay, maskCnpj, slugify } from './masks'

describe('masks', () => {
  it('slugify removes accents and symbols', () => {
    expect(slugify('Empresa Áçúcar & Co.')).toBe('empresa-acucar-co')
  })

  it('maskCnpj applies proper format', () => {
    const value = maskCnpj('12345678000195')
    expect(value.raw).toBe('12345678000195')
    expect(value.masked).toBe('12.345.678/0001-95')
    expect(formatCnpjDisplay('12345678000195')).toBe('12.345.678/0001-95')
  })
})

