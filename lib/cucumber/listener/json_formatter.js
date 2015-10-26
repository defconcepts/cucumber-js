/* jshint -W106 */
function JsonFormatter(options) {
  var Cucumber             = require('../../cucumber');
  var self                 = Cucumber.Listener.Formatter(options);
  var features = [];
  var currentFeature;
  var currentScenario;

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    var feature = event.getPayloadItem('feature');
    currentFeature = {
      description: feature.description,
      elements: [],
      id: feature.name.toLowerCase().replace(/ /g, '-'),
      keyword: feature.keyword,
      line: feature.location.line,
      name: feature.name,
      tags: feature.tags,
      uri: feature.uri
    };
    features.push(currentFeature);
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    currentScenario = {
      description: scenario.description,
      id: currentFeature.id + ';' + scenario.name.toLowerCase().replace(/ /g, '-'),
      keyword: scenario.keyword,
      line: scenario.locations[0].line,
      name: scenario.name,
      steps: []
    }
    currentFeature.elements.push(currentScenario);
    callback();
  };

  self.handleStepResultEvent = function handleStepResultEvent(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    currentScenario.steps.push(step);
    var status = stepResult.getStatus();

    var result = {status: status};

    if (status === Cucumber.Status.PASSED || status === Cucumber.Status.FAILED) {
      if (stepResult.hasAttachments()) {
        result.embeddings = stepResult.getAttachments().map(function (attachment) {
          return {
            data: attachment.getData(),
            mime_type: attachment.getMimeType()
          };
        });
      }
      result.duration = stepResult.getDuration();
    }

    if (status === Cucumber.Status.FAILED) {
      var failureMessage = stepResult.getFailureException();
      if (failureMessage) {
        result.error_message = (failureMessage.stack || failureMessage);
      }
    }
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    self.log(JSON.stringify(features, null, 2));
    self.finish(callback);
  };

  return self;
}

module.exports = JsonFormatter;
