// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import { findComponents } from "./find-components";
import { isNewComponent, setUpComponent } from "./set-up-component";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "new-react-component" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  let anotherDisposable = vscode.commands.registerCommand(
    "new-react-component.initializeIshaqExtension",
    async () => {
      let rootUri: null | vscode.Uri = null;
      let root = vscode.workspace.workspaceFolders;
      if (root && root.length > 0) {
        rootUri = root[0].uri;
      }

      console.log(
        rootUri?.path ? `Root: ${rootUri.path}` : "Could not find root"
      );

      if (rootUri) {
        await context.workspaceState.update("root", rootUri.path);
        const componentsUri = await findComponents(rootUri);
        if (componentsUri.length > 0) {
          if (componentsUri.length === 1) {
            vscode.window.showInformationMessage(
              `Found components folder at: ${componentsUri[0].path}`
            );
            console.log("Found components folder at: ", componentsUri[0].path);
            context.workspaceState.update(rootUri.path, componentsUri[0].path);
          } else {
            vscode.window.showErrorMessage(
              "Found multiple folders named 'components'. Please select the correct folder from the dropdown."
            );
            const selectedComponentsFolder = await vscode.window.showQuickPick(
              componentsUri.map((uri) => uri.path)
            );
            if (selectedComponentsFolder) {
              vscode.window.showInformationMessage(
                `Successfully selected: ${selectedComponentsFolder}`
              );
              context.workspaceState.update(
                rootUri.path,
                selectedComponentsFolder
              );
            }
          }
        } else {
          vscode.window.showErrorMessage(
            "Could not find components folder, please make sure it is called 'components' and exits in the workspace"
          );
          console.error("Components folder not found");
        }
      }
    }
  );

  const disposable = vscode.workspace.onDidCreateFiles(async (e) => {
    const root: string | undefined = context.workspaceState.get("root");
    if (root) {
      const rootUri = vscode.Uri.file(root);
      for (const file of e.files) {
        const wasCreatedInComponents = await isNewComponent(
          file.path,
          rootUri,
          context
        );
        if (wasCreatedInComponents) {
          const nameOfComponent =
            file.path.split("/")[file.path.split("/").length - 1];
          const permission = await vscode.window.showQuickPick([
            `Set up ${nameOfComponent}`,
            "Do nothing",
          ]);
          if (permission && permission === `Set up ${nameOfComponent}`) {
            vscode.window.showInformationMessage(
              `Setting up component: ${nameOfComponent}`
            );
            await setUpComponent(file, nameOfComponent);
          }
        }
      }
    }
  });

  context.subscriptions.push(anotherDisposable);
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
