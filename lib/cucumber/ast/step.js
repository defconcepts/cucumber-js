function Step(data) {
  var Cucumber = require('../../cucumber');
  var previousStep;

  var self = {
    setPreviousStep: function setPreviousStep(newPreviousStep) {
      previousStep = newPreviousStep;
    },

    isHidden: function isHidden() {
      return false;
    },

    isOutlineStep: function isOutlineStep() {
      return false;
    },

    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    hasUri: function hasUri() {
      return true;
    },

    getUri: function getUri() {
      return uri;
    },

    getLine: function getLine() {
      return line;
    },

    getPreviousStep: function getPreviousStep() {
      return previousStep;
    },

    hasPreviousStep: function hasPreviousStep() {
      return !!previousStep;
    },

    getAttachment: function getAttachment() {
      var attachment;
      if (self.hasDocString()) {
        attachment = self.getDocString();
      } else if (self.hasDataTable()) {
        attachment = self.getDataTable();
      }
      return attachment;
    },

    getDocString: function getDocString() {
      var result;
      step.arguments.forEach(function (argument) {
        if (argument.content) {
          result = argument.content;
        }
      });
      return result;
    },

    getDataTable: function getDataTable() {
      var result;
      step.arguments.forEach(function (argument) {
        if (argument.rows) {
          result = Cucumber.DataTable(argument.rows);
        }
      });
      return result;
    },

    hasAttachment: function hasAttachment() {
      return self.hasDocString() || self.hasDataTable();
    },

    hasDocString: function hasDocString() {
      var result = false;
      step.arguments.forEach(function (argument) {
        result ||= !!argument.content;
      });
      return result;
    },

    hasDataTable: function hasDataTable() {
      var result = false;
      step.arguments.forEach(function (argument) {
        result ||= !!argument.rows;
      });
      return result;
    },

    isOutcomeStep: function isOutcomeStep() {
      return self.hasOutcomeStepKeyword() || self.isRepeatingOutcomeStep();
    },

    isEventStep: function isEventStep() {
      return self.hasEventStepKeyword() || self.isRepeatingEventStep();
    },

    hasOutcomeStepKeyword: function hasOutcomeStepKeyword() {
      return keyword === Step.OUTCOME_STEP_KEYWORD;
    },

    hasEventStepKeyword: function hasEventStepKeyword() {
      return keyword === Step.EVENT_STEP_KEYWORD;
    },

    isRepeatingOutcomeStep: function isRepeatingOutcomeStep() {
      return self.hasRepeatStepKeyword() && self.isPrecededByOutcomeStep();
    },

    isRepeatingEventStep: function isRepeatingEventStep() {
      return self.hasRepeatStepKeyword() && self.isPrecededByEventStep();
    },

    hasRepeatStepKeyword: function hasRepeatStepKeyword() {
      return keyword === Step.AND_STEP_KEYWORD || keyword === Step.BUT_STEP_KEYWORD || keyword === Step.STAR_STEP_KEYWORD;
    },

    isPrecededByOutcomeStep: function isPrecededByOutcomeStep() {
      var result = false;

      if (self.hasPreviousStep()) {
        var previousStep = self.getPreviousStep();
        result           = previousStep.isOutcomeStep();
      }
      return result;
    },

    isPrecededByEventStep: function isPrecededByEventStep() {
      var result = false;

      if (self.hasPreviousStep()) {
        var previousStep          = self.getPreviousStep();
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
      return visitor.lookupStepDefinitionByName(name);
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
