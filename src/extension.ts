import * as vscode from 'vscode'
import lint from './lint'

let diagnosticCollection: vscode.DiagnosticCollection

export function activate (): void {
  vscode.workspace.onDidOpenTextDocument(handleEvent)
  vscode.workspace.onDidChangeTextDocument(handleEvent)
}

export function deactivate (): void {}

async function handleEvent (event: any): Promise<void> {
  const errors = await lint(
    vscode.workspace.getConfiguration('sql-lint'),
    event.document.uri.fsPath
  )
  const diagnosticMap: Map<string, vscode.Diagnostic[]> = new Map()

  diagnosticCollection.clear()

  errors.forEach(error => {
    const canonicalFile = vscode.Uri.file(error.file).toString()
    const range = new vscode.Range(
      error.line - 1,
      error.startColumn,
      error.line - 1,
      error.endColumn
    )
    let diagnostics = diagnosticMap.get(canonicalFile)

    if (!diagnostics) {
      diagnostics = []
    }

    diagnostics.push(new vscode.Diagnostic(
      range,
      error.message,
      vscode.DiagnosticSeverity.Error
    ))
    diagnosticMap.set(canonicalFile, diagnostics)
  })

  diagnosticMap.forEach((diags, file) => {
    diagnosticCollection.set(vscode.Uri.parse(file), diags)
  })
}
