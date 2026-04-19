const { spawn } = require('child_process')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const children = []
let shuttingDown = false

const processes = [
  {
    name: 'server',
    cwd: path.join(rootDir, 'server'),
    command: 'npm run dev',
  },
  {
    name: 'client',
    cwd: path.join(rootDir, 'ai-safehouse', 'client'),
    command: 'npm run dev',
  },
]

function writePrefixed(stream, name, chunk) {
  const text = chunk.toString().replace(/\r\n/g, '\n')
  const lines = text.split('\n')

  for (const line of lines) {
    if (!line.trim()) continue
    stream.write(`[${name}] ${line}\n`)
  }
}

function stopChildren(exitCode = 0) {
  if (shuttingDown) return
  shuttingDown = true

  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill('SIGTERM')
      } catch (error) {
        process.stderr.write(`[runner] Failed to stop ${child.name}: ${error.message}\n`)
      }
    }
  }

  setTimeout(() => process.exit(exitCode), 800)
}

function startProcess(config) {
  const child = spawn(config.command, {
    cwd: config.cwd,
    env: process.env,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.name = config.name
  children.push(child)

  child.stdout.on('data', chunk => writePrefixed(process.stdout, config.name, chunk))
  child.stderr.on('data', chunk => writePrefixed(process.stderr, config.name, chunk))

  child.on('exit', code => {
    if (shuttingDown) return

    const exitCode = typeof code === 'number' ? code : 1
    process.stderr.write(`[runner] ${config.name} stopped with exit code ${exitCode}. Shutting down the rest.\n`)
    stopChildren(exitCode)
  })
}

process.on('SIGINT', () => stopChildren(0))
process.on('SIGTERM', () => stopChildren(0))

process.stdout.write('[runner] Starting AI Safehouse dev stack...\n')
process.stdout.write('[runner] Client: http://localhost:5173 | Server: http://localhost:5000\n')

for (const processConfig of processes) {
  startProcess(processConfig)
}
