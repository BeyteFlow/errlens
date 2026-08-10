const { parseStackTrace, parseFrame, sourceSnippet } = require('../lib/stack-parser')
const fs = require('fs')
const path = require('path')
const os = require('os')

let passed = 0
let failed = 0

function check(desc, cond) {
  if (cond) {
    passed++
    console.log(`PASS: ${desc}`)
  } else {
    failed++
    console.log(`FAIL: ${desc}`)
  }
}

const multiLineStack = `TypeError: Cannot read properties of undefined (reading 'foo')
    at readFoo (/home/user/app/src/index.js:12:5)
    at Module._compile (node:internal/modules/cjs/loader:1256:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1311:10)
    at Module.load (node:internal/modules/cjs/loader:1118:16)
    at Function.Module._load (node:internal/modules/cjs/loader:988:28)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:134:12)
    at node:internal/main/run_main_module:28:49`

const frames = parseStackTrace(multiLineStack)
check('parses all frames', frames.length === 7)
check('frame 0 function is readFoo', frames[0].function === 'readFoo')
check('frame 0 file is index.js', frames[0].file.endsWith('src/index.js'))
check('frame 0 line is 12', frames[0].line === 12)
check('frame 0 column is 5', frames[0].column === 5)
check('frame 1 is a node:internal frame', frames[1].file === 'node:internal/modules/cjs/loader')
check('frame 6 has no function', frames[6].function === null)

const bareFrame = '    at /home/user/app/src/index.js:40:3'
const bare = parseStackTrace(bareFrame)
check('parses frame without function name', bare.length === 1)
check('bare frame function is null', bare[0].function === null)
check('bare frame line is 40', bare[0].line === 40)

const asyncFrame = '    at async processBatch (/home/user/app/src/worker.js:9:14)'
const asyncFrames = parseStackTrace(asyncFrame)
check('parses async frame', asyncFrames.length === 1)
check('async frame function is processBatch', asyncFrames[0].function === 'processBatch')
check('async frame line is 9', asyncFrames[0].line === 9)

const urlStack = `Error: boom
    at file:///home/user/app/dist/main.js:3:7`
const urlFrames = parseStackTrace(urlStack)
check('parses file:// frame', urlFrames.length === 1)
check('url frame file is file://path', urlFrames[0].file === 'file:///home/user/app/dist/main.js')

const empty = parseStackTrace('')
check('empty input returns []', Array.isArray(empty) && empty.length === 0)

const noStack = parseStackTrace('TypeError: nothing here')
check('message-only input returns []', noStack.length === 0)

check('parseFrame returns null for garbage', parseFrame('not a frame') === null)

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'errlens-stack-'))
const tmpFile = path.join(tmpDir, 'sample.js')
const tmpContent = [
  'const data = getData();',
  'const user = data.user;',
  'const name = user.name;',
  'console.log(name);',
  'module.exports = { name };',
].join('\n')
fs.writeFileSync(tmpFile, tmpContent, 'utf8')

const snippet = sourceSnippet(tmpFile, 3, 2)
check('snippet is created', snippet !== null)
check('snippet start is 1', snippet.start === 1)
check('snippet end is 5', snippet.end === 5)
check('snippet has 5 lines', snippet.lines.length === 5)
check('error line is flagged', snippet.lines[2].isErrorLine === true)
check('snippet marks correct line number', snippet.lines[2].number === 3)

const snippetTop = sourceSnippet(tmpFile, 1, 2)
check('snippet clamps start at 1', snippetTop.start === 1)
check('snippet top has 3 lines', snippetTop.lines.length === 3)

const snippetBottom = sourceSnippet(tmpFile, 5, 2)
check('snippet clamps end', snippetBottom.end === 5)
check('snippet bottom has 3 lines', snippetBottom.lines.length === 3)

check('missing file returns null', sourceSnippet(path.join(tmpDir, 'nope.js'), 1, 2) === null)
check('internal frame returns null', sourceSnippet('node:internal/modules/cjs/loader', 1, 2) === null)
check('negative line returns null', sourceSnippet(tmpFile, 0, 2) === null)

fs.rmSync(tmpDir, { recursive: true, force: true })

console.log(`\n--- Stack Parser ---`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)

if (failed > 0) process.exit(1)