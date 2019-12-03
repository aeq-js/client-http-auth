export class BearerCredential {
  username: string = ''
  password: string = ''
  remember_me: boolean = false
  clientId: string = ''
  client_secret: string = ''
  grant_type: string = 'password'

  constructor (data: Partial<BearerCredential> = {}) {
    Object.assign(this, data)
  }
}
