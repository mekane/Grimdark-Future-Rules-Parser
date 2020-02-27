#! /usr/bin/node

const parser = require('./src/parse');

const args = process.argv.slice(2);
const textToParse = args.join(' ');

//console.log(`Parse: "${textToParse}"\n`);

try {
    const unit = parser.parseUnit(textToParse);
    console.dir(unit);
}
catch (err) {
    console.error('Error: ' + err.message);

    /**/
    console.log(err)
}
