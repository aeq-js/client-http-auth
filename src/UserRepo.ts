import { AuthToken } from './AuthToken'
import { User } from './User'

export interface UserRepo {
  login (username: string, password: string): Promise<AuthToken>

  resetPassword (username: string): Promise<void>

  me (...args: any): Promise<User>
}
