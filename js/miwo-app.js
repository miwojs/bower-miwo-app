(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Application, EventManager,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventManager = require('./EventManager');

Application = (function(_super) {
  __extends(Application, _super);

  Application.inject('injector');

  Application.inject('controllerFactory', 'miwo.controllerFactory');

  Application.prototype.eventMgr = null;

  Application.prototype.componentMgr = null;

  Application.prototype.viewport = null;

  Application.prototype.rendered = false;

  Application.prototype.controllers = null;

  Application.prototype.runControllers = null;

  Application.prototype.autoCanonicalize = true;

  function Application(config) {
    this.controllers = {};
    this.eventMgr = new EventManager();
    Application.__super__.constructor.call(this, config);
    return;
  }

  Application.prototype.setInjector = function(injector) {
    this.injector = injector;
    if (!injector.has('viewport')) {
      throw new Error("Missing 'viewport' service. Viewport is required to render your application");
    }
  };

  Application.prototype.run = function(render) {
    var name, _i, _len, _ref;
    if (render == null) {
      render = null;
    }
    _ref = this.runControllers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      this.getController(name, (function(_this) {
        return function(controller) {
          _this.runControllers.erase(controller.name);
          if (_this.runControllers.length === 0) {
            if (render) {
              _this.render(render);
            }
          }
        };
      })(this));
    }
  };

  Application.prototype.render = function(target) {
    var controller, name, viewport, _ref, _ref1;
    if (target == null) {
      target = null;
    }
    if (!this.rendered) {
      this.rendered = true;
      viewport = this.getViewport();
      _ref = this.controllers;
      for (name in _ref) {
        controller = _ref[name];
        controller.beforeRender();
      }
      viewport.render(target || miwo.body);
      _ref1 = this.controllers;
      for (name in _ref1) {
        controller = _ref1[name];
        controller.afterRender();
      }
      window.onhashchange = this.executeRequestByHash.bind(this);
      this.executeRequestByHash();
    }
  };

  Application.prototype.getController = function(name, onReady) {
    var controller;
    controller = this.controllers[name];
    if (!controller) {
      controller = this.controllers[name] = this.controllerFactory.create(name);
      controller.application = this;
      controller.onStartup(onReady);
      controller.initialize();
    } else {
      controller.onStartup(onReady);
    }
  };

  Application.prototype.control = function(target, events) {
    if (Type.isString(target)) {
      this.eventMgr.control(target, events);
    } else {
      target.on(events);
    }
  };

  Application.prototype.getViewport = function() {
    return this.injector.get('viewport');
  };

  Application.prototype.getRouter = function() {
    return this.injector.get('miwo.router');
  };

  Application.prototype.execute = function(request) {
    this.getController(request.controller, (function(_this) {
      return function(controller) {
        controller.execute(request);
      };
    })(this));
  };

  Application.prototype.forward = function(request) {
    miwo.async((function(_this) {
      return function() {
        return _this.execute(request);
      };
    })(this));
  };

  Application.prototype.redirect = function(request, unique) {
    if (Type.isString(request) && request.charAt(0) === '#') {
      request = this.getRouter().constructRequest(request.replace(/^#/, ''));
    }
    if (!this.request) {
      this.redirectRequest(request, unique);
    } else {
      this.getController(this.request.controller, (function(_this) {
        return function(controller) {
          controller.terminate(_this.request, function() {
            _this.redirectRequest(request, unique);
          });
        };
      })(this));
    }
  };

  Application.prototype.redirectRequest = function(request, unique) {
    var hash;
    if (unique) {
      request.params._rid = Math.random().toString(36).substring(4, 10);
    }
    hash = this.getRouter().constructHash(request);
    this.emit('request', this, request, hash);
    document.location.hash = hash;
  };

  Application.prototype.executeRequestByHash = function() {
    var constructedHash, hash, request;
    hash = document.location.hash.substr(1);
    if (!hash && !this.autoCanonicalize) {
      return;
    }
    request = this.getRouter().constructRequest(hash);
    constructedHash = this.getRouter().constructHash(request);
    if (this.autoCanonicalize && constructedHash !== hash) {
      document.location.hash = constructedHash;
      return;
    }
    this.execute(request);
  };

  return Application;

})(Miwo.Object);

module.exports = Application;


},{"./EventManager":6}],2:[function(require,module,exports){
var ContentContainer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ContentContainer = (function(_super) {
  __extends(ContentContainer, _super);

  function ContentContainer() {
    return ContentContainer.__super__.constructor.apply(this, arguments);
  }

  ContentContainer.prototype.baseCls = 'miwo-views';

  ContentContainer.prototype.role = 'main';

  ContentContainer.prototype.contentEl = 'div';

  ContentContainer.prototype.addedComponent = function(component) {
    ContentContainer.__super__.addedComponent.call(this, component);
    component.el.addClass(this.getBaseCls('item'));
  };

  return ContentContainer;

})(Miwo.Container);

module.exports = ContentContainer;


},{}],3:[function(require,module,exports){
var Controller,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Controller = (function(_super) {
  __extends(Controller, _super);

  Controller.prototype.name = null;

  Controller.prototype.injector = null;

  Controller.prototype.application = null;

  Controller.prototype.request = null;

  Controller.prototype.views = null;

  Controller.prototype.view = null;

  Controller.prototype.request = null;

  Controller.prototype.lastRequest = null;

  Controller.service = function(prop, service) {
    if (service == null) {
      service = null;
    }
    Object.defineProperty(this.prototype, prop, {
      get: function() {
        return this.injector.get(service || prop);
      }
    });
  };

  Controller.registerView = function(name, klass) {
    this.prototype['create' + name.capitalize()] = function(config) {
      return new klass(config);
    };
  };

  function Controller(config) {
    Controller.__super__.constructor.call(this, config);
    this.startuped = false;
    this.onStartupCallbacks = [];
    this.views = {};
    return;
  }

  Controller.prototype.initialize = function() {
    this.startup((function(_this) {
      return function() {
        miwo.async(function() {
          var callback, _i, _len, _ref;
          _this.startuped = true;
          _ref = _this.onStartupCallbacks;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            callback = _ref[_i];
            callback(_this);
          }
          _this.onStartupCallbacks.empty();
        });
      };
    })(this));
  };

  Controller.prototype.onStartup = function(callback) {
    if (!this.startuped) {
      this.onStartupCallbacks.push(callback);
    } else {
      miwo.async((function(_this) {
        return function() {
          return callback(_this);
        };
      })(this));
    }
  };

  Controller.prototype.startup = function(done) {
    done();
  };

  Controller.prototype.beforeRender = function() {};

  Controller.prototype.afterRender = function() {};

  Controller.prototype.control = function(target, events) {
    this.application.control(target, this.boundEvents(events));
  };

  Controller.prototype.getViewport = function() {
    return this.application.getViewport();
  };

  Controller.prototype.setInjector = function(injector) {
    this.injector = injector;
  };

  Controller.prototype.boundEvents = function(events) {
    var callback, name;
    for (name in events) {
      callback = events[name];
      events[name] = this.boundEvent(callback);
    }
    return events;
  };

  Controller.prototype.boundEvent = function(callback) {
    return (function(_this) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (Type.isString(callback)) {
          return _this[callback].apply(_this, args);
        } else {
          return callback.apply(_this, args);
        }
      };
    })(this);
  };

  Controller.prototype.refresh = function(name) {
    var renderName, view;
    if (this.hasView(name)) {
      view = this.getView(name);
      renderName = this.formatMethodName(view.request.action, 'render');
      if (this[renderName]) {
        this[renderName](view.request, view);
      }
    }
  };

  Controller.prototype.forward = function(code, params) {
    if (this.request) {
      this.request.executed = true;
    }
    this.application.forward(this.createRequest(code, params));
  };

  Controller.prototype.redirect = function(code, params, unique) {
    var request;
    if (this.request) {
      this.request.executed = true;
    }
    request = Type.isString(code) ? this.createRequest(code, params) : code;
    this.application.redirect(request, unique);
  };

  Controller.prototype.createRequest = function(code, params) {
    return this.injector.get('miwo.requestFactory').create(code, params, {
      name: this.name,
      action: this.action
    });
  };

  Controller.prototype.execute = function(request) {
    var methodName;
    this.request = request;
    methodName = this.formatMethodName(request.action, 'show');
    if (!this[methodName]) {
      this.executeDone(request);
      return;
    }
    this[methodName](request, (function(_this) {
      return function(view) {
        _this.executeDone(request, view);
      };
    })(this));
  };

  Controller.prototype.executeDone = function(request, viewName) {
    var view;
    if (request.executed) {
      return;
    }
    request.executed = true;
    if (!viewName) {
      viewName = request.action;
    }
    request.view = viewName;
    view = this.getView(viewName || request.action);
    view.request = request;
    this.application.request = request;
    this.getViewport().activateView(view.viewName, (function(_this) {
      return function() {
        var methodName;
        methodName = _this.formatMethodName(viewName, 'render');
        if (_this[methodName]) {
          _this[methodName](request, view);
        }
      };
    })(this));
  };

  Controller.prototype.terminate = function(request, callback) {
    var methodName;
    methodName = this.formatMethodName(request.view, 'hide');
    if (!this[methodName]) {
      miwo.async((function(_this) {
        return function() {
          return callback();
        };
      })(this));
      return;
    }
    this[methodName](request, this.getView(request.view), (function(_this) {
      return function() {
        miwo.async(function() {
          return callback();
        });
      };
    })(this));
  };

  Controller.prototype.getView = function(name) {
    var viewName, viewport;
    viewport = this.getViewport();
    viewName = this.formatViewName(name);
    if (!viewport.hasView(viewName)) {
      viewport.addView(viewName, this.createView(name));
    }
    return viewport.getView(viewName);
  };

  Controller.prototype.hasView = function(name) {
    var viewName, viewport;
    viewport = this.getViewport();
    viewName = this.formatViewName(name);
    return viewport.hasView(viewName);
  };

  Controller.prototype.createView = function(name) {
    var factory, view;
    factory = 'create' + name.capitalize();
    if (!this[factory]) {
      throw new Error("View " + name + " has no factory method. You must define " + factory + " method in controller " + this);
    }
    view = this[factory]();
    if (!(view instanceof Miwo.Component)) {
      throw new Error("Created view should by instance of Miwo.Component");
    }
    view.isView = true;
    view.visible = false;
    view.viewName = this.formatViewName(name);
    view.setId(this.name + name.capitalize());
    return view;
  };

  Controller.prototype.formatMethodName = function(action, type) {
    return type + action.capitalize();
  };

  Controller.prototype.formatViewName = function(action) {
    return this.name + '.' + action;
  };

  return Controller;

})(Miwo.Object);

