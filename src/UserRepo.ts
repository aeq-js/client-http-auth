import { AuthToken } from './AuthToken'
import { User } from './User'
import { Token } from 'typedi'

export interface UserRepo {
  login (username: string, password: string): Promise<AuthToken>

  resetPassword (username: string): Promise<void>

  me (...args: any): Promise<User>
}

export const UserRepoService = new Token<UserRepo>('auth.userRepo')
