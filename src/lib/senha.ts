/** Regras da senha definitiva (troca obrigatória no primeiro acesso). */

export type PasswordRule = { id: 'tamanho' | 'letras_numeros' | 'comum' | 'pessoal'; label: string; ok: boolean }

export const PASSWORD_MIN_LENGTH = 8

/** Senhas fáceis de adivinhar (inclui provisórias usadas no cadastro). Comparação sem maiúsculas. */
const COMMON = new Set([
  '123456', '1234567', '12345678', '123456789', '1234567890', '0123456789', '87654321',
  '111111', '000000', '11111111', '00000000', '123123', '12341234', '123456abc', 'abc123', 'abcd1234',
  'senha', 'senha123', 'senha1234', 'mudar123', 'trocar123', 'password', 'password1', 'qwerty', 'qwerty123',
  'confiara', 'confiara1', 'confiara123', 'bismarchi', 'bismarchi1', 'bismarchi123', 'bp123456',
])

function isTrivial(pwd: string): boolean {
  const p = pwd.toLowerCase()
  if (COMMON.has(p)) return true
  if (/^(.)\1+$/.test(p)) return true
  const digits = '01234567890123456789'
  return /^\d+$/.test(p) && (digits.includes(p) || digits.split('').reverse().join('').includes(p))
}

export function checkNewPassword(pwd: string, ctx: { email?: string | null; name?: string | null } = {}): PasswordRule[] {
  const lower = pwd.toLowerCase()
  const emailUser = (ctx.email ?? '').split('@')[0].toLowerCase()
  const nameParts = (ctx.name ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/\s+/)
    .filter((p) => p.length >= 4)
  const plain = lower.normalize('NFD').replace(/[̀-ͯ]/g, '')
  const pessoal = (emailUser.length >= 4 && plain.includes(emailUser)) || nameParts.some((p) => plain.includes(p))

  return [
    { id: 'tamanho', label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`, ok: pwd.length >= PASSWORD_MIN_LENGTH },
    { id: 'letras_numeros', label: 'Letras e números', ok: /[a-zA-ZÀ-ÿ]/.test(pwd) && /\d/.test(pwd) },
    { id: 'comum', label: 'Nada óbvio, como 123456 ou “senha123”', ok: pwd.length > 0 && !isTrivial(pwd) },
    { id: 'pessoal', label: 'Sem o seu nome ou e-mail', ok: pwd.length > 0 && !pessoal },
  ]
}

export function isPasswordAccepted(rules: PasswordRule[]): boolean {
  return rules.every((r) => r.ok)
}

/** Traduz erros do Supabase Auth na troca de senha. */
export function passwordErrorMessage(error: { message?: string; code?: string } | null | undefined): string {
  const code = error?.code ?? ''
  const msg = error?.message ?? ''
  if (code === 'same_password' || /different from the old password/i.test(msg)) return 'A nova senha precisa ser diferente da senha provisória.'
  if (code === 'weak_password' || /weak|at least/i.test(msg)) return 'A senha não atende às regras de segurança. Use uma senha mais longa, com letras e números.'
  if (/session|jwt|not authenticated/i.test(msg)) return 'Sua sessão expirou. Entre de novo com a senha provisória.'
  return 'Não foi possível trocar a senha. Tente novamente.'
}
