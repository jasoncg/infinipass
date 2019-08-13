## Infinipass
  Infinipass is part password generator, part password manager.
  It can generate complex unique passwords based on something you know
  (your passphrase), and something about the service you are accessing
  (such as the domain name) and something unique to you (your username
  for the service).

  An instance of this application is running at https://pw.lortonlabs.com

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

### Web

Run `ng build` to build the project. The build artifacts will be stored in the 
`dist/` directory. Use the `--prod` flag for a production build.

### Windows

Run `npm run win32` to build the project. The build artifacts will be stored in the 
`electron/` directory.

### WebExtension

1. Run `ng build` to build the project.
2. Copy the results from dist/ to webextension/popup/
3. Modify webextension/popup/index.html changing **base href="/"** to **base href="/popup/"**

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
