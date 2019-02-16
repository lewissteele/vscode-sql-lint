import * as vscode from 'vscode';
import { execSync } from 'child_process';

let diagnosticCollection: vscode.DiagnosticCollection;
let languageIds: any = {};

export function activate(context: vscode.ExtensionContext): void {
	const config = vscode.workspace.getConfiguration('sql-lint');
  	diagnosticCollection = vscode.languages.createDiagnosticCollection('sql-lint');
	context.subscriptions.push(diagnosticCollection);

	vscode.workspace.onDidOpenTextDocument(event => {
		const languageId = event.languageId;
		const file = event.fileName;
		languageIds[languageId] = file;
		handle(file, languageId, config);
	});

	vscode.workspace.onDidChangeTextDocument(event => {
		const file = event.document.uri.fsPath;
		const languageId = languageIds[file];
		handle(file, languageId, config);
	});
}

export function deactivate(): void { }

function handle(file: string, languageId: string, config: any) {
	const errors = runLinter(file, config);

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
			vscode.DiagnosticSeverity.Error
		));
		diagnosticMap.set(canonicalFile, diagnostics);
	});

	diagnosticMap.forEach((diags, file) => {
		diagnosticCollection.set(vscode.Uri.parse(file), diags);
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
