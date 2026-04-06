export type CaptchaChallenge = {
  a: number
  b: number
  answer: number
  label: string
}

export function createCaptchaChallenge(): CaptchaChallenge {
  const a = Math.floor(Math.random() * 8) + 2
  const b = Math.floor(Math.random() * 8) + 2
  return {
    a,
    b,
    answer: a + b,
    label: `Quanto é ${a} + ${b}?`,
  }
}

export function isCaptchaValid(input: string, challenge: CaptchaChallenge): boolean {
  return Number(input.trim()) === challenge.answer
}

