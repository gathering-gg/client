import * as React from 'react'
import { Alert, Button, Form, Input } from 'reactstrap'
import { api } from './api'
import { user } from './user'

interface LoginProps {
  onLogin: (token: string, user: User) => void
}

interface LoginState {
  token: string
  error?: string
}

export class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props)
    this.state = { token: '' }
    this.tokenChange = this.tokenChange.bind(this)
    this.login = this.login.bind(this)
  }

  public tokenChange(event: React.FormEvent<HTMLInputElement>): void {
    const token = event.currentTarget.value
    this.setState({ token })
  }

  public async login(event: React.FormEvent<EventTarget>) {
    event.preventDefault()
    this.setState({ error: undefined })
    try {
      const { token } = this.state
      const user = await api.me(token)
      this.props.onLogin(token, user)
    } catch (err) {
      this.setState({ error: err.message })
    }
  }

  public render() {
    const error = this.state.error ? (
      <Alert color="danger" className="col-12 mb-0 mt-3">
        {this.state.error}
      </Alert>
    ) : (
      undefined
    )
    return (
      <div className="row">
        <div className="py-3 offset-1 col-10 text-center">
          <img id="logo" src="./ody.png" />
        </div>
        <div className="col-10 offset-1 d-flex justify-content-center">
          <h1>Gathering.gg</h1>
        </div>
        <div className="col-10 offset-1">
          <Form onSubmit={this.login} className="row">
            <Input
              className="col-12"
              type="text"
              name="token"
              id="token"
              required
              autoFocus={true}
              tabIndex={1}
              value={this.state.token}
              onChange={this.tokenChange}
              placeholder="Gathering.gg Token"
            />
            {error}
            <Button
              type="submit"
              color="primary"
              className="col-12 mt-3"
              disabled={!this.state.token}
            >
              Login
            </Button>
          </Form>
        </div>
      </div>
    )
  }
}
