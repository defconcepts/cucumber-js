function Scenario(data) {
  var Cucumber = require('../../cucumber');

  var previousStep;
  var steps = data.steps.map(function(stepData) {
    var step = Cucumber.Ast.Step(stepData);
    step.setPreviousStep(previousStep);
    return step;
  });

  var self = {
    getKeyword: function getKeyword() {
      return data.keyword;
    },

    getName: function getName() {
      return data.name;
    },

    getDescription: function getDescription() {
      return data.description;
    },

    getLine: function getLine() {
      return data.locations[0].line;
    },

    getTags: function getTags() {
      return data.tags;
    },

    getSteps: function getSteps() {
      return steps;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      Cucumber.Util.asyncForEach(steps, visitor.visitStep, callback);
    }
  };
  return self;
}

module.exports = Scenario;
