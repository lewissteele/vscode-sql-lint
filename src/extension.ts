import * as vscode from 'vscode'

function handleEvent (event: any): void {
  console.log('did call handleEvent')
  console.log(event)

  if (event.contentChanges.length === 0) {
    return
  }

  console.log('meh')
}

export function activate (): void {
  vscode.workspace.onDidOpenTextDocument(handleEvent)
  vscode.workspace.onDidChangeTextDocument(handleEvent)
  console.log('did activate extension')
}

export function deactivate (): void {}
