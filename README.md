# [anime.js](http://anime-js.com) ![](https://badge-size.herokuapp.com/juliangarnier/anime/master/anime.min.js)
*Anime* `(/ˈæn.ə.meɪ/)` is a flexible yet lightweight JavaScript animation library.
It works with CSS, Individual Transforms, SVG, DOM attributes and JS Objects.

**Features**

* [Specific animation parameters](#specific-animation-parameters)
* [Specific target values](#specific-target-values)
* [Multiple timing values](#multiple-timing-values)
* [Playback controls](#playback-controls)
* [Motion path](#motion-path)


**Examples and demos**

* [CodePen demos and examples](http://codepen.io/collection/b392d3a52d6abf5b8d9fda4e4cab61ab/)
* [juliangarnier.com](http://juliangarnier.com)
* [anime-js.com](http://anime-js.com)
* [kenzo.com/en/thejunglebook](https://kenzo.com/en/thejunglebook)
* [Stress test](http://codepen.io/juliangarnier/pen/9aea7f045d7db301eab41bc09dcfc04d?editors=0010)

### Animation example

```javascript
var myAnimation = anime({
  targets: ['.blue', '.green'],
  translateX: '13rem',
  rotate: 180,
  borderRadius: 8,
  duration: 2000,
  loop: true
});
```

![Basic animation](http://anime-js.com/img/gifs/basic-anim.gif)

[Live example on CodePen](http://codepen.io/juliangarnier/pen/42673ea42700509510c80dcf83d5fc22?editors=0010)

### Browser support

* Chrome
* Safari
* Opera
* Firefox
* IE 11+ (some things might break but it will work)

### Quick start

`npm install animejs` / `bower install animejs` or [download](https://github.com/juliangarnier/anime/archive/master.zip)

Then insert `anime.min.js` in your html:

```html
<script src="anime.min.js"></script>
```

Or import it in your JavaScript

```javascript
import anime from 'animejs'
```

## API

### targets

Defines the elements or JS Objects to animate.

| Accept | Examples
| --- | --- | ---
| CSS Selectors | `'div'`,`'.thing'`,`'path'`
| DOM Element | `document.querySelector('.thing')`
| Nodelist | `document.querySelectorAll('.thing')`
| JavaScript Object | `{prop1: 100, prop2: 200}`
| JavaScript Array | `['.thing-1', 'div']`

### Parameters

| Names | Defaults | Types
| --- | --- | ---
| delay | `0` | `number`, `function` (el, index, total)
| duration | `1000` | `number`, `function` (el, index, total)
| autoplay | `true` | `boolean`
| loop | `false` | `number`, `boolean`
| direction | `'normal'` | `'normal'`, `'reverse'`, `'alternate'`
| easing | `'easeOutElastic'` | console log `anime.easings` to get the complete functions list
| elasticity | `400` | `number` (higher is stronger)
| round | `false` | `number`, `boolean`
| begin | `undefined` | `function` (animation)
| update | `undefined` | `function` (animation)
| complete | `undefined` | `function` (animation)


#### Specific animation parameters

![Specific parameters](http://anime-js.com/img/gifs/specific-parameters.gif)

Parameters can be set individually to properties by using an Object.

Specific property parameters are :

* value (required)
* delay
* duration
* easing

Example:

```javascript
anime({
  targets: 'div',
  translateX: '13rem',
  rotate: {
    value: 180,
    duration: 1500,
    easing: 'easeInOutQuad'
  },
  scale: {
    value: 2,
    delay: 150,
    duration: 850,
    easing: 'easeInOutExpo',
  },
  direction: 'alternate',
  loop: true
});
```

[Live example on CodePen](http://codepen.io/juliangarnier/pen/9f707f4ee1d805a5034ecddb24156e56?editors=0010)

#### Multiple timing values

![Multi timings](http://anime-js.com/img/gifs/multi-timings.gif)

Delays and durations can be specific to each targeted elements by using a function.

Available function arguments:

| Positions | Names | Infos
| --- | --- | ---
| 1 | target | The targeted element
| 2 | index | The target index (start at 0)
| 3 | length of targets | The total number of targets (start at 0)

Example:

```javascript
anime({
  targets: 'div',
  translateX: '13.5rem',
  scale: [.75, .9],
  delay(el, index) {
    return index * 80;
  },
  direction: 'alternate',
  loop: true
});
```

[Live example on CodePen](http://codepen.io/juliangarnier/pen/68ce02709b3b98a6e1ca33f33899b6cf?editors=0010)

### List of valid animateable properties

Any property can be animated, as long as the property value contains at least one numerical value.

| Types | Examples
| --- | --- | ---
| CSS Properties | `width`, `borderRadius`, `'background-color'`
| Individual transforms | `translateX`, `rotate`, `scaleY`
| SVG attributes | `d`, `rx`, `transform`
| DOM attributes | `value`, `volume`
| Object properties | any object property containing at least one number

### Property values

#### Single value

Defines the end value of the animation.

| Types | Examples | Infos
| --- | --- | ---
| String | `'100rem'` | Recommended technique. Will force the animation to use a specific value, but doesn't convert units.
| Number | `100` | Will use default units if possible. Doesn't work with properties that aren't specified in the CSS, or non-numerical values (e.g. margin: auto; left: auto; etc..).

Example:

```CSS
.div {
  width: 20px;
}
```
```javascript

anime({
  targets: 'div',
  translateX: '3rem', // Will translate the div from '0rem' to '3rem'
  width: '100', // Will be converted to '100px' because the width is '20px' in the CSS
});
```

#### From To values

Defines the start and end values of the animation.

Example:

```javascript
anime({
  targets: 'div',
  translateX: [50, 250] // Will start at 50px and end at 250px
});
```

#### Specific target values

![Random values](http://anime-js.com/img/gifs/random-values.gif)

Property values  can be specific to each targeted elements by using a function.

Available function arguments:

| Positions | Names | Infos
| --- | --- | ---
| 1 | target | The targeted element
| 2 | index | The target index (start at 0)

Examples:

```javascript
anime({
  targets: 'div',
  translateX(el, index) {
    return anime.random(50, 100); // Will set a random value from 50 to 100 to each divs
  }
});
```

[Live example on CodePen](http://codepen.io/juliangarnier/pen/7f35cee232d7872be268c0a97f34cb2d?editors=0010)

```javascript
anime({
  targets: 'path',
  strokeDashoffset(el) {
    let pathLength = el.getTotalLength();
    return [pathLength, 0]; // Will use the exact path length for each targeted path elements
  }
});
```

[Live example on CodePen](http://codepen.io/juliangarnier/pen/d1cf92b2af5bb4166cde511e233e8a0d?editors=0010)

## Playback controls and Events

![Playback controls](http://anime-js.com/img/gifs/playback-controls.gif)

Events Play, pause, restart and seek the animation.

| Names | Infos | Arguments | Returns
| --- | --- | ---
| `.play()` | Play the animation | animation parameters object | animation
| `.pause()` | Pause the animation | none | animation
| `.restart()` | Restart the animation | animation parameters object | animation
| `.seek()` | Advance in the animation | a percentage, or an object {time: 1250} | none
| `.on()` | handle events on an animation | event type and function | listener object -> { off, on }
| `.once()` | handle an event on an animation once | event type + optional callback func | Promise or event listener
| `.complete` | handle an event on an animation once | none | Promise
| `.begin` | handle an event on an animation once | none | Promise

```javascript
  var myAnimation = anime({
    targets: 'div',
    translateX: 100,
    autoplay: false
  });

  // .once always returns a promise
  myAnimation.once('begin').then(anim => {
    console.log("Began!"); // Called the animation began.
  });
  // but you can also use
  myAnimation.begin.then(anim => {
    console.log("Began!"); // Called the animation began.
  });
  // or
  myAnimation.begin = anim => {
    console.log("Began!"); // Called the animation began.
  };

  // .on requires a callback and returns a listener
  myAnimation.on('complete', anim => {
      console.log("Completed!"); // Called the animation ended.
  });

  // listeners may be used to turn an event off or on again
  let listener = myAnimation.on('update', anim => {
    console.log("Updated!"); // Called the animation updated.
  });
  listener.off();
  // later
  listener.on();
  // change it to once
  listener.once();

  myAnimation.once('pause').then(anim => {
    console.log("the animation was paused!"); // called on pause
    setTimeout(anim.play, 1500);
  });

  myAnimation.play(); // Manually play the animation

```

###### Handling Multiple animations at once

```js


// Promise support
let anims = Array.from(document.querySelectorAll('div'))
            .map(el => anime({
                targets: el,
                translateY : -30,
                duration: anime.random(100,2000),
                autoplay : false,
            }));


  // anime.all simplifies reacting to events
  // on multiple animations
  // anime.all( eventtype , [animation,animation,animation] or ...animations )
  anime.all('complete',anims).then(anims => {
    console.log('all done! :D',anims);
  });

  // the same as above without anime.all

  let animsPromises = anims.map(anim => anim.once('complete')); // convert to promises
  Promise.all(animsPromises).then(anims => {
    console.log('all done! :D',anims);
  });

  // different way of using anime.all
  anime.all('begin', ...anims).then(anims => {
    console.log('all the animations started! :D',anims);
  });

  // anime.chain allows you to
  anime.chain(anims).play();

  let chain = anime.chain(animation1,animation2,animation3);
  // you can add to chains
  chain.add(animation4);
  // and remove from them
  chain.remove(animation1);

  // use chain.Do to apply an action to
  // the animations in the chain
  // chain.Do( event | true , string | function )
  chain.Do('complete','restart');
  // adding true makes actions imediate
  chain.Do(true, anim => {
    // do something to all
    // animations in the chain
  });
  chain.Do(true,'pause');

  // available chain actions are
  chain.play
  chain.pause
  chain.restart
  // use chain.Do for anything else
```

[Live example on CodePen](http://codepen.io/juliangarnier/pen/d1cf92b2af5bb4166cde511e233e8a0d?editors=0010)

### Motion path

![Follow path](http://anime-js.com/img/gifs/follow-path.gif)

Animate the transform properties along an SVG path by using the `anime.path()` Object.

Transforms compatible with a motion path:

| Names | Infos
| --- | --- |
| `translateX` | follow the x path coordinate
| `translateY` | follow the y path coordinate
| `rotate` | follow the path angle value

Notes: [IE cannot apply CSS transforms on SVG elements](https://connect.microsoft.com/IE/feedback/details/811744/ie11-bug-with-implementation-of-css-transforms-in-svg).

Example:

```javascript
var myPath = anime.path('path');

anime({
  targets: 'div',
  translateX: myPath,
  translateY: myPath,
  rotate: myPath
});
```

[Live example on CodePen](http://codepen.io/juliangarnier/pen/cb829a6e62006720bfb7f934734f8c15?editors=0010)

## Helpers

### anime.list

Return an array of all active animations objects

```javascript
anime.list;
```

### anime.speed = x

Change all animations speed (from 0 to 1).

```javascript
anime.speed = .5; // Will slow down all animations by half of their original speed
```

### anime.easings

Return the complete list of anime.js easing functions

```javascript
anime.easings;
```

### anime.remove(target)

Remove one or multiple targets from the animation.

```javascript
anime.remove('.item-2'); // Will remove all divs with the class '.item-2'
```

### anime.getValue(target, property)

Get current valid value from an element.

```javascript
anime.getValue('div', 'translateX'); // Will return '100px'
```

### anime.random(x,y)

Generate a random number between two numbers.

```javascript
anime.random(10, 40); // Will return a random number between 10 and 40
```

### anime.includes(arr,value)

checks whether a string, array or arraylike object contains
a certain value

```javascript
anime.includes([1,2,3,4], 4); // -> true returns true there is indeed a 4 in the array
```

### anime.flattenArr(array)

flattens arrays

```javascript
anime.flattenArr([1,2,[3,4,[5]]]); // -> [1,2,3,4,5]
```

### anime.dropArrDupes(array)

removes dulicate values from arrays

```javascript
anime.dropArrDupes([1,2,3,3,3,3,4,5]); // -> [1,2,3,4,5]
```

### anime.cloneObj(obj)

clones objects

```javascript
  anime.cloneObj({ a : 1 , b : { c : 2}}); // -> { a : 1 , b : { c : 2}}
```

### anime.mergeObjs(array)

merges objects, similar to Object.assign

```javascript
  anime.mergeObjs({ a : 1 } , { b : { c : 2}}); // -> { a : 1 , b : { c : 2}}
```


====

[MIT License](LICENSE.md). © 2016 Julian Garnier

Big thanks to [Animate Plus](https://github.com/bendc/animateplus) and [Velocity](https://github.com/julianshapiro/velocity) that inspired `anime.js` API, and [jQuery UI](https://jqueryui.com/) from which the easing functions come from.
