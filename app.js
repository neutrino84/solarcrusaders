
var Application = require('./src/Application'),
    app = global.app = new Application(),
    debugArgIdx, debugArgs = ['--inspect', '--inspect-brk'];

app.init();
app.start();

// disable debug
// server on children
for(var a in debugArgs) {
  debugArgIdx = process.execArgv.indexOf(debugArgs[a]);
  if(debugArgIdx !== -1) {
    process.execArgv.splice(debugArgIdx, 1);
  }
}
