function Parser(featureSources, runtimeFilter) {
  var Gherkin      = require('gherkin');
  var Cucumber     = require('../cucumber');

  var parser = new Gherkin.Parser();
  var compiler = new Gherkin.Compiler();

  var self = {
    parse: function parse() {
      return featureSources.map(function (featureSource) {
        var uri    = featureSource[Parser.FEATURE_NAME_SOURCE_PAIR_URI_INDEX];
        var source = featureSource[Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX];

        var featureData, pickles;
        try {
          featureData = parser.parse(source);
          var pickles = compiler.compile(featureData, uri);
        } catch(e) {
          e.message += '\npath: ' + uri;
          throw e;
        }

        featureData.pickles = pickles.filter(function (pickle) {
          return runtimeFilter.isElementEnrolled(pickle);
        });
        featureData.uri = uri;

        return Cucumber.Ast.Feature(featureData)
      });
    }
  };
  return self;
}

Parser.FEATURE_NAME_SOURCE_PAIR_URI_INDEX = 0;
Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX = 1;

module.exports = Parser;
