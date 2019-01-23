import * as React from 'react'
import { Config } from './Config'
import { Login } from './Login'
import { User } from './user'
import { api } from './api'
import { Spinner } from 'reactstrap'

interface AppOptions {
  timer?: number
  file?: string
  token?: string
}

interface AppState {
  loading: boolean
  token: string
  user?: User
}

export class App extends React.Component<any, AppState> {
  constructor(props: any) {
    super(props)
    this.state = { loading: false, token: 'token' }
    this.onLogin = this.onLogin.bind(this)
  }

  public async componentDidMount() {
    this.setState({ loading: true })
    const { token, user } = this.state
    if (token && !user) {
      try {
        const user = await api.me(token)
        this.setState({ user, loading: false })
      } catch (err) {
        this.setState({ loading: false })
      }
    } else {
      this.setState({ loading: false })
    }
  }

  public onLogin(token: string, user: User) {
    this.setState({ token, user })
  }

  public renderLoading = () => (
    <div className="row d-flex align-items-center h-100">
      <div className="col-12 d-flex justify-content-center">
        <Spinner color="primary" />
      </div>
    </div>
  )

  public render() {
    const { loading, user } = this.state
    if (loading) {
      return this.renderLoading()
    }
    if (!user) {
      return <Login onLogin={this.onLogin} />
    }
    return <Config {...this.state} />
  }
}
