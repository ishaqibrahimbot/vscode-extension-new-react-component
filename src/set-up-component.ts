import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export const isNewComponent = async (
  path: string,
  root: vscode.Uri,
  context: vscode.ExtensionContext
) => {
  const isChildOfComponent = path.split("/").includes("components");
  if (isChildOfComponent) {
    //verify if this is the component we are concerned about
    const componentPathArray = path.split("/");
    let componentsFolderPathArray = [];
    let index = 0;
    let currentPathStep;
    while (index < componentPathArray.length) {
      currentPathStep = componentPathArray[index];
      componentsFolderPathArray.push(currentPathStep);
      if (currentPathStep === "components") {
        break;
      } else {
        index += 1;
      }
    }

    if (!componentsFolderPathArray.includes("components")) {
      return false;
    }

    const savedComponentsFolder = await context.workspaceState.get(root.path);
    if (
      savedComponentsFolder &&
      savedComponentsFolder === componentsFolderPathArray.join("/")
    ) {
      return true;
    }
  }
  return false;
};

export const setUpComponent = async (
  componentFolderUri: vscode.Uri,
  componentName: string
) => {
  //pull in file.tsx and index.ts from template, replace {{ComponentName}} with actual component name,
  // and write files ComponentName.tsx and index.ts inside the folder created
  const templateFolderPath = path.join(__dirname, "../template");
  const componentFilePath = path.join(templateFolderPath, "file.txt");
  const indexFilePath = path.join(templateFolderPath, "index.txt");

  const componentFile = fs.readFileSync(componentFilePath, "utf8");
  const indexFile = fs.readFileSync(indexFilePath, "utf8");
  const newComponentFile = componentFile.replace(
    /{{ComponentName}}/g,
    componentName
  );
  const newIndexFile = indexFile.replace(/{{ComponentName}}/g, componentName);
  await vscode.workspace.fs.writeFile(
    vscode.Uri.joinPath(componentFolderUri, `${componentName}.tsx`),
    Buffer.from(newComponentFile)
  );
  await vscode.workspace.fs.writeFile(
    vscode.Uri.joinPath(componentFolderUri, "index.ts"),
    Buffer.from(newIndexFile)
  );

  //look in the parent folder of the component and check if there's an index.ts
  // if so, add the line 'export { default as ${ComponentName} } from './${ComponentName}' there
  // if not, create the file and do the same thing

  const parentFolder = vscode.Uri.joinPath(componentFolderUri, "..");

  const filesInParent = await vscode.workspace.fs.readDirectory(parentFolder);

  const indexInParent = filesInParent.filter(
    (file) =>
      file[1] === 1 && (file[0] === "index.ts" || file[0] === "index.tsx")
  );

  if (indexInParent.length === 1) {
    const indexFile = await (
      await vscode.workspace.fs.readFile(
        vscode.Uri.joinPath(parentFolder, indexInParent[0][0])
      )
    ).toString();
    const newIndexFileContents =
      indexFile.slice(indexFile.length - 2, indexFile.length - 1) === "\n"
        ? indexFile +
          `export { default as ${componentName} } from './${componentName}'`
        : indexFile +
          `\nexport { default as ${componentName} } from './${componentName}'`;
    await vscode.workspace.fs.writeFile(
      vscode.Uri.joinPath(parentFolder, indexInParent[0][0]),
      Buffer.from(newIndexFileContents)
    );
  } else if (indexInParent.length === 0) {
    await vscode.workspace.fs.writeFile(
      vscode.Uri.joinPath(parentFolder, "index.ts"),
      Buffer.from(
        `export { default as ${componentName} } from './${componentName}'`
      )
    );
  }
};
