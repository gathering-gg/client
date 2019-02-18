import { remote, ipcRenderer } from 'electron'
import * as Store from 'electron-store'
import * as React from 'react'
import {
  Button,
  Col,
  Form,
  FormGroup,
  FormText,
  Input,
  Label,
  Row
} from 'reactstrap'
import {
  IPC_GATHERING_CLI_RESTART,
  IPC_GATHERING_CLI_UPLOAD,
  IPC_GATHERING_OPEN_LOG_DIR
} from './constants'
import { GatheringConfig } from './store'
import { User } from './user'

export interface ConfigProps {
  timer?: number
  file?: string
  token: string
  user: User
}

export interface ConfigState {
  timer: string
  file: string
}

export class Config extends React.Component<ConfigProps> {
  constructor(props: ConfigProps) {
    super(props)
    this.state = { file: '', timer: props.timer || '30' }
    this.timerChange = this.timerChange.bind(this)
    this.fileChange = this.fileChange.bind(this)
    this.update = this.update.bind(this)
    this.onUpload = this.onUpload.bind(this)
  }

  public timerChange(event: React.FormEvent<HTMLInputElement>): void {
    const timer = event.currentTarget.value
    this.setState({ timer })
  }

  public fileChange(event: React.FormEvent<HTMLInputElement>): void {
    const file = event.currentTarget.value
    this.setState({ file })
  }

  public update(event: React.FormEvent<EventTarget>) {
    event.preventDefault()
    const store = new Store<GatheringConfig>()
    if (this.state.timer) {
      const timer = parseInt(this.state.timer, 10)
      store.set('timer', timer)
    }
    if (this.state.file) {
      store.set('file', this.state.file)
    }
    ipcRenderer.send(IPC_GATHERING_CLI_RESTART)
  }

  public async onUpload(event: React.FormEvent<EventTarget>) {
    event.preventDefault()
    ipcRenderer.send(IPC_GATHERING_CLI_UPLOAD)
  }

  public async openLogDir(event) {
    ipcRenderer.send(IPC_GATHERING_OPEN_LOG_DIR)
  }

  public render() {
    return (
      <div className="container-fluid">
        <Form onSubmit={this.update} className="row">
          <div className="col-2 offset-1">
            <img id="logo" className="py-2" src="./ody.png" />
          </div>
          <div className="col-8 d-flex align-items-center">
            <h4>{this.props.user.username}</h4>
          </div>
          <FormGroup className="col-10 offset-1">
            <Label for="timer">Log Parse Interval (seconds)</Label>
            <Input
              id="timer"
              type="number"
              value={this.state.timer}
              onChange={this.timerChange}
            />
            <FormText>
              The minimum amount of time between log parses. Parsing the log can
              take quite a bit of CPU usage and can take several seconds. If you
              experience slowness you should increase this interval. 300 and 600
              are good options.
            </FormText>
          </FormGroup>
          <FormGroup className="col-10 offset-1">
            <Label for="file">Log Location</Label>
            <Input
              id="file"
              type="text"
              value={this.state.file}
              onChange={this.fileChange}
            />
            <FormText>
              If you have your `output_log.txt` in a strange location you can
              set it here. Make sure you use the absolute (full) path. Leave
              this blank for the default location.
            </FormText>
          </FormGroup>
          <Button
            type="submit"
            color="primary"
            className="col-10 offset-1 mt-3"
          >
            Restart Tracker
          </Button>
          <small className="text-muted col-10 offset-1 px-1">
            If the parser has crashed in the background or you changed any
            settings.
          </small>
          <Button
            type="button"
            color="info"
            className="col-10 offset-1 mt-3"
            onClick={this.onUpload}
          >
            Upload Raw Log
          </Button>
          <small className="text-muted col-10 offset-1 px-1">
            The developers may request the raw logs to help debug certain
            issues.
          </small>
          <Button
            type="button"
            color="info"
            className="col-10 offset-1 mt-3"
            onClick={this.openLogDir}
          >
            Show Gathering Client Log
          </Button>
        </Form>
        <Row>
          <Col className="text-center">
            <small className="text-muted">v{remote.app.getVersion()}</small>
          </Col>
        </Row>
      </div>
    )
  }
}
