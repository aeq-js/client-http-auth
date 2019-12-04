import { Auth } from './Auth'
import { Container, Service } from 'typedi'

@Service()
export class AuthServiceProvider {

//  @Inject('http')
//  http: any

  boot ({ store }: { store: any }) {
//    const repo = Container.get('userRepo')
//    console.log('repo', repo)
    const auth = Container.get(Auth)
    store.auth = auth
//    this.http.interceptors.request.use((config: any) => {
//      const token = auth.getAccessToken()
//      if (token) {
//        config.headers['Authorization'] = `Bearer ${auth.getAccessToken()}`
//      }
//      return config
//    }, function (error: any) {
//      return Promise.reject(error)
  }

)
}
}
