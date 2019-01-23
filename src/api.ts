import axios from 'axios'
import { config } from './config/index'
import { User } from './user'

const Axios = axios.create({
  baseURL: config.url
})

class Api {
  public async me(token: string): Promise<User> {
    const res = await Axios({
      headers: {
        Authorization: `token ${token}`
      },
      url: '/me'
    })
    return res.data
  }
}

export const api = new Api()
