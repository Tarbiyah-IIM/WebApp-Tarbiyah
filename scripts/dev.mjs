import { spawn } from 'node:child_process';

const children = [];

function launch(name, cmd, args) {
  const proc = spawn(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  proc.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });
  children.push(proc);
}

launch('server', 'npm', ['run', 'dev:server']);
launch('client', 'npm', ['run', 'dev']);

function shutdown() {
  for (const child of children) {
    child.kill('SIGTERM');
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
