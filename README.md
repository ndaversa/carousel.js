# Carousel.js

[![Build Status](https://secure.travis-ci.org/ndaversa/carousel.js.png?branch=master)](http://travis-ci.org/ndaversa/carousel.js)

## Demo

[View the demo on codio](http://ndaversa.cod.io/carousel-js/demo.html)

OR

Start Karma to boot the file server

```
karma start
```

then navigate to
[http://localhost:9876/base/demo.html](http://localhost:9876/base/demo.html)

OR

Just goto the `demo.html` using the `file://` protocol locally

## Dependencies

* [jQuery](http://jquery.com/)
* [Lo-Dash](http://lodash.com/)

I agree that the above dependencies are unnecessary. However they
were already dependencies for the project this carousel was built for.
I suspect removing jQuery would be pretty straight forward as well as lo-dash.
That is to say... Pull Requests Welcomed :)

## Usage

```javascript
var carousel = new Carousel({
  el: '#test',
  pageWidth: 128,
  data: [
    { url: 'http://placehold.it/128x200/D5FBFF' },
    { url: 'http://placehold.it/128x200/9FBCBF' },
    { url: 'http://placehold.it/128x200/647678' },
    { url: 'http://placehold.it/128x200/2F3738' },
    { url: 'http://placehold.it/128x200/59D8E6' },
  ],
  template: function (data, options) {
    if (data && data.url) {
      return '<img src="' + data.url + '" />';
    }
    return '';
  }
});
carousel.render();
```

The required parameters upon construction are:
  * `el`: an element or selector
  * `data`: an array of data for each page

Other options:
  * `animationDuration`: the number in seconds used when swiping through the
     carousel (`0.325` by default)
  * `delayBuffers`: will delay building of buffer pages, if you specify
    this parameter you will be required to call `renderBuffers` manually
  * `initialOffset`: the number of pixels to offset the initial position of
    the carousel (`0` by default)
  * `loop`: a boolean indicating whether the carousel should loop
    (default `true`)
  * `pageTemplate`: a function which returns a string containing html markup to construct the
    page (by default it creates `<li>` elements with the `pageWidth` set inline
  * `pageWidth`: the number of pixels wide each page should be (default
    is `256`)
  * `template`: a function which returns a string containing html markup
    to construct the contents of the page. The function is passed two
    parameters `data` and `options`
  * `templateOptions`: the options that should be passed to the template
    when rendering the content of each page

## Testing

Install [Node](http://nodejs.org) (comes with npm) and Bower.

From the repo root, install the project's development dependencies:

```
npm install
bower install
```

Testing relies on the Karma test-runner. If you'd like to use Karma to
automatically watch and re-run the test file during development, it's easiest
to globally install Karma and run it from the CLI.

```
npm install -g karma
karma start
```

To run the tests in Firefox, just once, as CI would:

```
npm test
```

## Browser support

* Google Chrome (latest)
* Firefox (latest)
* Safari (latest)
* Mobile Safari (iOS 5+)
* Android Browser 2.3+
* Possibly more (untested)
