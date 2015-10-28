function Feature(data) {
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
      return data.location.line;
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      Cucumber.Util.asyncForEach(data.pickles, function (pickle, iterate) {
        var scenario = Cucumber.Ast.Scenario(pickle);
        visitor.visitScenario(scenario, iterate);
      }, callback);
    }
  };
  return self;
}

module.exports = Feature;
