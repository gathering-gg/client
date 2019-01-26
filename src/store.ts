import { Store } from 'electron-store'
import { User } from './user'

export interface GatheringConfig {
  timer?: number
  file?: string
  token?: string
  user?: User
}
