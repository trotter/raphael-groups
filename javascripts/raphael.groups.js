(function () {
    var R = Raphael,
        Set = R.st,
        proto = 'prototype',
        has = 'hasOwnProperty',
        push = 'push',
        length = 'length',
        string = 'string',
        array = 'array';

    var Group = function (raphael, items) {
        this.r = raphael;
        this.set = this.r.set(items);
        this.items = this.set; // For treating the set as a list of items
        this.type = 'Group';
    };

    for (var method in Set) if (Set[has](method)) {
      Group.prototype[method] = (function (methodname) {
        return function () {
          this.set[methodname].apply(this.set, arguments);
          return this;
        };
      })(method);
    }

    var offsetX = function (item, box) {
      return item.attr('x') - box.x;
    };

    var offsetY = function (item, box) {
      return item.attr('y') - box.y;
    };

    var cloneObject = function (obj) {
      var ret = {};
      for (key in obj) {
        ret[key] = obj[key];
      }
      return ret;
    };

    var relativeAttrs = function (item, attrs, box) {
      var tmp = cloneObject(attrs);
      if (tmp.x) {
          tmp.x += offsetX(item, box);
      }
      if (tmp.y) {
          tmp.y += offsetY(item, box);
      }
      if (tmp.rotation) {
        if (R.is(tmp.rotation, array) || R.is(tmp.rotation, "object")) {
          // Don't handle an array yet
        } else {
          var center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
          tmp.rotation = [tmp.rotation, center.x, center.y];
        }
      }
      return tmp;
    }

    Group[proto].attr = function (name, value) {
        var self = this,
            box = this.set.getBBox();
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            this.set(name);
        } else {
            for (var i = 0, ii = this.items[length]; i < ii; i++) {
                if (name === 'x') {
                  value += offsetX(this.items[i], box);
                }
                if (name === 'y') {
                  value += offsetY(this.items[i], box);
                }
                if (R.is(name, "object")) {
                  this.items[i].attr(relativeAttrs(this.items[i], name, box));
                } else {
                  this.items[i].attr(name, value);
                }
            }
        }
        return this;
    }

    Group[proto].animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items[length],
            i = len,
            item,
            set = this.set,
            box = this.set.getBBox(),
            collector;
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        item = this.items[--i].animate(relativeAttrs(this.items[i], params, box), ms, easing, collector);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, relativeAttrs(this.items[i], params, box), ms, easing, collector);
        }
        return this;
    };

    R.fn.group = function (items) {
        return new Group(this, items);
    }
})();