module.exports = Controller;


},{}],4:[function(require,module,exports){
var Controller, ControllerFactory,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Controller = require('./Controller');

ControllerFactory = (function(_super) {
  __extends(ControllerFactory, _super);

  ControllerFactory.prototype.injector = ControllerFactory.inject('injector');

  ControllerFactory.prototype.namespace = 'App';

  ControllerFactory.prototype.controllers = null;

  function ControllerFactory(config) {
    ControllerFactory.__super__.constructor.call(this, config);
    this.controllers = {};
  }

  ControllerFactory.prototype.register = function(name, klass) {
    this.controllers[name] = klass;
    return this;
  };

  ControllerFactory.prototype.create = function(name) {
    var controller, e, klass, klassName;
    klassName = this.formatClassName(name);
    try {
      klass = eval(klassName);
    } catch (_error) {
      e = _error;
      throw new Error("Controller class " + klassName + " is bad defined");
    }
    if (typeof klass !== 'function') {
      throw new Error("Controller class " + klassName + " is not constructor");
    }
    controller = this.injector.createInstance(klass);
    controller.setInjector(this.injector);
    controller.name = name;
    if (!(controller instanceof Controller)) {
      throw new Error("Controller " + klassName + " is not instance of Controller");
    }
    return controller;
  };

  ControllerFactory.prototype.formatClassName = function(name) {
    if (this.controllers[name]) {
      return this.controllers[name];
    } else {
      return this.namespace + '.controllers.' + name.capitalize() + 'Controller';
    }
  };

  return ControllerFactory;

})(Miwo.Object);

module.exports = ControllerFactory;


},{"./Controller":3}],5:[function(require,module,exports){
var Application, ControllerFactory, FlashNotificator, MiwoAppExtension, RequestFactory, Router,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Application = require('./Application');

Router = require('./Router');

RequestFactory = require('./RequestFactory');

FlashNotificator = require('./FlashNotificator');

ControllerFactory = require('./ControllerFactory');

MiwoAppExtension = (function(_super) {
  __extends(MiwoAppExtension, _super);

  function MiwoAppExtension() {
    return MiwoAppExtension.__super__.constructor.apply(this, arguments);
  }

  MiwoAppExtension.prototype.init = function() {
    this.setConfig({
      flash: null,
      controllers: {},
      run: [],
      defaultController: 'default',
      defaultAction: 'default',
      autoCanonicalize: true
    });
  };

  MiwoAppExtension.prototype.build = function(injector) {
    injector.define('application', Application, (function(_this) {
      return function(service) {
        service.runControllers = _this.config.run;
        return service.autoCanonicalize = _this.config.autoCanonicalize;
      };
    })(this));
    injector.define('flash', FlashNotificator, (function(_this) {
      return function(service) {
        return service.renderer = _this.config.flash;
      };
    })(this));
    injector.define('miwo.controllerFactory', ControllerFactory, (function(_this) {
      return function(service) {
        var controller, name, _ref;
        service.namespace = _this.config.namespace;
        _ref = _this.config.controllers;
        for (name in _ref) {
          controller = _ref[name];
          service.register(name, controller);
        }
      };
    })(this));
    injector.define('miwo.router', Router, (function(_this) {
      return function(service) {
        service.controller = _this.config.defaultController;
        service.action = _this.config.defaultAction;
      };
    })(this));
    injector.define('miwo.requestFactory', RequestFactory);
  };

  return MiwoAppExtension;

})(Miwo.di.InjectorExtension);

module.exports = MiwoAppExtension;


},{"./Application":1,"./ControllerFactory":4,"./FlashNotificator":7,"./RequestFactory":9,"./Router":10}],6:[function(require,module,exports){
var EventManager,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventManager = (function(_super) {
  __extends(EventManager, _super);

  EventManager.prototype.selectors = null;

  function EventManager() {
    EventManager.__super__.constructor.call(this);
    this.selectors = [];
    miwo.componentMgr.on('register', this.bound('onRegister'));
    miwo.componentMgr.on('unregister', this.bound('onUnregister'));
    return;
  }

  EventManager.prototype.control = function(selector, events) {
    this.selectors.push({
      selector: selector,
      events: events,
      parts: selector.split(' ')
    });
  };

  EventManager.prototype.onRegister = function(component) {
    var event, item, name, _i, _len, _ref, _ref1;
    _ref = this.selectors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (item.parts.length === 1 && this.isMatched(component, item)) {
        _ref1 = item.events;
        for (name in _ref1) {
          event = _ref1[name];
          component.on(name, event);
        }
      }
    }
    component.on('attached', this.bound('onAttached'));
    component.on('detached', this.bound('onDetached'));
  };

  EventManager.prototype.onUnregister = function(component) {
    var event, item, name, _i, _len, _ref, _ref1;
    _ref = this.selectors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (item.parts.length === 1 && this.isMatched(component, item)) {
        _ref1 = item.events;
        for (name in _ref1) {
          event = _ref1[name];
          component.un(name, event);
        }
      }
    }
    component.un('attached', this.bound('onAttached'));
    component.un('detached', this.bound('onDetached'));
  };

  EventManager.prototype.onAttached = function(component) {
    var child, event, item, name, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    _ref = this.selectors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (item.parts.length > 1 && this.isMatched(component, item)) {
        _ref1 = item.events;
        for (name in _ref1) {
          event = _ref1[name];
          component.on(name, event);
        }
      }
    }
    if (component.isContainer) {
      _ref2 = component.getComponents().toArray();
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        child = _ref2[_j];
        this.onAttached(child);
      }
    }
  };

  EventManager.prototype.onDetached = function(component) {
    var child, event, item, name, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    _ref = this.selectors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (item.parts.length > 1 && this.isMatched(component, item)) {
        _ref1 = item.events;
        for (name in _ref1) {
          event = _ref1[name];
          component.un(name, event);
        }
      }
    }
    if (component.isContainer) {
      _ref2 = component.getComponents().toArray();
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        child = _ref2[_j];
        this.onDetached(child);
      }
    }
  };

  EventManager.prototype.isMatched = function(component, item) {
    var index, indexLast, selector, selectors, _i;
    if (Type.isString(item)) {
      selectors = item.split(' ');
    } else {
      selectors = item.parts;
    }
    if (!component.is(selectors[selectors.length - 1])) {
      return false;
    }
    if (selectors.length === 1) {
      return true;
    }
    component = component.getParent();
    indexLast = selectors.length - 1;
    for (index = _i = selectors.length - 1; _i >= 0; index = _i += -1) {
      selector = selectors[index];
      if (index === indexLast) {
        continue;
      }
      while (component && !component.is(selector)) {
        component = component.getParent();
      }
      if (component === null) {
        return false;
      }
    }
    return true;
  };

  EventManager.prototype.doDestroy = function() {
    miwo.componentMgr.un('register', this.bound('onRegister'));
    miwo.componentMgr.un('unregister', this.bound('onUnregister'));
  };

  return EventManager;

})(Miwo.Object);

