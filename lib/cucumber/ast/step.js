function Step(data) {
  var Cucumber = require('../../cucumber');
  var previousStep;

  var stepArguments = [];

  if (data.arguments) {
    stepArguments = data.arguments.map(function (argument) {
      if (argument.content) {
        return argument.content;
      } else if (argument.rows) {
        return Cucumber.Ast.DataTable(argument.rows);
      } else {
        throw new Error("Unknown argument type: " + JSON.stringify(argument));
      }
    });
  }

  var self = {
    setPreviousStep: function setPreviousStep(newPreviousStep) {
      previousStep = newPreviousStep;
    },

    isHidden: function isHidden() {
      return false;
    },

    getKeyword: function getKeyword() {
      return data.keyword;
    },

    getName: function getName() {
      return data.text;
    },

    hasUri: function hasUri() {
      return true;
    },

    getLine: function getLine() {
      return data.locations[0].line;
    },

    getPreviousStep: function getPreviousStep() {
      return previousStep;
    },

    hasPreviousStep: function hasPreviousStep() {
      return !!previousStep;
    },

    getArguments: function getArguments() {
      return stepArguments;
    },

    isOutcomeStep: function isOutcomeStep() {
      return self.hasOutcomeStepKeyword() || self.isRepeatingOutcomeStep();
    },

    isEventStep: function isEventStep() {
      return self.hasEventStepKeyword() || self.isRepeatingEventStep();
    },

    hasOutcomeStepKeyword: function hasOutcomeStepKeyword() {
      return self.getKeyword() === Step.OUTCOME_STEP_KEYWORD;
    },

    hasEventStepKeyword: function hasEventStepKeyword() {
      return self.getKeyword() === Step.EVENT_STEP_KEYWORD;
    },

    isRepeatingOutcomeStep: function isRepeatingOutcomeStep() {
      return self.hasRepeatStepKeyword() && self.isPrecededByOutcomeStep();
    },

    isRepeatingEventStep: function isRepeatingEventStep() {
      return self.hasRepeatStepKeyword() && self.isPrecededByEventStep();
    },

    hasRepeatStepKeyword: function hasRepeatStepKeyword() {
      return self.getKeyword() === Step.AND_STEP_KEYWORD || self.getKeyword() === Step.BUT_STEP_KEYWORD || self.getKeyword() === Step.STAR_STEP_KEYWORD;
    },

    isPrecededByOutcomeStep: function isPrecededByOutcomeStep() {
      var result = false;

      if (self.hasPreviousStep()) {
        var previousStep = self.getPreviousStep();
        result = previousStep.isOutcomeStep();
      }
      return result;
    },

    isPrecededByEventStep: function isPrecededByEventStep() {
      var result = false;

      if (self.hasPreviousStep()) {
        var previousStep = self.getPreviousStep();
        result = previousStep.isEventStep();
      }
      return result;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      self.execute(visitor, function (stepResult) {
        visitor.visitStepResult(stepResult, callback);
      });
    },

    getStepDefinition: function getStepDefinition(visitor) {
      return visitor.lookupStepDefinitionByName(self.getName());
    },

    execute: function execute(visitor, callback) {
      var stepDefinition = self.getStepDefinition(visitor);
      var world          = visitor.getWorld();
      var scenario       = visitor.getScenario();
      var domain         = visitor.getDomain();
      var defaultTimeout = visitor.getDefaultTimeout();
      stepDefinition.invoke(self, world, scenario, domain, defaultTimeout, callback);
    }
  };
  return self;
}

Step.EVENT_STEP_KEYWORD   = 'When ';
Step.OUTCOME_STEP_KEYWORD = 'Then ';
Step.AND_STEP_KEYWORD     = 'And ';
Step.BUT_STEP_KEYWORD     = 'But ';
Step.STAR_STEP_KEYWORD    = '* ';

module.exports = Step;
