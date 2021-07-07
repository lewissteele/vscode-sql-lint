import * as vscode from 'vscode'
import sqlLint from '../../sql-lint/dist/src/main'

export function activate (): void {
  vscode.workspace.onDidChangeTextDocument(handleEvent)
  vscode.workspace.onDidOpenTextDocument(handleEvent)
}

export function deactivate (): void {}

const collection = vscode.languages.createDiagnosticCollection()

async function handleEvent (event: any): Promise<void> {
  collection.clear()

  const sql = event.document.getText()
  const config = vscode.workspace.getConfiguration('sql-lint')
  const { driver, host, password, user } = config

  const errors = await sqlLint({
    driver,
    host,
    password,
    sql,
    user,
  })

  const diagnostics = errors.map(err => new vscode.Diagnostic(
    // sql-lint lines are not zero indexed
    new vscode.Range(
      new vscode.Position(err.line - 1, 0),
      new vscode.Position(err.line - 1, 200),
    ),
    err.error,
    vscode.DiagnosticSeverity.Error,
  ))

  collection.set(
    vscode.Uri.parse(event.document.uri.fsPath),
    diagnostics,
  )
}
