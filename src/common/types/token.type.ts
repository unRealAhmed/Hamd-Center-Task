export interface TokenPayload {
  sub: string
  email: string
  role: string
  fullName?: string
}

export class TokenPayloadDto {
  sub: string
  email: string
  role: string
  fullName?: string
}
export interface RefreshTokenPayload {
  sub: string
  email: string
  role: string
  fullName?: string
  token: string
}

