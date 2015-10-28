function Scenario(data) {
  var Cucumber = require('../../cucumber');

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

    getUri: function getUri() {
      return data.uri;
    },

    getLine: function getLine() {
      return data.locations[0].line;
    },

    getTags: function getTags() {
      return data.tags;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      var previousStep;
      Cucumber.Util.asyncForEach(data.steps, function (stepData, iterate) {
        var step = Cucumber.Ast.Step(stepData);
        step.setPreviousStep(previousStep);
        previousStep = step;
        visitor.visitStep(step, iterate);
      }, callback);
    }
  };
  return self;
}

module.exports = Scenario;
