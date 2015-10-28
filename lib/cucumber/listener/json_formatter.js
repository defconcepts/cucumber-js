/* jshint -W106 */
function JsonFormatter(options) {
  var Cucumber = require('../../cucumber');
  var base64 = require('base-64');

  var self = Cucumber.Listener.Formatter(options);

  var features = [];
  var currentFeature;
  var currentScenario;

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    var feature      = event.getPayloadItem('feature');
    currentFeature = {
      description: feature.getDescription(),
      elements: [],
      id: feature.getName().replace(/ /g, '-').toLowerCase(),
      keyword: feature.getKeyword(),
      line: feature.getLine(),
      name: feature.getName(),
      tags: feature.getTags()
    };
    features.push(currentFeature);
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    currentScenario = {
      description: scenario.getDescription(),
      id: currentFeature.id + ';' + scenario.getName().replace(/ /g, '-').toLowerCase(),
      keyword: 'Scenario',
      line: scenario.getLine(),
      name: scenario.getName(),
      tags: scenario.getTags(),
      type: 'scenario'
    };
    currentFeature.elements.push(scenario);
    callback();
  };

  self.handleStepResultEvent = function handleStepResultEvent(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    var status = stepResult.getStatus();

    var currentStep = {
      arguments: step.getArguments(),
      keyword: step.getKeyword(),
      line: step.getLine(),
      name: step.getName(),
      result: {
        status: status
      }
    };

    if (step.isHidden()) {
      currentStep.hidden = true;
    }

    if (status === Cucumber.Status.PASSED || status === Cucumber.Status.FAILED) {
      if (stepResult.hasAttachments()) {
        currentStep.embeddings = stepResult.getAttachments().map(function (attachment) {
          return {
            data: base64.encode(attachment.getData()),
            mime_type: getMimeType(),
          }
        });
      }
      currentStep.result.duration = stepResult.getDuration();
    }

    if (status === Cucumber.Status.FAILED) {
      var failureMessage = stepResult.getFailureException();
      if (failureMessage) {
        currentStep.result.error_message = (failureMessage.stack || failureMessage);
      }
    }

    currentScenario.steps.push(currentStep);
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    self.log(JSON.stringify(features, null, 2))
    self.finish(callback);
  };

  return self;
}

module.exports = JsonFormatter;
