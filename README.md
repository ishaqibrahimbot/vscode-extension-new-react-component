# New React Component

Every React project, especially if it's a Next.js project, will have a 'components' folder somewhere where you will maintain all
your components. These may also be categorized inside the components folder so that some are in a 'common' sub-folder while others
are in a 'ui' sub-folder, and so on.

To make importing these in other parts of your application easier, we use a re-exporting pattern where the component is re-exported
from its category folder. E.g. if I have a 'Navbar' component inside a 'common' folder inside the 'components' folder, there will
be an index.ts inside the Navbar folder which exports the component to the common folder, and then there will be another index.ts
inside the common folder which re-exports the same Navbar.

In this way, if you have multiple components inside common and need to import them in a file, you can simply do it like this:
import { ComponentA, ComponentB, ComponentC } from '../components/common'

If you follow this pattern and you use TypeScript as well, you will know how much of a (small but consistent) pain it is to set up the files for a new component. You have to make the folder, then the file inside the folder, then an index.ts file inside the same
folder, then add the boilerplate for the react component, export it, and then re-export it from the parent folder.

This extension is made to solve that problem.

## Features

Whenever you create a new component folder inside a 'components' folder in your project, this extension will ask you if
you want to set up the component. If so, it will create the boilerplate component file and do the export and re-export
automaticaly.

Right now, this is what the component file will look like:

```
import { FC, useState, useEffect } from 'react'

export interface {{ComponentName}}Props {

}

const {{ComponentName}} : FC<{{ComponentName}}Props> = () => {
    return <div></div>
}

export default {{ComponentName}}
```

In the future, I will add support for customization, i.e. you will be able to set the template for the
file yourself to suit your needs and development patterns.

## How to use

Once the extension is installed and you've opened your project's workspace, press Ctrl + Shift + P or Cmd + Shift + P on Mac
to open the command pallette.

Run the command 'Initialize Ishaq Extension'.

The extension will search for a folder named 'components' in your workspace and save its Uri.
Note: if there are multiple folders named 'components', it will prompt you to select the right one from a list.

Once the components folder is selected, go to the components folder and create a new folder inside it (or inside any
sub-folder at any level inside the components folder).

When you do this, you will be prompted to select whether you want to set up the component or do nothing.

If you select the set up option, the extension will do its job and make the boilerplate files and do the re-exporting
for you.

That's it. Enjoy!

If you have any suggestions, send them to ishaqibrahimbss@gmail.com
