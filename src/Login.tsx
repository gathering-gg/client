import * as React from 'react'
import { Button, Form, Input } from 'reactstrap'

interface LoginProps {
  onLogin: (token: string) => void
}

interface LoginState {
  token: string
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
    console.log('login', this.state.token)
  }

  public render() {
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
            <Button type="submit" color="primary" className="col-12 mt-3">
              Login
            </Button>
          </Form>
        </div>
      </div>
    )
  }
}
