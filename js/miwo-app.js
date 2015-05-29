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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi93d3cvdmhvc3RzL21pd29qcy9taXdvLWFwcC9zcmMvQXBwbGljYXRpb24uY29mZmVlIiwiL3d3dy92aG9zdHMvbWl3b2pzL21pd28tYXBwL3NyYy9Db250ZW50Q29udGFpbmVyLmNvZmZlZSIsIi93d3cvdmhvc3RzL21pd29qcy9taXdvLWFwcC9zcmMvQ29udHJvbGxlci5jb2ZmZWUiLCIvd3d3L3Zob3N0cy9taXdvanMvbWl3by1hcHAvc3JjL0NvbnRyb2xsZXJGYWN0b3J5LmNvZmZlZSIsIi93d3cvdmhvc3RzL21pd29qcy9taXdvLWFwcC9zcmMvRGlFeHRlbnNpb24uY29mZmVlIiwiL3d3dy92aG9zdHMvbWl3b2pzL21pd28tYXBwL3NyYy9FdmVudE1hbmFnZXIuY29mZmVlIiwiL3d3dy92aG9zdHMvbWl3b2pzL21pd28tYXBwL3NyYy9GbGFzaE5vdGlmaWNhdG9yLmNvZmZlZSIsIi93d3cvdmhvc3RzL21pd29qcy9taXdvLWFwcC9zcmMvUmVxdWVzdC5jb2ZmZWUiLCIvd3d3L3Zob3N0cy9taXdvanMvbWl3by1hcHAvc3JjL1JlcXVlc3RGYWN0b3J5LmNvZmZlZSIsIi93d3cvdmhvc3RzL21pd29qcy9taXdvLWFwcC9zcmMvUm91dGVyLmNvZmZlZSIsIi93d3cvdmhvc3RzL21pd29qcy9taXdvLWFwcC9zcmMvVmlld3BvcnQuY29mZmVlIiwiL3d3dy92aG9zdHMvbWl3b2pzL21pd28tYXBwL3NyYy9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLHlCQUFBO0VBQUE7aVNBQUE7O0FBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxnQkFBUixDQUFmLENBQUE7O0FBQUE7QUFLQyxnQ0FBQSxDQUFBOztBQUFBLEVBQUEsV0FBQyxDQUFBLE1BQUQsQ0FBUSxVQUFSLENBQUEsQ0FBQTs7QUFBQSxFQUNBLFdBQUMsQ0FBQSxNQUFELENBQVEsbUJBQVIsRUFBNkIsd0JBQTdCLENBREEsQ0FBQTs7QUFBQSx3QkFHQSxRQUFBLEdBQVUsSUFIVixDQUFBOztBQUFBLHdCQUlBLFlBQUEsR0FBYyxJQUpkLENBQUE7O0FBQUEsd0JBS0EsUUFBQSxHQUFVLElBTFYsQ0FBQTs7QUFBQSx3QkFNQSxRQUFBLEdBQVUsS0FOVixDQUFBOztBQUFBLHdCQU9BLFdBQUEsR0FBYSxJQVBiLENBQUE7O0FBQUEsd0JBUUEsY0FBQSxHQUFnQixJQVJoQixDQUFBOztBQUFBLHdCQVNBLGdCQUFBLEdBQWtCLElBVGxCLENBQUE7O0FBWWEsRUFBQSxxQkFBQyxNQUFELEdBQUE7QUFDWixJQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFBZixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLFlBQUEsQ0FBQSxDQURoQixDQUFBO0FBQUEsSUFFQSw2Q0FBTSxNQUFOLENBRkEsQ0FBQTtBQUdBLFVBQUEsQ0FKWTtFQUFBLENBWmI7O0FBQUEsd0JBbUJBLFdBQUEsR0FBYSxTQUFFLFFBQUYsR0FBQTtBQUNaLElBRGEsSUFBQyxDQUFBLFdBQUEsUUFDZCxDQUFBO0FBQUEsSUFBQSxJQUFHLENBQUEsUUFBUyxDQUFDLEdBQVQsQ0FBYSxVQUFiLENBQUo7QUFDQyxZQUFVLElBQUEsS0FBQSxDQUFNLDZFQUFOLENBQVYsQ0FERDtLQURZO0VBQUEsQ0FuQmIsQ0FBQTs7QUFBQSx3QkF5QkEsR0FBQSxHQUFLLFNBQUMsTUFBRCxHQUFBO0FBRUosUUFBQSxvQkFBQTs7TUFGSyxTQUFTO0tBRWQ7QUFBQTtBQUFBLFNBQUEsMkNBQUE7c0JBQUE7QUFDQyxNQUFBLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBZixFQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxVQUFELEdBQUE7QUFFcEIsVUFBQSxLQUFDLENBQUEsY0FBYyxDQUFDLEtBQWhCLENBQXNCLFVBQVUsQ0FBQyxJQUFqQyxDQUFBLENBQUE7QUFFQSxVQUFBLElBQUcsS0FBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixLQUEwQixDQUE3QjtBQUVDLFlBQUEsSUFBbUIsTUFBbkI7QUFBQSxjQUFBLEtBQUMsQ0FBQSxNQUFELENBQVEsTUFBUixDQUFBLENBQUE7YUFGRDtXQUpvQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLENBQUEsQ0FERDtBQUFBLEtBRkk7RUFBQSxDQXpCTCxDQUFBOztBQUFBLHdCQXVDQSxNQUFBLEdBQVEsU0FBQyxNQUFELEdBQUE7QUFDUCxRQUFBLHVDQUFBOztNQURRLFNBQVM7S0FDakI7QUFBQSxJQUFBLElBQUcsQ0FBQSxJQUFFLENBQUEsUUFBTDtBQUNDLE1BQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFaLENBQUE7QUFBQSxNQUNBLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBRCxDQUFBLENBRFgsQ0FBQTtBQUlBO0FBQUEsV0FBQSxZQUFBO2dDQUFBO0FBQ0MsUUFBQSxVQUFVLENBQUMsWUFBWCxDQUFBLENBQUEsQ0FERDtBQUFBLE9BSkE7QUFBQSxNQVFBLFFBQVEsQ0FBQyxNQUFULENBQWdCLE1BQUEsSUFBVSxJQUFJLENBQUMsSUFBL0IsQ0FSQSxDQUFBO0FBV0E7QUFBQSxXQUFBLGFBQUE7aUNBQUE7QUFDQyxRQUFBLFVBQVUsQ0FBQyxXQUFYLENBQUEsQ0FBQSxDQUREO0FBQUEsT0FYQTtBQUFBLE1BZUEsTUFBTSxDQUFDLFlBQVAsR0FBc0IsSUFBQyxDQUFBLG9CQUFvQixDQUFDLElBQXRCLENBQTJCLElBQTNCLENBZnRCLENBQUE7QUFBQSxNQWdCQSxJQUFDLENBQUEsb0JBQUQsQ0FBQSxDQWhCQSxDQUREO0tBRE87RUFBQSxDQXZDUixDQUFBOztBQUFBLHdCQTZEQSxhQUFBLEdBQWUsU0FBQyxJQUFELEVBQU8sT0FBUCxHQUFBO0FBQ2QsUUFBQSxVQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLFdBQVksQ0FBQSxJQUFBLENBQTFCLENBQUE7QUFDQSxJQUFBLElBQUcsQ0FBQSxVQUFIO0FBQ0MsTUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLFdBQVksQ0FBQSxJQUFBLENBQWIsR0FBcUIsSUFBQyxDQUFBLGlCQUFpQixDQUFDLE1BQW5CLENBQTBCLElBQTFCLENBQWxDLENBQUE7QUFBQSxNQUNBLFVBQVUsQ0FBQyxXQUFYLEdBQXlCLElBRHpCLENBQUE7QUFBQSxNQUVBLFVBQVUsQ0FBQyxTQUFYLENBQXFCLE9BQXJCLENBRkEsQ0FBQTtBQUFBLE1BR0EsVUFBVSxDQUFDLFVBQVgsQ0FBQSxDQUhBLENBREQ7S0FBQSxNQUFBO0FBTUMsTUFBQSxVQUFVLENBQUMsU0FBWCxDQUFxQixPQUFyQixDQUFBLENBTkQ7S0FGYztFQUFBLENBN0RmLENBQUE7O0FBQUEsd0JBeUVBLE9BQUEsR0FBUyxTQUFDLE1BQUQsRUFBUyxNQUFULEdBQUE7QUFDUixJQUFBLElBQUcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFkLENBQUg7QUFDQyxNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixNQUFsQixFQUEwQixNQUExQixDQUFBLENBREQ7S0FBQSxNQUFBO0FBR0MsTUFBQSxNQUFNLENBQUMsRUFBUCxDQUFVLE1BQVYsQ0FBQSxDQUhEO0tBRFE7RUFBQSxDQXpFVCxDQUFBOztBQUFBLHdCQWlGQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1osV0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxVQUFkLENBQVAsQ0FEWTtFQUFBLENBakZiLENBQUE7O0FBQUEsd0JBcUZBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVixXQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLGFBQWQsQ0FBUCxDQURVO0VBQUEsQ0FyRlgsQ0FBQTs7QUFBQSx3QkF5RkEsT0FBQSxHQUFTLFNBQUMsT0FBRCxHQUFBO0FBQ1IsSUFBQSxJQUFDLENBQUEsYUFBRCxDQUFlLE9BQU8sQ0FBQyxVQUF2QixFQUFtQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxVQUFELEdBQUE7QUFDbEMsUUFBQSxVQUFVLENBQUMsT0FBWCxDQUFtQixPQUFuQixDQUFBLENBRGtDO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkMsQ0FBQSxDQURRO0VBQUEsQ0F6RlQsQ0FBQTs7QUFBQSx3QkFnR0EsT0FBQSxHQUFTLFNBQUMsT0FBRCxHQUFBO0FBQ1IsSUFBQSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFBRyxLQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQsRUFBSDtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBQSxDQURRO0VBQUEsQ0FoR1QsQ0FBQTs7QUFBQSx3QkFxR0EsUUFBQSxHQUFVLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQUNULElBQUEsSUFBRyxJQUFJLENBQUMsUUFBTCxDQUFjLE9BQWQsQ0FBQSxJQUEwQixPQUFPLENBQUMsTUFBUixDQUFlLENBQWYsQ0FBQSxLQUFxQixHQUFsRDtBQUVDLE1BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBWSxDQUFDLGdCQUFiLENBQThCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLEVBQXNCLEVBQXRCLENBQTlCLENBQVYsQ0FGRDtLQUFBO0FBR0EsSUFBQSxJQUFHLENBQUEsSUFBRSxDQUFBLE9BQUw7QUFFQyxNQUFBLElBQUMsQ0FBQSxlQUFELENBQWlCLE9BQWpCLEVBQTBCLE1BQTFCLENBQUEsQ0FGRDtLQUFBLE1BQUE7QUFLQyxNQUFBLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxVQUF4QixFQUFvQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxVQUFELEdBQUE7QUFDbkMsVUFBQSxVQUFVLENBQUMsU0FBWCxDQUFxQixLQUFDLENBQUEsT0FBdEIsRUFBK0IsU0FBQSxHQUFBO0FBQzlCLFlBQUEsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsT0FBakIsRUFBMEIsTUFBMUIsQ0FBQSxDQUQ4QjtVQUFBLENBQS9CLENBQUEsQ0FEbUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQyxDQUFBLENBTEQ7S0FKUztFQUFBLENBckdWLENBQUE7O0FBQUEsd0JBc0hBLGVBQUEsR0FBaUIsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2hCLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBb0UsTUFBcEU7QUFBQSxNQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBZixHQUFzQixJQUFJLENBQUMsTUFBTCxDQUFBLENBQWEsQ0FBQyxRQUFkLENBQXVCLEVBQXZCLENBQTBCLENBQUMsU0FBM0IsQ0FBcUMsQ0FBckMsRUFBdUMsRUFBdkMsQ0FBdEIsQ0FBQTtLQUFBO0FBQUEsSUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsYUFBYixDQUEyQixPQUEzQixDQURQLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixFQUFpQixJQUFqQixFQUF1QixPQUF2QixFQUFnQyxJQUFoQyxDQUZBLENBQUE7QUFBQSxJQUdBLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBbEIsR0FBeUIsSUFIekIsQ0FEZ0I7RUFBQSxDQXRIakIsQ0FBQTs7QUFBQSx3QkE4SEEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO0FBQ3JCLFFBQUEsOEJBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUF2QixDQUE4QixDQUE5QixDQUFQLENBQUE7QUFDQSxJQUFBLElBQUcsQ0FBQSxJQUFBLElBQVMsQ0FBQSxJQUFFLENBQUEsZ0JBQWQ7QUFDQyxZQUFBLENBREQ7S0FEQTtBQUFBLElBSUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBWSxDQUFDLGdCQUFiLENBQThCLElBQTlCLENBSlYsQ0FBQTtBQUFBLElBS0EsZUFBQSxHQUFrQixJQUFDLENBQUEsU0FBRCxDQUFBLENBQVksQ0FBQyxhQUFiLENBQTJCLE9BQTNCLENBTGxCLENBQUE7QUFPQSxJQUFBLElBQUcsSUFBQyxDQUFBLGdCQUFELElBQXNCLGVBQUEsS0FBcUIsSUFBOUM7QUFDQyxNQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBbEIsR0FBeUIsZUFBekIsQ0FBQTtBQUNBLFlBQUEsQ0FGRDtLQVBBO0FBQUEsSUFXQSxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQsQ0FYQSxDQURxQjtFQUFBLENBOUh0QixDQUFBOztxQkFBQTs7R0FGeUIsSUFBSSxDQUFDLE9BSC9CLENBQUE7O0FBQUEsTUFtSk0sQ0FBQyxPQUFQLEdBQWlCLFdBbkpqQixDQUFBOzs7O0FDQUEsSUFBQSxnQkFBQTtFQUFBO2lTQUFBOztBQUFBO0FBRUMscUNBQUEsQ0FBQTs7OztHQUFBOztBQUFBLDZCQUFBLE9BQUEsR0FBUyxZQUFULENBQUE7O0FBQUEsNkJBQ0EsSUFBQSxHQUFNLE1BRE4sQ0FBQTs7QUFBQSw2QkFFQSxTQUFBLEdBQVcsS0FGWCxDQUFBOztBQUFBLDZCQUtBLGNBQUEsR0FBZ0IsU0FBQyxTQUFELEdBQUE7QUFDZixJQUFBLHFEQUFNLFNBQU4sQ0FBQSxDQUFBO0FBQUEsSUFDQSxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQWIsQ0FBc0IsSUFBQyxDQUFBLFVBQUQsQ0FBWSxNQUFaLENBQXRCLENBREEsQ0FEZTtFQUFBLENBTGhCLENBQUE7OzBCQUFBOztHQUY4QixJQUFJLENBQUMsVUFBcEMsQ0FBQTs7QUFBQSxNQWFNLENBQUMsT0FBUCxHQUFpQixnQkFiakIsQ0FBQTs7OztBQ0FBLElBQUEsVUFBQTtFQUFBOztvQkFBQTs7QUFBQTtBQUVDLCtCQUFBLENBQUE7O0FBQUEsdUJBQUEsSUFBQSxHQUFNLElBQU4sQ0FBQTs7QUFBQSx1QkFDQSxRQUFBLEdBQVUsSUFEVixDQUFBOztBQUFBLHVCQUVBLFdBQUEsR0FBYSxJQUZiLENBQUE7O0FBQUEsdUJBR0EsT0FBQSxHQUFTLElBSFQsQ0FBQTs7QUFBQSx1QkFJQSxLQUFBLEdBQU8sSUFKUCxDQUFBOztBQUFBLHVCQUtBLElBQUEsR0FBTSxJQUxOLENBQUE7O0FBQUEsdUJBTUEsT0FBQSxHQUFTLElBTlQsQ0FBQTs7QUFBQSx1QkFPQSxXQUFBLEdBQWEsSUFQYixDQUFBOztBQUFBLEVBVUEsVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLElBQUQsRUFBTyxPQUFQLEdBQUE7O01BQU8sVUFBVTtLQUMxQjtBQUFBLElBQUEsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsSUFBQyxDQUFBLFNBQXZCLEVBQWtDLElBQWxDLEVBQ0M7QUFBQSxNQUFBLEdBQUEsRUFBSyxTQUFBLEdBQUE7ZUFBTSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxPQUFBLElBQVcsSUFBekIsRUFBTjtNQUFBLENBQUw7S0FERCxDQUFBLENBRFM7RUFBQSxDQVZWLENBQUE7O0FBQUEsRUFnQkEsVUFBQyxDQUFBLFlBQUQsR0FBZSxTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7QUFDZCxJQUFBLElBQUMsQ0FBQSxTQUFVLENBQUEsUUFBQSxHQUFTLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBVCxDQUFYLEdBQXlDLFNBQUMsTUFBRCxHQUFBO0FBQ3hDLGFBQVcsSUFBQSxLQUFBLENBQU0sTUFBTixDQUFYLENBRHdDO0lBQUEsQ0FBekMsQ0FEYztFQUFBLENBaEJmLENBQUE7O0FBdUJhLEVBQUEsb0JBQUMsTUFBRCxHQUFBO0FBQ1osSUFBQSw0Q0FBTSxNQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQURiLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixFQUZ0QixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsS0FBRCxHQUFTLEVBSFQsQ0FBQTtBQUlBLFVBQUEsQ0FMWTtFQUFBLENBdkJiOztBQUFBLHVCQStCQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1gsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDUixRQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBQSxHQUFBO0FBQ1YsY0FBQSx3QkFBQTtBQUFBLFVBQUEsS0FBQyxDQUFBLFNBQUQsR0FBYSxJQUFiLENBQUE7QUFDQTtBQUFBLGVBQUEsMkNBQUE7Z0NBQUE7QUFBeUMsWUFBQSxRQUFBLENBQVMsS0FBVCxDQUFBLENBQXpDO0FBQUEsV0FEQTtBQUFBLFVBRUEsS0FBQyxDQUFBLGtCQUFrQixDQUFDLEtBQXBCLENBQUEsQ0FGQSxDQURVO1FBQUEsQ0FBWCxDQUFBLENBRFE7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFULENBQUEsQ0FEVztFQUFBLENBL0JaLENBQUE7O0FBQUEsdUJBMENBLFNBQUEsR0FBVyxTQUFDLFFBQUQsR0FBQTtBQUNWLElBQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxTQUFMO0FBQ0MsTUFBQSxJQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsQ0FBeUIsUUFBekIsQ0FBQSxDQUREO0tBQUEsTUFBQTtBQUdDLE1BQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLFFBQUEsQ0FBUyxLQUFULEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQUEsQ0FIRDtLQURVO0VBQUEsQ0ExQ1gsQ0FBQTs7QUFBQSx1QkFvREEsT0FBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO0FBQ1IsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQURRO0VBQUEsQ0FwRFQsQ0FBQTs7QUFBQSx1QkEyREEsWUFBQSxHQUFjLFNBQUEsR0FBQSxDQTNEZCxDQUFBOztBQUFBLHVCQWlFQSxXQUFBLEdBQWEsU0FBQSxHQUFBLENBakViLENBQUE7O0FBQUEsdUJBd0VBLE9BQUEsR0FBUyxTQUFDLE1BQUQsRUFBUyxNQUFULEdBQUE7QUFDUixJQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFxQixNQUFyQixFQUE2QixJQUFDLENBQUEsV0FBRCxDQUFhLE1BQWIsQ0FBN0IsQ0FBQSxDQURRO0VBQUEsQ0F4RVQsQ0FBQTs7QUFBQSx1QkErRUEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNaLFdBQU8sSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQUEsQ0FBUCxDQURZO0VBQUEsQ0EvRWIsQ0FBQTs7QUFBQSx1QkFxRkEsV0FBQSxHQUFhLFNBQUUsUUFBRixHQUFBO0FBQ1osSUFEYSxJQUFDLENBQUEsV0FBQSxRQUNkLENBRFk7RUFBQSxDQXJGYixDQUFBOztBQUFBLHVCQTJGQSxXQUFBLEdBQWEsU0FBQyxNQUFELEdBQUE7QUFDWixRQUFBLGNBQUE7QUFBQSxTQUFBLGNBQUE7OEJBQUE7QUFDQyxNQUFBLE1BQU8sQ0FBQSxJQUFBLENBQVAsR0FBZSxJQUFDLENBQUEsVUFBRCxDQUFZLFFBQVosQ0FBZixDQUREO0FBQUEsS0FBQTtBQUVBLFdBQU8sTUFBUCxDQUhZO0VBQUEsQ0EzRmIsQ0FBQTs7QUFBQSx1QkFtR0EsVUFBQSxHQUFZLFNBQUMsUUFBRCxHQUFBO0FBQ1gsV0FBTyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQVksWUFBQSxJQUFBO0FBQUEsUUFBWCw4REFBVyxDQUFBO0FBQUEsUUFBQSxJQUFHLElBQUksQ0FBQyxRQUFMLENBQWMsUUFBZCxDQUFIO2lCQUFnQyxLQUFLLENBQUEsUUFBQSxDQUFTLENBQUMsS0FBZixDQUFxQixLQUFyQixFQUEyQixJQUEzQixFQUFoQztTQUFBLE1BQUE7aUJBQXNFLFFBQVEsQ0FBQyxLQUFULENBQWUsS0FBZixFQUFxQixJQUFyQixFQUF0RTtTQUFaO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUCxDQURXO0VBQUEsQ0FuR1osQ0FBQTs7QUFBQSx1QkF5R0EsT0FBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO0FBQ1IsUUFBQSxnQkFBQTtBQUFBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsQ0FBSDtBQUNDLE1BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFQLENBQUE7QUFBQSxNQUNBLFVBQUEsR0FBYSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUEvQixFQUF1QyxRQUF2QyxDQURiLENBQUE7QUFFQSxNQUFBLElBQXdDLElBQUssQ0FBQSxVQUFBLENBQTdDO0FBQUEsUUFBQSxJQUFLLENBQUEsVUFBQSxDQUFMLENBQWlCLElBQUksQ0FBQyxPQUF0QixFQUErQixJQUEvQixDQUFBLENBQUE7T0FIRDtLQURRO0VBQUEsQ0F6R1QsQ0FBQTs7QUFBQSx1QkFvSEEsT0FBQSxHQUFTLFNBQUMsSUFBRCxFQUFPLE1BQVAsR0FBQTtBQUNSLElBQUEsSUFBNkIsSUFBQyxDQUFBLE9BQTlCO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQVQsR0FBb0IsSUFBcEIsQ0FBQTtLQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBcUIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFmLEVBQXFCLE1BQXJCLENBQXJCLENBREEsQ0FEUTtFQUFBLENBcEhULENBQUE7O0FBQUEsdUJBOEhBLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsTUFBZixHQUFBO0FBQ1QsUUFBQSxPQUFBO0FBQUEsSUFBQSxJQUE2QixJQUFDLENBQUEsT0FBOUI7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsUUFBVCxHQUFvQixJQUFwQixDQUFBO0tBQUE7QUFBQSxJQUNBLE9BQUEsR0FBYSxJQUFJLENBQUMsUUFBTCxDQUFjLElBQWQsQ0FBSCxHQUE0QixJQUFDLENBQUEsYUFBRCxDQUFlLElBQWYsRUFBcUIsTUFBckIsQ0FBNUIsR0FBOEQsSUFEeEUsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFiLENBQXNCLE9BQXRCLEVBQStCLE1BQS9CLENBRkEsQ0FEUztFQUFBLENBOUhWLENBQUE7O0FBQUEsdUJBdUlBLGFBQUEsR0FBZSxTQUFDLElBQUQsRUFBTyxNQUFQLEdBQUE7QUFDZCxXQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLHFCQUFkLENBQW9DLENBQUMsTUFBckMsQ0FBNEMsSUFBNUMsRUFBa0QsTUFBbEQsRUFDTjtBQUFBLE1BQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxJQUFQO0FBQUEsTUFDQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BRFQ7S0FETSxDQUFQLENBRGM7RUFBQSxDQXZJZixDQUFBOztBQUFBLHVCQWdKQSxPQUFBLEdBQVMsU0FBQyxPQUFELEdBQUE7QUFDUixRQUFBLFVBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBWCxDQUFBO0FBQUEsSUFDQSxVQUFBLEdBQWEsSUFBQyxDQUFBLGdCQUFELENBQWtCLE9BQU8sQ0FBQyxNQUExQixFQUFrQyxNQUFsQyxDQURiLENBQUE7QUFFQSxJQUFBLElBQUcsQ0FBQSxJQUFNLENBQUEsVUFBQSxDQUFUO0FBQ0MsTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLE9BQWIsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUZEO0tBRkE7QUFBQSxJQUtBLElBQUssQ0FBQSxVQUFBLENBQUwsQ0FBaUIsT0FBakIsRUFBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsSUFBRCxHQUFBO0FBQ3pCLFFBQUEsS0FBQyxDQUFBLFdBQUQsQ0FBYSxPQUFiLEVBQXNCLElBQXRCLENBQUEsQ0FEeUI7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixDQUxBLENBRFE7RUFBQSxDQWhKVCxDQUFBOztBQUFBLHVCQStKQSxXQUFBLEdBQWEsU0FBQyxPQUFELEVBQVUsUUFBVixHQUFBO0FBQ1osUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFHLE9BQU8sQ0FBQyxRQUFYO0FBQXlCLFlBQUEsQ0FBekI7S0FBQTtBQUFBLElBQ0EsT0FBTyxDQUFDLFFBQVIsR0FBbUIsSUFEbkIsQ0FBQTtBQUlBLElBQUEsSUFBNkIsQ0FBQSxRQUE3QjtBQUFBLE1BQUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxNQUFuQixDQUFBO0tBSkE7QUFBQSxJQUtBLE9BQU8sQ0FBQyxJQUFSLEdBQWUsUUFMZixDQUFBO0FBQUEsSUFNQSxJQUFBLEdBQU8sSUFBQyxDQUFBLE9BQUQsQ0FBUyxRQUFBLElBQVksT0FBTyxDQUFDLE1BQTdCLENBTlAsQ0FBQTtBQUFBLElBT0EsSUFBSSxDQUFDLE9BQUwsR0FBZSxPQVBmLENBQUE7QUFBQSxJQVFBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixPQVJ2QixDQUFBO0FBQUEsSUFVQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQWMsQ0FBQyxZQUFmLENBQTRCLElBQUksQ0FBQyxRQUFqQyxFQUEyQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQzFDLFlBQUEsVUFBQTtBQUFBLFFBQUEsVUFBQSxHQUFhLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixRQUFsQixFQUE0QixRQUE1QixDQUFiLENBQUE7QUFDQSxRQUFBLElBQW1DLEtBQUssQ0FBQSxVQUFBLENBQXhDO0FBQUEsVUFBQSxLQUFLLENBQUEsVUFBQSxDQUFMLENBQWlCLE9BQWpCLEVBQTBCLElBQTFCLENBQUEsQ0FBQTtTQUYwQztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNDLENBVkEsQ0FEWTtFQUFBLENBL0piLENBQUE7O0FBQUEsdUJBcUxBLFNBQUEsR0FBVyxTQUFDLE9BQUQsRUFBVSxRQUFWLEdBQUE7QUFDVixRQUFBLFVBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsT0FBTyxDQUFDLElBQTFCLEVBQWdDLE1BQWhDLENBQWIsQ0FBQTtBQUNBLElBQUEsSUFBRyxDQUFBLElBQU0sQ0FBQSxVQUFBLENBQVQ7QUFDQyxNQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxRQUFBLENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUZEO0tBREE7QUFBQSxJQUlBLElBQUssQ0FBQSxVQUFBLENBQUwsQ0FBaUIsT0FBakIsRUFBMEIsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFPLENBQUMsSUFBakIsQ0FBMUIsRUFBa0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUNqRCxRQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBQSxHQUFBO2lCQUFHLFFBQUEsQ0FBQSxFQUFIO1FBQUEsQ0FBWCxDQUFBLENBRGlEO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEQsQ0FKQSxDQURVO0VBQUEsQ0FyTFgsQ0FBQTs7QUFBQSx1QkFnTUEsT0FBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO0FBQ1IsUUFBQSxrQkFBQTtBQUFBLElBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBWCxDQUFBO0FBQUEsSUFDQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBaEIsQ0FEWCxDQUFBO0FBRUEsSUFBQSxJQUFpRCxDQUFBLFFBQVMsQ0FBQyxPQUFULENBQWlCLFFBQWpCLENBQWxEO0FBQUEsTUFBQSxRQUFRLENBQUMsT0FBVCxDQUFpQixRQUFqQixFQUEyQixJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosQ0FBM0IsQ0FBQSxDQUFBO0tBRkE7QUFHQSxXQUFPLFFBQVEsQ0FBQyxPQUFULENBQWlCLFFBQWpCLENBQVAsQ0FKUTtFQUFBLENBaE1ULENBQUE7O0FBQUEsdUJBdU1BLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTtBQUNSLFFBQUEsa0JBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQVgsQ0FBQTtBQUFBLElBQ0EsUUFBQSxHQUFXLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQWhCLENBRFgsQ0FBQTtBQUVBLFdBQU8sUUFBUSxDQUFDLE9BQVQsQ0FBaUIsUUFBakIsQ0FBUCxDQUhRO0VBQUEsQ0F2TVQsQ0FBQTs7QUFBQSx1QkE2TUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1gsUUFBQSxhQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsUUFBQSxHQUFTLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBbkIsQ0FBQTtBQUNBLElBQUEsSUFBRyxDQUFBLElBQU0sQ0FBQSxPQUFBLENBQVQ7QUFDQyxZQUFVLElBQUEsS0FBQSxDQUFPLE9BQUEsR0FBTSxJQUFOLEdBQVksMENBQVosR0FBcUQsT0FBckQsR0FBOEQsd0JBQTlELEdBQXFGLElBQTVGLENBQVYsQ0FERDtLQURBO0FBQUEsSUFHQSxJQUFBLEdBQU8sSUFBSyxDQUFBLE9BQUEsQ0FBTCxDQUFBLENBSFAsQ0FBQTtBQUlBLElBQUEsSUFBRyxDQUFBLENBQUEsSUFBQSxZQUFpQixJQUFJLENBQUMsU0FBdEIsQ0FBSDtBQUNDLFlBQVUsSUFBQSxLQUFBLENBQU0sbURBQU4sQ0FBVixDQUREO0tBSkE7QUFBQSxJQU1BLElBQUksQ0FBQyxNQUFMLEdBQWMsSUFOZCxDQUFBO0FBQUEsSUFPQSxJQUFJLENBQUMsT0FBTCxHQUFlLEtBUGYsQ0FBQTtBQUFBLElBUUEsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBaEIsQ0FSaEIsQ0FBQTtBQUFBLElBU0EsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsSUFBRCxHQUFNLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBakIsQ0FUQSxDQUFBO0FBVUEsV0FBTyxJQUFQLENBWFc7RUFBQSxDQTdNWixDQUFBOztBQUFBLHVCQTJOQSxnQkFBQSxHQUFrQixTQUFDLE1BQUQsRUFBUyxJQUFULEdBQUE7QUFDakIsV0FBTyxJQUFBLEdBQUssTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFaLENBRGlCO0VBQUEsQ0EzTmxCLENBQUE7O0FBQUEsdUJBK05BLGNBQUEsR0FBZ0IsU0FBQyxNQUFELEdBQUE7QUFDZixXQUFPLElBQUMsQ0FBQSxJQUFELEdBQU0sR0FBTixHQUFVLE1BQWpCLENBRGU7RUFBQSxDQS9OaEIsQ0FBQTs7b0JBQUE7O0dBRndCLElBQUksQ0FBQyxPQUE5QixDQUFBOztBQUFBLE1BcU9NLENBQUMsT0FBUCxHQUFpQixVQXJPakIsQ0FBQTs7OztBQ0FBLElBQUEsNkJBQUE7RUFBQTtpU0FBQTs7QUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FBYixDQUFBOztBQUFBO0FBS0Msc0NBQUEsQ0FBQTs7QUFBQSw4QkFBQSxRQUFBLEdBQVUsaUJBQUMsQ0FBQSxNQUFELENBQVEsVUFBUixDQUFWLENBQUE7O0FBQUEsOEJBQ0EsU0FBQSxHQUFXLEtBRFgsQ0FBQTs7QUFBQSw4QkFFQSxXQUFBLEdBQWEsSUFGYixDQUFBOztBQUthLEVBQUEsMkJBQUMsTUFBRCxHQUFBO0FBQ1osSUFBQSxtREFBTSxNQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxFQURmLENBRFk7RUFBQSxDQUxiOztBQUFBLDhCQVVBLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7QUFDVCxJQUFBLElBQUMsQ0FBQSxXQUFZLENBQUEsSUFBQSxDQUFiLEdBQXFCLEtBQXJCLENBQUE7QUFDQSxXQUFPLElBQVAsQ0FGUztFQUFBLENBVlYsQ0FBQTs7QUFBQSw4QkFlQSxNQUFBLEdBQVEsU0FBQyxJQUFELEdBQUE7QUFDUCxRQUFBLCtCQUFBO0FBQUEsSUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBakIsQ0FBWixDQUFBO0FBQ0E7QUFDQyxNQUFBLEtBQUEsR0FBUSxJQUFBLENBQUssU0FBTCxDQUFSLENBREQ7S0FBQSxjQUFBO0FBR0MsTUFESyxVQUNMLENBQUE7QUFBQSxZQUFVLElBQUEsS0FBQSxDQUFPLG1CQUFBLEdBQWtCLFNBQWxCLEdBQTZCLGlCQUFwQyxDQUFWLENBSEQ7S0FEQTtBQU1BLElBQUEsSUFBRyxNQUFBLENBQUEsS0FBQSxLQUFtQixVQUF0QjtBQUNDLFlBQVUsSUFBQSxLQUFBLENBQU8sbUJBQUEsR0FBa0IsU0FBbEIsR0FBNkIscUJBQXBDLENBQVYsQ0FERDtLQU5BO0FBQUEsSUFTQSxVQUFBLEdBQWEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxjQUFWLENBQXlCLEtBQXpCLENBVGIsQ0FBQTtBQUFBLElBVUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsSUFBQyxDQUFBLFFBQXhCLENBVkEsQ0FBQTtBQUFBLElBV0EsVUFBVSxDQUFDLElBQVgsR0FBa0IsSUFYbEIsQ0FBQTtBQWFBLElBQUEsSUFBRyxDQUFBLENBQUEsVUFBQSxZQUF1QixVQUF2QixDQUFIO0FBQ0MsWUFBVSxJQUFBLEtBQUEsQ0FBTyxhQUFBLEdBQVksU0FBWixHQUF1QixnQ0FBOUIsQ0FBVixDQUREO0tBYkE7QUFnQkEsV0FBTyxVQUFQLENBakJPO0VBQUEsQ0FmUixDQUFBOztBQUFBLDhCQW1DQSxlQUFBLEdBQWlCLFNBQUMsSUFBRCxHQUFBO0FBQ2hCLElBQUEsSUFBRyxJQUFDLENBQUEsV0FBWSxDQUFBLElBQUEsQ0FBaEI7QUFDQyxhQUFPLElBQUMsQ0FBQSxXQUFZLENBQUEsSUFBQSxDQUFwQixDQUREO0tBQUEsTUFBQTtBQUdDLGFBQU8sSUFBQyxDQUFBLFNBQUQsR0FBVyxlQUFYLEdBQTJCLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBM0IsR0FBNkMsWUFBcEQsQ0FIRDtLQURnQjtFQUFBLENBbkNqQixDQUFBOzsyQkFBQTs7R0FGK0IsSUFBSSxDQUFDLE9BSHJDLENBQUE7O0FBQUEsTUErQ00sQ0FBQyxPQUFQLEdBQWlCLGlCQS9DakIsQ0FBQTs7OztBQ0FBLElBQUEsMEZBQUE7RUFBQTtpU0FBQTs7QUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGVBQVIsQ0FBZCxDQUFBOztBQUFBLE1BQ0EsR0FBUyxPQUFBLENBQVEsVUFBUixDQURULENBQUE7O0FBQUEsY0FFQSxHQUFpQixPQUFBLENBQVEsa0JBQVIsQ0FGakIsQ0FBQTs7QUFBQSxnQkFHQSxHQUFtQixPQUFBLENBQVEsb0JBQVIsQ0FIbkIsQ0FBQTs7QUFBQSxpQkFJQSxHQUFvQixPQUFBLENBQVEscUJBQVIsQ0FKcEIsQ0FBQTs7QUFBQTtBQVVDLHFDQUFBLENBQUE7Ozs7R0FBQTs7QUFBQSw2QkFBQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0wsSUFBQSxJQUFDLENBQUEsU0FBRCxDQUNDO0FBQUEsTUFBQSxLQUFBLEVBQU8sSUFBUDtBQUFBLE1BQ0EsV0FBQSxFQUFhLEVBRGI7QUFBQSxNQUVBLEdBQUEsRUFBSyxFQUZMO0FBQUEsTUFHQSxpQkFBQSxFQUFtQixTQUhuQjtBQUFBLE1BSUEsYUFBQSxFQUFlLFNBSmY7QUFBQSxNQUtBLGdCQUFBLEVBQWtCLElBTGxCO0tBREQsQ0FBQSxDQURLO0VBQUEsQ0FBTixDQUFBOztBQUFBLDZCQVdBLEtBQUEsR0FBTyxTQUFDLFFBQUQsR0FBQTtBQUVOLElBQUEsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsYUFBaEIsRUFBK0IsV0FBL0IsRUFBNEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsT0FBRCxHQUFBO0FBQzNDLFFBQUEsT0FBTyxDQUFDLGNBQVIsR0FBeUIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxHQUFqQyxDQUFBO2VBQ0EsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLEtBQUMsQ0FBQSxNQUFNLENBQUMsaUJBRlE7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxDQUFBLENBQUE7QUFBQSxJQUlBLFFBQVEsQ0FBQyxNQUFULENBQWdCLE9BQWhCLEVBQXlCLGdCQUF6QixFQUEyQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxPQUFELEdBQUE7ZUFDMUMsT0FBTyxDQUFDLFFBQVIsR0FBbUIsS0FBQyxDQUFBLE1BQU0sQ0FBQyxNQURlO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0MsQ0FKQSxDQUFBO0FBQUEsSUFPQSxRQUFRLENBQUMsTUFBVCxDQUFnQix3QkFBaEIsRUFBMEMsaUJBQTFDLEVBQTZELENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLE9BQUQsR0FBQTtBQUM1RCxZQUFBLHNCQUFBO0FBQUEsUUFBQSxPQUFPLENBQUMsU0FBUixHQUFvQixLQUFDLENBQUEsTUFBTSxDQUFDLFNBQTVCLENBQUE7QUFDQTtBQUFBLGFBQUEsWUFBQTtrQ0FBQTtBQUNDLFVBQUEsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsSUFBakIsRUFBc0IsVUFBdEIsQ0FBQSxDQUREO0FBQUEsU0FGNEQ7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3RCxDQVBBLENBQUE7QUFBQSxJQWFBLFFBQVEsQ0FBQyxNQUFULENBQWdCLGFBQWhCLEVBQStCLE1BQS9CLEVBQXVDLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLE9BQUQsR0FBQTtBQUN0QyxRQUFBLE9BQU8sQ0FBQyxVQUFSLEdBQXFCLEtBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQTdCLENBQUE7QUFBQSxRQUNBLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLEtBQUMsQ0FBQSxNQUFNLENBQUMsYUFEekIsQ0FEc0M7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QyxDQWJBLENBQUE7QUFBQSxJQWtCQSxRQUFRLENBQUMsTUFBVCxDQUFnQixxQkFBaEIsRUFBdUMsY0FBdkMsQ0FsQkEsQ0FGTTtFQUFBLENBWFAsQ0FBQTs7MEJBQUE7O0dBSDhCLElBQUksQ0FBQyxFQUFFLENBQUMsa0JBUHZDLENBQUE7O0FBQUEsTUE4Q00sQ0FBQyxPQUFQLEdBQWlCLGdCQTlDakIsQ0FBQTs7OztBQ0FBLElBQUEsWUFBQTtFQUFBO2lTQUFBOztBQUFBO0FBRUMsaUNBQUEsQ0FBQTs7QUFBQSx5QkFBQSxTQUFBLEdBQVcsSUFBWCxDQUFBOztBQUdhLEVBQUEsc0JBQUEsR0FBQTtBQUNaLElBQUEsNENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLEVBRGIsQ0FBQTtBQUFBLElBRUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFsQixDQUFxQixVQUFyQixFQUFpQyxJQUFDLENBQUEsS0FBRCxDQUFPLFlBQVAsQ0FBakMsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQWxCLENBQXFCLFlBQXJCLEVBQW1DLElBQUMsQ0FBQSxLQUFELENBQU8sY0FBUCxDQUFuQyxDQUhBLENBQUE7QUFJQSxVQUFBLENBTFk7RUFBQSxDQUhiOztBQUFBLHlCQVdBLE9BQUEsR0FBUyxTQUFDLFFBQUQsRUFBVyxNQUFYLEdBQUE7QUFDUixJQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUNDO0FBQUEsTUFBQSxRQUFBLEVBQVUsUUFBVjtBQUFBLE1BQ0EsTUFBQSxFQUFRLE1BRFI7QUFBQSxNQUVBLEtBQUEsRUFBTyxRQUFRLENBQUMsS0FBVCxDQUFlLEdBQWYsQ0FGUDtLQURELENBQUEsQ0FEUTtFQUFBLENBWFQsQ0FBQTs7QUFBQSx5QkFtQkEsVUFBQSxHQUFZLFNBQUMsU0FBRCxHQUFBO0FBRVgsUUFBQSx3Q0FBQTtBQUFBO0FBQUEsU0FBQSwyQ0FBQTtzQkFBQTtBQUNDLE1BQUEsSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQVgsS0FBcUIsQ0FBckIsSUFBMEIsSUFBQyxDQUFBLFNBQUQsQ0FBVyxTQUFYLEVBQXNCLElBQXRCLENBQTdCO0FBQ0M7QUFBQSxhQUFBLGFBQUE7OEJBQUE7QUFDQyxVQUFBLFNBQVMsQ0FBQyxFQUFWLENBQWEsSUFBYixFQUFtQixLQUFuQixDQUFBLENBREQ7QUFBQSxTQUREO09BREQ7QUFBQSxLQUFBO0FBQUEsSUFLQSxTQUFTLENBQUMsRUFBVixDQUFhLFVBQWIsRUFBeUIsSUFBQyxDQUFBLEtBQUQsQ0FBTyxZQUFQLENBQXpCLENBTEEsQ0FBQTtBQUFBLElBTUEsU0FBUyxDQUFDLEVBQVYsQ0FBYSxVQUFiLEVBQXlCLElBQUMsQ0FBQSxLQUFELENBQU8sWUFBUCxDQUF6QixDQU5BLENBRlc7RUFBQSxDQW5CWixDQUFBOztBQUFBLHlCQStCQSxZQUFBLEdBQWMsU0FBQyxTQUFELEdBQUE7QUFFYixRQUFBLHdDQUFBO0FBQUE7QUFBQSxTQUFBLDJDQUFBO3NCQUFBO0FBQ0MsTUFBQSxJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBWCxLQUFxQixDQUFyQixJQUEwQixJQUFDLENBQUEsU0FBRCxDQUFXLFNBQVgsRUFBc0IsSUFBdEIsQ0FBN0I7QUFDQztBQUFBLGFBQUEsYUFBQTs4QkFBQTtBQUNDLFVBQUEsU0FBUyxDQUFDLEVBQVYsQ0FBYSxJQUFiLEVBQW1CLEtBQW5CLENBQUEsQ0FERDtBQUFBLFNBREQ7T0FERDtBQUFBLEtBQUE7QUFBQSxJQUtBLFNBQVMsQ0FBQyxFQUFWLENBQWEsVUFBYixFQUF5QixJQUFDLENBQUEsS0FBRCxDQUFPLFlBQVAsQ0FBekIsQ0FMQSxDQUFBO0FBQUEsSUFNQSxTQUFTLENBQUMsRUFBVixDQUFhLFVBQWIsRUFBeUIsSUFBQyxDQUFBLEtBQUQsQ0FBTyxZQUFQLENBQXpCLENBTkEsQ0FGYTtFQUFBLENBL0JkLENBQUE7O0FBQUEseUJBMkNBLFVBQUEsR0FBWSxTQUFDLFNBQUQsR0FBQTtBQUVYLFFBQUEsaUVBQUE7QUFBQTtBQUFBLFNBQUEsMkNBQUE7c0JBQUE7QUFDQyxNQUFBLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFYLEdBQW9CLENBQXBCLElBQXlCLElBQUMsQ0FBQSxTQUFELENBQVcsU0FBWCxFQUFzQixJQUF0QixDQUE1QjtBQUNDO0FBQUEsYUFBQSxhQUFBOzhCQUFBO0FBQ0MsVUFBQSxTQUFTLENBQUMsRUFBVixDQUFhLElBQWIsRUFBbUIsS0FBbkIsQ0FBQSxDQUREO0FBQUEsU0FERDtPQUREO0FBQUEsS0FBQTtBQUtBLElBQUEsSUFBRyxTQUFTLENBQUMsV0FBYjtBQUNDO0FBQUEsV0FBQSw4Q0FBQTswQkFBQTtBQUNDLFFBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxLQUFaLENBQUEsQ0FERDtBQUFBLE9BREQ7S0FQVztFQUFBLENBM0NaLENBQUE7O0FBQUEseUJBd0RBLFVBQUEsR0FBWSxTQUFDLFNBQUQsR0FBQTtBQUVYLFFBQUEsaUVBQUE7QUFBQTtBQUFBLFNBQUEsMkNBQUE7c0JBQUE7QUFDQyxNQUFBLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFYLEdBQW9CLENBQXBCLElBQXlCLElBQUMsQ0FBQSxTQUFELENBQVcsU0FBWCxFQUFzQixJQUF0QixDQUE1QjtBQUNDO0FBQUEsYUFBQSxhQUFBOzhCQUFBO0FBQ0MsVUFBQSxTQUFTLENBQUMsRUFBVixDQUFhLElBQWIsRUFBbUIsS0FBbkIsQ0FBQSxDQUREO0FBQUEsU0FERDtPQUREO0FBQUEsS0FBQTtBQUtBLElBQUEsSUFBRyxTQUFTLENBQUMsV0FBYjtBQUNDO0FBQUEsV0FBQSw4Q0FBQTswQkFBQTtBQUNDLFFBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxLQUFaLENBQUEsQ0FERDtBQUFBLE9BREQ7S0FQVztFQUFBLENBeERaLENBQUE7O0FBQUEseUJBcUVBLFNBQUEsR0FBVyxTQUFDLFNBQUQsRUFBWSxJQUFaLEdBQUE7QUFDVixRQUFBLHlDQUFBO0FBQUEsSUFBQSxJQUFHLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFIO0FBQ0MsTUFBQSxTQUFBLEdBQVksSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBQVosQ0FERDtLQUFBLE1BQUE7QUFHQyxNQUFBLFNBQUEsR0FBWSxJQUFJLENBQUMsS0FBakIsQ0FIRDtLQUFBO0FBTUEsSUFBQSxJQUFHLENBQUEsU0FBVSxDQUFDLEVBQVYsQ0FBYSxTQUFVLENBQUEsU0FBUyxDQUFDLE1BQVYsR0FBaUIsQ0FBakIsQ0FBdkIsQ0FBSjtBQUNDLGFBQU8sS0FBUCxDQUREO0tBTkE7QUFVQSxJQUFBLElBQUcsU0FBUyxDQUFDLE1BQVYsS0FBb0IsQ0FBdkI7QUFDQyxhQUFPLElBQVAsQ0FERDtLQVZBO0FBQUEsSUFjQSxTQUFBLEdBQVksU0FBUyxDQUFDLFNBQVYsQ0FBQSxDQWRaLENBQUE7QUFBQSxJQWVBLFNBQUEsR0FBWSxTQUFTLENBQUMsTUFBVixHQUFpQixDQWY3QixDQUFBO0FBZ0JBLFNBQUEsNERBQUE7a0NBQUE7QUFDQyxNQUFBLElBQUcsS0FBQSxLQUFTLFNBQVo7QUFDQyxpQkFERDtPQUFBO0FBRUEsYUFBTSxTQUFBLElBQWEsQ0FBQSxTQUFVLENBQUMsRUFBVixDQUFhLFFBQWIsQ0FBcEIsR0FBQTtBQUNDLFFBQUEsU0FBQSxHQUFZLFNBQVMsQ0FBQyxTQUFWLENBQUEsQ0FBWixDQUREO01BQUEsQ0FGQTtBQUlBLE1BQUEsSUFBRyxTQUFBLEtBQWEsSUFBaEI7QUFDQyxlQUFPLEtBQVAsQ0FERDtPQUxEO0FBQUEsS0FoQkE7QUF1QkEsV0FBTyxJQUFQLENBeEJVO0VBQUEsQ0FyRVgsQ0FBQTs7QUFBQSx5QkFnR0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNWLElBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFsQixDQUFxQixVQUFyQixFQUFpQyxJQUFDLENBQUEsS0FBRCxDQUFPLFlBQVAsQ0FBakMsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQWxCLENBQXFCLFlBQXJCLEVBQW1DLElBQUMsQ0FBQSxLQUFELENBQU8sY0FBUCxDQUFuQyxDQURBLENBRFU7RUFBQSxDQWhHWCxDQUFBOztzQkFBQTs7R0FGMEIsSUFBSSxDQUFDLE9BQWhDLENBQUE7O0FBQUEsTUF3R00sQ0FBQyxPQUFQLEdBQWlCLFlBeEdqQixDQUFBOzs7O0FDQUEsSUFBQSxnQkFBQTs7QUFBQTtBQUVDLDZCQUFBLFFBQUEsR0FBVSxJQUFWLENBQUE7O0FBR2EsRUFBQSwwQkFBQSxHQUFBO0FBQ1osSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLFNBQUMsT0FBRCxFQUFVLElBQVYsR0FBQTtBQUNYLE1BQUEsSUFBRyxPQUFIO0FBQWdCLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxRQUFaLEVBQXNCLE9BQXRCLEVBQStCLElBQS9CLENBQUEsQ0FBaEI7T0FEVztJQUFBLENBQVosQ0FEWTtFQUFBLENBSGI7O0FBQUEsNkJBU0EsS0FBQSxHQUFPLFNBQUMsT0FBRCxHQUFBO0FBQ04sSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQsRUFBa0IsT0FBbEIsQ0FBQSxDQURNO0VBQUEsQ0FUUCxDQUFBOztBQUFBLDZCQWNBLElBQUEsR0FBTSxTQUFDLE9BQUQsR0FBQTtBQUNMLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFULEVBQWtCLE1BQWxCLENBQUEsQ0FESztFQUFBLENBZE4sQ0FBQTs7QUFBQSw2QkFtQkEsT0FBQSxHQUFTLFNBQUMsT0FBRCxHQUFBO0FBQ1IsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQsRUFBa0IsU0FBbEIsQ0FBQSxDQURRO0VBQUEsQ0FuQlQsQ0FBQTs7QUFBQSw2QkF3QkEsT0FBQSxHQUFTLFNBQUMsT0FBRCxFQUFVLElBQVYsR0FBQTtBQUNSLElBQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxRQUFMO0FBQW1CLFlBQUEsQ0FBbkI7S0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBREEsQ0FEUTtFQUFBLENBeEJULENBQUE7OzBCQUFBOztJQUZELENBQUE7O0FBQUEsTUFnQ00sQ0FBQyxPQUFQLEdBQWlCLGdCQWhDakIsQ0FBQTs7OztBQ0FBLElBQUEsT0FBQTs7QUFBQTtBQUVDLG9CQUFBLFNBQUEsR0FBVyxJQUFYLENBQUE7O0FBQUEsb0JBQ0EsVUFBQSxHQUFZLElBRFosQ0FBQTs7QUFBQSxvQkFFQSxNQUFBLEdBQVEsSUFGUixDQUFBOztBQUFBLG9CQUdBLElBQUEsR0FBTSxJQUhOLENBQUE7O0FBQUEsb0JBSUEsTUFBQSxHQUFRLElBSlIsQ0FBQTs7QUFNYSxFQUFBLGlCQUFFLFVBQUYsRUFBZSxNQUFmLEVBQXVCLE1BQXZCLEdBQUE7QUFDWixJQURhLElBQUMsQ0FBQSxhQUFBLFVBQ2QsQ0FBQTtBQUFBLElBRDBCLElBQUMsQ0FBQSxTQUFBLE1BQzNCLENBQUE7O01BRG1DLFNBQVM7S0FDNUM7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsTUFBTSxDQUFDLEtBQVAsQ0FBYSxFQUFiLEVBQWlCLE1BQWpCLENBQVYsQ0FEWTtFQUFBLENBTmI7O2lCQUFBOztJQUZELENBQUE7O0FBQUEsTUFZTSxDQUFDLE9BQVAsR0FBaUIsT0FaakIsQ0FBQTs7OztBQ0FBLElBQUEsdUJBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSLENBQVYsQ0FBQTs7QUFBQTs4QkFLQzs7QUFBQSwyQkFBQSxNQUFBLEdBQVEscUNBQVIsQ0FBQTs7QUFBQSwyQkFHQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlLFFBQWYsR0FBQTtBQUNQLFFBQUEseUJBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxNQUFaLENBQVIsQ0FBQTtBQUNBLElBQUEsSUFBRyxDQUFBLEtBQUg7QUFBZ0IsWUFBVSxJQUFBLEtBQUEsQ0FBTSxtQkFBTixDQUFWLENBQWhCO0tBREE7QUFBQSxJQUVBLFVBQUEsR0FBZ0IsS0FBTSxDQUFBLENBQUEsQ0FBTixLQUFjLE1BQWpCLEdBQWdDLEtBQU0sQ0FBQSxDQUFBLENBQXRDLEdBQThDLFFBQVEsQ0FBQyxJQUZwRSxDQUFBO0FBQUEsSUFHQSxNQUFBLEdBQVksS0FBTSxDQUFBLENBQUEsQ0FBTixLQUFjLE1BQWpCLEdBQTZCLEtBQU0sQ0FBQSxDQUFBLENBQW5DLEdBQTJDLFFBQVEsQ0FBQyxNQUg3RCxDQUFBO0FBSUEsV0FBVyxJQUFBLE9BQUEsQ0FBUSxVQUFSLEVBQW9CLE1BQXBCLEVBQTRCLE1BQTVCLENBQVgsQ0FMTztFQUFBLENBSFIsQ0FBQTs7d0JBQUE7O0lBTEQsQ0FBQTs7QUFBQSxNQWdCTSxDQUFDLE9BQVAsR0FBaUIsY0FoQmpCLENBQUE7Ozs7QUNBQSxJQUFBLGVBQUE7RUFBQTtpU0FBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVIsQ0FBVixDQUFBOztBQUFBO0FBS0MsMkJBQUEsQ0FBQTs7OztHQUFBOztBQUFBLG1CQUFBLFVBQUEsR0FBWSxTQUFaLENBQUE7O0FBQUEsbUJBQ0EsTUFBQSxHQUFRLFNBRFIsQ0FBQTs7QUFBQSxtQkFJQSxnQkFBQSxHQUFrQixTQUFDLElBQUQsR0FBQTtBQUNqQixRQUFBLGlDQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxnREFBWCxDQUFSLENBQUE7QUFBQSxJQUNBLFVBQUEsR0FBYSxLQUFNLENBQUEsQ0FBQSxDQUFOLElBQVksSUFBQyxDQUFBLFVBRDFCLENBQUE7QUFBQSxJQUVBLE1BQUEsR0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFOLElBQVksSUFBQyxDQUFBLE1BRnRCLENBQUE7QUFBQSxJQUdBLE1BQUEsR0FBUyxDQUFJLEtBQU0sQ0FBQSxDQUFBLENBQVQsR0FBaUIsSUFBQyxDQUFBLFVBQUQsQ0FBWSxLQUFNLENBQUEsQ0FBQSxDQUFsQixDQUFqQixHQUE0QyxFQUE3QyxDQUhULENBQUE7QUFJQSxXQUFXLElBQUEsT0FBQSxDQUFRLFVBQVIsRUFBb0IsTUFBcEIsRUFBNEIsTUFBNUIsQ0FBWCxDQUxpQjtFQUFBLENBSmxCLENBQUE7O0FBQUEsbUJBWUEsYUFBQSxHQUFlLFNBQUMsT0FBRCxHQUFBO0FBQ2QsUUFBQSxXQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLFVBQWYsQ0FBQTtBQUNBLElBQUEsSUFBRyxDQUFDLE9BQU8sQ0FBQyxNQUFSLElBQW1CLE9BQU8sQ0FBQyxNQUFSLEtBQW9CLElBQUMsQ0FBQSxNQUF6QyxDQUFBLElBQW9ELENBQUMsT0FBTyxDQUFDLE1BQVIsSUFBbUIsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsT0FBTyxDQUFDLE1BQXpCLENBQUEsR0FBbUMsQ0FBdkQsQ0FBdkQ7QUFDQyxNQUFBLElBQUEsSUFBUSxHQUFBLEdBQU0sT0FBTyxDQUFDLE1BQXRCLENBQUE7QUFDQSxNQUFBLElBQUcsT0FBTyxDQUFDLE1BQVg7QUFDQyxRQUFBLEtBQUEsR0FBUSxNQUFNLENBQUMsYUFBUCxDQUFxQixPQUFPLENBQUMsTUFBN0IsQ0FBUixDQUFBO0FBQ0EsUUFBQSxJQUF3QixLQUF4QjtBQUFBLFVBQUEsSUFBQSxJQUFRLEdBQUEsR0FBTSxLQUFkLENBQUE7U0FGRDtPQUZEO0tBREE7QUFNQSxXQUFPLElBQVAsQ0FQYztFQUFBLENBWmYsQ0FBQTs7QUFBQSxtQkFzQkEsVUFBQSxHQUFZLFNBQUMsTUFBRCxHQUFBO0FBQ1gsUUFBQSxrQ0FBQTtBQUFBLElBQUEsS0FBQSxHQUFRLEVBQVIsQ0FBQTtBQUNBO0FBQUEsU0FBQSwyQ0FBQTtzQkFBQTtBQUNDLE1BQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBWCxDQUFSLENBQUE7QUFBQSxNQUNBLEtBQU0sQ0FBQSxrQkFBQSxDQUFtQixLQUFNLENBQUEsQ0FBQSxDQUF6QixDQUFBLENBQU4sR0FBc0Msa0JBQUEsQ0FBbUIsS0FBTSxDQUFBLENBQUEsQ0FBekIsQ0FEdEMsQ0FERDtBQUFBLEtBREE7QUFJQSxXQUFPLEtBQVAsQ0FMVztFQUFBLENBdEJaLENBQUE7O2dCQUFBOztHQUZvQixJQUFJLENBQUMsT0FIMUIsQ0FBQTs7QUFBQSxNQW1DTSxDQUFDLE9BQVAsR0FBaUIsTUFuQ2pCLENBQUE7Ozs7QUNBQSxJQUFBLDBCQUFBO0VBQUE7aVNBQUE7O0FBQUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLG9CQUFSLENBQW5CLENBQUE7O0FBQUE7QUFLQyw2QkFBQSxDQUFBOzs7O0dBQUE7O0FBQUEscUJBQUEsRUFBQSxHQUFJLFVBQUosQ0FBQTs7QUFBQSxxQkFDQSxJQUFBLEdBQU0sVUFETixDQUFBOztBQUFBLHFCQUVBLE1BQUEsR0FBUSxVQUZSLENBQUE7O0FBQUEscUJBR0EsT0FBQSxHQUFTLGVBSFQsQ0FBQTs7QUFBQSxxQkFJQSxTQUFBLEdBQVcsS0FKWCxDQUFBOztBQUFBLHFCQUtBLElBQUEsR0FBTSxJQUxOLENBQUE7O0FBQUEscUJBTUEsU0FBQSxHQUFXLEtBTlgsQ0FBQTs7QUFBQSxxQkFPQSxhQUFBLEdBQWUsUUFQZixDQUFBOztBQUFBLHFCQVFBLGNBQUEsR0FBZ0IsU0FSaEIsQ0FBQTs7QUFBQSxxQkFTQSxpQkFBQSxHQUFtQixJQVRuQixDQUFBOztBQUFBLHFCQVlBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVixJQUFBLHlDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxFQUFnQixLQUFoQixDQURYLENBQUE7QUFFQSxJQUFBLElBQUcsQ0FBQSxJQUFFLENBQUEsT0FBTDtBQUNDLFlBQVUsSUFBQSxLQUFBLENBQU0sMkJBQU4sQ0FBVixDQUREO0tBRkE7QUFJQSxJQUFBLElBQUcsQ0FBQSxDQUFBLElBQUMsQ0FBQSxPQUFELFlBQXFCLGdCQUFyQixDQUFIO0FBQ0MsWUFBVSxJQUFBLEtBQUEsQ0FBTSwwREFBTixDQUFWLENBREQ7S0FMVTtFQUFBLENBWlgsQ0FBQTs7QUFBQSxxQkFzQkEsVUFBQSxHQUFZLFNBQUMsTUFBRCxHQUFBO0FBQ1gsV0FBTyxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsRUFBb0IsSUFBQSxnQkFBQSxDQUFpQixNQUFqQixDQUFwQixDQUFQLENBRFc7RUFBQSxDQXRCWixDQUFBOztBQUFBLHFCQTBCQSxPQUFBLEdBQVMsU0FBQyxJQUFELEdBQUE7QUFDUixXQUFPLENBQUEsQ0FBQyxJQUFFLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosQ0FBYixFQUFnQyxLQUFoQyxDQUFULENBRFE7RUFBQSxDQTFCVCxDQUFBOztBQUFBLHFCQThCQSxPQUFBLEdBQVMsU0FBQyxJQUFELEdBQUE7QUFDUixXQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixDQUFiLENBQVAsQ0FEUTtFQUFBLENBOUJULENBQUE7O0FBQUEscUJBa0NBLE9BQUEsR0FBUyxTQUFDLElBQUQsRUFBTyxTQUFQLEdBQUE7QUFDUixXQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixDQUFiLEVBQWdDLFNBQWhDLENBQVAsQ0FEUTtFQUFBLENBbENULENBQUE7O0FBQUEscUJBc0NBLFlBQUEsR0FBYyxTQUFDLElBQUQsRUFBTyxRQUFQLEdBQUE7QUFDYixJQUFBLElBQUcsQ0FBQSxJQUFFLENBQUEsSUFBTDtBQUNDLE1BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsQ0FBUixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sQ0FBZ0IsSUFBaEIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBQSxDQUZBLENBQUE7QUFBQSxNQUdBLFFBQUEsQ0FBQSxDQUhBLENBQUE7QUFJQSxZQUFBLENBTEQ7S0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBQ1QsUUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxLQUFDLENBQUEsSUFBRCxHQUFRLEtBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxDQURSLENBQUE7QUFBQSxRQUVBLEtBQUMsQ0FBQSxRQUFELENBQVUsU0FBQSxHQUFBO0FBQ1QsVUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sQ0FBZ0IsSUFBaEIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxRQUFBLENBQVMsS0FBQyxDQUFBLElBQVYsQ0FEQSxDQURTO1FBQUEsQ0FBVixDQUZBLENBRFM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWLENBTkEsQ0FEYTtFQUFBLENBdENkLENBQUE7O0FBQUEscUJBd0RBLFFBQUEsR0FBVSxTQUFDLFFBQUQsR0FBQTtBQUNULElBQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxJQUFMO0FBQ0MsTUFBQSxRQUFBLENBQUEsQ0FBQSxDQUREO0tBQUE7QUFFQSxJQUFBLElBQUcsQ0FBQSxJQUFFLENBQUEsU0FBTDtBQUNDLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxRQUFBLENBQUEsQ0FEQSxDQUREO0tBQUEsTUFBQTtBQUlDLE1BQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBVCxDQUFrQixVQUFsQixDQUE2QixDQUFDLFFBQTlCLENBQXVDLElBQUMsQ0FBQSxjQUF4QyxDQUFBLENBQUE7QUFBQSxNQUNBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ1YsVUFBQSxLQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVQsQ0FBcUIsVUFBckIsQ0FBZ0MsQ0FBQyxXQUFqQyxDQUE2QyxLQUFDLENBQUEsY0FBOUMsQ0FEQSxDQUFBO0FBQUEsVUFFQSxRQUFBLENBQUEsQ0FGQSxDQURVO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxFQUtFLElBQUMsQ0FBQSxpQkFMSCxDQURBLENBSkQ7S0FIUztFQUFBLENBeERWLENBQUE7O0FBQUEscUJBeUVBLFFBQUEsR0FBVSxTQUFDLFFBQUQsR0FBQTtBQUNULElBQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxTQUFMO0FBQ0MsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLFFBQUEsQ0FBQSxDQURBLENBREQ7S0FBQSxNQUFBO0FBSUMsTUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFULENBQWtCLFVBQWxCLENBQTZCLENBQUMsUUFBOUIsQ0FBdUMsSUFBQyxDQUFBLGFBQXhDLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxRQUFBLENBQUEsQ0FGQSxDQUFBO0FBQUEsTUFHQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNWLFVBQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVCxDQUFxQixVQUFyQixDQUFnQyxDQUFDLFdBQWpDLENBQTZDLEtBQUMsQ0FBQSxhQUE5QyxDQUFBLENBRFU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBR0UsSUFBQyxDQUFBLGlCQUhILENBSEEsQ0FKRDtLQURTO0VBQUEsQ0F6RVYsQ0FBQTs7QUFBQSxxQkF3RkEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1gsUUFBQSxvQkFBQTtBQUFBLElBQUEsT0FBbUIsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBQW5CLEVBQUMsZUFBRCxFQUFRLGlCQUFSLENBQUE7QUFDQSxXQUFPLEtBQUEsR0FBUSxPQUFPLENBQUMsVUFBUixDQUFBLENBQWYsQ0FGVztFQUFBLENBeEZaLENBQUE7O2tCQUFBOztHQUZzQixJQUFJLENBQUMsVUFINUIsQ0FBQTs7QUFBQSxNQWtHTSxDQUFDLE9BQVAsR0FBaUIsUUFsR2pCLENBQUE7Ozs7QUNBQSxJQUFJLENBQUMsR0FBTCxHQUNDO0FBQUEsRUFBQSxXQUFBLEVBQWEsT0FBQSxDQUFRLGVBQVIsQ0FBYjtBQUFBLEVBQ0EsVUFBQSxFQUFZLE9BQUEsQ0FBUSxjQUFSLENBRFo7QUFBQSxFQUVBLE1BQUEsRUFBUSxPQUFBLENBQVEsVUFBUixDQUZSO0FBQUEsRUFHQSxPQUFBLEVBQVMsT0FBQSxDQUFRLFdBQVIsQ0FIVDtBQUFBLEVBSUEsY0FBQSxFQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FKaEI7QUFBQSxFQUtBLGdCQUFBLEVBQWtCLE9BQUEsQ0FBUSxvQkFBUixDQUxsQjtBQUFBLEVBTUEsWUFBQSxFQUFjLE9BQUEsQ0FBUSxnQkFBUixDQU5kO0FBQUEsRUFPQSxRQUFBLEVBQVUsT0FBQSxDQUFRLFlBQVIsQ0FQVjtBQUFBLEVBUUEsZ0JBQUEsRUFBa0IsT0FBQSxDQUFRLG9CQUFSLENBUmxCO0NBREQsQ0FBQTs7QUFBQSxJQVlJLENBQUMsaUJBQUwsQ0FBdUIsVUFBdkIsRUFBbUMsT0FBQSxDQUFRLGVBQVIsQ0FBbkMsQ0FaQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkV2ZW50TWFuYWdlciA9IHJlcXVpcmUgJy4vRXZlbnRNYW5hZ2VyJ1xuXG5cbmNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgTWl3by5PYmplY3RcblxuXHRAaW5qZWN0ICdpbmplY3Rvcidcblx0QGluamVjdCAnY29udHJvbGxlckZhY3RvcnknLCAnbWl3by5jb250cm9sbGVyRmFjdG9yeSdcblxuXHRldmVudE1ncjogbnVsbFxuXHRjb21wb25lbnRNZ3I6IG51bGxcblx0dmlld3BvcnQ6IG51bGxcblx0cmVuZGVyZWQ6IGZhbHNlXG5cdGNvbnRyb2xsZXJzOiBudWxsXG5cdHJ1bkNvbnRyb2xsZXJzOiBudWxsXG5cdGF1dG9DYW5vbmljYWxpemU6IHRydWVcblxuXG5cdGNvbnN0cnVjdG9yOiAoY29uZmlnKSAtPlxuXHRcdEBjb250cm9sbGVycyA9IHt9XG5cdFx0QGV2ZW50TWdyID0gbmV3IEV2ZW50TWFuYWdlcigpXG5cdFx0c3VwZXIoY29uZmlnKVxuXHRcdHJldHVyblxuXG5cblx0c2V0SW5qZWN0b3I6IChAaW5qZWN0b3IpIC0+XG5cdFx0aWYgIWluamVjdG9yLmhhcygndmlld3BvcnQnKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyAndmlld3BvcnQnIHNlcnZpY2UuIFZpZXdwb3J0IGlzIHJlcXVpcmVkIHRvIHJlbmRlciB5b3VyIGFwcGxpY2F0aW9uXCIpXG5cdFx0cmV0dXJuXG5cblxuXHRydW46IChyZW5kZXIgPSBudWxsKSAtPlxuXHRcdCMgc3RhcnR1cCBjb250cm9sbGVyc1xuXHRcdGZvciBuYW1lIGluIEBydW5Db250cm9sbGVyc1xuXHRcdFx0QGdldENvbnRyb2xsZXIgbmFtZSwgKGNvbnRyb2xsZXIpPT5cblx0XHRcdFx0IyBtYXJrIGNvbnRyb2xsZXJzIGFzIGxvYWRlZFxuXHRcdFx0XHRAcnVuQ29udHJvbGxlcnMuZXJhc2UoY29udHJvbGxlci5uYW1lKVxuXHRcdFx0XHQjIGNoZWNrIGlmIGFsbCBjb250cm9sbGVycyBhcmUgbG9hZGVkXG5cdFx0XHRcdGlmIEBydW5Db250cm9sbGVycy5sZW5ndGggaXMgMFxuXHRcdFx0XHRcdCMgYXV0byByZW5kZXIgdmlld3BvcnRcblx0XHRcdFx0XHRAcmVuZGVyKHJlbmRlcikgaWYgcmVuZGVyXG5cdFx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cblx0cmVuZGVyOiAodGFyZ2V0ID0gbnVsbCkgLT5cblx0XHRpZiAhQHJlbmRlcmVkXG5cdFx0XHRAcmVuZGVyZWQgPSB0cnVlXG5cdFx0XHR2aWV3cG9ydCA9IEBnZXRWaWV3cG9ydCgpXG5cblx0XHRcdCMgbm90aWZ5IGJlZm9yZVJlbmRlclxuXHRcdFx0Zm9yIG5hbWUsY29udHJvbGxlciBvZiBAY29udHJvbGxlcnNcblx0XHRcdFx0Y29udHJvbGxlci5iZWZvcmVSZW5kZXIoKVxuXG5cdFx0XHQjIHJlbmRlciB2aWV3cG9ydFxuXHRcdFx0dmlld3BvcnQucmVuZGVyKHRhcmdldCB8fCBtaXdvLmJvZHkpXG5cblx0XHRcdCMgbm90aWZ5IGFmdGVyUmVuZGVyXG5cdFx0XHRmb3IgbmFtZSxjb250cm9sbGVyIG9mIEBjb250cm9sbGVyc1xuXHRcdFx0XHRjb250cm9sbGVyLmFmdGVyUmVuZGVyKClcblxuXHRcdFx0IyBoYW5kbGUgaGFzaCBjaGFuZ2VzXG5cdFx0XHR3aW5kb3cub25oYXNoY2hhbmdlID0gQGV4ZWN1dGVSZXF1ZXN0QnlIYXNoLmJpbmQodGhpcylcblx0XHRcdEBleGVjdXRlUmVxdWVzdEJ5SGFzaCgpXG5cdFx0cmV0dXJuXG5cblxuXHRnZXRDb250cm9sbGVyOiAobmFtZSwgb25SZWFkeSkgLT5cblx0XHRjb250cm9sbGVyID0gQGNvbnRyb2xsZXJzW25hbWVdXG5cdFx0aWYgIWNvbnRyb2xsZXJcblx0XHRcdGNvbnRyb2xsZXIgPSBAY29udHJvbGxlcnNbbmFtZV0gPSBAY29udHJvbGxlckZhY3RvcnkuY3JlYXRlKG5hbWUpXG5cdFx0XHRjb250cm9sbGVyLmFwcGxpY2F0aW9uID0gdGhpc1xuXHRcdFx0Y29udHJvbGxlci5vblN0YXJ0dXAob25SZWFkeSlcblx0XHRcdGNvbnRyb2xsZXIuaW5pdGlhbGl6ZSgpXG5cdFx0ZWxzZVxuXHRcdFx0Y29udHJvbGxlci5vblN0YXJ0dXAob25SZWFkeSlcblx0XHRyZXR1cm5cblxuXG5cdGNvbnRyb2w6ICh0YXJnZXQsIGV2ZW50cykgLT5cblx0XHRpZiBUeXBlLmlzU3RyaW5nKHRhcmdldClcblx0XHRcdEBldmVudE1nci5jb250cm9sKHRhcmdldCwgZXZlbnRzKVxuXHRcdGVsc2Vcblx0XHRcdHRhcmdldC5vbihldmVudHMpXG5cdFx0cmV0dXJuXG5cblxuXHRnZXRWaWV3cG9ydDogLT5cblx0XHRyZXR1cm4gQGluamVjdG9yLmdldCgndmlld3BvcnQnKVxuXG5cblx0Z2V0Um91dGVyOiAtPlxuXHRcdHJldHVybiBAaW5qZWN0b3IuZ2V0KCdtaXdvLnJvdXRlcicpXG5cblxuXHRleGVjdXRlOiAocmVxdWVzdCkgLT5cblx0XHRAZ2V0Q29udHJvbGxlciByZXF1ZXN0LmNvbnRyb2xsZXIsIChjb250cm9sbGVyKT0+XG5cdFx0XHRjb250cm9sbGVyLmV4ZWN1dGUocmVxdWVzdClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cblx0Zm9yd2FyZDogKHJlcXVlc3QpIC0+XG5cdFx0bWl3by5hc3luYyA9PiBAZXhlY3V0ZShyZXF1ZXN0KVxuXHRcdHJldHVyblxuXG5cblx0cmVkaXJlY3Q6IChyZXF1ZXN0LCB1bmlxdWUpIC0+XG5cdFx0aWYgVHlwZS5pc1N0cmluZyhyZXF1ZXN0KSAmJiByZXF1ZXN0LmNoYXJBdCgwKSBpcyAnIydcblx0XHRcdCMgY29udmVydCBoYXNoIHRvIHJlcXVlc3Rcblx0XHRcdHJlcXVlc3QgPSBAZ2V0Um91dGVyKCkuY29uc3RydWN0UmVxdWVzdChyZXF1ZXN0LnJlcGxhY2UoL14jLywgJycpKVxuXHRcdGlmICFAcmVxdWVzdFxuXHRcdFx0IyBleGVjdXRlIHJlcXVlc3Rcblx0XHRcdEByZWRpcmVjdFJlcXVlc3QocmVxdWVzdCwgdW5pcXVlKVxuXHRcdGVsc2Vcblx0XHRcdCMgZmluaXNoIHJlcXVlc3QgYnkgY29udHJvbGxlclxuXHRcdFx0QGdldENvbnRyb2xsZXIgQHJlcXVlc3QuY29udHJvbGxlciwgKGNvbnRyb2xsZXIpPT5cblx0XHRcdFx0Y29udHJvbGxlci50ZXJtaW5hdGUgQHJlcXVlc3QsID0+XG5cdFx0XHRcdFx0QHJlZGlyZWN0UmVxdWVzdChyZXF1ZXN0LCB1bmlxdWUpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cblx0cmVkaXJlY3RSZXF1ZXN0OiAocmVxdWVzdCwgdW5pcXVlKSAtPlxuXHRcdHJlcXVlc3QucGFyYW1zLl9yaWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNCwxMCkgaWYgdW5pcXVlXG5cdFx0aGFzaCA9IEBnZXRSb3V0ZXIoKS5jb25zdHJ1Y3RIYXNoKHJlcXVlc3QpXG5cdFx0QGVtaXQoJ3JlcXVlc3QnLCB0aGlzLCByZXF1ZXN0LCBoYXNoKVxuXHRcdGRvY3VtZW50LmxvY2F0aW9uLmhhc2ggPSBoYXNoXG5cdFx0cmV0dXJuXG5cblxuXHRleGVjdXRlUmVxdWVzdEJ5SGFzaDogLT5cblx0XHRoYXNoID0gZG9jdW1lbnQubG9jYXRpb24uaGFzaC5zdWJzdHIoMSlcblx0XHRpZiAhaGFzaCAmJiAhQGF1dG9DYW5vbmljYWxpemVcblx0XHRcdHJldHVyblxuXG5cdFx0cmVxdWVzdCA9IEBnZXRSb3V0ZXIoKS5jb25zdHJ1Y3RSZXF1ZXN0KGhhc2gpXG5cdFx0Y29uc3RydWN0ZWRIYXNoID0gQGdldFJvdXRlcigpLmNvbnN0cnVjdEhhc2gocmVxdWVzdClcblxuXHRcdGlmIEBhdXRvQ2Fub25pY2FsaXplIGFuZCBjb25zdHJ1Y3RlZEhhc2ggaXNudCBoYXNoXG5cdFx0XHRkb2N1bWVudC5sb2NhdGlvbi5oYXNoID0gY29uc3RydWN0ZWRIYXNoXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBleGVjdXRlKHJlcXVlc3QpXG5cdFx0cmV0dXJuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvbiIsImNsYXNzIENvbnRlbnRDb250YWluZXIgZXh0ZW5kcyBNaXdvLkNvbnRhaW5lclxuXG5cdGJhc2VDbHM6ICdtaXdvLXZpZXdzJ1xuXHRyb2xlOiAnbWFpbidcblx0Y29udGVudEVsOiAnZGl2J1xuXG5cblx0YWRkZWRDb21wb25lbnQ6IChjb21wb25lbnQpIC0+XG5cdFx0c3VwZXIoY29tcG9uZW50KVxuXHRcdGNvbXBvbmVudC5lbC5hZGRDbGFzcyhAZ2V0QmFzZUNscygnaXRlbScpKVxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ29udGVudENvbnRhaW5lciIsImNsYXNzIENvbnRyb2xsZXIgZXh0ZW5kcyBNaXdvLk9iamVjdFxuXG5cdG5hbWU6IG51bGxcblx0aW5qZWN0b3I6IG51bGxcblx0YXBwbGljYXRpb246IG51bGxcblx0cmVxdWVzdDogbnVsbFxuXHR2aWV3czogbnVsbFxuXHR2aWV3OiBudWxsXG5cdHJlcXVlc3Q6IG51bGxcblx0bGFzdFJlcXVlc3Q6IG51bGxcblxuXG5cdEBzZXJ2aWNlOiAocHJvcCwgc2VydmljZSA9IG51bGwpIC0+XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsXG5cdFx0XHRnZXQ6ICgpIC0+IEBpbmplY3Rvci5nZXQoc2VydmljZSB8fCBwcm9wKVxuXHRcdHJldHVyblxuXG5cblx0QHJlZ2lzdGVyVmlldzogKG5hbWUsIGtsYXNzKSAtPlxuXHRcdEBwcm90b3R5cGVbJ2NyZWF0ZScrbmFtZS5jYXBpdGFsaXplKCldID0gKGNvbmZpZyktPlxuXHRcdFx0cmV0dXJuIG5ldyBrbGFzcyhjb25maWcpXG5cdFx0cmV0dXJuXG5cblxuXG5cdGNvbnN0cnVjdG9yOiAoY29uZmlnKS0+XG5cdFx0c3VwZXIoY29uZmlnKVxuXHRcdEBzdGFydHVwZWQgPSBmYWxzZVxuXHRcdEBvblN0YXJ0dXBDYWxsYmFja3MgPSBbXVxuXHRcdEB2aWV3cyA9IHt9XG5cdFx0cmV0dXJuXG5cblxuXHRpbml0aWFsaXplOiAtPlxuXHRcdEBzdGFydHVwID0+XG5cdFx0XHRtaXdvLmFzeW5jID0+XG5cdFx0XHRcdEBzdGFydHVwZWQgPSB0cnVlXG5cdFx0XHRcdGZvciBjYWxsYmFjayBpbiBAb25TdGFydHVwQ2FsbGJhY2tzIHRoZW4gY2FsbGJhY2sodGhpcylcblx0XHRcdFx0QG9uU3RhcnR1cENhbGxiYWNrcy5lbXB0eSgpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cblxuXHRvblN0YXJ0dXA6IChjYWxsYmFjaykgLT5cblx0XHRpZiAhQHN0YXJ0dXBlZFxuXHRcdFx0QG9uU3RhcnR1cENhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKVxuXHRcdGVsc2Vcblx0XHRcdG1pd28uYXN5bmMgPT4gY2FsbGJhY2sodGhpcylcblx0XHRyZXR1cm5cblxuXG5cdCMgSW50ZXJuYWwgaW5pdGlhbGl6YXRpb24gb2YgY29udHJvbGxlclxuXHQjIEBwcm90ZWN0ZWRcblx0c3RhcnR1cDogKGRvbmUpIC0+XG5cdFx0ZG9uZSgpXG5cdFx0cmV0dXJuXG5cblxuXHQjIEJlZm9yZSByZW5kZXJpbmcgbm90aWZpY2F0aW9uXG5cdCMgQHByb3RlY3RlZFxuXHRiZWZvcmVSZW5kZXI6IC0+XG5cdFx0cmV0dXJuXG5cblxuXHQjIEFmdGVyIHJlbmRlciBub3RpZmljYXRpb25cblx0IyBAcHJvdGVjdGVkXG5cdGFmdGVyUmVuZGVyOiAtPlxuXHRcdHJldHVyblxuXG5cblx0IyBDb250cm9sIG9iamVjdCBvciBjb21wb25lbnRcblx0IyBAcGFyYW0ge01pd28uT2JqZWN0fFN0cmluZ30gdGFyZ2V0XG5cdCMgQHBhcmFtIHtPYmplY3R9IGV2ZW50c1xuXHRjb250cm9sOiAodGFyZ2V0LCBldmVudHMpIC0+XG5cdFx0QGFwcGxpY2F0aW9uLmNvbnRyb2wodGFyZ2V0LCBAYm91bmRFdmVudHMoZXZlbnRzKSk7XG5cdFx0cmV0dXJuXG5cblxuXHQjIEdldCBtYWluIGFwcGxpY2F0aW9uIHZpZXdwb3J0XG5cdCMgQHJldHVybnMge01pd28uY29tcG9uZW50LkNvbnRhaW5lcn1cblx0Z2V0Vmlld3BvcnQ6ICgpIC0+XG5cdFx0cmV0dXJuIEBhcHBsaWNhdGlvbi5nZXRWaWV3cG9ydCgpO1xuXG5cblx0IyBTZXQgc3lzdGVtIGNvbnRhaW5lclxuXHQjIEBwYXJhbSB7TWl3by5kaS5JbmplY3Rvcn0gaW5qZWN0b3Jcblx0c2V0SW5qZWN0b3I6IChAaW5qZWN0b3IpIC0+XG5cdFx0cmV0dXJuXG5cblxuXHQjIEJvdW5kIGNvbnRyb2wgZXZlbnRzIHRvIHRoaXMgc2NvcGVcblx0IyBAcHJpdmF0ZVxuXHRib3VuZEV2ZW50czogKGV2ZW50cykgLT5cblx0XHRmb3IgbmFtZSxjYWxsYmFjayBvZiBldmVudHNcblx0XHRcdGV2ZW50c1tuYW1lXSA9IEBib3VuZEV2ZW50KGNhbGxiYWNrKVxuXHRcdHJldHVybiBldmVudHNcblxuXG5cdCMgQm91bmQgY29udHJvbCBldmVudCB0byB0aGlzIHNjb3BlXG5cdCMgQHByaXZhdGVcblx0Ym91bmRFdmVudDogKGNhbGxiYWNrKSAtPlxuXHRcdHJldHVybiAoYXJncy4uLik9PiBpZiBUeXBlLmlzU3RyaW5nKGNhbGxiYWNrKSB0aGVuIHRoaXNbY2FsbGJhY2tdLmFwcGx5KHRoaXMsIGFyZ3MpIGVsc2UgY2FsbGJhY2suYXBwbHkodGhpcywgYXJncylcblxuXG5cdCMgUmVmcmVzaCB2aWV3IGJ5IG5hbWVcblx0IyBAcGFyYW0ge1N0cmluZ30gbmFtZVxuXHRyZWZyZXNoOiAobmFtZSkgLT5cblx0XHRpZiBAaGFzVmlldyhuYW1lKVxuXHRcdFx0dmlldyA9IEBnZXRWaWV3KG5hbWUpXG5cdFx0XHRyZW5kZXJOYW1lID0gQGZvcm1hdE1ldGhvZE5hbWUodmlldy5yZXF1ZXN0LmFjdGlvbiwgJ3JlbmRlcicpXG5cdFx0XHR0aGlzW3JlbmRlck5hbWVdKHZpZXcucmVxdWVzdCwgdmlldykgaWYgdGhpc1tyZW5kZXJOYW1lXVxuXHRcdHJldHVyblxuXG5cblx0IyBGb3J3YXJkIHJlcXVlc3QgKGV4ZWN1dGVkIHdpdGhvdXQgY2hhbmdlIGhhc2gpXG5cdCMgQHBhcmFtIHtTdHJpbmd9IGNvZGVcblx0IyBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG5cdGZvcndhcmQ6IChjb2RlLCBwYXJhbXMpIC0+XG5cdFx0QHJlcXVlc3QuZXhlY3V0ZWQgPSB0cnVlICBpZiBAcmVxdWVzdCAjIGJyZWFrIHByb2Nlc3MgcmVxdWVzdFxuXHRcdEBhcHBsaWNhdGlvbi5mb3J3YXJkKEBjcmVhdGVSZXF1ZXN0KGNvZGUsIHBhcmFtcykpXG5cdFx0cmV0dXJuXG5cblxuXHQjIFJlZGlyZWN0IHJlcXVlc3QgKGhhc2ggY2hhbmdlZClcblx0IyBAcGFyYW0ge1N0cmluZ30gY29kZVxuXHQjIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcblx0IyBAcGFyYW0ge0Jvb2xlYW59IHVuaXF1ZVxuXHRyZWRpcmVjdDogKGNvZGUsIHBhcmFtcywgdW5pcXVlKSAtPlxuXHRcdEByZXF1ZXN0LmV4ZWN1dGVkID0gdHJ1ZSAgaWYgQHJlcXVlc3QgIyBicmVhayBwcm9jZXNzIHJlcXVlc3Rcblx0XHRyZXF1ZXN0ID0gaWYgVHlwZS5pc1N0cmluZyhjb2RlKSB0aGVuIEBjcmVhdGVSZXF1ZXN0KGNvZGUsIHBhcmFtcykgZWxzZSBjb2RlXG5cdFx0QGFwcGxpY2F0aW9uLnJlZGlyZWN0KHJlcXVlc3QsIHVuaXF1ZSlcblx0XHRyZXR1cm5cblxuXG5cdCMgQ3JlYXRlIGFwcGxpY2F0aW9uIHJlcXVlc3Rcblx0IyBAcHJpdmF0ZVxuXHRjcmVhdGVSZXF1ZXN0OiAoY29kZSwgcGFyYW1zKSAtPlxuXHRcdHJldHVybiBAaW5qZWN0b3IuZ2V0KCdtaXdvLnJlcXVlc3RGYWN0b3J5JykuY3JlYXRlIGNvZGUsIHBhcmFtcyxcblx0XHRcdG5hbWU6IEBuYW1lXG5cdFx0XHRhY3Rpb246IEBhY3Rpb25cblxuXG5cdCMgRXhlY3V0ZSBhcHBsaWNhdGlvbiByZXF1ZXN0XG5cdCMgQHByb3RlY3RlZFxuXHQjIEBwYXJhbSB7TWl3by5hcHAuUmVxdWVzdH0gcmVxdWVzdFxuXHRleGVjdXRlOiAocmVxdWVzdCkgLT5cblx0XHRAcmVxdWVzdCA9IHJlcXVlc3Rcblx0XHRtZXRob2ROYW1lID0gQGZvcm1hdE1ldGhvZE5hbWUocmVxdWVzdC5hY3Rpb24sICdzaG93Jylcblx0XHRpZiAhdGhpc1ttZXRob2ROYW1lXVxuXHRcdFx0QGV4ZWN1dGVEb25lKHJlcXVlc3QpXG5cdFx0XHRyZXR1cm5cblx0XHR0aGlzW21ldGhvZE5hbWVdIHJlcXVlc3QsICh2aWV3KT0+XG5cdFx0XHRAZXhlY3V0ZURvbmUocmVxdWVzdCwgdmlldylcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXG5cblx0IyBJbnRlcm5hbCBjYWxsYmFjayB3aGVuIGFjdGlvbiBpcyByZWFkeVxuXHQjIEBwcml2YXRlXG5cdCMgQHBhcmFtIHtNaXdvLmFwcC5SZXF1ZXN0fSByZXF1ZXN0XG5cdGV4ZWN1dGVEb25lOiAocmVxdWVzdCwgdmlld05hbWUpIC0+XG5cdFx0aWYgcmVxdWVzdC5leGVjdXRlZCB0aGVuIHJldHVyblxuXHRcdHJlcXVlc3QuZXhlY3V0ZWQgPSB0cnVlXG5cblx0XHQjIGNhbGwgcmVuZGVyIG1ldGhvZFxuXHRcdHZpZXdOYW1lID0gcmVxdWVzdC5hY3Rpb24gaWYgIXZpZXdOYW1lXG5cdFx0cmVxdWVzdC52aWV3ID0gdmlld05hbWVcblx0XHR2aWV3ID0gQGdldFZpZXcodmlld05hbWUgfHwgcmVxdWVzdC5hY3Rpb24pXG5cdFx0dmlldy5yZXF1ZXN0ID0gcmVxdWVzdCAjIHN0b3JlIGxhc3QgcmVxdWVzdFxuXHRcdEBhcHBsaWNhdGlvbi5yZXF1ZXN0ID0gcmVxdWVzdCAjIHN0b3JlIGxhc3QgcmVxdWVzdFxuXG5cdFx0QGdldFZpZXdwb3J0KCkuYWN0aXZhdGVWaWV3IHZpZXcudmlld05hbWUsID0+XG5cdFx0XHRtZXRob2ROYW1lID0gQGZvcm1hdE1ldGhvZE5hbWUodmlld05hbWUsICdyZW5kZXInKVxuXHRcdFx0dGhpc1ttZXRob2ROYW1lXShyZXF1ZXN0LCB2aWV3KSBpZiB0aGlzW21ldGhvZE5hbWVdXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxuXG5cdCMgVGVybWluYXRlIHJlcXVlc3QgKGNhbGxlZCBieSBhcHBsaWNhdGlvbiwgd2hlbiBuZXcgcmVxdWVzdCBuZWVkIHRvIGJlIGV4ZWN1dGVkKVxuXHQjIEBwcml2YXRlXG5cdCMgQHBhcmFtIHtNaXdvLmFwcC5SZXF1ZXN0fSByZXF1ZXN0XG5cdCMgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcblx0dGVybWluYXRlOiAocmVxdWVzdCwgY2FsbGJhY2spIC0+XG5cdFx0bWV0aG9kTmFtZSA9IEBmb3JtYXRNZXRob2ROYW1lKHJlcXVlc3QudmlldywgJ2hpZGUnKVxuXHRcdGlmICF0aGlzW21ldGhvZE5hbWVdXG5cdFx0XHRtaXdvLmFzeW5jID0+IGNhbGxiYWNrKClcblx0XHRcdHJldHVyblxuXHRcdHRoaXNbbWV0aG9kTmFtZV0gcmVxdWVzdCwgQGdldFZpZXcocmVxdWVzdC52aWV3KSwgPT5cblx0XHRcdG1pd28uYXN5bmMgPT4gY2FsbGJhY2soKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cblxuXHRnZXRWaWV3OiAobmFtZSkgLT5cblx0XHR2aWV3cG9ydCA9IEBnZXRWaWV3cG9ydCgpXG5cdFx0dmlld05hbWUgPSBAZm9ybWF0Vmlld05hbWUobmFtZSlcblx0XHR2aWV3cG9ydC5hZGRWaWV3KHZpZXdOYW1lLCBAY3JlYXRlVmlldyhuYW1lKSkgaWYgIXZpZXdwb3J0Lmhhc1ZpZXcodmlld05hbWUpXG5cdFx0cmV0dXJuIHZpZXdwb3J0LmdldFZpZXcodmlld05hbWUpXG5cblxuXHRoYXNWaWV3OiAobmFtZSkgLT5cblx0XHR2aWV3cG9ydCA9IEBnZXRWaWV3cG9ydCgpXG5cdFx0dmlld05hbWUgPSBAZm9ybWF0Vmlld05hbWUobmFtZSlcblx0XHRyZXR1cm4gdmlld3BvcnQuaGFzVmlldyh2aWV3TmFtZSlcblxuXG5cdGNyZWF0ZVZpZXc6IChuYW1lKSAtPlxuXHRcdGZhY3RvcnkgPSAnY3JlYXRlJytuYW1lLmNhcGl0YWxpemUoKVxuXHRcdGlmICF0aGlzW2ZhY3RvcnldXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJWaWV3ICN7bmFtZX0gaGFzIG5vIGZhY3RvcnkgbWV0aG9kLiBZb3UgbXVzdCBkZWZpbmUgI3tmYWN0b3J5fSBtZXRob2QgaW4gY29udHJvbGxlciAje3RoaXN9XCIpXG5cdFx0dmlldyA9IHRoaXNbZmFjdG9yeV0oKVxuXHRcdGlmIHZpZXcgIWluc3RhbmNlb2YgTWl3by5Db21wb25lbnRcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNyZWF0ZWQgdmlldyBzaG91bGQgYnkgaW5zdGFuY2Ugb2YgTWl3by5Db21wb25lbnRcIilcblx0XHR2aWV3LmlzVmlldyA9IHRydWVcblx0XHR2aWV3LnZpc2libGUgPSBmYWxzZVxuXHRcdHZpZXcudmlld05hbWUgPSBAZm9ybWF0Vmlld05hbWUobmFtZSlcblx0XHR2aWV3LnNldElkKEBuYW1lK25hbWUuY2FwaXRhbGl6ZSgpKVxuXHRcdHJldHVybiB2aWV3XG5cblxuXHRmb3JtYXRNZXRob2ROYW1lOiAoYWN0aW9uLCB0eXBlKSAtPlxuXHRcdHJldHVybiB0eXBlK2FjdGlvbi5jYXBpdGFsaXplKClcblxuXG5cdGZvcm1hdFZpZXdOYW1lOiAoYWN0aW9uKSAtPlxuXHRcdHJldHVybiBAbmFtZSsnLicrYWN0aW9uXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sbGVyIiwiQ29udHJvbGxlciA9IHJlcXVpcmUgJy4vQ29udHJvbGxlcidcblxuXG5jbGFzcyBDb250cm9sbGVyRmFjdG9yeSBleHRlbmRzIE1pd28uT2JqZWN0XG5cblx0aW5qZWN0b3I6IEBpbmplY3QoJ2luamVjdG9yJylcblx0bmFtZXNwYWNlOiAnQXBwJ1xuXHRjb250cm9sbGVyczogbnVsbFxuXG5cblx0Y29uc3RydWN0b3I6IChjb25maWcpIC0+XG5cdFx0c3VwZXIoY29uZmlnKVxuXHRcdEBjb250cm9sbGVycyA9IHt9XG5cblxuXHRyZWdpc3RlcjogKG5hbWUsIGtsYXNzKSAtPlxuXHRcdEBjb250cm9sbGVyc1tuYW1lXSA9IGtsYXNzXG5cdFx0cmV0dXJuIHRoaXNcblxuXG5cdGNyZWF0ZTogKG5hbWUpIC0+XG5cdFx0a2xhc3NOYW1lID0gQGZvcm1hdENsYXNzTmFtZShuYW1lKVxuXHRcdHRyeVxuXHRcdFx0a2xhc3MgPSBldmFsKGtsYXNzTmFtZSlcblx0XHRjYXRjaCBlXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb250cm9sbGVyIGNsYXNzICN7a2xhc3NOYW1lfSBpcyBiYWQgZGVmaW5lZFwiKVxuXG5cdFx0aWYgdHlwZW9mKGtsYXNzKSBpc250ICdmdW5jdGlvbidcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNvbnRyb2xsZXIgY2xhc3MgI3trbGFzc05hbWV9IGlzIG5vdCBjb25zdHJ1Y3RvclwiKVxuXG5cdFx0Y29udHJvbGxlciA9IEBpbmplY3Rvci5jcmVhdGVJbnN0YW5jZShrbGFzcylcblx0XHRjb250cm9sbGVyLnNldEluamVjdG9yKEBpbmplY3Rvcilcblx0XHRjb250cm9sbGVyLm5hbWUgPSBuYW1lXG5cblx0XHRpZiBjb250cm9sbGVyICFpbnN0YW5jZW9mIENvbnRyb2xsZXJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNvbnRyb2xsZXIgI3trbGFzc05hbWV9IGlzIG5vdCBpbnN0YW5jZSBvZiBDb250cm9sbGVyXCIpXG5cblx0XHRyZXR1cm4gY29udHJvbGxlclxuXG5cblx0Zm9ybWF0Q2xhc3NOYW1lOiAobmFtZSktPlxuXHRcdGlmIEBjb250cm9sbGVyc1tuYW1lXVxuXHRcdFx0cmV0dXJuIEBjb250cm9sbGVyc1tuYW1lXVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBAbmFtZXNwYWNlKycuY29udHJvbGxlcnMuJytuYW1lLmNhcGl0YWxpemUoKSsnQ29udHJvbGxlcidcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xsZXJGYWN0b3J5IiwiQXBwbGljYXRpb24gPSByZXF1aXJlICcuL0FwcGxpY2F0aW9uJ1xuUm91dGVyID0gcmVxdWlyZSAnLi9Sb3V0ZXInXG5SZXF1ZXN0RmFjdG9yeSA9IHJlcXVpcmUgJy4vUmVxdWVzdEZhY3RvcnknXG5GbGFzaE5vdGlmaWNhdG9yID0gcmVxdWlyZSAnLi9GbGFzaE5vdGlmaWNhdG9yJ1xuQ29udHJvbGxlckZhY3RvcnkgPSByZXF1aXJlICcuL0NvbnRyb2xsZXJGYWN0b3J5J1xuXG5cbmNsYXNzIE1pd29BcHBFeHRlbnNpb24gZXh0ZW5kcyBNaXdvLmRpLkluamVjdG9yRXh0ZW5zaW9uXG5cblxuXHRpbml0OiAtPlxuXHRcdEBzZXRDb25maWdcblx0XHRcdGZsYXNoOiBudWxsXG5cdFx0XHRjb250cm9sbGVyczoge31cblx0XHRcdHJ1bjogW11cblx0XHRcdGRlZmF1bHRDb250cm9sbGVyOiAnZGVmYXVsdCdcblx0XHRcdGRlZmF1bHRBY3Rpb246ICdkZWZhdWx0J1xuXHRcdFx0YXV0b0Nhbm9uaWNhbGl6ZTogdHJ1ZVxuXHRcdHJldHVyblxuXG5cblx0YnVpbGQ6IChpbmplY3RvcikgLT5cblx0XHQjIHNldHVwIGFwcGxpY2F0aW9uXG5cdFx0aW5qZWN0b3IuZGVmaW5lICdhcHBsaWNhdGlvbicsIEFwcGxpY2F0aW9uLCAoc2VydmljZSkgPT5cblx0XHRcdHNlcnZpY2UucnVuQ29udHJvbGxlcnMgPSBAY29uZmlnLnJ1blxuXHRcdFx0c2VydmljZS5hdXRvQ2Fub25pY2FsaXplID0gQGNvbmZpZy5hdXRvQ2Fub25pY2FsaXplXG5cblx0XHRpbmplY3Rvci5kZWZpbmUgJ2ZsYXNoJywgRmxhc2hOb3RpZmljYXRvciwgKHNlcnZpY2UpPT5cblx0XHRcdHNlcnZpY2UucmVuZGVyZXIgPSBAY29uZmlnLmZsYXNoXG5cblx0XHRpbmplY3Rvci5kZWZpbmUgJ21pd28uY29udHJvbGxlckZhY3RvcnknLCBDb250cm9sbGVyRmFjdG9yeSwgKHNlcnZpY2UpPT5cblx0XHRcdHNlcnZpY2UubmFtZXNwYWNlID0gQGNvbmZpZy5uYW1lc3BhY2Vcblx0XHRcdGZvciBuYW1lLGNvbnRyb2xsZXIgb2YgQGNvbmZpZy5jb250cm9sbGVyc1xuXHRcdFx0XHRzZXJ2aWNlLnJlZ2lzdGVyKG5hbWUsY29udHJvbGxlcilcblx0XHRcdHJldHVyblxuXG5cdFx0aW5qZWN0b3IuZGVmaW5lICdtaXdvLnJvdXRlcicsIFJvdXRlciwgKHNlcnZpY2UpID0+XG5cdFx0XHRzZXJ2aWNlLmNvbnRyb2xsZXIgPSBAY29uZmlnLmRlZmF1bHRDb250cm9sbGVyXG5cdFx0XHRzZXJ2aWNlLmFjdGlvbiA9IEBjb25maWcuZGVmYXVsdEFjdGlvblxuXHRcdFx0cmV0dXJuXG5cblx0XHRpbmplY3Rvci5kZWZpbmUgJ21pd28ucmVxdWVzdEZhY3RvcnknLCBSZXF1ZXN0RmFjdG9yeVxuXHRcdHJldHVyblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNaXdvQXBwRXh0ZW5zaW9uIiwiY2xhc3MgRXZlbnRNYW5hZ2VyIGV4dGVuZHMgTWl3by5PYmplY3RcblxuXHRzZWxlY3RvcnM6IG51bGxcblxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdHN1cGVyKClcblx0XHRAc2VsZWN0b3JzID0gW11cblx0XHRtaXdvLmNvbXBvbmVudE1nci5vbigncmVnaXN0ZXInLCBAYm91bmQoJ29uUmVnaXN0ZXInKSlcblx0XHRtaXdvLmNvbXBvbmVudE1nci5vbigndW5yZWdpc3RlcicsIEBib3VuZCgnb25VbnJlZ2lzdGVyJykpXG5cdFx0cmV0dXJuXG5cblxuXHRjb250cm9sOiAoc2VsZWN0b3IsIGV2ZW50cykgLT5cblx0XHRAc2VsZWN0b3JzLnB1c2hcblx0XHRcdHNlbGVjdG9yOiBzZWxlY3RvclxuXHRcdFx0ZXZlbnRzOiBldmVudHNcblx0XHRcdHBhcnRzOiBzZWxlY3Rvci5zcGxpdCgnICcpXG5cdFx0cmV0dXJuXG5cblxuXHRvblJlZ2lzdGVyOiAoY29tcG9uZW50KSAtPlxuXHRcdCMgbWF0Y2ggb25seSAxLXJ1bGUgc2VsZWN0b3JzXG5cdFx0Zm9yIGl0ZW0gaW4gQHNlbGVjdG9yc1xuXHRcdFx0aWYgaXRlbS5wYXJ0cy5sZW5ndGggaXMgMSAmJiBAaXNNYXRjaGVkKGNvbXBvbmVudCwgaXRlbSlcblx0XHRcdFx0Zm9yIG5hbWUsZXZlbnQgb2YgaXRlbS5ldmVudHNcblx0XHRcdFx0XHRjb21wb25lbnQub24obmFtZSwgZXZlbnQpXG5cdFx0IyBoYW5kbGUgbXVsdGktcnVsZXMgc2VsZWN0b3JzXG5cdFx0Y29tcG9uZW50Lm9uICdhdHRhY2hlZCcsIEBib3VuZCgnb25BdHRhY2hlZCcpXG5cdFx0Y29tcG9uZW50Lm9uICdkZXRhY2hlZCcsIEBib3VuZCgnb25EZXRhY2hlZCcpXG5cdFx0cmV0dXJuXG5cblxuXHRvblVucmVnaXN0ZXI6IChjb21wb25lbnQpIC0+XG5cdFx0IyB1bmJvdW5kIGV2ZW50c1xuXHRcdGZvciBpdGVtIGluIEBzZWxlY3RvcnNcblx0XHRcdGlmIGl0ZW0ucGFydHMubGVuZ3RoIGlzIDEgJiYgQGlzTWF0Y2hlZChjb21wb25lbnQsIGl0ZW0pXG5cdFx0XHRcdGZvciBuYW1lLGV2ZW50IG9mIGl0ZW0uZXZlbnRzXG5cdFx0XHRcdFx0Y29tcG9uZW50LnVuKG5hbWUsIGV2ZW50KVxuXHRcdCMgdW5ib3VuZCBldmVudHNcblx0XHRjb21wb25lbnQudW4gJ2F0dGFjaGVkJywgQGJvdW5kKCdvbkF0dGFjaGVkJylcblx0XHRjb21wb25lbnQudW4gJ2RldGFjaGVkJywgQGJvdW5kKCdvbkRldGFjaGVkJylcblx0XHRyZXR1cm5cblxuXG5cdG9uQXR0YWNoZWQ6IChjb21wb25lbnQpIC0+XG5cdFx0IyBwcm9jZXNzIG9ubHkgMS1sZXZlbCBzZWxlY3RvcnNcblx0XHRmb3IgaXRlbSBpbiBAc2VsZWN0b3JzXG5cdFx0XHRpZiBpdGVtLnBhcnRzLmxlbmd0aCA+IDEgJiYgQGlzTWF0Y2hlZChjb21wb25lbnQsIGl0ZW0pXG5cdFx0XHRcdGZvciBuYW1lLGV2ZW50IG9mIGl0ZW0uZXZlbnRzXG5cdFx0XHRcdFx0Y29tcG9uZW50Lm9uKG5hbWUsIGV2ZW50KVxuXHRcdCMgaXRlcmF0ZSBvdmVyIGFsbCBjaGlsZHMgcmVjdXJzaXZlbHlcblx0XHRpZiBjb21wb25lbnQuaXNDb250YWluZXJcblx0XHRcdGZvciBjaGlsZCBpbiBjb21wb25lbnQuZ2V0Q29tcG9uZW50cygpLnRvQXJyYXkoKVxuXHRcdFx0XHRAb25BdHRhY2hlZChjaGlsZClcblx0XHRyZXR1cm5cblxuXG5cdG9uRGV0YWNoZWQ6IChjb21wb25lbnQpIC0+XG5cdFx0IyBwcm9jZXNzIG9ubHkgMS1sZXZlbCBzZWxlY3RvcnNcblx0XHRmb3IgaXRlbSBpbiBAc2VsZWN0b3JzXG5cdFx0XHRpZiBpdGVtLnBhcnRzLmxlbmd0aCA+IDEgJiYgQGlzTWF0Y2hlZChjb21wb25lbnQsIGl0ZW0pXG5cdFx0XHRcdGZvciBuYW1lLGV2ZW50IG9mIGl0ZW0uZXZlbnRzXG5cdFx0XHRcdFx0Y29tcG9uZW50LnVuKG5hbWUsIGV2ZW50KVxuXHRcdCMgaXRlcmF0ZSBvdmVyIGFsbCBjaGlsZHMgcmVjdXJzaXZlbHlcblx0XHRpZiBjb21wb25lbnQuaXNDb250YWluZXJcblx0XHRcdGZvciBjaGlsZCBpbiBjb21wb25lbnQuZ2V0Q29tcG9uZW50cygpLnRvQXJyYXkoKVxuXHRcdFx0XHRAb25EZXRhY2hlZChjaGlsZClcblx0XHRyZXR1cm5cblxuXG5cdGlzTWF0Y2hlZDogKGNvbXBvbmVudCwgaXRlbSkgLT5cblx0XHRpZiBUeXBlLmlzU3RyaW5nKGl0ZW0pXG5cdFx0XHRzZWxlY3RvcnMgPSBpdGVtLnNwbGl0KCcgJylcblx0XHRlbHNlXG5cdFx0XHRzZWxlY3RvcnMgPSBpdGVtLnBhcnRzXG5cblx0XHQjIHRlc3QgaWYgY29tcG9uZW50IG1hdGNoIGxhc3Qgc2VsZWN0b3Jcblx0XHRpZiAhY29tcG9uZW50LmlzKHNlbGVjdG9yc1tzZWxlY3RvcnMubGVuZ3RoLTFdKVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cblx0XHQjIGlmIGNvbXBvbmVudCBtYXRjaCwgY2hlY2sgaWYgaGFzIG5leHQgc2VsZWN0b3JzXG5cdFx0aWYgc2VsZWN0b3JzLmxlbmd0aCBpcyAxXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0IyB2YWxpZGF0ZSBhbGwgb3RoZXIgcHJldmlvdXMgaXRlbXNcblx0XHRjb21wb25lbnQgPSBjb21wb25lbnQuZ2V0UGFyZW50KClcblx0XHRpbmRleExhc3QgPSBzZWxlY3RvcnMubGVuZ3RoLTFcblx0XHRmb3Igc2VsZWN0b3IsaW5kZXggaW4gc2VsZWN0b3JzIGJ5IC0xXG5cdFx0XHRpZiBpbmRleCBpcyBpbmRleExhc3Rcblx0XHRcdFx0Y29udGludWVcblx0XHRcdHdoaWxlIGNvbXBvbmVudCAmJiAhY29tcG9uZW50LmlzKHNlbGVjdG9yKVxuXHRcdFx0XHRjb21wb25lbnQgPSBjb21wb25lbnQuZ2V0UGFyZW50KClcblx0XHRcdGlmIGNvbXBvbmVudCBpcyBudWxsXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdHJldHVybiB0cnVlXG5cblxuXHRkb0Rlc3Ryb3k6IC0+XG5cdFx0bWl3by5jb21wb25lbnRNZ3IudW4oJ3JlZ2lzdGVyJywgQGJvdW5kKCdvblJlZ2lzdGVyJykpXG5cdFx0bWl3by5jb21wb25lbnRNZ3IudW4oJ3VucmVnaXN0ZXInLCBAYm91bmQoJ29uVW5yZWdpc3RlcicpKVxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRNYW5hZ2VyIiwiY2xhc3MgRmxhc2hOb3RpZmljYXRvclxuXG5cdHJlbmRlcmVyOiBudWxsXG5cblxuXHRjb25zdHJ1Y3RvcjogKCkgLT5cblx0XHRAcmVuZGVyZXIgPSAobWVzc2FnZSwgdHlwZSkgLT5cblx0XHRcdGlmIGNvbnNvbGUgdGhlbiBjb25zb2xlLmxvZygnRkxBU0g6JywgbWVzc2FnZSwgdHlwZSlcblx0XHRcdHJldHVyblxuXG5cblx0ZXJyb3I6IChtZXNzYWdlKSAtPlxuXHRcdEBtZXNzYWdlKG1lc3NhZ2UsICdlcnJvcicpXG5cdFx0cmV0dXJuXG5cblxuXHRpbmZvOiAobWVzc2FnZSkgLT5cblx0XHRAbWVzc2FnZShtZXNzYWdlLCAnaW5mbycpXG5cdFx0cmV0dXJuXG5cblxuXHR3YXJuaW5nOiAobWVzc2FnZSkgLT5cblx0XHRAbWVzc2FnZShtZXNzYWdlLCAnd2FybmluZycpXG5cdFx0cmV0dXJuXG5cblxuXHRtZXNzYWdlOiAobWVzc2FnZSwgdHlwZSkgLT5cblx0XHRpZiAhQHJlbmRlcmVyIHRoZW4gcmV0dXJuXG5cdFx0QHJlbmRlcmVyKG1lc3NhZ2UsIHR5cGUpXG5cdFx0cmV0dXJuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGbGFzaE5vdGlmaWNhdG9yIiwiY2xhc3MgUmVxdWVzdFxuXG5cdGlzUmVxdWVzdDogdHJ1ZVxuXHRjb250cm9sbGVyOiBudWxsXG5cdGFjdGlvbjogbnVsbFxuXHR2aWV3OiBudWxsXG5cdHBhcmFtczogbnVsbFxuXG5cdGNvbnN0cnVjdG9yOiAoQGNvbnRyb2xsZXIsIEBhY3Rpb24sIHBhcmFtcyA9IHt9KSAtPlxuXHRcdEBwYXJhbXMgPSBPYmplY3QubWVyZ2Uoe30sIHBhcmFtcykgIyBjbG9uZSBvYmplY3RcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcXVlc3QiLCJSZXF1ZXN0ID0gcmVxdWlyZSAnLi9SZXF1ZXN0J1xuXG5cbmNsYXNzIFJlcXVlc3RGYWN0b3J5XG5cblx0Y29kZVJlOiAvXigoW2EtekEtWl0rKVxcOik/KFthLXpdW2EtekEtWl0rKT8kL1xuXG5cblx0Y3JlYXRlOiAoY29kZSwgcGFyYW1zLCBkZWZhdWx0cykgLT5cblx0XHRwYXJ0cyA9IGNvZGUubWF0Y2goQGNvZGVSZSlcblx0XHRpZighcGFydHMpIHRoZW4gdGhyb3cgbmV3IEVycm9yKFwiQmFkIHJlZGlyZWN0IENPREVcIilcblx0XHRjb250cm9sbGVyID0gaWYgcGFydHNbMl0gaXNudCB1bmRlZmluZWQgdGhlbiBwYXJ0c1syXSBlbHNlIGRlZmF1bHRzLm5hbWVcblx0XHRhY3Rpb24gPSBpZiBwYXJ0c1szXSBpc250ICd0aGlzJyB0aGVuIHBhcnRzWzNdIGVsc2UgZGVmYXVsdHMuYWN0aW9uXG5cdFx0cmV0dXJuIG5ldyBSZXF1ZXN0KGNvbnRyb2xsZXIsIGFjdGlvbiwgcGFyYW1zKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUmVxdWVzdEZhY3RvcnkiLCJSZXF1ZXN0ID0gcmVxdWlyZSAnLi9SZXF1ZXN0J1xuXG5cbmNsYXNzIFJvdXRlciBleHRlbmRzIE1pd28uT2JqZWN0XG5cblx0Y29udHJvbGxlcjogXCJkZWZhdWx0XCJcblx0YWN0aW9uOiBcImRlZmF1bHRcIlxuXG5cblx0Y29uc3RydWN0UmVxdWVzdDogKGhhc2gpIC0+XG5cdFx0bWF0Y2ggPSBoYXNoLm1hdGNoKC9eKChbYS16QS1aXSopKFxcOihbYS16XVthLXpBLVpdKykpPyhcXD8oLiopKT8pPyQvKVxuXHRcdGNvbnRyb2xsZXIgPSBtYXRjaFsyXSBvciBAY29udHJvbGxlclxuXHRcdGFjdGlvbiA9IG1hdGNoWzRdIG9yIEBhY3Rpb25cblx0XHRwYXJhbXMgPSAoaWYgbWF0Y2hbNl0gdGhlbiBAcGFyc2VRdWVyeShtYXRjaFs2XSkgZWxzZSB7fSlcblx0XHRyZXR1cm4gbmV3IFJlcXVlc3QoY29udHJvbGxlciwgYWN0aW9uLCBwYXJhbXMpXG5cblxuXHRjb25zdHJ1Y3RIYXNoOiAocmVxdWVzdCkgLT5cblx0XHRoYXNoID0gcmVxdWVzdC5jb250cm9sbGVyXG5cdFx0aWYgKHJlcXVlc3QuYWN0aW9uIGFuZCByZXF1ZXN0LmFjdGlvbiBpc250IEBhY3Rpb24pIG9yIChyZXF1ZXN0LnBhcmFtcyBhbmQgT2JqZWN0LmdldExlbmd0aChyZXF1ZXN0LnBhcmFtcykgPiAwKVxuXHRcdFx0aGFzaCArPSBcIjpcIiArIHJlcXVlc3QuYWN0aW9uXG5cdFx0XHRpZiByZXF1ZXN0LnBhcmFtc1xuXHRcdFx0XHRxdWVyeSA9IE9iamVjdC50b1F1ZXJ5U3RyaW5nKHJlcXVlc3QucGFyYW1zKVxuXHRcdFx0XHRoYXNoICs9IFwiP1wiICsgcXVlcnkgIGlmIHF1ZXJ5XG5cdFx0cmV0dXJuIGhhc2hcblxuXG5cdHBhcnNlUXVlcnk6IChzdHJpbmcpIC0+XG5cdFx0cXVlcnkgPSB7fVxuXHRcdGZvciBpdGVtIGluIHN0cmluZy5zcGxpdCgnJicpXG5cdFx0XHRwYXJ0cyA9IGl0ZW0uc3BsaXQoJz0nKVxuXHRcdFx0cXVlcnlbZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzBdKV0gPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pXG5cdFx0cmV0dXJuIHF1ZXJ5XG5cblxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZXIiLCJDb250ZW50Q29udGFpbmVyID0gcmVxdWlyZSAnLi9Db250ZW50Q29udGFpbmVyJ1xuXG5cbmNsYXNzIFZpZXdwb3J0IGV4dGVuZHMgTWl3by5Db250YWluZXJcblxuXHRpZDogJ3ZpZXdwb3J0J1xuXHRuYW1lOiAndmlld3BvcnQnXG5cdGxheW91dDogJ2Fic29sdXRlJ1xuXHRiYXNlQ2xzOiAnbWl3by12aWV3cG9ydCdcblx0Y29udGVudEVsOiAnZGl2J1xuXHR2aWV3OiBudWxsXG5cdGFuaW1hdGlvbjogZmFsc2Vcblx0YW5pbWF0aW9uRnhJbjogJ2ZhZGVJbidcblx0YW5pbWF0aW9uRnhPdXQ6ICdmYWRlT3V0J1xuXHRhbmltYXRpb25EdXJhdGlvbjogMTAwMFxuXG5cblx0YWZ0ZXJJbml0OiAtPlxuXHRcdHN1cGVyXG5cdFx0QGNvbnRlbnQgPSBAZ2V0KCdjb250ZW50JywgZmFsc2UpXG5cdFx0aWYgIUBjb250ZW50XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb250ZW50IGNvbXBvbmVudCBtaXNzaW5nXCIpXG5cdFx0aWYgQGNvbnRlbnQgIWluc3RhbmNlb2YgQ29udGVudENvbnRhaW5lclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ29udGVudCBjb21wb25lbnQgc2hvdWxkIGJ5IGluc3RhbmNlIG9mIENvbnRlbnRDb250YWluZXJcIilcblx0XHRyZXR1cm5cblxuXG5cdGFkZENvbnRlbnQ6IChjb25maWcpIC0+XG5cdFx0cmV0dXJuIEBhZGQoJ2NvbnRlbnQnLCBuZXcgQ29udGVudENvbnRhaW5lcihjb25maWcpKVxuXG5cblx0aGFzVmlldzogKG5hbWUpIC0+XG5cdFx0cmV0dXJuICEhQGNvbnRlbnQuZ2V0KEBmb3JtYXROYW1lKG5hbWUpLCBmYWxzZSlcblxuXG5cdGdldFZpZXc6IChuYW1lKSAtPlxuXHRcdHJldHVybiBAY29udGVudC5nZXQoQGZvcm1hdE5hbWUobmFtZSkpXG5cblxuXHRhZGRWaWV3OiAobmFtZSwgY29tcG9uZW50KSAtPlxuXHRcdHJldHVybiBAY29udGVudC5hZGQoQGZvcm1hdE5hbWUobmFtZSksIGNvbXBvbmVudClcblxuXG5cdGFjdGl2YXRlVmlldzogKG5hbWUsIGNhbGxiYWNrKSAtPlxuXHRcdGlmICFAdmlldyAjIGZpcnN0IHZpZXcgc2hvdyB3aXRob3V0IGFuaW1hdGlvblxuXHRcdFx0QHZpZXcgPSBAZ2V0VmlldyhuYW1lKVxuXHRcdFx0QHZpZXcuc2V0QWN0aXZlKHRydWUpXG5cdFx0XHRAdmlldy5zaG93KClcblx0XHRcdGNhbGxiYWNrKClcblx0XHRcdHJldHVyblxuXHRcdEBoaWRlVmlldyA9PlxuXHRcdFx0QHZpZXcuc2V0QWN0aXZlKGZhbHNlKVxuXHRcdFx0QHZpZXcgPSBAZ2V0VmlldyhuYW1lKVxuXHRcdFx0QHNob3dWaWV3ID0+XG5cdFx0XHRcdEB2aWV3LnNldEFjdGl2ZSh0cnVlKVxuXHRcdFx0XHRjYWxsYmFjayhAdmlldylcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxuXG5cdGhpZGVWaWV3OiAoY2FsbGJhY2spIC0+XG5cdFx0aWYgIUB2aWV3XG5cdFx0XHRjYWxsYmFjaygpXG5cdFx0aWYgIUBhbmltYXRpb25cblx0XHRcdEB2aWV3LmhpZGUoKVxuXHRcdFx0Y2FsbGJhY2soKVxuXHRcdGVsc2Vcblx0XHRcdEB2aWV3LmVsLmFkZENsYXNzKCdhbmltYXRlZCcpLmFkZENsYXNzKEBhbmltYXRpb25GeE91dClcblx0XHRcdHNldFRpbWVvdXQgPT5cblx0XHRcdFx0QHZpZXcuaGlkZSgpXG5cdFx0XHRcdEB2aWV3LmVsLnJlbW92ZUNsYXNzKCdhbmltYXRlZCcpLnJlbW92ZUNsYXNzKEBhbmltYXRpb25GeE91dClcblx0XHRcdFx0Y2FsbGJhY2soKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdCwgQGFuaW1hdGlvbkR1cmF0aW9uXG5cdFx0cmV0dXJuXG5cblxuXHRzaG93VmlldzogKGNhbGxiYWNrKSAtPlxuXHRcdGlmICFAYW5pbWF0aW9uXG5cdFx0XHRAdmlldy5zaG93KClcblx0XHRcdGNhbGxiYWNrKClcblx0XHRlbHNlXG5cdFx0XHRAdmlldy5lbC5hZGRDbGFzcygnYW5pbWF0ZWQnKS5hZGRDbGFzcyhAYW5pbWF0aW9uRnhJbilcblx0XHRcdEB2aWV3LnNob3coKVxuXHRcdFx0Y2FsbGJhY2soKVxuXHRcdFx0c2V0VGltZW91dCA9PlxuXHRcdFx0XHRAdmlldy5lbC5yZW1vdmVDbGFzcygnYW5pbWF0ZWQnKS5yZW1vdmVDbGFzcyhAYW5pbWF0aW9uRnhJbilcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHQsIEBhbmltYXRpb25EdXJhdGlvblxuXHRcdHJldHVyblxuXG5cblx0Zm9ybWF0TmFtZTogKG5hbWUpIC0+XG5cdFx0W2dyb3VwLCBzZWN0aW9uXSA9IG5hbWUuc3BsaXQoJy4nKVxuXHRcdHJldHVybiBncm91cCArIHNlY3Rpb24uY2FwaXRhbGl6ZSgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3cG9ydCIsIk1pd28uYXBwID1cblx0QXBwbGljYXRpb246IHJlcXVpcmUgJy4vQXBwbGljYXRpb24nXG5cdENvbnRyb2xsZXI6IHJlcXVpcmUgJy4vQ29udHJvbGxlcidcblx0Um91dGVyOiByZXF1aXJlICcuL1JvdXRlcidcblx0UmVxdWVzdDogcmVxdWlyZSAnLi9SZXF1ZXN0J1xuXHRSZXF1ZXN0RmFjdG9yeTogcmVxdWlyZSAnLi9SZXF1ZXN0RmFjdG9yeSdcblx0Rmxhc2hOb3RpZmljYXRvcjogcmVxdWlyZSAnLi9GbGFzaE5vdGlmaWNhdG9yJ1xuXHRFdmVudE1hbmFnZXI6IHJlcXVpcmUgJy4vRXZlbnRNYW5hZ2VyJ1xuXHRWaWV3cG9ydDogcmVxdWlyZSAnLi9WaWV3cG9ydCdcblx0Q29udGVudENvbnRhaW5lcjogcmVxdWlyZSAnLi9Db250ZW50Q29udGFpbmVyJ1xuXG5cbm1pd28ucmVnaXN0ZXJFeHRlbnNpb24oJ21pd28tYXBwJywgcmVxdWlyZSAnLi9EaUV4dGVuc2lvbicpIl19
