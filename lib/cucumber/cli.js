function Cli(argv) {
  var Cucumber = require('../cucumber');
  var Command = require('commander').Command;
  var path = require('path');

  function collect(val, memo) {
    memo.push(val);
    return memo;
  }

  function getConfiguration() {
    var program = getProgram();
    program.parse(argv);
    var profileArgs = Cucumber.Cli.ProfilesLoader.getArgs(program.profile);
    argv.splice.apply(argv, [2, 0].concat(profileArgs));
    program.parse(argv);
    var configuration = Cucumber.Cli.Configuration(program.opts(), program.args);
    return configuration;
  }

  function getProgram () {
    var program = new Command(path.basename(argv[1]));

    program
      .usage('[options] [<DIR|FILE[:LINE]>...]')
      .version(Cucumber.VERSION, '-v, --version')
      .option('-b, --backtrace', 'show full backtrace for errors')
      .option('--compiler <EXTENSION:MODULE>', 'require files with the given EXTENSION after requiring MODULE (repeatable)', collect, [])
      .option('-d, --dry-run', 'invoke formatters without executing steps')
      .option('--fail-fast', 'abort the run on first failure')
      .option('-f, --format <TYPE[:PATH]>', 'specify the output format, optionally supply PATH to redirect formatter output (repeatable)', collect, ['pretty'])
      .option('--no-colors', 'disable colors in formatter output')
      .option('--no-snippets', 'hide step definition snippets for pending steps')
      .option('--no-source', 'hide source uris')
      .option('-p, --profile <NAME>', 'specify the profile to use (repeatable)', collect, [])
      .option('-r, --require <FILE|DIR>', 'require files before executing features (repeatable)', collect, [])
      .option('--snippet-syntax <FILE>', 'specify a custom snippet syntax')
      .option('-S, --strict', 'fail if there are any undefined or pending steps')
      .option('-t, --tags <EXPRESSION>', 'only execute the features or scenarios with tags matching the expression (repeatable)', collect, []);

    program.on('--help', function(){
      console.log('  For more details please visit https://github.com/cucumber/cucumber-js#cli\n');
    });

    return program;
  }

  var self = {
    run: function run(callback) {
      var configuration = getConfiguration();
      var runtime    = Cucumber.Runtime(configuration);
      var formatters = configuration.getFormatters();
      formatters.forEach(function (formatter) {
        runtime.attachListener(formatter);
      });
      runtime.start(callback);
    }
  };
  return self;
}

Cli.Configuration = require('./cli/configuration');
Cli.FeaturePathExpander = require('./cli/feature_path_expander');
Cli.FeatureSourceLoader = require('./cli/feature_source_loader');
Cli.PathExpander = require('./cli/path_expander');
Cli.ProfilesLoader = require('./cli/profiles_loader');
Cli.SupportCodeLoader = require('./cli/support_code_loader');
Cli.SupportCodePathExpander = require('./cli/support_code_path_expander');

module.exports = Cli;
