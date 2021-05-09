import { promisify } from 'util'
import * as cd from 'child_process'
import * as vscode from 'vscode'

const diagnosticCollection = vscode.languages.createDiagnosticCollection()
const exec = promisify(cd.exec)

export function activate (): void {
  vscode.workspace.onDidChangeTextDocument(handleEvent)
  vscode.workspace.onDidOpenTextDocument(handleEvent)
}

export function deactivate (): void {}

async function handleEvent (event: any): Promise<void> {
  const path: string = event.document.uri.fsPath

  diagnosticCollection.clear()

  const diagnostic = new vscode.Diagnostic(
    new vscode.Range(
      new vscode.Position(1, 1),
      new vscode.Position(1, 1),
    ),
    'something is wrong',
    vscode.DiagnosticSeverity.Error,
  )

  diagnosticCollection.set(vscode.Uri.parse(path), [diagnostic])

  await lint(path)
}

async function lint (file: string): Promise<void> {
  const cmd = `sql-lint --format=json --host=localhost --user=test --password=test ${file}`

  const output = await exec(cmd)

  console.log(output)
}
