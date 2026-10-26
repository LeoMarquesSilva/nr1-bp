import { describe, expect, it } from 'vitest'
import { checkNewPassword, isPasswordAccepted, passwordErrorMessage } from './senha'

const ctx = { email: 'catharina.silva@bismarchipires.com.br', name: 'Catharina Cardoso da Silva' }
const ok = (pwd: string) => isPasswordAccepted(checkNewPassword(pwd, ctx))
const failed = (pwd: string) => checkNewPassword(pwd, ctx).filter((r) => !r.ok).map((r) => r.id)

describe('senha definitiva', () => {
  it('recusa a senha provisória e senhas óbvias', () => {
    expect(ok('123456')).toBe(false)
    expect(failed('12345678')).toContain('comum')
    expect(failed('Senha123')).toContain('comum')
    expect(failed('aaaaaaaa1')).not.toContain('comum')
    expect(failed('Bismarchi123')).toContain('comum')
  })

  it('exige tamanho mínimo e letras com números', () => {
    expect(failed('Ab1')).toContain('tamanho')
    expect(failed('somenteletras')).toContain('letras_numeros')
    expect(failed('1234598765')).toContain('letras_numeros')
  })

  it('recusa nome ou e-mail da pessoa (sem acento e sem maiúsculas)', () => {
    expect(failed('Catharina2026')).toContain('pessoal')
    expect(failed('cardoso#2026')).toContain('pessoal')
    expect(failed('Catharina.silva9')).toContain('pessoal')
  })

  it('aceita uma senha forte', () => {
    expect(ok('Ipe-Roxo-48-cafe')).toBe(true)
    expect(ok('Trovao7Marco')).toBe(true)
  })

  it('traduz erros do Supabase Auth', () => {
    expect(passwordErrorMessage({ code: 'same_password', message: 'New password should be different from the old password.' })).toContain('diferente')
    expect(passwordErrorMessage({ message: 'Password should be at least 8 characters' })).toContain('regras')
    expect(passwordErrorMessage({ message: 'qualquer outra coisa' })).toContain('Tente novamente')
  })
})
