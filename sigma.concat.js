// Define packages:
var sigma = {};
sigma.tools = {};
sigma.classes = {};
sigma.instances = {};

// Adding Array helpers, if not present yet:
(function() {
  if (!Array.prototype.some) {
    Array.prototype.some = function(fun /*, thisp*/) {
      var len = this.length;
      if (typeof fun != 'function') {
        throw new TypeError();
      }

      var thisp = arguments[1];
      for (var i = 0; i < len; i++) {
        if (i in this &&
            fun.call(thisp, this[i], i, this)) {
          return true;
        }
      }

      return false;
    };
  }

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fun /*, thisp*/) {
      var len = this.length;
      if (typeof fun != 'function') {
        throw new TypeError();
      }

      var thisp = arguments[1];
      for (var i = 0; i < len; i++) {
        if (i in this) {
          fun.call(thisp, this[i], i, this);
        }
      }
    };
  }

  if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp*/) {
      var len = this.length;
      if (typeof fun != 'function') {
        throw new TypeError();
      }

      var res = new Array(len);
      var thisp = arguments[1];
      for (var i = 0; i < len; i++) {
        if (i in this) {
          res[i] = fun.call(thisp, this[i], i, this);
        }
      }

      return res;
    };
  }

  if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp*/) {
      var len = this.length;
      if (typeof fun != 'function')
        throw new TypeError();

      var res = new Array();
      var thisp = arguments[1];
      for (var i = 0; i < len; i++) {
        if (i in this) {
          var val = this[i]; // in case fun mutates this
          if (fun.call(thisp, val, i, this)) {
            res.push(val);
          }
        }
      }

      return res;
    };
  }

  if (!Object.keys) {
    Object.keys = (function() {
      var hasOwnProperty = Object.prototype.hasOwnProperty,
          hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
          dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
          ],
          dontEnumsLength = dontEnums.length;

      return function(obj) {
        if (typeof obj !== 'object' &&
            typeof obj !== 'function' ||
            obj === null
        ) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [];

        for (var prop in obj) {
          if (hasOwnProperty.call(obj, prop)) result.push(prop);
        }

        if (hasDontEnumBug) {
          for (var i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      }
    })();
  }
})();

/**
 * A jQuery like properties management class. It works like jQuery .css()
 * method: You can call it with juste one string to get the corresponding
 * property, with a string and anything else to set the corresponding property,
 * or directly with an object, and then each pair string / object (or any type)
 * will be set in the properties.
 * @constructor
 * @this {sigma.classes.Cascade}
 */
sigma.classes.Cascade = function() {
  /**
   * This instance properties.
   * @protected
   * @type {Object}
   */
  this.p = {};

  /**
   * The method to use to set/get any property of this instance.
   * @param  {(string|Object)} a1 If it is a string and if a2 is undefined,
   *                              then it will return the corresponding
   *                              property.
   *                              If it is a string and if a2 is set, then it
   *                              will set a2 as the property corresponding to
   *                              a1, and return this.
   *                              If it is an object, then each pair string /
   *                              object (or any other type) will be set as a
   *                              property.
   * @param  {*?} a2              The new property corresponding to a1 if a1 is
   *                              a string.
   * @return {(*|sigma.classes.Cascade)} Returns itself or the corresponding
   *                                     property.
   */
  this.config = function(a1, a2) {
    if (typeof a1 == 'string' && a2 == undefined) {
      return this.p[a1];
    } else {
      var o = (typeof a1 == 'object' && a2 == undefined) ? a1 : {};
      if (typeof a1 == 'string') {
        o[a1] = a2;
      }

      for (var k in o) {
        if (this.p[k] != undefined) {
          this.p[k] = o[k];
        }
      }
      return this;
    }
  };
};

/**
 * sigma.js custom event dispatcher class.
 * @constructor
 * @this {sigma.classes.EventDispatcher}
 */
sigma.classes.EventDispatcher = function() {
  /**
   * An object containing all the different handlers bound to one or many
   * events, indexed by these events.
   * @private
   * @type {Object.<string,Object>}
   */
  var _h = {};

  /**
   * Represents "this", without the well-known scope issue.
   * @private
   * @type {sigma.classes.EventDispatcher}
   */
  var _self = this;

  /**
   * Will execute the handler the next (and only the next) time that the
   * indicated event (or the indicated events) will be triggered.
   * @param  {string} events            The name of the event (or the events
   *                                    separated by spaces).
   * @param  {function(Object)} handler The handler to bind.
   * @return {sigma.classes.EventDispatcher} Returns itself.
   */
  function one(events, handler) {
    if (!handler || !events) {
      return _self;
    }

    var eArray = ((typeof events) == 'string') ? events.split(' ') : events;

    eArray.forEach(function(event) {
      if (!_h[event]) {
        _h[event] = [];
      }

      _h[event].push({
        'h': handler,
        'one': true
      });
    });

    return _self;
  }

  /**
   * Will execute the handler everytime that the indicated event (or the
   * indicated events) will be triggered.
   * @param  {string} events            The name of the event (or the events
   *                                    separated by spaces).
   * @param  {function(Object)} handler The handler to bind.
   * @return {sigma.classes.EventDispatcher} Returns itself.
   */
  function bind(events, handler) {
    if (!handler || !events) {
      return _self;
    }

    var eArray = ((typeof events) == 'string') ? events.split(' ') : events;

    eArray.forEach(function(event) {
      if (!_h[event]) {
        _h[event] = [];
      }

      _h[event].push({
        'h': handler,
        'one': false
      });
    });

    return _self;
  }

  /**
   * Unbinds the handler from a specified event (or specified events).
   * @param  {?string} events            The name of the event (or the events
   *                                     separated by spaces). If undefined,
   *                                     then all handlers are unbound.
   * @param  {?function(Object)} handler The handler to unbind. If undefined,
   *                                     each handler bound to the event or the
   *                                     events will be unbound.
   * @return {sigma.classes.EventDispatcher} Returns itself.
   */
  function unbind(events, handler) {
    if (!events) {
      _h = {};
    }

    var eArray = typeof events == 'string' ? events.split(' ') : events;

    if (handler) {
      eArray.forEach(function(event) {
        if (_h[event]) {
          _h[event] = _h[event].filter(function(e) {
            return e['h'] != handler;
          });
        }

        if (_h[event] && _h[event].length == 0) {
          delete _h[event];
        }
      });
    }else {
      eArray.forEach(function(event) {
        delete _h[event];
      });
    }

    return _self;
  }

  /**
   * Executes each handler bound to the event
   * @param  {string} type     The type of the event.
   * @param  {?Object} content The content of the event (optional).
   * @return {sigma.classes.EventDispatcher} Returns itself.
   */
  function dispatch(type, content) {
    if (_h[type]) {
      _h[type].forEach(function(e) {
        e['h']({
          'type': type,
          'content': content,
          'target': _self
        });
      });

      _h[type] = _h[type].filter(function(e) {
        return !e['one'];
      });
    }

    return _self;
  }

  /* PUBLIC INTERFACE: */
  this.one = one;
  this.bind = bind;
  this.unbind = unbind;
  this.dispatch = dispatch;
};

