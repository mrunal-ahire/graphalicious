# Abstract

The *View* can present a [ContentView](ContentView/ContentView.md) and allow it to scroll.

# Overview & Terminology

A *View* is essentially a glorified [scroll view](https://github.com/unixpickle/scroller.js). It automatically passes its size and animation state down to a *ContentView*, and reflects scrolling state changes from the same *ContentView*. The *View* provides the DOM element that you, the user, should add to your webpage.

# Construction

A *View* can be constructed as follows:

```js
var myView = new window.graphalicious.View()
```

If you want the View to use a harmonizer context besides the default one, you can pass it as an option argument. You will probably want to make sure that the *ContentView*s use this same context, but that is up to you.

# Methods

*View* implements the following methods:

 * *DOMElement* element() - get the root element of the *View*. You should add this to your webpage to show the *View*.
 * *void* layout(width, height) - update the size of the DOM element and notify the *ContentView* of the change.
 * *boolean* getAnimate() - get whether or not animations are enabled for the *ContentView*.
 * *void* setAnimate(flag) - set whether or not animations are enabled for the *ContentView*. If the *View* currently has no *ContentView*, this flag will be set on any *ContentView* which is presented in this *View*. This flag persists through any number of *setContentView()* calls.
 * *ContentView* getContentView() - get the current *ContentView* being presented in this *View*. This may be `null`.
 * *void* setContentView(cv) - change the *ContentView* being presented in this *View*. The old *ContentView*, if there was one, will be removed from the *View*.
