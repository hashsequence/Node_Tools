/************************************************************
Author: Avery Wong

************************************************************/

const fs = require('fs');
const readline = require('readline');
const stream = require('stream');
const crypto = require('crypto');
const WORK_DIR = './work_dir/';

var generateReadStream = (inputStreamName, outputStreamName) => {
  var instream = fs.createReadStream(inputStreamName);
  var outstream = fs.createWriteStream(outputStreamName);
  outstream.readable = true;
  outstream.writeable = true;

  var rl = readline.createInterface({
    input : instream,
    output : process.stdout,
    terminal: false
  });

  return rl;
}

var generateList = (file) => {
  return new Promise((resolve, reject) => {
    var rl =  generateReadStream(WORK_DIR + file, WORK_DIR + file.substring(0,file.length-4) + '_output.txt' )
    console.log("reading file line by line");

    var parent =  new Map();
    var curr_parent;
    rl.on('line', (line) => {
      try{
        if(line[0] === '+') {
          curr_parent = line.substring(1,line.length);
          parent[curr_parent] = [];
        } else if (line[0] === '-' && curr_parent !== undefined) {
            parent[curr_parent].push(line.substring(1,line.length));
        } else {
          throw new Error('file format is incorrect');
        }
      } catch(e) {
        reject('Error: file format is incorrect');
      }
    }).on('close', () =>
    {
      resolve(parent);
    });
  })

}

var comparingFiles = (parent) => {
  return new Promise((resolve,reject) => {
    try {
      for (var key in parent) {
        for(var i = 0; i < parent[key].length; i++) {
          if(compare(key, parent[key][i])){
            fs.appendFileSync(WORK_DIR + 'diff.csv', `${key},${parent[key]},true`)
          } else {
            fs.appendFileSync(WORK_DIR + 'diff.csv', `${key},${parent[key]},false`)
          }
        }
    } catch(e) {
      reject('Error: something wrong in comparing files');
    }
  }
  })

}

var compare(file1, file2) {
  var buf1 = fs.readFileSync(file1);
  var buf2 = fs.readFileSync(file2);
  const buf1Hash = crypto.createHash('sha256').update(buf1).digest();
  const buf2Hash = crypto.createHash('sha256').update(buf2).digest();
  return buf1Hash.should.eql(buf2Hash);
}
var main = (file) => {
  generateList(file).then((res) => {
    return comparingFiles(res);
  },
  (errorMsg) => {
    reject(errorMsg);
  }).then((res) => {
      console.log(res);
    },
    (errorMsg) => {
      console.log(errorMsg);
    });
}
module.exports = {
  main
}
