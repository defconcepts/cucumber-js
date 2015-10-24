function PrettyFormatter(options) {
  var Cucumber         = require('../../cucumber');
  var path             = require('path');

  var colors           = Cucumber.Util.Colors(options.useColors);
  var self             = Cucumber.Listener.Formatter(options);
  var summaryFormatter = Cucumber.Listener.SummaryFormatter({
    snippets: options.snippets,
    snippetSyntax: options.snippetSyntax,
    hideFailedStepResults: true,
    useColors: options.useColors
  });
  var lines = []
  var lastLine = 0;

  var applyColor = function applyColor (stepResult, source) {
    var status = stepResult.getStatus();
    return colors[status](source);
  };

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    summaryFormatter.hear(event, function () {
      parentHear(event, callback);
    });
  };

  var printToLine = function (printToLine) {

  }

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    var feature = event.getPayloadItem('feature');
    lines = feature.source.split('\n');
    self.log(featureLines[feature.location.line - 1] + '\n');
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    self.log(featureLines[scenario.locations[0].line - 1] + '\n');
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    self.log('\n');
    callback();
  };

  self.handleStepResultEvent = function handleStepResultEvent(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    if (step.locations) {
      var source = featureLines[step.locations[0].line - 1];
      self.log(applyColor(stepResult, source) + '\n');
      if (step.arguments.length > 0) {
        step.arguments.forEach(function (stepArgument) {
          if (stepArgument.content) {
            self.log(indent(formatDocString(stepResult, stepArgument.content), 3))
          }
        });
      }
      if (stepResult.getStatus() === Cucumber.Status.FAILED) {
        var failure = stepResult.getFailureException();
        var failureDescription = failure.stack || failure;
        self.log(indent(failureDescription, 3) + '\n');
      }
    }
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var summaryLogs = summaryFormatter.getLogs();
    self.log(summaryLogs);
    self.finish(callback);
  };

  return self;
}

module.exports = PrettyFormatter;
