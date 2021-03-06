# Abstract

A [ContentView](ContentView.md) can display a *SplashScreen* before it has any data to render. A *SplashScreen* should keep the user mildly entertained while conveying the fact that data is on the way. It should also inform the user when the data has failed to load, giving the user the option to "retry" the load operation.

# Animations & Disposal

A *SplashScreen* most likely includes some sort of loading animation. It would be an utter waste of resources if this animation were constantly being rendered and maintained in the background, especially while the *SplashScreen* is invisible or permanently removed from the DOM. For this reason, *SplashScreen*s include a mechanism for enabling and disabling such animations.

A *SplashScreen* may use a canvas to render its animations. Therefore, it may (and should) use a library like [crystal](https://github.com/unixpickle/crystal) to detect DPI changes. Crystal creates a global reference to each of its event handlers, meaning that anything listening for DPI changes cannot be garbage collected. To address this issue, a *SplashScreen* should ensure that it can be garbage collected whenever its animations are disabled.

# Methods

* *DOMElement* element() - get the view's root DOM element. This element will automatically be sized by *layout()*. The user of the *SplashScreen* must position it.
* *void* layout(width, height) - update the size of the view's element and adjust its graphics accordingly.
* *void* setAnimate(flag) - enable or disable animations. While animations are disabled, the view should not consume any resources which cannot be garbage collected.
* *void* showLoading() - show the loading animation. This may be called multiple times in succession.
* *void* showError() - show the "retry" button which accompanies an error. This may be called multiple times in succession.

# Events

A *SplashScreen* emits the following event:

 * retry() - the user would like to make another attempt to load the graph.
