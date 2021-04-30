import * as vscode from 'vscode'
import SqlError from './sql-error'
import { exec } from 'child_process'

export default async function lint (
  config: vscode.WorkspaceConfiguration,
  file: string
): Promise<Array<SqlError>> {
  let cmd = `sql-lint --format=json ${file}`

  if (
    config.has('host') &&
    config.has('user') &&
    config.has('password')
  ) {
    cmd = `
      sql-lint
      --format=json
      --host=${config.host}
      --user=${config.user}
      --password=${config.password}
      ${file}
    `
  }

  return new Promise<Array<SqlError>>((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err !== null) {
        err = null
      }

      const errors = JSON.parse(stdout)

      console.log(errors)

      resolve(stdout)
    })
  })
}
