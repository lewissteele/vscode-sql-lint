import * as vscode from 'vscode'

const diagnosticCollection = vscode.languages.createDiagnosticCollection()

export function activate (context: vscode.ExtensionContext): void {
  vscode.workspace.onDidChangeTextDocument(handleEvent)
  vscode.workspace.onDidOpenTextDocument(handleEvent)
}

export function deactivate (): void {}

function handleEvent (event: any): void {
  const path: string = event.document.uri.fsPath

  diagnosticCollection.clear()

  const diagnostic = new vscode.Diagnostic(
    new vscode.Range(
      new vscode.Position(1, 1),
      new vscode.Position(1, 1)
    ),
    'something is wrong',
    vscode.DiagnosticSeverity.Error
  )
  diagnosticCollection.set(vscode.Uri.parse(path), [diagnostic])
}
