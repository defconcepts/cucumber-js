function Parser(featureSources, astFilter) {
  var Gherkin      = require('gherkin');
  var Cucumber     = require('../cucumber');

  var parser = new Gherkin.Parser();
  var compiler = new Gherkin.Compiler();

  var self = {
    parse: function parse() {
      return featureSources.map(function (featureSource) {
        var uri    = featureSource[Parser.FEATURE_NAME_SOURCE_PAIR_URI_INDEX];
        var source = featureSource[Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX];

        var feature;
        try {
          feature = parser.parse(source.toString());
          feature.pickles = compiler.compile(feature, uri);
        } catch(e) {
          e.message += '\npath: ' + uri;
          throw e;
        }
        return feature;
      });
    }
  };
  return self;
}

Parser.FEATURE_NAME_SOURCE_PAIR_URI_INDEX = 0;
Parser.FEATURE_NAME_SOURCE_PAIR_SOURCE_INDEX = 1;

module.exports = Parser;
