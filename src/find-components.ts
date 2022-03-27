import * as vscode from "vscode";
/*
We want to find the components folder through a breadth-first traversal of the workspace.
Here is what the algorithm looks like:
Find root --> start at root --> enumerate all possible folder paths and add to array
--> look at first one and add its subfolders to the array --> keep doing this until you find 'components'
Special case: multiple components folders: prompt the user to paste the relative path of their target
components folder
Input: root Uri
returns: array of Uri(s)
At the end you return the Uri of the components folder, or an array of these if there are multiple
*/

export const findComponents: (
  root: vscode.Uri
) => Promise<vscode.Uri[]> = async (root) => {
  let componentsFolders: vscode.Uri[] = [];
  let queue: vscode.Uri[] = [];
  const { workspace } = vscode;
  const { fs } = workspace;

  const foldersInRoot = await fs.readDirectory(root);

  // Now we begin searching breadth-first
  queue = queue.concat(
    foldersInRoot
      .filter((file) => file[1] === 2 && file[0] !== "node_modules")
      .map((folder) => vscode.Uri.joinPath(root, folder[0]))
  );

  let lengthOfQueue = queue.length;
  let numComponentFolders = 0;
  //   console.log("Sub folders of root: ", queue);
  let index = 0;

  while (index < lengthOfQueue) {
    const currentFile = queue[index];
    // console.log("Checking: ", currentFile.path);
    const currentFilePath = currentFile.path.split("/");
    if (currentFilePath[currentFilePath.length - 1] === "components") {
      componentsFolders.push(currentFile);
      numComponentFolders += 1;
    } else {
      //   console.log(`${currentFile.path} is not components`);
      //get subfolders and add to array
      const subFolders = await fs.readDirectory(currentFile);
      //   console.log(`Sub folders of ${currentFile.path}: ${subFolders}`);
      const subs = subFolders
        .filter((file) => file[1] === 2 && file[0] !== "node_modules")
        .map((folder) => vscode.Uri.joinPath(currentFile, folder[0]));
      queue = queue.concat(subs);
    }
    index += 1;
    lengthOfQueue = queue.length;
  }

  return componentsFolders;
};
