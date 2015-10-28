function HookStep(data) {
  var Cucumber = require('../../cucumber');
  var self = Cucumber.Ast.Step(data);
  var hook;

  self.isHidden = function isHidden() {
    return true;
  };

  self.hasUri = function hasUri() {
    return false;
  };

  self.setHook = function setHook(newHook) {
    hook = newHook;
  };

  self.getStepDefinition = function getStepDefinition() {
    return hook;
  };

  return self;
}

module.exports = HookStep;
