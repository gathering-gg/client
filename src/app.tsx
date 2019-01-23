import * as React from 'react'
import { Login } from './Login'

interface AppOptions {
  timer?: number
  file?: string
  token?: string
}

export class App extends React.Component {
  render() {
    return <Login />
  }
}
