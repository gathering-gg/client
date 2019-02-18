import * as React from 'react'
import { Alert, Button, Col, Form, FormGroup, Input, Label } from 'reactstrap'
import { api } from './api'
import { user } from './user'

interface LoginProps {
  onLogin: (token: string, user: User) => void
}

interface LoginState {
  username: string
  password: string
  error: string
}

export class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props)
    this.state = {
      error: '',
      password: '',
      username: ''
    }
    this.login = this.login.bind(this)
    this.usernameChange = this.usernameChange.bind(this)
    this.passwordChange = this.passwordChange.bind(this)
  }

  public usernameChange(event: React.FormEvent<HTMLInputElement>): void {
    const username = event.currentTarget.value
    this.setState({ username })
  }

  public passwordChange(event: React.FormEvent<HTMLInputElement>): void {
    const password = event.currentTarget.value
    this.setState({ password })
  }

  public async login(event: React.FormEvent<EventTarget>) {
    event.preventDefault()
    this.setState({ error: '' })
    try {
      const { username, password } = this.state
      const { session, user } = await api.login({ username, password })
      this.props.onLogin(session.token, user)
    } catch (err) {
      this.setState({ error: err.message })
    }
  }

  public render() {
    const error = this.state.error ? (
      <Alert color="danger" className="col-12 my-3">
        {this.state.error}
      </Alert>
    ) : (
      undefined
    )
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="py-3 offset-1 col-10 text-center">
            <img id="logo" src="./ody.png" />
          </div>
          <div className="col-10 offset-1 d-flex justify-content-center">
            <h1>Gathering.gg</h1>
          </div>
          <div className="col-10 offset-1">
            <Form onSubmit={this.login} className="row">
              <FormGroup className="col-12">
                <Label for="username">
                  <strong>Username</strong>
                </Label>
                <Input
                  type="text"
                  name="username"
                  id="username"
                  required
                  autoFocus={true}
                  tabIndex={1}
                  value={this.state.username}
                  onChange={this.usernameChange}
                />
              </FormGroup>
              <FormGroup className="col-12">
                <Label for="password">
                  <strong>Password</strong>
                </Label>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  required
                  tabIndex={2}
                  value={this.state.password}
                  onChange={this.passwordChange}
                />
              </FormGroup>
              <Col xs="12" className={error ? `d-block` : `d-none`}>
                {error}
              </Col>
              <Col xs="12">
                <Button
                  type="submit"
                  color="primary"
                  className="col-12 btn-block"
                  disabled={!this.state.password || !this.state.username}
                >
                  Sign In
                </Button>
              </Col>
            </Form>
          </div>
        </div>
      </div>
    )
  }
}
