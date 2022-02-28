

# Using the calculator

The cost calculators works with recipes first.

On the right side, select the recipe you want to calculate.
The primary output will automatically be added to the "Products" Tab, the required materials to "Inputs" and any potential by-product (e.g. Slag, Tailings, Barrels) to a "Byproduct" section in the "inputs" tab.

Tables and professions are automatically added as needed.

If an item is produced by multiple recipes (e.g. multiple tiers of ore crushing), the cheapest option is used for that item.

There's also a shortcut for adding a recipe by clicking on the "+" Icon in the input list. This is adding the first found recipe that produces this item. If there are multiple options (e.g. smelting, concentrating, mortar, ...), double-check if the correct option was added.

## Byproducts
If you want to include byproduct prices in your calculations, just add what you're selling them for to the items in the "byproducts" section in Inputs. For example, if you pay people to take away your tailings, you could enter "-1" for the "Wet Tailings" item.
For byproducts that you also produce yourself, you still have to manually enter the value.

This is basically required for Barrels, makes a noticeable difference for tailings, but can mostly be ignored for ore crushing.

For barrels, it's best to look at your "products" tab and copy the barrel price.

## Quirks
The profit margin is applied to each product. If that product is used in another product, the profit margin is applied again.
That means that large margins somewhat exponentially increase the price of the end-product. This is intentional. Crafting from ore to skid steer should be more rewarding than just selling the equivalent amount of crushed ore.

There is an option to add the "Lavish Workspace Bonus" even to professions that don't have it as an option (e.g. Mining, Logging).
I didn't find an easy way to extract this information from the running game. Just don't check the box for skills that can't have that bonus.

There is an option to add Modules to tables that don't support them. This is a bit annoying, but again I didn't find a good way to easily extract that data from the server.

Tags are not currently handled in a special way. That means an item requiring "Fat" as an input does not automatically use your "Oil" product. Also, an item requiring generic "logs" won't use the price of your "Oak Log" input. They're all treated as different items.

# Customization
The cost calculator has preset recipes for the 9.5 playtest.

However, you can upload a custom recipe JSON file for each profile.
This allows using this tool even with modded servers and newer versions.

The only limitation is, that a recipe should only have at most 2 outputs.

The output that's not scaling with modules or has the largest quantity is considered the "primary" output, while a (random) other output is considered the "byproduct"

The JSON file should be an array of recipe-entries like this:

```json
{
  "name": "Iron Pipe",
  "ingredients": [
    {
      "displayName": "Iron Bar",
      "name": "IronBarItem",
      "tag": null,
      "quantity": 2.0,
      "isConstant": false
    }
  ],
  "products": [
    {
      "displayName": "Iron Pipe",
      "name": "IronPipeItem",
      "tag": null,
      "quantity": 1.0,
      "isConstant": true
    }
  ],
  "experience": 0.5,
  "time": 0.8,
  "calories": 15.0,
  "table": "Anvil",
  "professions": [
    {
      "name": "SmeltingSkill",
      "displayName": "Smelting",
      "level": 1
    }
  ]
}
```


# Source Code
## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
