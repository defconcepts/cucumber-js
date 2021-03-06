function Library(supportCodeDefinition) {
  var Cucumber = require('../../cucumber');

  var listeners        = [];
  var stepDefinitions  = [];
  var aroundHooks      = [];
  var beforeHooks      = [];
  var afterHooks       = [];
  var World            = function World() {};
  var defaultTimeout   = 5 * 1000;

  function appendEventHandlers(supportCodeHelper, library) {
    var Cucumber = require('../../cucumber');
    var events = Cucumber.Listener.Events;
    var eventName;

    for (eventName in events) {
      if (events.hasOwnProperty(eventName)) {
        supportCodeHelper[eventName] = createEventListenerMethod(library, eventName);
      }
    }
  }

  function createEventListenerMethod(library, eventName) {
    return function (handler) {
      library.registerHandler(eventName, handler);
    };
  }

  var self = {
    lookupAroundHooksByScenario: function lookupBeforeHooksByScenario(scenario) {
      return self.lookupHooksByScenario(aroundHooks, scenario);
    },

    lookupBeforeHooksByScenario: function lookupBeforeHooksByScenario(scenario) {
      return self.lookupHooksByScenario(beforeHooks, scenario);
    },

    lookupAfterHooksByScenario: function lookupBeforeHooksByScenario(scenario) {
      return self.lookupHooksByScenario(afterHooks, scenario);
    },

    lookupHooksByScenario: function lookupHooksByScenario(hooks, scenario) {
      return hooks.filter(function (hook) {
        return hook.appliesToScenario(scenario);
      });
    },

    lookupStepDefinitionByName: function lookupStepDefinitionByName(name) {
      var matchingStepDefinition;

      stepDefinitions.forEach(function (stepDefinition) {
        if (stepDefinition.matchesStepName(name)) {
          matchingStepDefinition = stepDefinition;
        }
      });
      return matchingStepDefinition;
    },

    isStepDefinitionNameDefined: function isStepDefinitionNameDefined(name) {
      var stepDefinition = self.lookupStepDefinitionByName(name);
      return (stepDefinition !== undefined);
    },

    defineAroundHook: function defineAroundHook() {
      var tagGroupStrings = Cucumber.Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      var hook            = Cucumber.SupportCode.AroundHook(code, {tags: tagGroupStrings});
      aroundHooks.push(hook);
    },

    defineBeforeHook: function defineBeforeHook() {
      var tagGroupStrings = Cucumber.Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      var hook            = Cucumber.SupportCode.Hook(code, {tags: tagGroupStrings});
      beforeHooks.push(hook);
    },

    defineAfterHook: function defineAfterHook() {
      var tagGroupStrings = Cucumber.Util.Arguments(arguments);
      var code            = tagGroupStrings.pop();
      var hook            = Cucumber.SupportCode.Hook(code, {tags: tagGroupStrings});
      afterHooks.push(hook);
    },

    defineStep: function defineStep(name, options, code) {
      if (typeof(options) === 'function') {
        code = options;
        options = {};
      }
      var stepDefinition = Cucumber.SupportCode.StepDefinition(name, options, code);
      stepDefinitions.push(stepDefinition);
    },

    registerListener: function registerListener(listener) {
      listeners.push(listener);
    },

    registerHandler: function registerHandler(eventName, handler) {
      var listener = Cucumber.Listener();
      listener.setHandlerForEvent(eventName, handler);
      self.registerListener(listener);
    },

    getListeners: function getListeners() {
      return listeners;
    },

    instantiateNewWorld: function instantiateNewWorld(callback) {
      var world = new World();
      callback(world);
    },

    getDefaultTimeout: function getDefaultTimeout() {
      return defaultTimeout;
    },

    setDefaultTimeout: function setDefaultTimeout(milliseconds) {
      defaultTimeout = milliseconds;
    }
  };

  var supportCodeHelper = {
    Around            : self.defineAroundHook,
    Before            : self.defineBeforeHook,
    After             : self.defineAfterHook,
    Given             : self.defineStep,
    When              : self.defineStep,
    Then              : self.defineStep,
    defineStep        : self.defineStep,
    registerListener  : self.registerListener,
    registerHandler   : self.registerHandler,
    setDefaultTimeout : self.setDefaultTimeout,
    World             : World
  };

  appendEventHandlers(supportCodeHelper, self);
  supportCodeDefinition.call(supportCodeHelper);
  World = supportCodeHelper.World;

  return self;
}

module.exports = Library;
