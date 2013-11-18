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
* [imagesLoaded](https://github.com/desandro/imagesloaded) (Optional -
  only needed if the `manageImages` option is used)

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
  * `manageImages`: a boolean indicating that images inside the carousel
    should be monitored, delaying buffer page construction until visible
    images are loaded. See additional notes on this behaviour.
  * `pageTemplate`: a function which returns a string containing html markup to construct the
    page (by default it creates `<li>` elements with the `pageWidth` set inline
  * `pageWidth`: the number of pixels wide each page should be (default
    is `256`)
  * `snap`: a boolean indicating if the carousel should always snap to
    the closest page boundary at the end of a gesture (default `false`)
  * `template`: a function which returns a string containing html markup
    to construct the contents of the page. The function is passed two
    parameters `data` and `options`
  * `templateOptions`: the options that should be passed to the template
    when rendering the content of each page

### How `manageImages` behaves

If you enable the `manageImages` option described above Carousel.js will
track any `<img>` tags that are added by the `template`. The purpose of
this is to give visible images priority so they load first before
attempting to load images for buffer pages. This is accomplished by
delaying construction of the templates for offscreen buffers. This
behaviour is also global to all instances of Carousel. That is, if you
create multiple carousels then no buffer pages will be rendered until
all visible images for every rendered carousel are loaded. There is an
exception to this, if you interact with any carousel and the buffer
pages are not constructed yet, they will be immediately constructed
for that carousel despite the global image loading state.

#### A note for single page applications

Carousel.js exposes a method called `flush` which may be prudent to call
when changing the visible elements of your application. This method will
flush all the buffer page queues so it that all carousels waiting for
images to load will render their buffer pages immediately.  This will
prevent any newly created Carousels from being stuck in the middle of
the image queue.

### Methods

The following methods are the only supported public facing methods:

#### **render** `carousel.render()`
Call this method when you are ready to insert the carousel instance into
the DOM with the specified element (selector) provided upon construction.
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

#### **goToDataIndex** `carousel.goToDataIndex(index)`
Provide the **index** in the `data` which you want to display
```javascript
carousel.goToDataIndex(3);
```

#### **flush** `Carousel.prototype.flush()`
When the `manageImages` option has been used and you wish to stop
waiting for visible images to be ready before building buffer pages.
Calling `flush()` will render the buffer pages for all Carousel objects.

```javascript
Carousel.prototype.flush()
```

### Events

Carousel.js provides the same event system as
[Backbone.js](http://backbonejs.org/). The following are the current
catalog of events that Carousel.js provides:

  * `"crossboundary" (previous, current)` - whenever a page boundary is
    crossed, provides the previous and current page details, page
    details will be in this format:

```javascript
    {
      page: pageNumberHere,
      dataIndex: dataIndexhere
    }
```

  * `"imagesloaded" (imagesLoadedInstance)` - triggered whenver
    `manageImages` is enabled and all visible images have loaded for a
    carousel
  * `"transitionend"` - whenever an animation completes
  * `"resize" (eventDetails)` - whenever the carousel changes size in response to
    an orientation change or window resize

You can listen for any of these events using `on` or `once` as follows:

```javascript
carouselInstance.on("crossboundary", function(previous, current) {
  console.log('previous page was', previous.page, 'current page is', current.page);
  console.log('previous dataIndex was', previous.dataIndex, 'current dataIndex is', current.dataIndex);
});
```

## Testing

Install [Node](http://nodejs.org) (comes with npm) and Bower.

From the repo root, install the project's development dependencies:

```
npm install
bower install
```

If you don't have bower installed globally already, you can run:

```
npm install -g bower
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
* Likely others
