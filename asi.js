var fs = require('fs'),
  spawn = require('child_process').spawn;

var eslint = spawn('grunt', ['eslint']),
  lint = '';

eslint.stdout.on('data', function(chunk) {
  lint += chunk;
});

eslint.on('close', function() {
  doLint(lint);
});

function doLint(lint) {
  var file,
    filename;
  lint = lint.split("\n");
  var colAdjst = {},
    maxCols = {};

  for (var i in lint) {
    var line = lint[i],
      colNumber,
      lineNumber = line.match(/\s*(\d+):(\d+)/),
      fileLine;

    if (lineNumber) {
      colNumber = parseInt(lineNumber[2], 10);
      lineNumber = lineNumber[1] - 1;
      // If eslint isn't spitting out these things in order, we don't try to
      // fix later errors in the line - it gets really messy really fast.
      if (maxCols[lineNumber] > colNumber) {
        continue;
      }
      colAdjst[lineNumber] = colAdjst[lineNumber] || 0;
      maxCols[lineNumber] = colNumber;

      colNumber += colAdjst[lineNumber];
      fileLine = file[lineNumber];
    }

    if (line.match(/\.js/)) {
      if (file) {
        fs.writeFileSync(filename, file.join("\n"));
        console.log(filename);
      }
      filename = line;
      file = fs.readFileSync(line).toString().split("\n");
      colAdjst = {};
      maxCols = {};

    } else if (line.match(/Missing semicolon/)) {
      var add = ';';
      if (fileLine.length !== colNumber && fileLine[colNumber] !== ' ') {
        // This semicolon is not at the end of a line - we need to add a space
        // and include the rest of the line.
        add += ' ';
        colAdjst[lineNumber] += 1;
      }
      file[lineNumber] = fileLine.slice(0, colNumber) + add +
        fileLine.slice(colNumber, fileLine.length);
      colAdjst[lineNumber] += 1;

    } else if (line.match(/Unexpected space before function parentheses/)) {
      file[lineNumber] = fileLine.replace("function (", "function(");
      colAdjst[lineNumber] += 1;

    } else if (line.match(/Unexpected trailing comma/)) {
      file[lineNumber] = fileLine.substr(0, fileLine.length - 1);

    } else if (line.match(/Missing space before opening brace/)) {
      file[lineNumber] = fileLine.replace("){", ") {");
      colAdjst[lineNumber] += 1;

    } else if (line.match(/Missing space before value for key /)) {
      var key = line.match(/"(.*?)"/)[1];
      regex = new RegExp("('?" + key + "'?:)")
      file[lineNumber] = fileLine.replace(regex, "$1 ");
      colAdjst[lineNumber] += 1;

    } else if (line.match(/".+?" must be followed by whitespace/)) {
      var keyword = line.match(/"(.+?)"/)[1];
      file[lineNumber] = fileLine.replace(keyword, keyword + ' ');
      colAdjst[lineNumber] += 1;

    } else if (line.match(/Multiple spaces found before '='/)) {
      file[lineNumber] = fileLine.replace(/\s*=/, ' =');
      colAdjst[lineNumber] -= 1;

    } else if (line.match(/',' should be placed last/)) {
      file[lineNumber] = fileLine.replace(", ", "");
      colAdjst[lineNumber] -= 2;

      var prevLine = lineNumber;
      var inComment = false;
      while (true) {
        prevLine--;
        if (!file[prevLine] || file[prevLine].match(/^\s*?\/\//)) {
          continue;
        }
        if (file[prevLine].match(/\*\//)) {
          inComment = true;
          continue;
        }
        if (inComment) {
          if (file[prevLine].match(/^\s*\/\*/)) {
            inComment = false;
          }
          continue;
        }
        break;
      }
      file[prevLine] = file[prevLine] + ',';

    } else if (line.match(/Expected '===' and instead saw '=='/)) {
      file[lineNumber] = fileLine.replace("==", "===");
      colAdjst[lineNumber] += 1;

    } else if (line.match(/Missing radix parameter/)) {
      file[lineNumber] = fileLine.replace(/parseInt\((.*?)\)/, "parseInt($1, 10)");
      colAdjst[lineNumber] += 4;

    } else if (line.match(/A space is required after /)) {
      file[lineNumber] = fileLine.slice(0, colNumber + 1) + ' ' +
        fileLine.slice(colNumber + 1, fileLine.length);
      colAdjst[lineNumber] += 1;

    } else if (line.match(/quotes/)) {
      var string = fileLine.match(/"([^"\\]*(?:\\.[^"\\]*)*)"/)[1];
      string = string.replace(/\\"/g, '"').replace(/'/, "\\'");
      file[lineNumber] = fileLine.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/, "'" + string + "'");

    } else if (line.match(/Multiple spaces found before/)) {
      if (fileLine.match(/\t/)) {
        colAdjst[lineNumber] += fileLine.match(/\t/g).length - 1;
        fileLine.replace(/\t/g, '  ');
      } else {
        var spacesRemoved = fileLine.match(/(\S)\s{2,}/)[1].length - 1;
        file[lineNumber] = fileLine.replace(/(\S)\s{2,}/, '$1 ');
        colAdjst[lineNumber] += spacesRemoved;
      }

    } else if (line.match(/Expected space or tab after \/\/ in comment/)) {
      file[lineNumber] = fileLine.replace('//', '// ');
      colAdjst[lineNumber] += 1;

    } else if (line.match(/Expected \{ after 'if' condition/)) {
      var ws = fileLine.match(/^( *)/)[1].length;
      //  Only make an update if two lines down is lees or equally indented
      // ie, if it's really a single-line if-statement.
      if (file[lineNumber + 2].match(/^( *)/)[1].length <= ws) {
        file[lineNumber] += ' {';
        file[lineNumber + 1] +=  '\n' + Array(ws + 1).join(' ') + '}'
      }

    } else if (line.match(/Extra space after key/)) {
      var key = line.match(/"(.*?)"/)[1];
      regex = new RegExp("('?" + key + "'?) :")
      file[lineNumber] = fileLine.replace(regex, "$1:");
      colAdjst[lineNumber] -= 1;

    } else if (line.match(/Block must not be padded by blank lines/)) {
      if (!file[lineNumber + 1]) {
        file[lineNumber + 1] = null;
      } else if (!file[lineNumber - 1]) {
        file[lineNumber - 1] = null;
      }

    } else if (line.match(/Opening curly brace does not appear on the same line as controlling statement/)) {
      while (file[lineNumber][file[lineNumber].length - 1] !== ')') {
        lineNumber++;
      }
      file[lineNumber] += ' {';
      file[lineNumber + 1] = null;

    } else if (line.match(/Infix operators must be spaced/)) {
      fileLine = fileLine.replace(/([^!\+\-\*\/\!\=<>])([\+\-\*\/\!\=<>]+)/, "$1 $2");
      fileLine = fileLine.replace(/([!\+\-\*\/\!\=<>]+)([^\+\-\*\/\!\=<>])/, "$1 $2");
      file[lineNumber] = fileLine;

    } else if (line.match(/Closing curly brace does not appear on the same line as the subsequent block/)) {
      fileLine = fileLine.trim();
      file[lineNumber - 1] += ' ' + fileLine;
      file[lineNumber] = null;
    } else if (line.match(/Expected indentation of/)) {
      var ws = parseInt(line.match(/of ([0-9]+) characters/)[1], 10);
      fileLine = (new Array(ws + 1)).join(' ') + fileLine.trim();
      file[lineNumber] = fileLine;

    } else if (line.match(/Expected '\!==' and instead saw '\!='/)) {
      file[lineNumber] = fileLine.replace(/ \!= /, ' !== ');
    }

  }
  if (file) {
    file = file.filter(function(l) { return l !== null; }).join("\n");
    fs.writeFileSync(filename, file);
    console.log(filename);
  }
}
