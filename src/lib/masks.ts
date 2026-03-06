/**
 * Gera slug a partir de nome de exibição (minúsculas, sem acentos, espaços → hífen).
 */
export function slugify(displayName: string): string {
  return displayName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || ''
}

/** Aplica máscara 00.000.000/0000-00 ao digitar. Retorna só dígitos para valor e valor mascarado para exibição. */
export function maskCnpj(value: string): { raw: string; masked: string } {
  const raw = value.replace(/\D/g, '').slice(0, 14)
  const masked = raw
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
  return { raw, masked }
}

/** Formata um valor já limpo (só dígitos) como CNPJ para exibição. */
export function formatCnpjDisplay(raw: string): string {
  return maskCnpj(raw).masked
}