(function() {
// Define local shortcut:
var id = 0;

// Define local package:
var local = {};
local.plugins = [];

sigma.init = function(dom) {
  var inst = new Sigma(dom, (++id).toString());
  sigma.instances[id] = new SigmaPublic(inst);
  return sigma.instances[id];
};

/**
 * The graph data model used in sigma.js.
 * @constructor
 * @extends sigma.classes.Cascade
 * @extends sigma.classes.EventDispatcher
 * @this {Graph}
 */
function Graph() {
  sigma.classes.Cascade.call(this);
  sigma.classes.EventDispatcher.call(this);

  /**
   * Represents "this", without the well-known scope issue.
   * @private
   * @type {Graph}
   */
  var self = this;

  /**
   * The different parameters that determine how the nodes and edges should be
   * translated and rescaled.
   * @type {Object}
   */
  this.p = {
    minNodeSize: 0,
    maxNodeSize: 0,
    minEdgeSize: 0,
    maxEdgeSize: 0,
    //   Scaling mode:
    //   - 'inside' (default)
    //   - 'outside'
    scalingMode: 'inside',
    nodesPowRatio: 0.5,
    edgesPowRatio: 0
  };

  /**
   * Contains the borders of the graph. These are useful to avoid the user to
   * drag the graph out of the canvas.
   * @type {Object}
   */
  this.borders = {};

  /**
   * Inserts a node in the graph.
   * @param {string} id     The node's ID.
   * @param {object} params An object containing the different parameters
   *                        of the node.
   * @return {Graph} Returns itself.
   */
  function addNode(id, params) {
    if (self.nodesIndex[id]) {
      throw new Error('Node "' + id + '" already exists.');
    }

    params = params || {};
    var n = {
      // Numbers :
      'x': 0,
      'y': 0,
      'size': 1,
      'degree': 0,
      'inDegree': 0,
      'outDegree': 0,
      // Flags :
      'fixed': false,
      'active': false,
      'hidden': false,
      'forceLabel': false,
      // Strings :
      'label': id.toString(),
      'id': id.toString(),
      // Custom attributes :
      'attr': {}
    };

    for (var k in params) {
      switch (k) {
        case 'id':
          break;
        case 'x':
        case 'y':
        case 'size':
        case 'forceLabel':
          n[k] = +params[k];
          break;
        case 'fixed':
        case 'active':
        case 'hidden':
          n[k] = !!params[k];
          break;
        case 'color':
        case 'label':
          n[k] = params[k];
          break;
        default:
          n['attr'][k] = params[k];
      }
    }

    self.nodes.push(n);
    self.nodesIndex[id.toString()] = n;

    return self;
  };

  /**
   * Generates the clone of a node, to make it easier to be exported.
   * @private
   * @param  {Object} node The node to clone.
   * @return {Object} The clone of the node.
   */
  function cloneNode(node) {
    return {
      'x': node['x'],
      'y': node['y'],
      'size': node['size'],
      'degree': node['degree'],
      'inDegree': node['inDegree'],
      'outDegree': node['outDegree'],
      'displayX': node['displayX'],
      'displayY': node['displayY'],
      'displaySize': node['displaySize'],
      'label': node['label'],
      'id': node['id'],
      'color': node['color'],
      'fixed': node['fixed'],
      'active': node['active'],
      'hidden': node['hidden'],
      'forceLabel': node['forceLabel'],
      'attr': node['attr']
    };
  };

  /**
   * Checks the clone of a node, and inserts its values when possible. For
   * example, it is possible to modify the size or the color of a node, but it
   * is not possible to modify its display values or its id.
   * @private
   * @param  {Object} node The original node.
   * @param  {Object} copy The clone.
   * @return {Graph} Returns itself.
   */
  function checkNode(node, copy) {
    for (var k in copy) {
      switch (k) {
        case 'id':
        case 'attr':
        case 'degree':
        case 'inDegree':
        case 'outDegree':
        case 'displayX':
        case 'displayY':
        case 'displaySize':
          break;
        case 'x':
        case 'y':
        case 'size':
        case 'forceLabel':
          node[k] = +copy[k];
          break;
        case 'fixed':
        case 'active':
        case 'hidden':
          node[k] = !!copy[k];
          break;
        case 'color':
        case 'label':
          node[k] = (copy[k] || '').toString();
          break;
        default:
          node['attr'][k] = copy[k];
      }
    }

    return self;
  };

  /**
   * Deletes one or several nodes from the graph, and the related edges.
   * @param  {(string|Array.<string>)} v A string ID, or an Array of several
   *                                     IDs.
   * @return {Graph} Returns itself.
   */
  function dropNode(v) {
    var a = (v instanceof Array ? v : [v]) || [];
    var nodesIdsToRemove = {};

    // Create hash to make lookups faster
    a.forEach(function(id) {
      if (self.nodesIndex[id]) {
        nodesIdsToRemove[id] = true;
      } else {
        sigma.log('Node "' + id + '" does not exist.');
      }
    });

    var indexesToRemove = [];
    self.nodes.forEach(function(n, i) {
      if (n['id'] in nodesIdsToRemove) {
        // Add to front, so we have a reverse-sorted list
        indexesToRemove.unshift(i);
        // No edges means we are done
        if (n['degree'] == 0) {
          delete nodesIdsToRemove[n['id']];
        }
      }
    });

    indexesToRemove.forEach(function(index) {
      self.nodes.splice(index, 1);
    });

    self.edges = self.edges.filter(function(e) {
      if (e['source']['id'] in nodesIdsToRemove) {
        delete self.edgesIndex[e['id']];
        e['target']['degree']--;
        e['target']['inDegree']--;
        return false;
      }else if (e['target']['id'] in nodesIdsToRemove) {
        delete self.edgesIndex[e['id']];
        e['source']['degree']--;
        e['source']['outDegree']--;
        return false;
      }
      return true;
    });

    return self;
  };

  /**
   * Inserts an edge in the graph.
   * @param {string} id     The edge ID.
   * @param {string} source The ID of the edge source.
   * @param {string} target The ID of the edge target.
   * @param {object} params An object containing the different parameters
   *                        of the edge.
   * @return {Graph} Returns itself.
   */
  function addEdge(id, source, target, params) {
    if (self.edgesIndex[id]) {
      throw new Error('Edge "' + id + '" already exists.');
    }

    if (!self.nodesIndex[source]) {
      var s = 'Edge\'s source "' + source + '" does not exist yet.';
      throw new Error(s);
    }

    if (!self.nodesIndex[target]) {
      var s = 'Edge\'s target "' + target + '" does not exist yet.';
      throw new Error(s);
    }

    params = params || {};
    var e = {
      'source': self.nodesIndex[source],
      'target': self.nodesIndex[target],
      'size': 1,
      'weight': 1,
      'displaySize': 0.5,
      'label': id.toString(),
      'id': id.toString(),
      'hidden': false,
      'attr': {}
    };

    e['source']['degree']++;
    e['source']['outDegree']++;
    e['target']['degree']++;
    e['target']['inDegree']++;

    for (var k in params) {
      switch (k) {
        case 'id':
        case 'source':
        case 'target':
          break;
        case 'hidden':
          e[k] = !!params[k];
          break;
        case 'size':
        case 'weight':
          e[k] = +params[k];
          break;
        case 'color':
          e[k] = params[k].toString();
          break;
        case 'type':
          e[k] = params[k].toString();
          break;
        case 'label':
          e[k] = params[k];
          break;
        default:
          e['attr'][k] = params[k];
      }
    }

    self.edges.push(e);
    self.edgesIndex[id.toString()] = e;

    return self;
  };

  /**
   * Generates the clone of a edge, to make it easier to be exported.
   * @private
   * @param  {Object} edge The edge to clone.
   * @return {Object} The clone of the edge.
   */
  function cloneEdge(edge) {
    return {
      'source': edge['source']['id'],
      'target': edge['target']['id'],
      'size': edge['size'],
      'type': edge['type'],
      'weight': edge['weight'],
      'displaySize': edge['displaySize'],
      'label': edge['label'],
      'hidden': edge['hidden'],
      'id': edge['id'],
      'attr': edge['attr'],
      'color': edge['color']
    };
  };

  /**
   * Checks the clone of an edge, and inserts its values when possible. For
   * example, it is possible to modify the label or the type of an edge, but it
   * is not possible to modify its display values or its id.
   * @private
   * @param  {Object} edge The original edge.
   * @param  {Object} copy The clone.
   * @return {Graph} Returns itself.
   */
  function checkEdge(edge, copy) {
    for (var k in copy) {
      switch (k) {
        case 'id':
        case 'displaySize':
          break;
        case 'weight':
        case 'size':
          edge[k] = +copy[k];
          break;
        case 'source':
        case 'target':
          edge[k] = self.nodesIndex[k] || edge[k];
          break;
        case 'hidden':
          edge[k] = !!copy[k];
          break;
        case 'color':
        case 'label':
        case 'type':
          edge[k] = (copy[k] || '').toString();
          break;
        default:
          edge['attr'][k] = copy[k];
      }
    }

    return self;
  };

  /**
   * Deletes one or several edges from the graph.
   * @param  {(string|Array.<string>)} v A string ID, or an Array of several
   *                                     IDs.
   * @return {Graph} Returns itself.
   */
  function dropEdge(v) {
    var a = (v instanceof Array ? v : [v]) || [];

    a.forEach(function(id) {
      if (self.edgesIndex[id]) {
        self.edgesIndex[id]['source']['degree']--;
        self.edgesIndex[id]['source']['outDegree']--;
        self.edgesIndex[id]['target']['degree']--;
        self.edgesIndex[id]['target']['inDegree']--;

        var index = null;
        self.edges.some(function(n, i) {
          if (n['id'] == id) {
            index = i;
            return true;
          }
          return false;
        });

        index != null && self.edges.splice(index, 1);
        delete self.edgesIndex[id];
      }else {
        sigma.log('Edge "' + id + '" does not exist.');
      }
    });

    return self;
  };

  /**
   * Deletes every nodes and edges from the graph.
   * @return {Graph} Returns itself.
   */
  function empty() {
    self.nodes = [];
    self.nodesIndex = {};
    self.edges = [];
    self.edgesIndex = {};

    return self;
  };

  /**
   * Computes the display x, y and size of each node, relatively to the
   * original values and the borders determined in the parameters, such as
   * each node is in the described area.
   * @param  {number} w           The area width (actually the width of the DOM
   *                              root).
   * @param  {number} h           The area height (actually the height of the
   *                              DOM root).
   * @param  {boolean} parseNodes Indicates if the nodes have to be parsed.
   * @param  {boolean} parseEdges Indicates if the edges have to be parsed.
   * @return {Graph} Returns itself.
   */
  function rescale(w, h, parseNodes, parseEdges) {
    var weightMax = 0, sizeMax = 0;

    parseNodes && self.nodes.forEach(function(node) {
      sizeMax = Math.max(node['size'], sizeMax);
    });

    parseEdges && self.edges.forEach(function(edge) {
      weightMax = Math.max(edge['size'], weightMax);
    });

    sizeMax = sizeMax || 1;
    weightMax = weightMax || 1;

    // Recenter the nodes:
    var xMin, xMax, yMin, yMax;
    parseNodes && self.nodes.forEach(function(node) {
      xMax = Math.max(node['x'], xMax || node['x']);
      xMin = Math.min(node['x'], xMin || node['x']);
      yMax = Math.max(node['y'], yMax || node['y']);
      yMin = Math.min(node['y'], yMin || node['y']);
    });

    // First, we compute the scaling ratio, without considering the sizes
    // of the nodes : Each node will have its center in the canvas, but might
    // be partially out of it.
    var scale = self.p.scalingMode == 'outside' ?
                Math.max(w / Math.max(xMax - xMin, 1),
                         h / Math.max(yMax - yMin, 1)) :
                Math.min(w / Math.max(xMax - xMin, 1),
                         h / Math.max(yMax - yMin, 1));

    // Then, we correct that scaling ratio considering a margin, which is
    // basically the size of the biggest node.
    // This has to be done as a correction since to compare the size of the
    // biggest node to the X and Y values, we have to first get an
    // approximation of the scaling ratio.
    var margin = (self.p.maxNodeSize || sizeMax) / scale;
    xMax += margin;
    xMin -= margin;
    yMax += margin;
    yMin -= margin;

    scale = self.p.scalingMode == 'outside' ?
            Math.max(w / Math.max(xMax - xMin, 1),
                     h / Math.max(yMax - yMin, 1)) :
            Math.min(w / Math.max(xMax - xMin, 1),
                     h / Math.max(yMax - yMin, 1));

    // Size homothetic parameters:
    var a, b;
    if (!self.p.maxNodeSize && !self.p.minNodeSize) {
      a = 1;
      b = 0;
    }else if (self.p.maxNodeSize == self.p.minNodeSize) {
      a = 0;
      b = self.p.maxNodeSize;
    }else {
      a = (self.p.maxNodeSize - self.p.minNodeSize) / sizeMax;
      b = self.p.minNodeSize;
    }

    var c, d;
    if (!self.p.maxEdgeSize && !self.p.minEdgeSize) {
      c = 1;
      d = 0;
    }else if (self.p.maxEdgeSize == self.p.minEdgeSize) {
      c = 0;
      d = self.p.minEdgeSize;
    }else {
      c = (self.p.maxEdgeSize - self.p.minEdgeSize) / weightMax;
      d = self.p.minEdgeSize;
    }

    // Rescale the nodes:
    parseNodes && self.nodes.forEach(function(node) {
      node['displaySize'] = node['size'] * a + b;

      if (!node['fixed']) {
        node['displayX'] = (node['x'] - (xMax + xMin) / 2) * scale + w / 2;
        node['displayY'] = (node['y'] - (yMax + yMin) / 2) * scale + h / 2;
      }
    });

    parseEdges && self.edges.forEach(function(edge) {
      edge['displaySize'] = edge['size'] * c + d;
    });

    return self;
  };

  /**
   * Translates the display values of the nodes and edges relatively to the
   * scene position and zoom ratio.
   * @param  {number} sceneX      The x position of the scene.
   * @param  {number} sceneY      The y position of the scene.
   * @param  {number} ratio       The zoom ratio of the scene.
   * @param  {boolean} parseNodes Indicates if the nodes have to be parsed.
   * @param  {boolean} parseEdges Indicates if the edges have to be parsed.
   * @return {Graph} Returns itself.
   */
  function translate(sceneX, sceneY, ratio, parseNodes, parseEdges) {
    var sizeRatio = Math.pow(ratio, self.p.nodesPowRatio);
    parseNodes && self.nodes.forEach(function(node) {
      if (!node['fixed']) {
        node['displayX'] = node['displayX'] * ratio + sceneX;
        node['displayY'] = node['displayY'] * ratio + sceneY;
      }

      node['displaySize'] = node['displaySize'] * sizeRatio;
    });

    sizeRatio = Math.pow(ratio, self.p.edgesPowRatio);
    parseEdges && self.edges.forEach(function(edge) {
      edge['displaySize'] = edge['displaySize'] * sizeRatio;
    });

    return self;
  };

  /**
   * Determines the borders of the graph as it will be drawn. It is used to
   * avoid the user to drag the graph out of the canvas.
   */
  function setBorders() {
    self.borders = {};

    self.nodes.forEach(function(node) {
      self.borders.minX = Math.min(
        self.borders.minX == undefined ?
          node['displayX'] - node['displaySize'] :
          self.borders.minX,
        node['displayX'] - node['displaySize']
      );

      self.borders.maxX = Math.max(
        self.borders.maxX == undefined ?
          node['displayX'] + node['displaySize'] :
          self.borders.maxX,
        node['displayX'] + node['displaySize']
      );

      self.borders.minY = Math.min(
        self.borders.minY == undefined ?
          node['displayY'] - node['displaySize'] :
          self.borders.minY,
        node['displayY'] - node['displaySize']
      );

      self.borders.maxY = Math.max(
        self.borders.maxY == undefined ?
          node['displayY'] - node['displaySize'] :
          self.borders.maxY,
        node['displayY'] - node['displaySize']
      );
    });
  }

  /**
   * Checks which nodes are under the (mX, mY) points, representing the mouse
   * position.
   * @param  {number} mX The mouse X position.
   * @param  {number} mY The mouse Y position.
   * @return {Graph} Returns itself.
   */
  function checkHover(mX, mY) {
    var dX, dY, s, over = [], out = [];
    self.nodes.forEach(function(node) {
      if (node['hidden']) {
        node['hover'] = false;
        return;
      }

      dX = Math.abs(node['displayX'] - mX);
      dY = Math.abs(node['displayY'] - mY);
      s = node['displaySize'];

      var oldH = node['hover'];
      var newH = dX < s && dY < s && Math.sqrt(dX * dX + dY * dY) < s;

      if (oldH && !newH) {
        node['hover'] = false;
        out.push(node.id);
      } else if (newH && !oldH) {
        node['hover'] = true;
        over.push(node.id);
      }
    });

    over.length && self.dispatch('overnodes', over);
    out.length && self.dispatch('outnodes', out);

    return self;
  };

  /**
   * Applies a function to a clone of each node (or indicated nodes), and then
   * tries to apply the modifications made on the clones to the original nodes.
   * @param  {function(Object)} fun The function to execute.
   * @param  {?Array.<string>} ids  An Array of node IDs (optional).
   * @return {Graph} Returns itself.
   */
  function iterNodes(fun, ids) {
    var a = ids ? ids.map(function(id) {
      return self.nodesIndex[id];
    }) : self.nodes;

    var aCopies = a.map(cloneNode);
    aCopies.forEach(fun);

    a.forEach(function(n, i) {
      checkNode(n, aCopies[i]);
    });

    return self;
  };

  /**
   * Applies a function to a clone of each edge (or indicated edges), and then
   * tries to apply the modifications made on the clones to the original edges.
   * @param  {function(Object)} fun The function to execute.
   * @param  {?Array.<string>} ids  An Array of edge IDs (optional).
   * @return {Graph} Returns itself.
   */
  function iterEdges(fun, ids) {
    var a = ids ? ids.map(function(id) {
      return self.edgesIndex[id];
    }) : self.edges;

    var aCopies = a.map(cloneEdge);
    aCopies.forEach(fun);

    a.forEach(function(e, i) {
      checkEdge(e, aCopies[i]);
    });

    return self;
  };

  /**
   * Returns a specific node clone or an array of specified node clones.
   * @param  {(string|Array.<string>)} ids The ID or an array of node IDs.
   * @return {(Object|Array.<Object>)} The clone or the array of clones.
   */
  function getNodes(ids) {
    var a = ((ids instanceof Array ? ids : [ids]) || []).map(function(id) {
      return cloneNode(self.nodesIndex[id]);
    });

    return (ids instanceof Array ? a : a[0]);
  };

  /**
   * Returns a specific edge clone or an array of specified edge clones.
   * @param  {(string|Array.<string>)} ids The ID or an array of edge IDs.
   * @return {(Object|Array.<Object>)} The clone or the array of clones.
   */
  function getEdges(ids) {
    var a = ((ids instanceof Array ? ids : [ids]) || []).map(function(id) {
      return cloneEdge(self.edgesIndex[id]);
    });

    return (ids instanceof Array ? a : a[0]);
  };

  empty();

  this.addNode = addNode;
  this.addEdge = addEdge;
  this.dropNode = dropNode;
  this.dropEdge = dropEdge;

  this.iterEdges = iterEdges;
  this.iterNodes = iterNodes;

  this.getEdges = getEdges;
  this.getNodes = getNodes;

  this.empty = empty;
  this.rescale = rescale;
  this.translate = translate;
  this.setBorders = setBorders;
  this.checkHover = checkHover;
}

/**
 * A class to monitor some local / global probes directly on an instance,
 * inside a div DOM element.
 * It executes different methods (called "probes") regularly, and displays
 * the results on the element.
 * @constructor
 * @extends sigma.classes.Cascade
 * @param {Sigma} instance The instance to monitor.
 * @param {element} dom    The div DOM element to draw write on.
 * @this {Monitor}
 */
function Monitor(instance, dom) {
  sigma.classes.Cascade.call(this);

  /**
   * Represents "this", without the well-known scope issue.
   * @private
   * @type {Monitor}
   */
  var self = this;

  /**
   * {@link Sigma} instance owning this Monitor instance.
   * @type {Sigma}
   */
  this.instance = instance;

  /**
   * Determines if the monitoring is activated or not.
   * @type {Boolean}
   */
  this.monitoring = false;

  /**
   * The different parameters that define how this instance should work. It
   * also contains the different probes.
   * @see sigma.classes.Cascade
   * @type {Object}
   */
  this.p = {
    fps: 40,
    dom: dom,
    globalProbes: {
      'Time (ms)': sigma.chronos.getExecutionTime,
      'Queue': sigma.chronos.getQueuedTasksCount,
      'Tasks': sigma.chronos.getTasksCount,
      'FPS': sigma.chronos.getFPS
    },
    localProbes: {
      'Nodes count': function() { return self.instance.graph.nodes.length; },
      'Edges count': function() { return self.instance.graph.edges.length; }
    }
  };

  /**
   * Activates the monitoring: Some texts describing some values about sigma.js
   * or the owning {@link Sigma} instance will appear over the graph, but
   * beneath the mouse sensible DOM element.
   * @return {Monitor} Returns itself.
   */
  function activate() {
    if (!self.monitoring) {
      self.monitoring = window.setInterval(routine, 1000 / self.p.fps);
    }

    return self;
  }

  /**
   * Desactivates the monitoring: Will disappear, and stop computing the
   * different probes.
   * @return {Monitor} Returns itself.
   */
  function desactivate() {
    if (self.monitoring) {
      window.clearInterval(self.monitoring);
      self.monitoring = null;

      self.p.dom.innerHTML = '';
    }

    return self;
  }

  /**
   * The private method dedicated to compute the different values to observe.
   * @private
   * @return {Monitor} Returns itself.
   */
  function routine() {
    var s = '';

    s += '<p>GLOBAL :</p>';
    for (var k in self.p.globalProbes) {
      s += '<p>' + k + ' : ' + self.p.globalProbes[k]() + '</p>';
    }

    s += '<br><p>LOCAL :</p>';
    for (var k in self.p.localProbes) {
      s += '<p>' + k + ' : ' + self.p.localProbes[k]() + '</p>';
    }

    self.p.dom.innerHTML = s;

    return self;
  }

  this.activate = activate;
  this.desactivate = desactivate;
}

/**
 * Sigma is the main class. It represents the core of any instance id sigma.js.
 * It is private and can be initialized only from inside sigma.js. To see its
 * public interface, see {@link SigmaPublic}.
 * It owns its own {@link Graph}, {@link MouseCaptor}, {@link Plotter}
 * and {@link Monitor}.
 * @constructor
 * @extends sigma.classes.Cascade
 * @extends sigma.classes.EventDispatcher
 * @param {element} root The DOM root of this instance (a div, for example).
 * @param {string} id    The ID of this instance.
 * @this {Sigma}
 */
function Sigma(root, id) {
  sigma.classes.Cascade.call(this);
  sigma.classes.EventDispatcher.call(this);

  /**
   * Represents "this", without the well-known scope issue.
   * @private
   * @type {Sigma}
   */
  var self = this;

  /**
   * The ID of the instance.
   * @type {string}
   */
  this.id = id.toString();

  /**
   * The different parameters that define how this instance should work.
   * @see sigma.classes.Cascade
   * @type {Object}
   */
  this.p = {
    auto: true,
    drawNodes: 2,
    drawEdges: 1,
    drawLabels: 2,
    lastNodes: 2,
    lastEdges: 0,
    lastLabels: 2,
    drawHoverNodes: true,
    drawActiveNodes: true
  };

  /**
   * The root DOM element of this instance, containing every other elements.
   * @type {element}
   */
  this.domRoot = root;

  /**
   * The width of this instance - initially, the root's width.
   * @type {number}
   */
  this.width = this.domRoot.offsetWidth;

  /**
   * The height of this instance - initially, the root's height.
   * @type {number}
   */
  this.height = this.domRoot.offsetHeight;

  /**
   * The graph of this instance - initiallyempty.
   * @type {Graph}
   */
  this.graph = new Graph();

  /**
   * An object referencing every DOM elements used by this instance.
   * @type {Object}
   */
  this.domElements = {};

  initDOM('edges', 'canvas');
  initDOM('nodes', 'canvas');
  initDOM('labels', 'canvas');
  initDOM('hover', 'canvas');
  initDOM('monitor', 'div');
  initDOM('mouse', 'canvas');

  /**
   * The class dedicated to manage the drawing process of the graph of the
   * different canvas.
   * @type {Plotter}
   */
  this.plotter = new Plotter(
    this.domElements.nodes.getContext('2d'),
    this.domElements.edges.getContext('2d'),
    this.domElements.labels.getContext('2d'),
    this.domElements.hover.getContext('2d'),
    this.graph,
    this.width,
    this.height
  );

  /**
   * The class dedicated to monitor different probes about the running
   * processes or the data, such as the number of nodes or edges, or how
   * many times the graph is drawn per second.
   * @type {Monitor}
   */
  this.monitor = new Monitor(
    this,
    this.domElements.monitor
  );

  /**
   * The class dedicated to manage the different mouse events.
   * @type {MouseCaptor}
   */
  this.mousecaptor = new MouseCaptor(
    this.domElements.mouse,
    this.id
  );

  // Interaction listeners:
  this.mousecaptor.bind('drag interpolate', function(e) {
    self.draw(
      self.p.auto ? 2 : self.p.drawNodes,
      self.p.auto ? 0 : self.p.drawEdges,
      self.p.auto ? 2 : self.p.drawLabels,
      true
    );
  }).bind('stopdrag stopinterpolate', function(e) {
    self.draw(
      self.p.auto ? 2 : self.p.drawNodes,
      self.p.auto ? 1 : self.p.drawEdges,
      self.p.auto ? 2 : self.p.drawLabels,
      true
    );
  }).bind('mousedown mouseup', function(e) {
    var targeted = self.graph.nodes.filter(function(n) {
      return !!n['hover'];
    }).map(function(n) {
      return n.id;
    });

    self.dispatch(
      e['type'] == 'mousedown' ?
        'downgraph' :
        'upgraph'
    );

    if (targeted.length) {
      self.dispatch(
        e['type'] == 'mousedown' ?
          'downnodes' :
          'upnodes',
        targeted
      );
    }
  }).bind('move', function() {
    self.domElements.hover.getContext('2d').clearRect(
      0,
      0,
      self.domElements.hover.width,
      self.domElements.hover.height
    );

    drawHover();
    drawActive();
  });

  sigma.chronos.bind('startgenerators', function() {
    if (sigma.chronos.getGeneratorsIDs().some(function(id) {
      return !!id.match(new RegExp('_ext_' + self.id + '$', ''));
    })) {
      self.draw(
        self.p.auto ? 2 : self.p.drawNodes,
        self.p.auto ? 0 : self.p.drawEdges,
        self.p.auto ? 2 : self.p.drawLabels
      );
    }
  }).bind('stopgenerators', function() {
    self.draw();
  });

  /**
   * Resizes the element, and redraws the graph with the last settings.
   * @param  {?number} w The new width (if undefined, it will use the root
   *                     width).
   * @param  {?number} h The new height (if undefined, it will use the root
   *                     height).
   * @return {Sigma} Returns itself.
   */
  function resize(w, h) {
    var oldW = self.width, oldH = self.height;

    if (w != undefined && h != undefined) {
      self.width = w;
      self.height = h;
    }else {
      self.width = self.domRoot.offsetWidth;
      self.height = self.domRoot.offsetHeight;
    }

    if (oldW != self.width || oldH != self.height) {
      for (var k in self.domElements) {
        self.domElements[k].setAttribute('width', self.width + 'px');
        self.domElements[k].setAttribute('height', self.height + 'px');
      }

      self.plotter.resize(self.width, self.height);

      self.draw(
        self.p.lastNodes,
        self.p.lastEdges,
        self.p.lastLabels,
        true
      );
    }
    return self;
  };

  /**
   * Kills every drawing task currently running. Basically, it stops this
   * instance's drawing process.
   * @return {Sigma} Returns itself.
   */
  function clearSchedule() {
    sigma.chronos.removeTask(
      'node_' + self.id, 2
    ).removeTask(
      'edge_' + self.id, 2
    ).removeTask(
      'label_' + self.id, 2
    ).stopTasks();
    return self;
  };

  /**
   * Initialize a DOM element, that will be stores by this instance, to make
   * automatic these elements resizing.
   * @private
   * @param  {string} id   The element's ID.
   * @param  {string} type The element's nodeName (Example : canvas, div, ...).
   * @return {Sigma} Returns itself.
   */
  function initDOM(id, type) {
    self.domElements[id] = document.createElement(type);
    self.domElements[id].style.position = 'absolute';
    self.domElements[id].setAttribute('id', 'sigma_' + id + '_' + self.id);
    self.domElements[id].setAttribute('class', 'sigma_' + id + '_' + type);
    self.domElements[id].setAttribute('width', self.width + 'px');
    self.domElements[id].setAttribute('height', self.height + 'px');

    self.domRoot.appendChild(self.domElements[id]);
    return self;
  };

  /**
   * Starts the graph drawing process. The three first parameters indicate
   * how the different layers have to be drawn:
   * . -1: The layer is not drawn, but it is not erased.
   * . 0:  The layer is not drawn.
   * . 1:  The layer is drawn progressively.
   * . 2:  The layer is drawn directly.
   * @param  {?number} nodes  Determines if and how the nodes must be drawn.
   * @param  {?number} edges  Determines if and how the edges must be drawn.
   * @param  {?number} labels Determines if and how the labels must be drawn.
   * @param  {?boolean} safe  If true, nothing will happen if any generator
   *                          affiliated to this instance is currently running
   *                          (an iterative layout, for example).
   * @return {Sigma} Returns itself.
   */
  function draw(nodes, edges, labels, safe) {
    if (safe && sigma.chronos.getGeneratorsIDs().some(function(id) {
      return !!id.match(new RegExp('_ext_' + self.id + '$', ''));
    })) {
      return self;
    }

    var n = (nodes == undefined) ? self.p.drawNodes : nodes;
    var e = (edges == undefined) ? self.p.drawEdges : edges;
    var l = (labels == undefined) ? self.p.drawLabels : labels;

    var params = {
      nodes: n,
      edges: e,
      labels: l
    };

    self.p.lastNodes = n;
    self.p.lastEdges = e;
    self.p.lastLabels = l;

    // Remove tasks:
    clearSchedule();

    // Rescale graph:
    self.graph.rescale(
      self.width,
      self.height,
      n > 0,
      e > 0
    ).setBorders();

    self.mousecaptor.checkBorders(
      self.graph.borders,
      self.width,
      self.height
    );

    self.graph.translate(
      self.mousecaptor.stageX,
      self.mousecaptor.stageY,
      self.mousecaptor.ratio,
      n > 0,
      e > 0
    );

    self.dispatch(
      'graphscaled'
    );

    // Clear scene:
    for (var k in self.domElements) {
      if (
        self.domElements[k].nodeName.toLowerCase() == 'canvas' &&
        (params[k] == undefined || params[k] >= 0)
      ) {
        self.domElements[k].getContext('2d').clearRect(
          0,
          0,
          self.domElements[k].width,
          self.domElements[k].height
        );
      }
    }

    self.plotter.currentEdgeIndex = 0;
    self.plotter.currentNodeIndex = 0;
    self.plotter.currentLabelIndex = 0;

    var previous = null;
    var start = false;

    if (n) {
      if (n > 1) {
        while (self.plotter.task_drawNode()) {}
      }else {
        sigma.chronos.addTask(
          self.plotter.task_drawNode,
          'node_' + self.id,
          false
        );

        start = true;
        previous = 'node_' + self.id;
      }
    }

    if (l) {
      if (l > 1) {
        while (self.plotter.task_drawLabel()) {}
      } else {
        if (previous) {
          sigma.chronos.queueTask(
            self.plotter.task_drawLabel,
            'label_' + self.id,
            previous
          );
        } else {
          sigma.chronos.addTask(
            self.plotter.task_drawLabel,
            'label_' + self.id,
            false
          );
        }

        start = true;
        previous = 'label_' + self.id;
      }
    }

    if (e) {
      if (e > 1) {
        while (self.plotter.task_drawEdge()) {}
      }else {
        if (previous) {
          sigma.chronos.queueTask(
            self.plotter.task_drawEdge,
            'edge_' + self.id,
            previous
          );
        }else {
          sigma.chronos.addTask(
            self.plotter.task_drawEdge,
            'edge_' + self.id,
            false
          );
        }

        start = true;
        previous = 'edge_' + self.id;
      }
    }

    self.dispatch(
      'draw'
    );

    self.refresh();

    start && sigma.chronos.runTasks();
    return self;
  };

  /**
   * Draws the hover and active nodes labels.
   * @return {Sigma} Returns itself.
   */
  function refresh() {
    self.domElements.hover.getContext('2d').clearRect(
      0,
      0,
      self.domElements.hover.width,
      self.domElements.hover.height
    );

    drawHover();
    drawActive();

    return self;
  }

  /**
   * Draws the hover nodes labels. This method is applied directly, and does
   * not use the pseudo-asynchronous tasks process.
   * @return {Sigma} Returns itself.
   */
  function drawHover() {
    if (self.p.drawHoverNodes) {
      self.graph.checkHover(
        self.mousecaptor.mouseX,
        self.mousecaptor.mouseY
      );

      self.graph.nodes.forEach(function(node) {
        if (node.hover && !node.active) {
          self.plotter.drawHoverNode(node);
        }
      });
    }

    return self;
  }

  /**
   * Draws the active nodes labels. This method is applied directly, and does
   * not use the pseudo-asynchronous tasks process.
   * @return {Sigma} Returns itself.
   */
  function drawActive() {
    if (self.p.drawActiveNodes) {
      self.graph.nodes.forEach(function(node) {
        if (node.active) {
          self.plotter.drawActiveNode(node);
        }
      });
    }

    return self;
  }

  // Apply plugins:
  for (var i = 0; i < local.plugins.length; i++) {
    local.plugins[i](this);
  }

  this.draw = draw;
  this.resize = resize;
  this.refresh = refresh;
  this.drawHover = drawHover;
  this.drawActive = drawActive;
  this.clearSchedule = clearSchedule;

  window.addEventListener('resize', function() {
    self.resize();
  });
}

/**
 * This class draws the graph on the different canvas DOM elements. It just
 * contains all the different methods to draw the graph, synchronously or
 * pseudo-asynchronously.
 * @constructor
 * @param {CanvasRenderingContext2D} nodesCtx  Context dedicated to draw nodes.
 * @param {CanvasRenderingContext2D} edgesCtx  Context dedicated to draw edges.
 * @param {CanvasRenderingContext2D} labelsCtx Context dedicated to draw
 *                                             labels.
 * @param {CanvasRenderingContext2D} hoverCtx  Context dedicated to draw hover
 *                                             nodes labels.
 * @param {Graph} graph                        A reference to the graph to
 *                                             draw.
 * @param {number} w                           The width of the DOM root
 *                                             element.
 * @param {number} h                           The width of the DOM root
 *                                             element.
 * @extends sigma.classes.Cascade
 * @this {Plotter}
 */
function Plotter(nodesCtx, edgesCtx, labelsCtx, hoverCtx, graph, w, h) {
  sigma.classes.Cascade.call(this);

  /**
   * Represents "this", without the well-known scope issue.
   * @private
   * @type {Plotter}
   */
  var self = this;

  /**
   * The different parameters that define how this instance should work.
   * @see sigma.classes.Cascade
   * @type {Object}
   */
  this.p = {
    // -------
    // LABELS:
    // -------
    //   Label color:
    //   - 'node'
    //   - default (then defaultLabelColor
    //              will be used instead)
    labelColor: 'default',
    defaultLabelColor: '#000',
    //   Label hover background color:
    //   - 'node'
    //   - default (then defaultHoverLabelBGColor
    //              will be used instead)
    labelHoverBGColor: 'default',
    defaultHoverLabelBGColor: '#fff',
    //   Label hover shadow:
    labelHoverShadow: true,
    labelHoverShadowColor: '#000',
    //   Label hover color:
    //   - 'node'
    //   - default (then defaultLabelHoverColor
    //              will be used instead)
    labelHoverColor: 'default',
    defaultLabelHoverColor: '#000',
    //   Label active background color:
    //   - 'node'
    //   - default (then defaultActiveLabelBGColor
    //              will be used instead)
    labelActiveBGColor: 'default',
    defaultActiveLabelBGColor: '#fff',
    //   Label active shadow:
    labelActiveShadow: true,
    labelActiveShadowColor: '#000',
    //   Label active color:
    //   - 'node'
    //   - default (then defaultLabelActiveColor
    //              will be used instead)
    labelActiveColor: 'default',
    defaultLabelActiveColor: '#000',
    //   Label size:
    //   - 'fixed'
    //   - 'proportional'
    //   Label size:
    //   - 'fixed'
    //   - 'proportional'
    labelSize: 'fixed',
    defaultLabelSize: 12, // for fixed display only
    labelSizeRatio: 2,    // for proportional display only
    labelThreshold: 6,
    font: 'Arial',
    hoverFont: '',
    activeFont: '',
    fontStyle: '',
    hoverFontStyle: '',
    activeFontStyle: '',
    // ------
    // EDGES:
    // ------
    //   Edge color:
    //   - 'source'
    //   - 'target'
    //   - default (then defaultEdgeColor or edge['color']
    //              will be used instead)
    edgeColor: 'source',
    defaultEdgeColor: '#aaa',
    defaultEdgeType: 'line',
    // ------
    // NODES:
    // ------
    defaultNodeColor: '#aaa',
    // HOVER:
    //   Node hover color:
    //   - 'node'
    //   - default (then defaultNodeHoverColor
    //              will be used instead)
    nodeHoverColor: 'node',
    defaultNodeHoverColor: '#fff',
    // ACTIVE:
    //   Node active color:
    //   - 'node'
    //   - default (then defaultNodeActiveColor
    //              will be used instead)
    nodeActiveColor: 'node',
    defaultNodeActiveColor: '#fff',
    //   Node border color:
    //   - 'node'
    //   - default (then defaultNodeBorderColor
    //              will be used instead)
    borderSize: 0,
    nodeBorderColor: 'node',
    defaultNodeBorderColor: '#fff',
    // --------
    // PROCESS:
    // --------
    edgesSpeed: 200,
    nodesSpeed: 200,
    labelsSpeed: 200
  };

  /**
   * The canvas context dedicated to draw the nodes.
   * @type {CanvasRenderingContext2D}
   */
  var nodesCtx = nodesCtx;

  /**
   * The canvas context dedicated to draw the edges.
   * @type {CanvasRenderingContext2D}
   */
  var edgesCtx = edgesCtx;

  /**
   * The canvas context dedicated to draw the labels.
   * @type {CanvasRenderingContext2D}
   */
  var labelsCtx = labelsCtx;

  /**
   * The canvas context dedicated to draw the hover nodes.
   * @type {CanvasRenderingContext2D}
   */
  var hoverCtx = hoverCtx;

  /**
   * A reference to the graph to draw.
   * @type {Graph}
   */
  var graph = graph;

  /**
   * The width of the stage to draw on.
   * @type {number}
   */
  var width = w;

  /**
   * The height of the stage to draw on.
   * @type {number}
   */
  var height = h;

  /**
   * The index of the next edge to draw.
   * @type {number}
   */
  this.currentEdgeIndex = 0;

  /**
   * The index of the next node to draw.
   * @type {number}
   */
  this.currentNodeIndex = 0;

  /**
   * The index of the next label to draw.
   * @type {number}
   */
  this.currentLabelIndex = 0;

  /**
   * An atomic function to drawn the N next edges, with N as edgesSpeed.
   * The counter is {@link this.currentEdgeIndex}.
   * This function has been designed to work with {@link sigma.chronos}, that
   * will insert frames at the middle of the calls, to make the edges drawing
   * process fluid for the user.
   * @see sigma.chronos
   * @return {boolean} Returns true if all the edges are drawn and false else.
   */
  function task_drawEdge() {
    var c = graph.edges.length;
    var s, t, i = 0;

    while (i++< self.p.edgesSpeed && self.currentEdgeIndex < c) {
      e = graph.edges[self.currentEdgeIndex];
      s = e['source'];
      t = e['target'];
      if (e['hidden'] ||
          s['hidden'] ||
          t['hidden'] ||
          (!self.isOnScreen(s) && !self.isOnScreen(t))) {
        self.currentEdgeIndex++;
      }else {
        drawEdge(graph.edges[self.currentEdgeIndex++]);
      }
    }

    return self.currentEdgeIndex < c;
  };

  /**
   * An atomic function to drawn the N next nodes, with N as nodesSpeed.
   * The counter is {@link this.currentEdgeIndex}.
   * This function has been designed to work with {@link sigma.chronos}, that
   * will insert frames at the middle of the calls, to make the nodes drawing
   * process fluid for the user.
   * @see sigma.chronos
   * @return {boolean} Returns true if all the nodes are drawn and false else.
   */
  function task_drawNode() {
    var c = graph.nodes.length;
    var i = 0;

    while (i++< self.p.nodesSpeed && self.currentNodeIndex < c) {
      if (!self.isOnScreen(graph.nodes[self.currentNodeIndex])) {
        self.currentNodeIndex++;
      }else {
        drawNode(graph.nodes[self.currentNodeIndex++]);
      }
    }

    return self.currentNodeIndex < c;
  };

  /**
   * An atomic function to drawn the N next labels, with N as labelsSpeed.
   * The counter is {@link this.currentEdgeIndex}.
   * This function has been designed to work with {@link sigma.chronos}, that
   * will insert frames at the middle of the calls, to make the labels drawing
   * process fluid for the user.
   * @see sigma.chronos
   * @return {boolean} Returns true if all the labels are drawn and false else.
   */
  function task_drawLabel() {
    var c = graph.nodes.length;
    var i = 0;

    while (i++< self.p.labelsSpeed && self.currentLabelIndex < c) {
      if (!self.isOnScreen(graph.nodes[self.currentLabelIndex])) {
        self.currentLabelIndex++;
      }else {
        drawLabel(graph.nodes[self.currentLabelIndex++]);
      }
    }

    return self.currentLabelIndex < c;
  };

  /**
   * Draws one node to the corresponding canvas.
   * @param  {Object} node The node to draw.
   * @return {Plotter} Returns itself.
   */
  function drawNode(node) {
    var size = Math.round(node['displaySize'] * 10) / 10;
    var ctx = nodesCtx;

    ctx.fillStyle = node['color'];
    ctx.beginPath();
    ctx.arc(node['displayX'],
            node['displayY'],
            size,
            0,
            Math.PI * 2,
            true);

    ctx.closePath();
    ctx.fill();

    node['hover'] && drawHoverNode(node);
    return self;
  };

  /**
   * Draws one edge to the corresponding canvas.
   * @param  {Object} edge The edge to draw.
   * @return {Plotter} Returns itself.
   */
  function drawEdge(edge) {
    var x1 = edge['source']['displayX'];
    var y1 = edge['source']['displayY'];
    var x2 = edge['target']['displayX'];
    var y2 = edge['target']['displayY'];
    var color = edge['color'];

    if (!color) {
      switch (self.p.edgeColor) {
        case 'source':
          color = edge['source']['color'] ||
                  self.p.defaultNodeColor;
          break;
        case 'target':
          color = edge['target']['color'] ||
                  self.p.defaultNodeColor;
          break;
        default:
          color = self.p.defaultEdgeColor;
          break;
      }
    }

    var ctx = edgesCtx;

    switch (edge['type'] || self.p.defaultEdgeType) {
      case 'curve':
        ctx.strokeStyle = color;
        ctx.lineWidth = edge['displaySize'] / 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo((x1 + x2) / 2 + (y2 - y1) / 4,
                             (y1 + y2) / 2 + (x1 - x2) / 4,
                             x2,
                             y2);
        ctx.stroke();
        break;
      case 'line':
      default:
        ctx.strokeStyle = color;
        ctx.lineWidth = edge['displaySize'] / 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.stroke();
        break;
    }

    return self;
  };

  /**
   * Draws one label to the corresponding canvas.
   * @param  {Object} node The label to draw.
   * @return {Plotter} Returns itself.
   */
  function drawLabel(node) {
    var ctx = labelsCtx;

    if (node['displaySize'] >= self.p.labelThreshold && !(node['forceLabel'] < 0)
        || node['forceLabel'] > 0) {
      var fontSize = self.p.labelSize == 'fixed' ?
                     self.p.defaultLabelSize :
                     self.p.labelSizeRatio * node['displaySize'];

      ctx.font = self.p.fontStyle + fontSize + 'px ' + self.p.font;

      ctx.fillStyle = self.p.labelColor == 'node' ?
                      (node['color'] || self.p.defaultNodeColor) :
                      self.p.defaultLabelColor;
      ctx.fillText(
        node['label'],
        Math.round(node['displayX'] + node['displaySize'] * 1.5),
        Math.round(node['displayY'] + fontSize / 2 - 3)
      );
    }

    return self;
  };

  /**
   * Draws one hover node to the corresponding canvas.
   * @param  {Object} node The hover node to draw.
   * @return {Plotter} Returns itself.
   */
  function drawHoverNode(node) {
    var ctx = hoverCtx;

    var fontSize = self.p.labelSize == 'fixed' ?
                   self.p.defaultLabelSize :
                   self.p.labelSizeRatio * node['displaySize'];

    ctx.font = (self.p.hoverFontStyle || self.p.fontStyle || '') + ' ' +
               fontSize + 'px ' +
               (self.p.hoverFont || self.p.font || '');

    ctx.fillStyle = self.p.labelHoverBGColor == 'node' ?
                    (node['color'] || self.p.defaultNodeColor) :
                    self.p.defaultHoverLabelBGColor;

    // Label background:
    ctx.beginPath();

    if (self.p.labelHoverShadow) {
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 4;
      ctx.shadowColor = self.p.labelHoverShadowColor;
    }

    sigma.tools.drawRoundRect(
      ctx,
      Math.round(node['displayX'] - fontSize / 2 - 2),
      Math.round(node['displayY'] - fontSize / 2 - 2),
      Math.round(ctx.measureText(node['label']).width +
        node['displaySize'] * 1.5 +
        fontSize / 2 + 4),
      Math.round(fontSize + 4),
      Math.round(fontSize / 2 + 2),
      'left'
    );
    ctx.closePath();
    ctx.fill();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // Node border:
    ctx.beginPath();
    ctx.fillStyle = self.p.nodeBorderColor == 'node' ?
                    (node['color'] || self.p.defaultNodeColor) :
                    self.p.defaultNodeBorderColor;
    ctx.arc(Math.round(node['displayX']),
            Math.round(node['displayY']),
            node['displaySize'] + self.p.borderSize,
            0,
            Math.PI * 2,
            true);
    ctx.closePath();
    ctx.fill();

    // Node:
    ctx.beginPath();
    ctx.fillStyle = self.p.nodeHoverColor == 'node' ?
                    (node['color'] || self.p.defaultNodeColor) :
                    self.p.defaultNodeHoverColor;
    ctx.arc(Math.round(node['displayX']),
            Math.round(node['displayY']),
            node['displaySize'],
            0,
            Math.PI * 2,
            true);

    ctx.closePath();
    ctx.fill();

    // Label:
    ctx.fillStyle = self.p.labelHoverColor == 'node' ?
                    (node['color'] || self.p.defaultNodeColor) :
                    self.p.defaultLabelHoverColor;
    ctx.fillText(
      node['label'],
      Math.round(node['displayX'] + node['displaySize'] * 1.5),
      Math.round(node['displayY'] + fontSize / 2 - 3)
    );

    return self;
  };

  /**
   * Draws one active node to the corresponding canvas.
   * @param  {Object} node The active node to draw.
   * @return {Plotter} Returns itself.
   */
  function drawActiveNode(node) {
    var ctx = hoverCtx;

    if (!isOnScreen(node)) {
      return self;
    }

    var fontSize = self.p.labelSize == 'fixed' ?
                   self.p.defaultLabelSize :
                   self.p.labelSizeRatio * node['displaySize'];

    ctx.font = (self.p.activeFontStyle || self.p.fontStyle || '') + ' ' +
               fontSize + 'px ' +
               (self.p.activeFont || self.p.font || '');

    ctx.fillStyle = self.p.labelHoverBGColor == 'node' ?
                    (node['color'] || self.p.defaultNodeColor) :
                    self.p.defaultActiveLabelBGColor;

    // Label background:
    ctx.beginPath();

    if (self.p.labelActiveShadow) {
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 4;
      ctx.shadowColor = self.p.labelActiveShadowColor;
    }

    sigma.tools.drawRoundRect(
      ctx,
      Math.round(node['displayX'] - fontSize / 2 - 2),
      Math.round(node['displayY'] - fontSize / 2 - 2),
      Math.round(ctx.measureText(node['label']).width +
        node['displaySize'] * 1.5 +
        fontSize / 2 + 4),
      Math.round(fontSize + 4),
      Math.round(fontSize / 2 + 2),
      'left'
    );
    ctx.closePath();
    ctx.fill();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // Node border:
    ctx.beginPath();
    ctx.fillStyle = self.p.nodeBorderColor == 'node' ?
                    (node['color'] || self.p.defaultNodeColor) :
                    self.p.defaultNodeBorderColor;
    ctx.arc(Math.round(node['displayX']),
            Math.round(node['displayY']),
            node['displaySize'] + self.p.borderSize,
            0,
            Math.PI * 2,
            true);
    ctx.closePath();
    ctx.fill();

    // Node:
    ctx.beginPath();
    ctx.fillStyle = self.p.nodeActiveColor == 'node' ?
                    (node['color'] || self.p.defaultNodeColor) :
                    self.p.defaultNodeActiveColor;
    ctx.arc(Math.round(node['displayX']),
            Math.round(node['displayY']),
            node['displaySize'],
            0,
            Math.PI * 2,
            true);

    ctx.closePath();
    ctx.fill();

    // Label:
    ctx.fillStyle = self.p.labelActiveColor == 'node' ?
                    (node['color'] || self.p.defaultNodeColor) :
                    self.p.defaultLabelActiveColor;
    ctx.fillText(
      node['label'],
      Math.round(node['displayX'] + node['displaySize'] * 1.5),
      Math.round(node['displayY'] + fontSize / 2 - 3)
    );

    return self;
  };

  /**
   * Determines if a node is on the screen or not. The limits here are
   * bigger than the actual screen, to avoid seeing labels disappear during
   * the graph manipulation.
   * @param  {Object}  node The node to check if it is on or out the screen.
   * @return {boolean} Returns false if the node is hidden or not on the screen
   *                   or true else.
   */
  function isOnScreen(node) {
    if (isNaN(node['x']) || isNaN(node['y'])) {
      throw (new Error('A node\'s coordinate is not a ' +
                       'number (id: ' + node['id'] + ')')
      );
    }

    return !node['hidden'] &&
           (node['displayX'] + node['displaySize'] > -width / 3) &&
           (node['displayX'] - node['displaySize'] < width * 4 / 3) &&
           (node['displayY'] + node['displaySize'] > -height / 3) &&
           (node['displayY'] - node['displaySize'] < height * 4 / 3);
  };

  /**
   * Resizes this instance.
   * @param  {number} w The new width.
   * @param  {number} h The new height.
   * @return {Plotter} Returns itself.
   */
  function resize(w, h) {
    width = w;
    height = h;

    return self;
  }

  this.task_drawLabel = task_drawLabel;
  this.task_drawEdge = task_drawEdge;
  this.task_drawNode = task_drawNode;
  this.drawActiveNode = drawActiveNode;
  this.drawHoverNode = drawHoverNode;
  this.isOnScreen = isOnScreen;
  this.resize = resize;
}

/**
 * This class listen to all the different mouse events, to normalize them and
 * dispatch action events instead (from "startinterpolate" to "isdragging",
 * etc).
 * @constructor
 * @extends sigma.classes.Cascade
 * @extends sigma.classes.EventDispatcher
 * @param {element} dom The DOM element to bind the handlers on.
 * @this {MouseCaptor}
 */
function MouseCaptor(dom) {
  sigma.classes.Cascade.call(this);
  sigma.classes.EventDispatcher.call(this);

  /**
   * Represents "this", without the well-known scope issue.
   * @private
   * @type {MouseCaptor}
   */
  var self = this;

  /**
   * The DOM element to bind the handlers on.
   * @type {element}
   */
  var dom = dom;

  /**
   * The different parameters that define how this instance should work.
   * @see sigma.classes.Cascade
   * @type {Object}
   */
  this.p = {
    minRatio: 1,
    maxRatio: 32,
    marginRatio: 1,
    zoomDelta: 0.1,
    dragDelta: 0.3,
    zoomMultiply: 2,
    directZooming: false,
    blockScroll: true,
    inertia: 1.1,
    mouseEnabled: true
  };

  var oldMouseX = 0;
  var oldMouseY = 0;
  var startX = 0;
  var startY = 0;

  var oldStageX = 0;
  var oldStageY = 0;
  var oldRatio = 1;

  var targetRatio = 1;
  var targetStageX = 0;
  var targetStageY = 0;

  var lastStageX = 0;
  var lastStageX2 = 0;
  var lastStageY = 0;
  var lastStageY2 = 0;

  var progress = 0;
  var isZooming = false;

  this.stageX = 0;
  this.stageY = 0;
  this.ratio = 1;

  this.mouseX = 0;
  this.mouseY = 0;

  this.isMouseDown = false;

  /**
   * Extract the local X position from a mouse event.
   * @private
   * @param  {event} e A mouse event.
   * @return {number} The local X value of the mouse.
   */
  function getX(e) {
    return e.offsetX != undefined && e.offsetX ||
           e.layerX != undefined && e.layerX ||
           e.clientX != undefined && e.clientX;
  };

  /**
   * Extract the local Y position from a mouse event.
   * @private
   * @param  {event} e A mouse event.
   * @return {number} The local Y value of the mouse.
   */
  function getY(e) {
    return e.offsetY != undefined && e.offsetY ||
           e.layerY != undefined && e.layerY ||
           e.clientY != undefined && e.clientY;
  };

  /**
   * Extract the wheel delta from a mouse event.
   * @private
   * @param  {event} e A mouse event.
   * @return {number} The wheel delta of the mouse.
   */
  function getDelta(e) {
    return e.wheelDelta != undefined && e.wheelDelta ||
           e.detail != undefined && -e.detail;
  };

  /**
   * The handler listening to the 'move' mouse event. It will set the mouseX
   * and mouseY values as the mouse position values, prevent the default event,
   * and dispatch a 'move' event.
   * @private
   * @param  {event} event A 'move' mouse event.
   */
  function moveHandler(event) {
    oldMouseX = self.mouseX;
    oldMouseY = self.mouseY;

    self.mouseX = getX(event);
    self.mouseY = getY(event);

    self.isMouseDown && drag(event);
    self.dispatch('move');

    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
  };

  /**
   * The handler listening to the 'up' mouse event. It will set the isMouseDown
   * value as false, dispatch a 'mouseup' event, and trigger stopDrag().
   * @private
   * @param  {event} event A 'up' mouse event.
   */
  function upHandler(event) {
    if (self.p.mouseEnabled && self.isMouseDown) {
      self.isMouseDown = false;
      self.dispatch('mouseup');
      stopDrag();

      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
    }
  };

  /**
   * The handler listening to the 'down' mouse event. It will set the
   * isMouseDown value as true, dispatch a 'mousedown' event, and trigger
   * startDrag().
   * @private
   * @param  {event} event A 'down' mouse event.
   */
  function downHandler(event) {
    if (self.p.mouseEnabled) {
      self.isMouseDown = true;
      oldMouseX = self.mouseX;
      oldMouseY = self.mouseY;

      self.dispatch('mousedown');

      startDrag();

      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
    }
  };

  /**
   * The handler listening to the 'wheel' mouse event. It will trigger
   * {@link startInterpolate} with the event delta as parameter.
   * @private
   * @param  {event} event A 'wheel' mouse event.
   */
  function wheelHandler(event) {
    if (self.p.mouseEnabled) {
      startInterpolate(
        self.mouseX,
        self.mouseY,
        self.ratio * (getDelta(event) > 0 ?
          self.p.zoomMultiply :
          1 / self.p.zoomMultiply)
      );

      if (self.p['blockScroll']) {
        if (event.preventDefault) {
          event.preventDefault();
        } else {
          event.returnValue = false;
        }
      }
    }
  };

  /**
   * Will start computing the scene X and Y, until {@link stopDrag} is
   * triggered.
   */
  function startDrag() {
    oldStageX = self.stageX;
    oldStageY = self.stageY;
    startX = self.mouseX;
    startY = self.mouseY;

    lastStageX = self.stageX;
    lastStageX2 = self.stageX;
    lastStageY = self.stageY;
    lastStageY2 = self.stageY;

    self.dispatch('startdrag');
  };

  /**
   * Stops computing the scene position.
   */
  function stopDrag() {
    if (oldStageX != self.stageX || oldStageY != self.stageY) {
      startInterpolate(
        self.stageX + self.p.inertia * (self.stageX - lastStageX2),
        self.stageY + self.p.inertia * (self.stageY - lastStageY2)
      );
    }
  };

  /**
   * Computes the position of the scene, relatively to the mouse position, and
   * dispatches a "drag" event.
   */
  function drag() {
    var newStageX = self.mouseX - startX + oldStageX;
    var newStageY = self.mouseY - startY + oldStageY;

    if (newStageX != self.stageX || newStageY != self.stageY) {
      lastStageX2 = lastStageX;
      lastStageY2 = lastStageY;

      lastStageX = newStageX;
      lastStageY = newStageY;

      self.stageX = newStageX;
      self.stageY = newStageY;
      self.dispatch('drag');
    }
  };

  /**
   * Will start computing the scene zoom ratio, until {@link stopInterpolate} is
   * triggered.
   * @param {number} x     The new stage X.
   * @param {number} y     The new stage Y.
   * @param {number} ratio The new zoom ratio.
   */
  function startInterpolate(x, y, ratio) {
    if (self.isMouseDown) {
      return;
    }

    window.clearInterval(self.interpolationID);
    isZooming = ratio != undefined;

    oldStageX = self.stageX;
    targetStageX = x;

    oldStageY = self.stageY;
    targetStageY = y;

    oldRatio = self.ratio;
    targetRatio = ratio || self.ratio;
    targetRatio = Math.min(
      Math.max(targetRatio, self.p.minRatio),
      self.p.maxRatio
    );

    progress =
      self.p.directZooming ?
      1 - (isZooming ? self.p.zoomDelta : self.p.dragDelta) :
      0;

    if (
      self.ratio != targetRatio ||
      self.stageX != targetStageX ||
      self.stageY != targetStageY
    ) {
      interpolate();
      self.interpolationID = window.setInterval(interpolate, 50);
      self.dispatch('startinterpolate');
    }
  };

  /**
   * Stops the move interpolation.
   */
  function stopInterpolate() {
    var oldRatio = self.ratio;

    if (isZooming) {
      self.ratio = targetRatio;
      self.stageX = targetStageX +
                    (self.stageX - targetStageX) *
                    self.ratio /
                    oldRatio;
      self.stageY = targetStageY +
                    (self.stageY - targetStageY) *
                    self.ratio /
                    oldRatio;
    }else {
      self.stageX = targetStageX;
      self.stageY = targetStageY;
    }

    self.dispatch('stopinterpolate');
  };

  /**
   * Computes the interpolate ratio and the position of the scene, relatively
   * to the last mouse event delta received, and dispatches a "interpolate"
   * event.
   */
  function interpolate() {
    progress += (isZooming ? self.p.zoomDelta : self.p.dragDelta);
    progress = Math.min(progress, 1);

    var k = sigma.easing.quadratic.easeout(progress);
    var oldRatio = self.ratio;

    self.ratio = oldRatio * (1 - k) + targetRatio * k;

    if (isZooming) {
      self.stageX = targetStageX +
                    (self.stageX - targetStageX) *
                    self.ratio /
                    oldRatio;

      self.stageY = targetStageY +
                    (self.stageY - targetStageY) *
                    self.ratio /
                    oldRatio;
    } else {
      self.stageX = oldStageX * (1 - k) + targetStageX * k;
      self.stageY = oldStageY * (1 - k) + targetStageY * k;
    }

    self.dispatch('interpolate');
    if (progress >= 1) {
      window.clearInterval(self.interpolationID);
      stopInterpolate();
    }
  };

  /**
   * Checks that there is always a part of the graph that is displayed, to
   * avoid the user to drag the graph out of the stage.
   * @param  {Object} b      An object containing the borders of the graph.
   * @param  {number} width  The width of the stage.
   * @param  {number} height The height of the stage.
   * @return {MouseCaptor} Returns itself.
   */
  function checkBorders(b, width, height) {
    // TODO : Find the good formula
    /*if (!isNaN(b.minX) && !isNaN(b.maxX)) {
      self.stageX = Math.min(
        self.stageX = Math.max(
          self.stageX,
          (b.minX - width) * self.ratio +
            self.p.marginRatio*(b.maxX - b.minX)
        ),
        (b.maxX - width) * self.ratio +
          width -
          self.p.marginRatio*(b.maxX - b.minX)
      );
    }

    if (!isNaN(b.minY) && !isNaN(b.maxY)) {
      self.stageY = Math.min(
        self.stageY = Math.max(
          self.stageY,
          (b.minY - height) * self.ratio +
            self.p.marginRatio*(b.maxY - b.minY)
        ),
        (b.maxY - height) * self.ratio +
          height -
          self.p.marginRatio*(b.maxY - b.minY)
      );
    }*/

    return self;
  };

  // ADD CALLBACKS
  dom.addEventListener('DOMMouseScroll', wheelHandler, true);
  dom.addEventListener('mousewheel', wheelHandler, true);
  dom.addEventListener('mousemove', moveHandler, true);
  dom.addEventListener('mousedown', downHandler, true);
  document.addEventListener('mouseup', upHandler, true);

  this.checkBorders = checkBorders;
  this.interpolate = startInterpolate;
}

function SigmaPublic(sigmaInstance) {
  var s = sigmaInstance;
  var self = this;
  sigma.classes.EventDispatcher.call(this);

  this._core = sigmaInstance;

  this.kill = function() {
    // TODO
  };

  this.getID = function() {
    return s.id;
  };

  // Config:
  this.configProperties = function(a1, a2) {
    var res = s.config(a1, a2);
    return res == s ? self : res;
  };

  this.drawingProperties = function(a1, a2) {
    var res = s.plotter.config(a1, a2);
    return res == s.plotter ? self : res;
  };

  this.mouseProperties = function(a1, a2) {
    var res = s.mousecaptor.config(a1, a2);
    return res == s.mousecaptor ? self : res;
  };

  this.graphProperties = function(a1, a2) {
    var res = s.graph.config(a1, a2);
    return res == s.graph ? self : res;
  };

  this.getMouse = function() {
    return {
      mouseX: s.mousecaptor.mouseX,
      mouseY: s.mousecaptor.mouseY,
      down: s.mousecaptor.isMouseDown
    };
  };

  // Actions:
  this.position = function(stageX, stageY, ratio) {
    if (arguments.length == 0) {
      return {
        stageX: s.mousecaptor.stageX,
        stageY: s.mousecaptor.stageY,
        ratio: s.mousecaptor.ratio
      };
    }else {
      s.mousecaptor.stageX = stageX != undefined ?
        stageX :
        s.mousecaptor.stageX;
      s.mousecaptor.stageY = stageY != undefined ?
        stageY :
        s.mousecaptor.stageY;
      s.mousecaptor.ratio = ratio != undefined ?
        ratio :
        s.mousecaptor.ratio;

      return self;
    }
  };

  this.goTo = function(stageX, stageY, ratio) {
    s.mousecaptor.interpolate(stageX, stageY, ratio);
    return self;
  };

  this.zoomTo = function(x, y, ratio) {
    ratio = Math.min(
              Math.max(s.mousecaptor.config('minRatio'), ratio),
              s.mousecaptor.config('maxRatio')
            );
    if (ratio == s.mousecaptor.ratio) {
      s.mousecaptor.interpolate(
        x - s.width / 2 + s.mousecaptor.stageX,
        y - s.height / 2 + s.mousecaptor.stageY
      );
    }else {
      s.mousecaptor.interpolate(
        (ratio * x - s.mousecaptor.ratio * s.width/2) /
        (ratio - s.mousecaptor.ratio),
        (ratio * y - s.mousecaptor.ratio * s.height/2) /
        (ratio - s.mousecaptor.ratio),
        ratio
      );
    }
    return self;
  };

  this.resize = function(w, h) {
    s.resize(w, h);
    return self;
  };

  this.draw = function(nodes, edges, labels, safe) {
    s.draw(nodes, edges, labels, safe);
    return self;
  };

  this.refresh = function() {
    s.refresh();
    return self;
  };

  // Tasks methods:
  this.addGenerator = function(id, task, condition) {
    sigma.chronos.addGenerator(id + '_ext_' + s.id, task, condition);
    return self;
  };

  this.removeGenerator = function(id) {
    sigma.chronos.removeGenerator(id + '_ext_' + s.id);
    return self;
  };

  // Graph methods:
  this.addNode = function(id, params) {
    s.graph.addNode(id, params);
    return self;
  };

  this.addEdge = function(id, source, target, params) {
    s.graph.addEdge(id, source, target, params);
    return self;
  }

  this.dropNode = function(v) {
    s.graph.dropNode(v);
    return self;
  };

  this.dropEdge = function(v) {
    s.graph.dropEdge(v);
    return self;
  };

  this.pushGraph = function(object, safe) {
    object.nodes && object.nodes.forEach(function(node) {
      node['id'] && (!safe || !s.graph.nodesIndex[node['id']]) &&
                    self.addNode(node['id'], node);
    });

    var isEdgeValid;
    object.edges && object.edges.forEach(function(edge) {
      validID = edge['source'] && edge['target'] && edge['id'];
      validID &&
        (!safe || !s.graph.edgesIndex[edge['id']]) &&
        self.addEdge(
          edge['id'],
          edge['source'],
          edge['target'],
          edge
        );
    });

    return self;
  };

  this.emptyGraph = function() {
    s.graph.empty();
    return self;
  };

  this.getNodesCount = function() {
    return s.graph.nodes.length;
  };

  this.getEdgesCount = function() {
    return s.graph.edges.length;
  };

  this.iterNodes = function(fun, ids) {
    s.graph.iterNodes(fun, ids);
    return self;
  };

  this.iterEdges = function(fun, ids) {
    s.graph.iterEdges(fun, ids);
    return self;
  };

  this.getNodes = function(ids) {
    return s.graph.getNodes(ids);
  };

  this.getEdges = function(ids) {
    return s.graph.getEdges(ids);
  };

  // Monitoring
  this.activateMonitoring = function() {
    return s.monitor.activate();
  };

  this.desactivateMonitoring = function() {
    return s.monitor.desactivate();
  };

  // Events
  s.bind('downnodes upnodes downgraph upgraph', function(e) {
    self.dispatch(e.type, e.content);
  });

  s.graph.bind('overnodes outnodes', function(e) {
    self.dispatch(e.type, e.content);
  });
}

sigma.tools.drawRoundRect = function(ctx, x, y, w, h, ellipse, corners) {
  var e = ellipse ? ellipse : 0;
  var c = corners ? corners : [];
  c = ((typeof c) == 'string') ? c.split(' ') : c;

  var tl = e && (c.indexOf('topleft') >= 0 ||
                 c.indexOf('top') >= 0 ||
                 c.indexOf('left') >= 0);
  var tr = e && (c.indexOf('topright') >= 0 ||
                 c.indexOf('top') >= 0 ||
                 c.indexOf('right') >= 0);
  var bl = e && (c.indexOf('bottomleft') >= 0 ||
                 c.indexOf('bottom') >= 0 ||
                 c.indexOf('left') >= 0);
  var br = e && (c.indexOf('bottomright') >= 0 ||
                 c.indexOf('bottom') >= 0 ||
                 c.indexOf('right') >= 0);

  ctx.moveTo(x, y + e);

  if (tl) {
    ctx.arcTo(x, y, x + e, y, e);
  }else {
    ctx.lineTo(x, y);
  }

  if (tr) {
    ctx.lineTo(x + w - e, y);
    ctx.arcTo(x + w, y, x + w, y + e, e);
  }else {
    ctx.lineTo(x + w, y);
  }

  if (br) {
    ctx.lineTo(x + w, y + h - e);
    ctx.arcTo(x + w, y + h, x + w - e, y + h, e);
  }else {
    ctx.lineTo(x + w, y + h);
  }

  if (bl) {
    ctx.lineTo(x + e, y + h);
    ctx.arcTo(x, y + h, x, y + h - e, e);
  }else {
    ctx.lineTo(x, y + h);
  }

  ctx.lineTo(x, y + e);
};

sigma.tools.getRGB = function(s, asArray) {
  s = s.toString();
  var res = {
    'r': 0,
    'g': 0,
    'b': 0
  };

  if (s.length >= 3) {
    if (s.charAt(0) == '#') {
      var l = s.length - 1;
      if (l == 6) {
        res = {
          'r': parseInt(s.charAt(1) + s.charAt(2), 16),
          'g': parseInt(s.charAt(3) + s.charAt(4), 16),
          'b': parseInt(s.charAt(5) + s.charAt(5), 16)
        };
      }else if (l == 3) {
        res = {
          'r': parseInt(s.charAt(1) + s.charAt(1), 16),
          'g': parseInt(s.charAt(2) + s.charAt(2), 16),
          'b': parseInt(s.charAt(3) + s.charAt(3), 16)
        };
      }
    }
  }

  if (asArray) {
    res = [
      res['r'],
      res['g'],
      res['b']
    ];
  }

  return res;
};

sigma.tools.rgbToHex = function(R, G, B) {
  return sigma.tools.toHex(R) + sigma.tools.toHex(G) + sigma.tools.toHex(B);
};

sigma.tools.toHex = function(n) {
  n = parseInt(n, 10);

  if (isNaN(n)) {
    return '00';
  }
  n = Math.max(0, Math.min(n, 255));
  return '0123456789ABCDEF'.charAt((n - n % 16) / 16) +
         '0123456789ABCDEF'.charAt(n % 16);
};

sigma.easing = {
  linear: {},
  quadratic: {}
};

sigma.easing.linear.easenone = function(k) {
  return k;
};

sigma.easing.quadratic.easein = function(k) {
  return k * k;
};

sigma.easing.quadratic.easeout = function(k) {
  return - k * (k - 2);
};

sigma.easing.quadratic.easeinout = function(k) {
  if ((k *= 2) < 1) return 0.5 * k * k;
  return - 0.5 * (--k * (k - 2) - 1);
};

sigma.debugMode = 0;

sigma.log = function() {
  if (sigma.debugMode == 1) {
    for (var k in arguments) {
      console.log(arguments[k]);
    }
  }else if (sigma.debugMode > 1) {
    for (var k in arguments) {
      throw new Error(arguments[k]);
    }
  }

  return sigma;
};

/**
 * Add a function to the prototype of SigmaPublic, but with access to the
 * Sigma class properties.
 * @param {string} pluginName        [description].
 * @param {function} caller          [description].
 * @param {function(Sigma)} launcher [description].
 */
sigma.addPlugin = function(pluginName, caller, launcher) {
  SigmaPublic.prototype[pluginName] = caller;
  local.plugins.push(launcher);
};
/**
 * sigma.chronos manages frames insertion to simulate asynchronous computing.
 * It has been designed to make possible to execute heavy computing tasks
 * for the browser, without freezing it.
 * @constructor
 * @extends sigma.classes.Cascade
 * @extends sigma.classes.EventDispatcher
 * @this {sigma.chronos}
 */
sigma.chronos = new (function() {
  sigma.classes.EventDispatcher.call(this);

  /**
   * Represents "this", without the well-known scope issue.
   * @private
   * @type {sigma.chronos}
   */
  var self = this;

  /**
   * Indicates whether any task is actively running or not.
   * @private
   * @type {boolean}
   */
  var isRunning = false;

  /**
   * Indicates the FPS "goal", that will define the theoretical
   * frame length.
   * @private
   * @type {number}
   */
  var fpsReq = 80;

  /**
   * Stores the last computed FPS value (FPS is computed only when any
   * task is running).
   * @private
   * @type {number}
   */
  var lastFPS = 0;

  /**
   * The number of frames inserted since the last start.
   * @private
   * @type {number}
   */
  var framesCount = 0;

  /**
   * The theoretical frame time.
   * @private
   * @type {number}
   */
  var frameTime = 1000 / fpsReq;

  /**
   * The theoretical frame length, minus the last measured delay.
   * @private
   * @type {number}
   */
  var correctedFrameTime = frameTime;

  /**
   * The measured length of the last frame.
   * @private
   * @type {number}
   */
  var effectiveTime = 0;

  /**
   * The time passed since the last runTasks action.
   * @private
   * @type {number}
   */
  var currentTime = 0;

  /**
   * The time when the last frame was inserted.
   * @private
   * @type {number}
   */
  var startTime = 0;

  /**
   * The difference between the theoretical frame length and the
   * last measured frame length.
   * @private
   * @type {number}
   */
  var delay = 0;

  /**
   * The container of all active generators.
   * @private
   * @type {Object.<string, Object>}
   */
  var generators = {};

  /**
   * The array of all the referenced and active tasks.
   * @private
   * @type {Array.<Object>}
   */
  var tasks = [];

  /**
   * The array of all the referenced and queued tasks.
   * @private
   * @type {Array.<Object>}
   */
  var queuedTasks = [];

  /**
   * The index of the next task to execute.
   * @private
   * @type {number}
   */
  var taskIndex = 0;


  /**
   * Inserts a frame before executing the callback.
   * @param  {function()} callback The callback to execute after having
   *                               inserted the frame.
   * @return {sigma.chronos} Returns itself.
   */
  function insertFrame(callback) {
    window.setTimeout(callback, 0);
    return self;
  }

  /**
   * The local method that executes routine, and inserts frames when needed.
   * It dispatches a "frameinserted" event after having inserted any frame,
   * and an "insertframe" event before.
   * @private
   */
  function frameInserter() {
    self.dispatch('frameinserted');
    while (isRunning && tasks.length && routine()) {}

    if (!isRunning || !tasks.length) {
      stopTasks();
    } else {
      startTime = (new Date()).getTime();
      framesCount++;
      delay = effectiveTime - frameTime;
      correctedFrameTime = frameTime - delay;

      self.dispatch('insertframe');
      insertFrame(frameInserter);
    }
  };

  /**
   * The local method that executes the tasks, and compares the current frame
   * length to the ideal frame length.
   * @private
   * @return {boolean} Returns false if the current frame should be ended,
   *                   and true else.
   */
  function routine() {
    taskIndex = taskIndex % tasks.length;

    if (!tasks[taskIndex].task()) {
      var n = tasks[taskIndex].taskName;

      queuedTasks = queuedTasks.filter(function(e) {
        (e.taskParent == n) && tasks.push({
          taskName: e.taskName,
          task: e.task
        });
        return e.taskParent != n;
      });

      self.dispatch('killed', tasks.splice(taskIndex--, 1)[0]);
    }

    taskIndex++;
    effectiveTime = (new Date()).getTime() - startTime;
    return effectiveTime <= correctedFrameTime;
  };

  /**
   * Starts tasks execution.
   * @return {sigma.chronos} Returns itself.
   */
  function runTasks() {
    isRunning = true;
    taskIndex = 0;
    framesCount = 0;

    startTime = (new Date()).getTime();
    currentTime = startTime;

    self.dispatch('start');
    self.dispatch('insertframe');
    insertFrame(frameInserter);
    return self;
  };

  /**
   * Stops tasks execution, and dispatch a "stop" event.
   * @return {sigma.chronos} Returns itself.
   */
  function stopTasks() {
    self.dispatch('stop');
    isRunning = false;
    return self;
  };

  /**
   * A task is a function that will be executed continuously while it returns
   * true. As soon as it return false, the task will be removed.
   * If several tasks are present, they will be executed in parallele.
   * This method will add the task to this execution process.
   * @param {function(): boolean} task     The task to add.
   * @param {string} name                  The name of the worker, used for
   *                                       managing the different tasks.
   * @param {boolean} autostart            If true, sigma.chronos will start
   *                                       automatically if it is not working
   *                                       yet.
   * @return {sigma.chronos} Returns itself.
   */
  function addTask(task, name, autostart) {
    if (typeof task != 'function') {
      throw new Error('Task "' + name + '" is not a function');
    }

    tasks.push({
      taskName: name,
      task: task
    });

    isRunning = !!(isRunning || (autostart && runTasks()) || true);
    return self;
  };

  /**
   * Will add a task that will be start to be executed as soon as a task
   * named as the parent will be removed.
   * @param {function(): boolean} task     The task to add.
   * @param {string} name                  The name of the worker, used for
   *                                       managing the different tasks.
   * @param {string} parent                The name of the parent task.
   * @return {sigma.chronos} Returns itself.
   */
  function queueTask(task, name, parent) {
    if (typeof task != 'function') {
      throw new Error('Task "' + name + '" is not a function');
    }

    if (!tasks.concat(queuedTasks).some(function(e) {
      return e.taskName == parent;
    })) {
      throw new Error(
        'Parent task "' + parent + '" of "' + name + '" is not attached.'
      );
    }

    queuedTasks.push({
      taskParent: parent,
      taskName: name,
      task: task
    });

    return self;
  };

  /**
   * Removes a task.
   * @param  {string} v           If v is undefined, then every tasks will
   *                              be removed. If not, each task named v will
   *                              be removed.
   * @param  {number} queueStatus Determines the queued tasks behaviour. If 0,
   *                              then nothing will happen. If 1, the tasks
   *                              queued to any removed task will be triggered.
   *                              If 2, the tasks queued to any removed task
   *                              will be removed as well.
   * @return {sigma.chronos} Returns itself.
   */
  function removeTask(v, queueStatus) {
    if (v == undefined) {
      tasks = [];
      if (queueStatus == 1) {
        queuedTasks = [];
      }else if (queueStatus == 2) {
        tasks = queuedTasks;
        queuedTasks = [];
      }
      stopTasks();
    } else {
      var n = (typeof v == 'string') ? v : '';
      tasks = tasks.filter(function(e) {
        if ((typeof v == 'string') ? e.taskName == v : e.task == v) {
          n = e.taskName;
          return false;
        }
        return true;
      });

      if (queueStatus > 0) {
        queuedTasks = queuedTasks.filter(function(e) {
          if (queueStatus == 1 && e.taskParent == n) {
            tasks.push(e);
          }
          return e.taskParent != n;
        });
      }
    }

    isRunning = !!(!tasks.length || (stopTasks() && false));
    return self;
  };

  /**
   * A generator is a pair task/condition. The task will be executed
   * while it returns true.
   * When it returns false, the condition will be tested. If
   * the condition returns true, the task will be executed
   * again at the next process iteration. If not, the generator
   * is removed.
   * If several generators are present, they will be executed one
   * by one: When the first stops, the second will start, etc. When
   * they are all ended, then the conditions will be tested to know
   * which generators have to be started again.
   * @param {string} id                     The generators ID.
   * @param {function(): boolean} task      The generator's task.
   * @param {function(): boolean} condition The generator's condition.
   * @return {sigma.chronos} Returns itself.
   */
  function addGenerator(id, task, condition) {
    if (generators[id] != undefined) {
      return self;
    }

    generators[id] = {
      task: task,
      condition: condition
    };

    getGeneratorsCount(true) == 0 && startGenerators();
    return self;
  };

  /**
   * Removes a generator. It means that the task will continue being eecuted
   * until it returns false, but then the
   * condition will not be tested.
   * @param  {string} id The generator's ID.
   * @return {sigma.chronos} Returns itself.
   */
  function removeGenerator(id) {
    if (generators[id]) {
      generators[id].on = false;
      generators[id].del = true;
    }
    return self;
  };

  /**
   * Returns the number of generators.
   * @private
   * @param  {boolean} running If true, returns the number of active
   *                          generators instead.
   * @return {sigma.chronos} Returns itself.
   */
  function getGeneratorsCount(running) {
    return running ?
      Object.keys(generators).filter(function(id) {
        return !!generators[id].on;
      }).length :
      Object.keys(generators).length;
  };

  /**
   * Returns the array of the generators IDs.
   * @return {array.<string>} The array of IDs.
   */
  function getGeneratorsIDs() {
    return Object.keys(generators);
  }

  /**
   * startGenerators is the method that manages which generator
   * is the next to start when another one stops. It will dispatch
   * a "stopgenerators" event if there is no more generator to start,
   * and a "startgenerators" event else.
   * @return {sigma.chronos} Returns itself.
   */
  function startGenerators() {
    if (!Object.keys(generators).length) {
      self.dispatch('stopgenerators');
    }else {
      self.dispatch('startgenerators');

      self.unbind('killed', onTaskEnded);
      insertFrame(function() {
        for (var k in generators) {
          generators[k].on = true;
          addTask(
            generators[k].task,
            k,
            false
          );
        }
      });

      self.bind('killed', onTaskEnded).runTasks();
    }

    return self;
  };

  /**
   * A callback triggered everytime the task of a generator stops, that will
   * test the related generator's condition, and see if there is still any
   * generator to start.
   * @private
   * @param  {Object} e The sigma.chronos "killed" event.
   */
  function onTaskEnded(e) {
    if (generators[e['content'].taskName] != undefined) {
      if (generators[e['content'].taskName].del ||
          !generators[e['content'].taskName].condition()) {
        delete generators[e['content'].taskName];
      }else {
        generators[e['content'].taskName].on = false;
      }

      if (getGeneratorsCount(true) == 0) {
        startGenerators();
      }
    }
  };

  /**
   * Either set or returns the fpsReq property. This property determines
   * the number of frames that should be inserted per second.
   * @param  {?number} v The frequency asked.
   * @return {(Chronos|number)} Returns the frequency if v is undefined, and
   *                          itself else.
   */
  function frequency(v) {
    if (v != undefined) {
      fpsReq = Math.abs(1 * v);
      frameTime = 1000 / fpsReq;
      framesCount = 0;
      return self;
    } else {
      return fpsReq;
    }
  };

  /**
   * Returns the actual average number of frames that are inserted per
   * second.
   * @return {number} The actual average FPS.
   */
  function getFPS() {
    if (isRunning) {
      lastFPS =
        Math.round(
          framesCount /
          ((new Date()).getTime() - currentTime) *
          10000
        ) / 10;
    }

    return lastFPS;
  };

  /**
   * Returns the number of tasks.
   * @return {number} The number of tasks.
   */
  function getTasksCount() {
    return tasks.length;
  }

  /**
   * Returns the number of queued tasks.
   * @return {number} The number of queued tasks.
   */
  function getQueuedTasksCount() {
    return queuedTasks.length;
  }

  /**
   * Returns how long sigma.chronos has active tasks running
   * without interuption for, in ms.
   * @return {number} The time chronos is running without interuption for.
   */
  function getExecutionTime() {
    return startTime - currentTime;
  }

  this.frequency = frequency;

  this.runTasks = runTasks;
  this.stopTasks = stopTasks;
  this.insertFrame = insertFrame;

  this.addTask = addTask;
  this.queueTask = queueTask;
  this.removeTask = removeTask;

  this.addGenerator = addGenerator;
  this.removeGenerator = removeGenerator;
  this.startGenerators = startGenerators;
  this.getGeneratorsIDs = getGeneratorsIDs;

  this.getFPS = getFPS;
  this.getTasksCount = getTasksCount;
  this.getQueuedTasksCount = getQueuedTasksCount;
  this.getExecutionTime = getExecutionTime;

  return this;
})();

sigma.publicPrototype = SigmaPublic.prototype;
})();

