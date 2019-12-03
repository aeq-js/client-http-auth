export class AuthToken {
  token_type: string = ''
  expires_in: string = ''
  access_token: string = ''
  refresh_token: string = ''

  constructor (data = {}) {
    Object.assign(this, data)
  }
}
