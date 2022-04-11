<img src="https://assets.solidjs.com/banner?project=Compendium DevTools Connector" />

## ⚠️ This branch of the repo will remain unchanged until the end of SolidHack voting! 

## ⚠️ If you would like to see the current progress of this project, please view the [`dev` branch](https://github.com/CompendiumDevTools/library/branches/dev).

A library for connecting frameworks and state management libraries to [Compendium DevTools](https://github.com/CompendiumDevTools/devtools) made for SolidHack.

If you're coming from SolidHack, make sure to look at the [Compendium DevTools](https://github.com/CompendiumDevTools/devtools) repo as well since it was a large part of this effort.

## Functions

### `registerNode`

This function registers a node which will cause it to appear in the devtools along with data associated with it.

If the node has already been registered, it will be reset and updated with the new data. This is to account for HMR.

### `updateNode`

This function updates the data associated with a node that has already been registered.

### `unregisterNode`

This function will unregister a node from the devtools. The node will be kept in the devtools' history, but will no longer be updated and will disappear from the node tree at the present time.

## SolidJS

Specific functions for connecting SolidJS projects.

### `<DevTools />`

This is a Solid component that will automatically connect everything under it to the devtools. It's best used at the root of your project, but it can be placed anywhere if you want a smaller, more managable scope to view.
