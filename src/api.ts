import axios from 'axios'
import { config } from './config/index'
import { Session, User } from './user'

const Axios = axios.create({
  baseURL: config.api
})

interface LoginResponse {
  user: Users
  session: Session
}

class Api {
  public async login(data: {
    username: string
    password: string
  }): Promise<LoginResponse> {
    const res = await Axios({
      data,
      method: 'POST',
      url: '/login'
    })
    return res.data
  }
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
