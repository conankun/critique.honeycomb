![loaders](./src/logo.png)

[![npm version](http://img.shields.io/npm/v/css-loading.svg)](https://www.npmjs.com/package/css-loading)
[![npm downloads](http://img.shields.io/npm/dm/css-loading.svg)](https://www.npmjs.com/package/css-loading)

Pure css loading animations. As long as only one element! [Live Demos](http://jovey-zheng.github.io/loader).

Inspiration from [loaders.css](https://github.com/ConnorAtherton/loaders.css) and [css-loaders](https://github.com/lukehaas/css-loaders).


## Install

Install with npm:
  ```
  $ npm install --save-dev css-loading
  ```

or download [the Latest releases version(ZIP)](https://github.com/jovey-zheng/loader/archive/v1.4.0.zip).

## Basic Usage

1. Import:

  ```html
  <link rel="stylesheet" href="loaders.css"> or
  <link rel="stylesheet" href="loaders.min.css">
  ```

  or require from `node_modules`:

  ```js
  import 'css-loading'
  ```

2. Create an element and add the attribute `data-loader`:

  ```html
  <div data-loader="circle"></div>
  ```

## Contributing

Pull requests are welcome!

Create another animation file in `src/` and test it in `example/example.html`, then open it in a browser to see your animation running.

## License

License under [MIT](https://github.com/jovey-zheng/loader/blob/master/LICENSE).
