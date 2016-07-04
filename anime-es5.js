var _this = this;
/**
 * http://anime-js.com
 * JavaScript animation engine
 * @version anime-next v1.2.0 ES6 version
 * @author Julian Garnier, Saul van der Walt
 * @copyright (c) 2016 Julian Garnier
 * Released under the MIT license
 */
(function(root, factory) { // AMD. Register as an anonymous module.
  if (typeof define === 'function' && define.amd) define([], factory); // Node. Does not work with strict CommonJS, but
  // only CommonJS-like environments that support module.exports,
  // like Node.
  else if (typeof module === 'object' && module.exports) module.exports = factory(); // Browser globals (root is window)
  else root.anime = factory();
})(this, function() { // Defaults
  var undef = undefined,
    validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skewX', 'skewY'],
    defaultSettings = {
      duration: 1000,
      delay: 0,
      loop: false,
      autoplay: true,
      direction: 'normal',
      easing: 'easeOutElastic',
      reversed: false,
      elasticity: 400,
      round: false
    },
    is = {
      array: Array.isArray,
      object: function(a) {
        return includes(Object.prototype.toString.call(a), 'Object');
      },
      html: function(a) {
        return a instanceof NodeList || a instanceof HTMLCollection;
      },
      node: function(a) {
        return a.nodeType;
      },
      bool: function(a) {
        return typeof a === 'boolean';
      },
      svg: function(a) {
        return a instanceof SVGElement;
      },
      dom: function(a) {
        return is.node(a) || is.svg(a);
      },
      number: function(a) {
        return !isNaN(parseInt(a));
      },
      string: function(a) {
        return typeof a === 'string';
      },
      func: function(a) {
        return typeof a === 'function';
      },
      undef: function(a) {
        return typeof a === 'undefined';
      },
      null: function(a) {
        return typeof a === 'null';
      },
      hex: function(a) {
        return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a));
      },
      rgb: function(a) {
        return (/^rgb/.test(a));
      },
      rgba: function(a) {
        return (/^rgba/.test(a));
      },
      hsl: function(a) {
        return (/^hsl/.test(a));
      },
      color: function(a) {
        return is.hex(a) || is.rgb(a) || is.rgba(a) || is.hsl(a);
      }
    },
    curry = function(fn, ctx) {
      var arity = fn.length,
        curried = function() {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return args.length < arity ? function() {
            for (var _len2 = arguments.length, more = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              more[_key2] = arguments[_key2];
            }
            return curried.apply(null, args.concat(more));
          } : fn.apply(ctx || _this, args);
        };
      return curried;
    },
    iseq = curry(function(a, b) {
      return a === b;
    }); // Utils
  /**
   * checks if an array or arraylike object
   * contains a certain value
   * synonym for Array.includes
   * @param (arraylike|array) arr
   * @param (*) searchElement - value to search for
   */
  function includes(arr, searchElement) {
    if (arr.includes) return arr.includes(searchElement);
    if (!is.array(arr)) arr = [].slice.call(arr);
    return !arr.length ? false : arr.some(iseq(searchElement));
  } // Easings functions adapted from http://jqueryui.com/
  var easings = function() {
      var eases = {},
        functions = {
          Sine: function(t) {
            return 1 - Math.cos(t * Math.PI / 2);
          },
          Circ: function(t) {
            return 1 - Math.sqrt(1 - t * t);
          },
          Elastic: function(t, m) {
            if (t === 0 || t === 1) return t;
            var p = 1 - Math.min(m, 998) / 1000,
              st = t / 1,
              st1 = st - 1,
              s = p / (2 * Math.PI) * Math.asin(1);
            return -(Math.pow(2, 10 * st1) * Math.sin((st1 - s) * (2 * Math.PI) / p));
          },
          Back: function(t) {
            return t * t * (3 * t - 2);
          },
          Bounce: function(t) {
            var pow2 = void 0,
              bounce = 4;
            while (t < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
            return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
          }
        };
      ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'].forEach(function(name, i) {
        functions[name] = function(t) {
          return Math.pow(t, i + 2);
        };
      });
      var _loop = function(name) {
        var easeIn = functions[name];
        eases['easeIn' + name] = easeIn;
        eases['easeOut' + name] = function(t, m) {
          return 1 - easeIn(1 - t, m);
        };
        eases['easeInOut' + name] = function(t, m) {
          return t < 0.5 ? easeIn(t * 2, m) / 2 : 1 - easeIn(t * -2 + 2, m) / 2;
        };
      };
      for (var name in functions) {
        _loop(name);
      }
      eases.linear = function(t) {
        return t;
      };
      return eases;
    }(),
    numberToString = function(val) {
      return is.string(val) ? val : '' + val;
    },
    stringToHyphens = function(str) {
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    },
    selectString = function(str) {
      if (is.color(str)) return false;
      try {
        return document.querySelectorAll(str);
      } catch (e) {
        return false;
      }
    }, // Numbers
    random = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }, // Arrays
    toArray = function(o) {
      if (is.array(o)) return o;
      if (is.string(o)) o = selectString(o) || o;
      if (is.html(o)) return [].slice.call(o);
      return [o];
    },
    flattenArr = function(arr) {
      return Array.prototype.reduce.call(arr, function(a, b) {
        return a.concat(is.array(b) ? flattenArr(b) : b);
      }, []);
    },
    groupArrayByProps = function(arr, propsArr) {
      var groups = {};
      arr.forEach(function(o) {
        var group = JSON.stringify(propsArr.map(function(p) {
          return o[p];
        }));
        groups[group] = groups[group] || [];
        groups[group].push(o);
      });
      return Object.keys(groups).map(function(group) {
        return groups[group];
      });
    },
    dropArrDupes = function(arr) {
      return arr.filter(function(item, pos, context) {
        return context.indexOf(item) === pos;
      });
    }, // Objects
    mergeObjs = function(o1, o2) {
      for (var p in o2) {
        o1[p] = !is.undef(o1[p]) ? o1[p] : o2[p];
      }
      return o1;
    },
    eventsys = function(obj) {
      if (!is.object(obj)) obj = {};
      var listeners = new Set();

      function on(type, func) {
        func.type = type;
        func.handle = {
          on: function() {
            listeners.add(func);
            return func.handle;
          },
          once: function() {
            return once(type, func);
          },
          off: function() {
            off(func);
            return func.handle;
          }
        };
        listeners.add(func);
        return func.handle;
      }

      function off(func) {
        if (listeners.has(func)) listeners.delete(func);
        return func.handle;
      }

      function once(type, func) {
        if (is.func(func)) {
          var _ret2 = function() {
            var funcwrapper = function() {
              func.apply(obj, arguments);
              off(funcwrapper);
            };
            off(func);
            return {
              v: on(type, funcwrapper)
            };
          }();
          if (typeof _ret2 === "object") return _ret2.v;
        }
      }
      obj.listeners = listeners;
      obj.on = on;
      obj.once = function(event, fn) {
        return is.func(fn) ? once(event, fn) : new Promise(function(pass) {
          once(event, pass);
        });
      };
      return obj;
    },
    emit = function(type, anim) {
      var _arguments = arguments;
      if (type == 'begin') anim.started = true;
      if (anim.listeners.size > 0) {
        (function() {
          var args = [].slice.call(_arguments, 1);
          anim.listeners.forEach(function(ln) {
            if (ln.type == type) ln.apply(anim, args.concat(ln.handle));
          });
        })();
      }
    }, // Colors
    hexToRgb = function(hex) {
      hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });
      var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex),
        r = parseInt(rgb[1], 16),
        g = parseInt(rgb[2], 16),
        b = parseInt(rgb[3], 16);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    },
    hue2rgb = function(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
    },
    hslToRgb = function(hsl) {
      hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hsl);
      var h = parseInt(hsl[1]) / 360,
        s = parseInt(hsl[2]) / 100,
        l = parseInt(hsl[3]) / 100,
        r = void 0,
        g = void 0,
        b = void 0;
      if (s === 0) r = g = b = l;
      else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
          p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      return 'rgb(' + r * 255 + ',' + g * 255 + ',' + b * 255 + ')';
    },
    colorToRgb = function(val) {
      return is.rgb(val) || is.rgba(val) ? val : is.hex(val) ? hexToRgb(val) : is.hsl(val) ? hslToRgb(val) : undef;
    }, // Units
    getUnit = function(val) {
      return (/([\+\-]?[0-9|auto\.]+)(%|px|pt|em|rem|in|cm|mm|ex|pc|vw|vh|deg)?/.exec(val)[2]);
    },
    addDefaultTransformUnit = function(prop, val, intialVal) {
      return getUnit(val) ? val : includes(prop, 'translate') ? getUnit(intialVal) ? val + getUnit(intialVal) : val + 'px' : includes(prop, 'rotate') || includes(prop, 'skew') ? val + 'deg' : val;
    }, // Values
    getAnimationType = function(el, prop) {
      if (is.dom(el) && includes(validTransforms, prop)) return 'transform';
      if (is.dom(el) && prop !== 'transform' && getCSSValue(el, prop)) return 'css';
      if (is.dom(el) && (el.getAttribute(prop) || is.svg(el) && el[prop])) return 'attribute';
      if (!is.null(el[prop]) && !is.undef(el[prop])) return 'object';
    },
    getCSSValue = function(el, prop) { // Then return the property value or fallback to '0' when getPropertyValue fails
      if (prop in el.style) return getComputedStyle(el).getPropertyValue(stringToHyphens(prop)) || '0';
    }, // prefix transforms for safari
    //transform = (getCSSValue(document.body, 'transform') ? '' : '-webkit-') + 'transform',
    getTransformValue = function(el, prop) {
      var defaultVal = includes(prop, 'scale') ? 1 : 0,
        str = el.style.transform;
      if (!str) return defaultVal;
      var rgx = /(\w+)\((.+?)\)/g,
        match = [],
        props = [],
        values = [];
      while (match = rgx.exec(str)) {
        props.push(match[1]);
        values.push(match[2]);
      }
      var val = values.filter(function(f, i) {
        return props[i] === prop;
      });
      return val.length ? val[0] : defaultVal;
    },
    getInitialTargetValue = function(target, prop) {
      var animtype = getAnimationType(target, prop);
      return animtype === 'transform' ? getTransformValue(target, prop) : animtype === 'css' ? getCSSValue(target, prop) : animtype === 'attribute' ? target.getAttribute(prop) : target[prop] || 0;
    },
    getValidValue = function(values, val, originalCSS) {
      if (is.color(val)) return colorToRgb(val);
      if (getUnit(val)) return val;
      var unit = getUnit(values.to) ? getUnit(values.to) : getUnit(values.from);
      if (!unit && originalCSS) unit = getUnit(originalCSS);
      return unit ? val + unit : val;
    },
    decomposeValue = function(val) {
      var rgx = /-?\d*\.?\d+/g;
      return {
        original: val,
        numbers: numberToString(val).match(rgx) ? numberToString(val).match(rgx).map(Number) : [0],
        strings: numberToString(val).split(rgx)
      };
    },
    recomposeValue = function(numbers, strings, initialStrings) {
      return strings.reduce(function(a, b, i) {
        return a + numbers[i - 1] + (b ? b : initialStrings[i - 1]);
      });
    }, // Animatables
    filterTargets = function(targets) {
      return targets ? flattenArr(is.array(targets) ? targets.map(toArray) : toArray(targets)) : [];
    },
    getAnimatables = function(targets) {
      return filterTargets(targets).map(function(t, i) {
        return {
          target: t,
          id: i
        };
      });
    }, // Properties
    getProperties = function(params, settings) {
      var props = [];
      for (var p in params) {
        if (!defaultSettings.hasOwnProperty(p) && p !== 'targets') {
          var prop = is.object(params[p]) ? Object.create(params[p]) : {
            value: params[p]
          };
          prop.name = p;
          props.push(mergeObjs(prop, settings));
        }
      }
      return props;
    },
    getPropertiesValues = function(target, prop, value, i) {
      var values = toArray(is.func(value) ? value(target, i) : value);
      return {
        from: values.length > 1 ? values[0] : getInitialTargetValue(target, prop),
        to: values.length > 1 ? values[1] : values[0]
      };
    },
    getTweenValues = function(prop, values, type, target) {
      var valid = {};
      if (type === 'transform') {
        valid.from = prop + ('(' + addDefaultTransformUnit(prop, values.from, values.to) + ')');
        valid.to = prop + ('(' + addDefaultTransformUnit(prop, values.to) + ')');
      } else {
        var originalCSS = type === 'css' ? getCSSValue(target, prop) : undef;
        valid.from = getValidValue(values, values.from, originalCSS);
        valid.to = getValidValue(values, values.to, originalCSS);
      }
      return {
        from: decomposeValue(valid.from),
        to: decomposeValue(valid.to)
      };
    },
    getTweensProps = function(animatables, props) {
      var tweensProps = [];
      animatables.forEach(function(animatable, i) {
        var target = animatable.target;
        return props.forEach(function(prop) {
          var animType = getAnimationType(target, prop.name);
          if (animType) {
            var values = getPropertiesValues(target, prop.name, prop.value, i),
              tween = Object.create(prop);
            tween.animatables = animatable;
            tween.type = animType;
            tween.from = getTweenValues(prop.name, values, tween.type, target).from;
            tween.to = getTweenValues(prop.name, values, tween.type, target).to;
            tween.round = is.color(values.from) || tween.round ? 1 : 0;
            tween.delay = (is.func(tween.delay) ? tween.delay(target, i, animatables.length) : tween.delay) / animation.speed;
            tween.duration = (is.func(tween.duration) ? tween.duration(target, i, animatables.length) : tween.duration) / animation.speed;
            tweensProps.push(tween);
          }
        });
      });
      return tweensProps;
    }, // Tweens
    getTweens = function(animatables, props) {
      var tweensProps = getTweensProps(animatables, props),
        splittedProps = groupArrayByProps(tweensProps, ['name', 'from', 'to', 'delay', 'duration']);
      return splittedProps.map(function(tweenProps) {
        var tween = Object.create(tweenProps[0]);
        tween.animatables = tweenProps.map(function(p) {
          return p.animatables;
        });
        tween.totalDuration = tween.delay + tween.duration;
        return tween;
      });
    },
    reverseTweens = function(anim, delays) {
      anim.tweens.forEach(function(tween) {
        var toVal = tween.to,
          fromVal = tween.from,
          delayVal = anim.duration - (tween.delay + tween.duration);
        tween.from = toVal;
        tween.to = fromVal;
        if (delays) tween.delay = delayVal;
      });
      anim.reversed = !!anim.reversed;
    },
    getTweensDuration = function(tweens) {
      if (tweens.length) return Math.max.apply(Math, tweens.map(function(tween) {
        return tween.totalDuration;
      }));
    }, // will-change
    getWillChange = function(anim) {
      var props = [],
        els = [];
      anim.tweens.forEach(function(tween) {
        if (tween.type === 'css' || tween.type === 'transform') {
          props.push(tween.type === 'css' ? stringToHyphens(tween.name) : 'transform');
          tween.animatables.forEach(function(animatable) {
            return els.push(animatable.target);
          });
        }
      });
      return {
        properties: dropArrDupes(props).join(', '),
        elements: dropArrDupes(els)
      };
    },
    setWillChange = function(anim) {
      var willChange = getWillChange(anim);
      willChange.elements.forEach(function(element) {
        return element.style.willChange = willChange.properties;
      });
    },
    removeWillChange = function(anim) {
      getWillChange(anim).elements.forEach(function(element) {
        return element.style.removeProperty('will-change');
      });
    },
    /* Svg path */ getPathProps = function(path) {
      var el = is.string(path) ? selectString(path)[0] : path;
      return {
        path: el,
        value: el.getTotalLength()
      };
    },
    snapProgressToPath = function(tween, progress) {
      var pathEl = tween.path,
        pathProgress = tween.value * progress,
        point = function(offset) {
          return pathEl.getPointAtLength(progress > 1 ? tween.value + (offset || 0) : pathProgress + (offset || 0));
        },
        p = point(),
        p0 = point(-1),
        p1 = point(+1),
        twnm = tween.name;
      return twnm === 'translateX' ? p.x : twnm === 'translateY' ? p.y : twnm === 'rotate' ? Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI : undef;
    }, // Progress
    getTweenProgress = function(tween, time) {
      var elapsed = Math.min(Math.max(time - tween.delay, 0), tween.duration),
        percent = elapsed / tween.duration,
        progress = tween.to.numbers.map(function(number, p) {
          var start = tween.from.numbers[p],
            eased = easings[tween.easing](percent, tween.elasticity),
            val = tween.path ? snapProgressToPath(tween, eased) : start + eased * (number - start);
          return tween.round ? Math.round(val * tween.round) / tween.round : val;
        });
      return recomposeValue(progress, tween.to.strings, tween.from.strings);
    },
    setAnimationProgress = function(anim, time) {
      var transforms = {}; //anim.time = Math.min(time, anim.duration);
      //anim.progress = (anim.time / anim.duration) * 100;
      anim.currentTime = time;
      anim.progress = Math.min(Math.max(time, 0), anim.duration) / anim.duration * 100;
      anim.tweens.forEach(function(tween) {
        tween.currentValue = getTweenProgress(tween, anim.currentTime);
        var progress = tween.currentValue;
        tween.animatables.forEach(function(animatable) {
          var id = animatable.id,
            tname = tween.name,
            target = animatable.target;
          switch (tween.type) {
            case 'css':
              target.style[tname] = progress;
              break;
            case 'attribute':
              target.setAttribute(tname, progress);
              break;
            case 'object':
              target[tname] = progress;
              break;
            case 'transform':
              if (!transforms) transforms = {};
              if (!transforms[id]) transforms[id] = [];
              transforms[id].push(progress);
              break;
          }
        });
      });
      if (transforms)
        for (var t in transforms) {
          anim.animatables[t].target.style.transform = transforms[t].join(' ');
        } // for (let t in transforms) anim.animatables[t].target.style[transform] = transforms[t].join(' ');
      emit('update', anim);
    }, // Animation
    createAnimation = function(params) {
      var anim = {
        animatables: getAnimatables(params.targets),
        settings: mergeObjs(params, defaultSettings),
        currentTime: 0,
        progress: 0,
        started: false,
        ended: false
      };
      anim.properties = getProperties(params, anim.settings);
      anim.tweens = getTweens(anim.animatables, anim.properties);
      anim.duration = getTweensDuration(anim.tweens) || params.duration;
      return eventsys(anim);
    },
    animations = new Set(),
    engine = {
      raf: 0,
      play: function() {
        engine.raf = requestAnimationFrame(engine.step);
      },
      step: function(time) {
        if (animations.size) {
          animations.forEach(function(anim) {
            return anim.tick(time);
          });
          engine.play();
        } else {
          cancelAnimationFrame(engine.raf);
          engine.raf = 0;
        }
      }
    },
    events = ['complete', 'begin', 'update'],
    animation = function(params, autostop) {
      var time = {},
        anim = createAnimation(params);
      if (autostop) anim.settings.autoplay = false;
      events.forEach(function(type) {
        if (is.func(anim.settings[type])) anim[includes(type, 'update', 'interloop') ? 'on' : 'once'](type, anim.settings[type]);
        Object.defineProperty(anim, type, {
          get: function() {
            return anim.once(type);
          },
          set: function(fn) {
            if (is.func(fn)) anim[includes(type, 'update', 'interloop') ? 'on' : 'once'](type, fn);
          }
        });
      });
      anim.tick = function(now) {
        anim.ended = false;
        if (!time.start) time.start = now;
        time.current = Math.min(Math.max(time.last + now - time.start, 0), anim.duration);
        var s = anim.settings;
        setAnimationProgress(anim, time.current);
        if (time.current >= anim.duration) {
          if (s.loop) {
            time.start = now;
            if (s.direction === 'alternate') reverseTweens(anim, true);
            if (is.number(s.loop)) s.loop--;
            emit('interloop', anim);
          } else {
            anim.ended = true;
            anim.pause(true);
            emit('complete', anim);
          }
          emit('begin', anim);
          time.last = 0;
        }
      };
      anim.seek = function(progress) {
        return setAnimationProgress(anim, progress / 100 * anim.duration);
      };
      anim.pause = function(internal) {
        if (!internal) emit('pause', anim);
        time.start = 0;
        removeWillChange(anim);
        animations.delete(anim);
        return anim;
      };
      anim.play = function(params) {
        if (params) anim = mergeObjs(createAnimation(mergeObjs(params, anim.settings)), anim); //time.start = performance.now();
        time.start = 0;
        time.last = anim.ended ? 0 : anim.currentTime;
        var s = anim.settings;
        if (s.direction === 'reverse') reverseTweens(anim);
        if (s.direction === 'alternate' && !s.loop) s.loop = 1;
        setWillChange(anim);
        animations.add(anim);
        if (engine.raf == 0) engine.play();
        return anim;
      };
      anim.restart = function() {
        if (anim.reversed) reverseTweens(anim);
        emit('restart', anim);
        anim.pause(true);
        anim.seek(0);
        return anim.play();
      };
      if (anim.settings.autoplay) anim.play();
      return anim;
    }; // Strings
  // Public
  animation.all = function(event) {
    return Promise.all(flattenArr(arguments).slice(1).map(function(anim) {
      return anim.once(event);
    }));
  };

  function chaindo(chain, event, action) {
    var actionfn = false;
    if (is.func(action)) actionfn = true;
    if (event == true) chain.anims.forEach(function(anim) {
      actionfn ? action(anim) : anim[action]();
    });
    var next = function(i) {
      return function() {
        if (chain.anims[i]) {
          actionfn ? action(chain.anims[i]) : chain.anims[i][action]();
          chain.anims[i].once(event, next(i == 0 ? 1 : i + 1));
        }
        return chain;
      };
    };
    return next(0)();
  }
  animation.chain = function() {
    var anims = flattenArr(arguments),
      chain = {
        anims: anims,
        paused: false,
        play: function() {
          if (chain.paused) chain.paused = false;
          return chaindo(chain, chain.paused || 'complete', 'play');
        },
        pause: function() {
          return chaindo(chain, chain.paused = true, 'pause');
        },
        restart: function() {
          return chaindo(chain, 'complete', 'restart');
        },
        add: function() {
          chain.anims = chain.anims.concat(flattenArr(arguments));
          chain.anims.forEach(function(anim) {
            anim.pause(true);
            anim.seek(0);
          });
          return chain;
        },
        remove: function(anim) {
          if (includes(chain.anims, anim)) chain.anims = chain.anims.filter(function(a) {
            return !Object.is(anim, a);
          });
          chain.anims.forEach(function(anim) {
            anim.pause(true);
            anim.seek(0);
          });
          return chain;
        },
        Do: function(event, action) {
          return chaindo(chain.anims, event, action, chain);
        }
      };
    return chain;
  }; // Remove on one or multiple targets from all active animations.
  animation.remove = function(targets) {
    targets = filterTargets(targets);
    animations.forEach(function(animation) {
      animation.tweens.forEach(function(tween, t) {
        for (var a = tween.animatables.length - 1; a >= 0; a--) {
          if (includes(targets, tween.animatables[a].target)) {
            tween.animatables.splice(a, 1);
            if (!tween.animatables.length) animation.tweens.splice(t, 1);
            if (!animation.tweens.length) animation.pause(true);
          }
        }
      });
    });
  };
  animation.speed = 1;
  animation.list = animations;
  animation.easings = easings;
  animation.getValue = getInitialTargetValue;
  animation.path = getPathProps;
  animation.random = random;
  animation.curry = curry;
  animation.includes = includes;
  animation.mergeObjs = mergeObjs;
  animation.flattenArr = flattenArr;
  animation.dropArrDupes = dropArrDupes;
  animation.eventsys = eventsys;
  animation.version = "1.2.0";
  return animation;
});