module.exports = EventManager;


},{}],7:[function(require,module,exports){
var FlashNotificator;

FlashNotificator = (function() {
  FlashNotificator.prototype.renderer = null;

  function FlashNotificator() {
    this.renderer = function(message, type) {
      if (console) {
        console.log('FLASH:', message, type);
      }
    };
  }

  FlashNotificator.prototype.error = function(message) {
    this.message(message, 'error');
  };

  FlashNotificator.prototype.info = function(message) {
    this.message(message, 'info');
  };

  FlashNotificator.prototype.warning = function(message) {
    this.message(message, 'warning');
  };

  FlashNotificator.prototype.message = function(message, type) {
    if (!this.renderer) {
      return;
    }
    this.renderer(message, type);
  };

  return FlashNotificator;

})();

module.exports = FlashNotificator;


},{}],8:[function(require,module,exports){
var Request;

Request = (function() {
  Request.prototype.isRequest = true;

  Request.prototype.controller = null;

  Request.prototype.action = null;

  Request.prototype.view = null;

  Request.prototype.params = null;

  function Request(controller, action, params) {
    this.controller = controller;
    this.action = action;
    if (params == null) {
      params = {};
    }
    this.params = Object.merge({}, params);
  }

  return Request;

})();

module.exports = Request;


},{}],9:[function(require,module,exports){
var Request, RequestFactory;

Request = require('./Request');

RequestFactory = (function() {
  function RequestFactory() {}

  RequestFactory.prototype.codeRe = /^(([a-zA-Z]+)\:)?([a-z][a-zA-Z]+)?$/;

  RequestFactory.prototype.create = function(code, params, defaults) {
    var action, controller, parts;
    parts = code.match(this.codeRe);
    if (!parts) {
      throw new Error("Bad redirect CODE");
    }
    controller = parts[2] !== void 0 ? parts[2] : defaults.name;
    action = parts[3] !== 'this' ? parts[3] : defaults.action;
    return new Request(controller, action, params);
  };

  return RequestFactory;

})();

module.exports = RequestFactory;


},{"./Request":8}],10:[function(require,module,exports){
var Request, Router,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Request = require('./Request');

Router = (function(_super) {
  __extends(Router, _super);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.controller = "default";

  Router.prototype.action = "default";

  Router.prototype.constructRequest = function(hash) {
    var action, controller, match, params;
    match = hash.match(/^(([a-zA-Z]*)(\:([a-z][a-zA-Z]+))?(\?(.*))?)?$/);
    controller = match[2] || this.controller;
    action = match[4] || this.action;
    params = (match[6] ? this.parseQuery(match[6]) : {});
    return new Request(controller, action, params);
  };

  Router.prototype.constructHash = function(request) {
    var hash, query;
    hash = request.controller;
    if ((request.action && request.action !== this.action) || (request.params && Object.getLength(request.params) > 0)) {
      hash += ":" + request.action;
      if (request.params) {
        query = Object.toQueryString(request.params);
        if (query) {
          hash += "?" + query;
        }
      }
    }
    return hash;
  };

  Router.prototype.parseQuery = function(string) {
    var item, parts, query, _i, _len, _ref;
    query = {};
    _ref = string.split('&');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      parts = item.split('=');
      query[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }
    return query;
  };

  return Router;

})(Miwo.Object);

module.exports = Router;


},{"./Request":8}],11:[function(require,module,exports){
var ContentContainer, Viewport,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ContentContainer = require('./ContentContainer');

Viewport = (function(_super) {
  __extends(Viewport, _super);

  function Viewport() {
    return Viewport.__super__.constructor.apply(this, arguments);
  }

  Viewport.prototype.id = 'viewport';

  Viewport.prototype.name = 'viewport';

  Viewport.prototype.layout = 'absolute';

  Viewport.prototype.baseCls = 'miwo-viewport';

  Viewport.prototype.contentEl = 'div';

  Viewport.prototype.view = null;

  Viewport.prototype.animation = false;

  Viewport.prototype.animationFxIn = 'fadeIn';

  Viewport.prototype.animationFxOut = 'fadeOut';

  Viewport.prototype.animationDuration = 1000;

  Viewport.prototype.afterInit = function() {
    Viewport.__super__.afterInit.apply(this, arguments);
    this.content = this.get('content', false);
    if (!this.content) {
      throw new Error("Content component missing");
    }
    if (!(this.content instanceof ContentContainer)) {
      throw new Error("Content component should by instance of ContentContainer");
    }
  };

  Viewport.prototype.addContent = function(config) {
    return this.add('content', new ContentContainer(config));
  };

  Viewport.prototype.hasView = function(name) {
    return !!this.content.get(this.formatName(name), false);
  };

  Viewport.prototype.getView = function(name) {
    return this.content.get(this.formatName(name));
  };

  Viewport.prototype.addView = function(name, component) {
    return this.content.add(this.formatName(name), component);
  };

  Viewport.prototype.activateView = function(name, callback) {
    if (!this.view) {
      this.view = this.getView(name);
      this.view.setActive(true);
      this.view.show();
      callback();
      return;
    }
    this.hideView((function(_this) {
      return function() {
        _this.view.setActive(false);
        _this.view = _this.getView(name);
        _this.showView(function() {
          _this.view.setActive(true);
          callback(_this.view);
        });
      };
    })(this));
  };

  Viewport.prototype.hideView = function(callback) {
    if (!this.view) {
      callback();
    }
    if (!this.animation) {
      this.view.hide();
      callback();
    } else {
      this.view.el.addClass('animated').addClass(this.animationFxOut);
      setTimeout((function(_this) {
        return function() {
          _this.view.hide();
          _this.view.el.removeClass('animated').removeClass(_this.animationFxOut);
          callback();
        };
      })(this), this.animationDuration);
    }
  };

  Viewport.prototype.showView = function(callback) {
    if (!this.animation) {
      this.view.show();
      callback();
    } else {
      this.view.el.addClass('animated').addClass(this.animationFxIn);
      this.view.show();
      callback();
      setTimeout((function(_this) {
        return function() {
          _this.view.el.removeClass('animated').removeClass(_this.animationFxIn);
        };
      })(this), this.animationDuration);
    }
  };

  Viewport.prototype.formatName = function(name) {
    var group, section, _ref;
    _ref = name.split('.'), group = _ref[0], section = _ref[1];
    return group + section.capitalize();
  };

  return Viewport;

})(Miwo.Container);

module.exports = Viewport;


},{"./ContentContainer":2}],12:[function(require,module,exports){
Miwo.app = {
  Application: require('./Application'),
  Controller: require('./Controller'),
  Router: require('./Router'),
  Request: require('./Request'),
  RequestFactory: require('./RequestFactory'),
  FlashNotificator: require('./FlashNotificator'),
  EventManager: require('./EventManager'),
  Viewport: require('./Viewport'),
  ContentContainer: require('./ContentContainer')
};

miwo.registerExtension('miwo-app', require('./DiExtension'));


},{"./Application":1,"./ContentContainer":2,"./Controller":3,"./DiExtension":5,"./EventManager":6,"./FlashNotificator":7,"./Request":8,"./RequestFactory":9,"./Router":10,"./Viewport":11}]},{},[12])