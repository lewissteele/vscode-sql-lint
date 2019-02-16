import * as vscode from 'vscode';
import { execSync } from 'child_process';

const diagnosticCollectionName = 'sql-lint';
let diagnosticCollection: vscode.DiagnosticCollection;

function activate(context: vscode.ExtensionContext): void {
	console.log('Congratulations, your extension "vscode-sql-lint" is now active!');

	const config = vscode.workspace.getConfiguration('sql-lint');

	// const selector: vscode.DocumentSelector = {
	// 	scheme: 'file',
	// 	language: 'sql',
	// };

  	diagnosticCollection = vscode.languages.createDiagnosticCollection(
		diagnosticCollectionName
	);
  	context.subscriptions.push(diagnosticCollection);

	vscode.workspace.onDidChangeTextDocument(event => {
		console.log('did get here');

		// if (event.languageId === 'sql') {
		const path = event.document.uri.fsPath;

		console.log('did get here 1');

		const errors = runLinter(path, config);

		diagnosticCollection.clear();

		let diagnosticMap: Map<string, vscode.Diagnostic[]> = new Map();

		errors.forEach(error => {
			let canonicalFile = vscode.Uri.file(error.file).toString();
			let range = new vscode.Range(
				error.line - 1,
				error.startColumn,
				error.line - 1,
				error.endColumn,
			);
			let diagnostics = diagnosticMap.get(canonicalFile);

			if (!diagnostics) {
				diagnostics = []; 
			}

			diagnostics.push(new vscode.Diagnostic(
				range,
				error.message,
				error.severity,
			));
			diagnosticMap.set(canonicalFile, diagnostics);
		});

		diagnosticMap.forEach((diags, file) => {
			diagnosticCollection.set(vscode.Uri.parse(file), diags);
		});
	});
}

function runLinter(file: string, config: any): Array<any> {
	const cmd = `sql-lint --host=${config.host} --user=${config.user} --password=${config.password} --file=${file}`;
	const result = execSync(cmd).toString();

	return [{
		file: file,
		line: 1,
		message: result,
		startColumn: 0,
		endColumn: 100,
	}];
}

function onChange() {
	console.log('onChange did get called!!!!!!!');
}

function deactivate(): void { }

export { activate, deactivate };
