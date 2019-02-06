import axios from 'axios'
import { app } from 'electron'
import * as log from 'electron-log'
import * as semver from 'semver'

export const HasUpdate = async () => {
  const appVersion = app.getVersion()
  try {
    const res = await axios({
      headers: {
        'User-Agent': 'gathering.gg/client'
      },
      url: 'https://api.github.com/repos/gathering-gg/client/releases/latest'
    })
    const { tag_name: current } = res.data
    return !semver.eq(appVersion, current)
  } catch (err) {
    log.error('error checking for update', err)
    return false
  }
}
