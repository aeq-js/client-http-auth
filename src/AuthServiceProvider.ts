import { Auth } from './Auth'
import { Container, Service } from 'typedi'

@Service()
export class AuthServiceProvider {

  boot ({ store }: { store: any }) {
    store.auth = Container.get(Auth)

    const axiosInstance: any = Container.get('http')
    const auth = Container.get(Auth)

    axiosInstance.interceptors.request.use(config => {
      const token = auth.getAccessToken()
      if (token) {
        config.headers['Authorization'] = `Bearer ${auth.getAccessToken()}`
      }
      return config
    }, function (error: any) {
      return Promise.reject(error)
    })
  }
}
