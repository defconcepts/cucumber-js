function PrettyFormatter(options) {
  var Cucumber         = require('../../cucumber');
  var path             = require('path');
  var Table = require('cli-table');

  var colors           = Cucumber.Util.Colors(options.useColors);
  var self             = Cucumber.Listener.Formatter(options);
  var summaryFormatter = Cucumber.Listener.SummaryFormatter({
    snippets: options.snippets,
    snippetSyntax: options.snippetSyntax,
    hideFailedStepResults: true,
    useColors: options.useColors
  });
  var feature;
  var uriCommentIndex = 0;

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    summaryFormatter.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    feature = event.getPayloadItem('feature');
    var source = '';

    var tagsSource = self.formatTags(feature.tags);
    if (tagsSource) {
      source = tagsSource + '\n';
    }

    var identifier = feature.keyword + ': ' + feature.name;
    source += identifier;

    var description = feature.description;
    if (description) {
      source += '\n\n' + self.indent(description, 1);
    }

    source += '\n\n';

    self.log(source);
    callback();
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    var source = '';

    var tagsSource = self.formatTags(scenario.tags);
    if (tagsSource) {
      source = tagsSource + '\n';
    }

    var identifier = scenario.keyword + ': ' + scenario.name;
    if (options.showSource) {
      var lineLengths = [identifier.length].concat(scenario.steps.map(function (step) {
        return step.keyword.length + step.text.length;
      }));
      uriCommentIndex = Math.max.apply(null, lineLengths) + 1;

      identifier = self._pad(identifier, uriCommentIndex + 2) +
                   colors.comment('# ' + path.relative(process.cwd(), feature.uri) + ':' + scenario.locations[0].line);
    }
    source += identifier;

    self.logIndented(source, 1);
    self.log('\n');
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    self.log('\n');
    callback();
  };

  self.applyColor = function applyColor (stepResult, source) {
    var status = stepResult.getStatus();
    return colors[status](source);
  };

  self.handleStepResultEvent = function handleStepResultEvent(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    if (step.locations || stepResult.getStatus() === Cucumber.Status.FAILED) {
      self.logStepResult(step, stepResult);
    }
    callback();
  };

  self.formatTags = function formatTags(tags) {
    if (tags.length === 0) {
      return '';
    }

    var tagNames = tags.map(function (tag) {
      return tag.name;
    });

    return colors.tag(tagNames.join(' '));
  };

  self.logStepResult = function logStepResult(step, stepResult) {
    var identifier = step.keyword + (step.text || '');

    if (options.showSource && step.locations) {
      identifier = self._pad(identifier, uriCommentIndex);
      identifier += colors.comment('# ' + path.relative(process.cwd(), feature.uri) + ':' + step.locations[0].line);
    }

    identifier = self.applyColor(stepResult, identifier);
    self.logIndented(identifier, 2);
    self.log('\n');

    if (step.arguments) {
      step.arguments.forEach(function (argument) {
        if (argument.content) {
          var docStringSource = self.formatDocString(stepResult, argument.content);
          self.logIndented(docStringSource, 3);
        }
        else if (argument.rows) {
          var dataTableSource = self.formatDataTable(stepResult, argument.rows);
          self.logIndented(dataTableSource, 3);
        }
      });
    }

    if (stepResult.getStatus() === Cucumber.Status.FAILED) {
      var failure            = stepResult.getFailureException();
      var failureDescription = failure.stack || failure;
      self.logIndented(failureDescription, 3);
      self.log('\n');
    }
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var summaryLogs = summaryFormatter.getLogs();
    self.log(summaryLogs);
    self.finish(callback);
  };

  self.formatDataTable = function formatDataTable(stepResult, rows) {
    var table = new Table({
      chars: {
        'bottom': '', 'bottom-left': '', 'bottom-mid': '', 'bottom-right': '',
        'left-mid': '', 'mid': '', 'mid-mid': '', 'right-mid': '',
        'top': '' , 'top-left': '', 'top-mid': '', 'top-right': ''
      }
    });
    table.push.apply(table, rows.map(function (row){
      return row.cells.map(function (cell) {
        return cell.value;
      });
    }));
    return table.toString();
  };

  self.formatDocString = function formatDocString(stepResult, docString) {
    var contents = '"""\n' + docString + '\n"""';
    return self.applyColor(stepResult, contents) + '\n';
  };

  self.logIndented = function logIndented(text, level) {
    var indented = self.indent(text, level);
    self.log(indented);
  };

  self.indent = function indent(text, level) {
    var indented;
    text.split('\n').forEach(function (line) {
      var prefix = new Array(level + 1).join('  ');
      line = (prefix + line).replace(/\s+$/, '');
      indented = (typeof(indented) === 'undefined' ? line : indented + '\n' + line);
    });
    return indented;
  };

  self._pad = function _pad(text, width) {
    var padded = '' + text;
    while (padded.length < width) {
      padded += ' ';
    }
    return padded;
  };

  return self;
}

module.exports = PrettyFormatter;
