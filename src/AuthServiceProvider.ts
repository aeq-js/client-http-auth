import { Auth } from './Auth'
import { Container, Service } from 'typedi'

@Service()
export class AuthServiceProvider {

  boot ({ store }: { store: any }) {
    store.auth = Container.get(Auth)
  }
}
