import { AuthToken } from './AuthToken'
import { CacheExecutor } from '@aeq/executors'
import { Logger } from './Logger'
import { Inject, Service, Token } from 'typedi'
import { UserRepo } from './UserRepo'
import { User } from './User'

export enum AuthStatus {
  Authorized = 'Authorized',
  NotAuthorized = 'not authorized',
  Unknown = 'unknown'
}

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN'
const STATUS_KEY = 'AUTH_STATUS'
/**
 * TODO login, logout, fetchUser should be queued, to avoid glitches like:
 * login------
 *   logout
 *
 * checkIsAuthorized will return login result
 */
export type AuthLoginCredential = {
  username: string,
  password: string
}

export const UserRepoService = new Token<UserRepo>()
export const StorageService = new Token<Storage>()
export const LoggerService = new Token<Logger>()

@Service()
export class Auth<U> {
  @Inject(UserRepoService)
  private userRepo!: UserRepo
  @Inject(StorageService)
  private storage!: Storage
  @Inject(LoggerService)
  private logger: Logger | null = null

  private authToken?: AuthToken
  private currentUser: (U & User) | null = null
  private fetchUser: CacheExecutor

  constructor () {
    this.fetchUser = new CacheExecutor(() => this.fetchUserCommand())
  }

  get isAuthorized () {
    return this.status === AuthStatus.Authorized
  }

  get isRunning (): boolean {
    return this.fetchUser.isRunning
  }

  get wasRun (): boolean {
    return this.fetchUser.wasRun
  }

  get status (): AuthStatus {
    const r = this.storage.getItem(STATUS_KEY)
    if (r === AuthStatus.NotAuthorized) return AuthStatus.NotAuthorized
    if (r === AuthStatus.Authorized) return AuthStatus.Authorized
    return AuthStatus.Unknown
  }

  set status (v: AuthStatus) {
    this.storage.setItem(STATUS_KEY, v)
  }

  private set accessToken (v: string) {
    this.storage.setItem(ACCESS_TOKEN_KEY, v)
  }

  getAccessToken(): string{
    return  this.storage.getItem(ACCESS_TOKEN_KEY) ||''
  }

  async checkIsAuthorized (): Promise<boolean> {
    if (this.wasRun) return this.isAuthorized
    await this.fetchUser.run()
    return this.isAuthorized
  }

  async init (): Promise<void> {
    await this.fetchUser.run()
  }

  async login (cred: AuthLoginCredential): Promise<void> {
    this.logout()
    this.authToken = await this.userRepo.login(cred.username, cred.password)
    this.accessToken = this.authToken.access_token
    await this.fetchUser.run()
  }

  async logout (): Promise<void> {
    this.storage.removeItem(ACCESS_TOKEN_KEY)
    this.status = AuthStatus.NotAuthorized
    this.currentUser = null
    this.fetchUser.cleanCache()
    this.setLoggerUser(null)
  }

  resetPassword (email: string): Promise<void> {
    return this.userRepo.resetPassword(email)
  }

  refresh (): Promise<void> {
    return this.fetchUser.runFresh()
  }

  private async fetchUserCommand (): Promise<void> {
    this.status = AuthStatus.Unknown
    try {
      this.currentUser = await this.userRepo.me() as U & User
      this.status = AuthStatus.Authorized
      this.setLoggerUser(this.currentUser)
    } catch (e) {
      const isApiException = e.response && e.response.status
      if (isApiException) {
        this.logout()
      }
      throw e
    }
  }

  private setLoggerUser (user: (U & User) | null): void {
    if (!this.logger) return
    if (!user) {
      this.logger.user = null
      return
    }

    this.logger.user = {
      id: user.id,
      username: user.email,
      fist_name: user.first_name,
      last_name: user.last_name
    }
  }
}
