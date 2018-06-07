const fs = require('fs');
const readline = require('readline');
const stream = require('stream');
const WORK_DIR = './work_dir/';

var generateStream = (inputStreamName, outputStreamName) => {
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
    var rl =  generateStream(file, WORK_DIR + file.substring(0,file.length-4) + '_output.txt' )
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
      resolve({parent,file});
    });
  })

}

var comparingFiles = (res) => {
  return new Promise((resolve,reject) => {
    try {
      for (var key in res.parent) {
        if(res.parent[key].length === 0) {
          console.log(`${key}, ` + 'NULL' + ` ,NULL`);
        }
        for(var i = 0; i < res.parent[key].length; i++) {
          if(compare(key, res.parent[key][i])){
            console.log(`${key}, ` + res.parent[key][i] + ` ,true`);
            fs.appendFileSync(WORK_DIR + res.file +'_diff.txt',`${key}, ` + res.parent[key][i] + `,true\n`);
          } else {
            console.log(`${key}, ` + res.parent[key][i] + ` ,false`);
            fs.appendFileSync(WORK_DIR + res.file + '_diff.txt', `${key},` + res.parent[key][i] + `,false\n`);
          }
        }
      }
      resolve('finished');
    } catch(e) {
      reject(JSON.stringify(e));
    }
  });

}

var format = (file1, file2) => {
  return {
    file1 : WORK_DIR + file1,
    file2 : WORK_DIR + file2
  }
}


var compare = (file1, file2) => {
  var formatted = format(file1, file2);
  var ret;
  if(!fs.existsSync(formatted.file1) || !fs.existsSync(formatted.file2)){
    return false;
  }

  var buf1 = fs.readFileSync(formatted.file1,{ encoding: 'hex' });
  var buf2 = fs.readFileSync(formatted.file2,{ encoding: 'hex' });
  return buf1 === buf2;
  return Buffer.compare(buf1, buf2);
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
