/************************************************************
Author: Avery Wong

************************************************************/

const yargs = require('yargs');
const comparer = require('./comparer/comparer.js');

const argv = yargs.options({
  f : {
    demand : true,
    alias : 'file',
    describe : 'read list of files to compare',
    string : true
  }
})
.help()
.alias('help','h')
.argv;


comparer.main(argv.file);
