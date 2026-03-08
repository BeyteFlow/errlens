const database = require('../lib/database');
const Fuse = require('fuse.js');
const { Command } = require('commander');

const fuse = new Fuse(database, { keys: ['pattern'] });

const program = new Command();

program
  .name('errlens')
  .description('Translate errors to human-readable insights')
  .version('1.0.9');

program
  .command('explain')
  .argument('<message>', 'error message to explain')
  .option('--json', 'output in json format')
  .action((message, options) => {
    const results = fuse.search(message);
    const result = results.length > 0 ? results[0].item : null;

    if (options.json) {
      console.log(JSON.stringify(result || { message: "No explanation found" }));
    } else {
      if (result) {
        console.log(`Explanation: ${result.explanation}\nCause: ${result.cause}\nFix: ${result.fix}`);
      } else {
        console.log("No specific explanation found for this error.");
      }
    }
  });

program.parse(process.argv);