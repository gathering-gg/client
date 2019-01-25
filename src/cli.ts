import * as AppRootDir from 'app-root-dir'
import { ChildProcess, exec, spawn } from 'child_process'
import { platform } from 'os'
import { dirname, join } from 'path'
import { compact, map, toString } from 'lodash'

const BINARY_NAME = process.platform === 'win32' ? 'gathering.exe' : 'gathering'
const RESOURCE_DIR = 'resources'

const getResourceDir = () => {
  switch (platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux'
    case 'darwin':
    case 'sunos':
      return 'darwin'
    case 'win32':
      return 'windows'
  }
}

export interface CLIOptions {
  token: string
  file?: string
  upload?: boolean
}

class CLI {
  private readonly binary: string

  private gathering?: ChildProcess

  private running = false

  constructor() {
    this.binary = join(
      AppRootDir.get(),
      RESOURCE_DIR,
      getResourceDir(),
      BINARY_NAME
    )
  }

  public start(options: CLIOptions) {
    const opts = compact(
      map(options, (v: string | boolean | undefined, k: string) => {
        if (v) {
          return `-${k}=${toString(v)}`
        }
        return undefined
      })
    )
    console.log(opts)
    const gathering = spawn(this.binary, opts)

    gathering.stdout.on('data', data => {
      console.log(`stdout: ${data}`)
    })

    gathering.stderr.on('data', data => {
      console.log(`stderr: ${data}`)
    })

    gathering.on('close', code => {
      console.log(`child process exited with code ${code}`)
      this.running = false
    })

    gathering.on('error', err => {
      console.log('error in subprocess', err)
      // Probably?
      this.running = false
    })

    this.gathering = gathering
    this.running = true
  }

  public stop(): void {
    if (this.gathering) {
      this.gathering.kill()
      this.running = false
    }
  }

  public isRunning(): boolean {
    return this.running
  }

  public async version(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`${this.binary} -version`, (err, stdout, stderr) => {
        if (err) {
          return reject(err)
        }
        return resolve(stdout)
      })
    })
  }
}

export const cli = new CLI()
