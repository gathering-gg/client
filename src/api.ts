import axios from 'axios'
import { User } from './user'

const API_URL = process.env.GATHERING_GG_ROOT
  ? process.env.GATHERING_GG_ROOT
  : 'https://api.gathering.gg'

const Axios = axios.create({
  baseURL: API_URL
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
