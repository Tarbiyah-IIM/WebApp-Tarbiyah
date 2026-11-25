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

function terminateChild(child) {
  if (!child || child.killed) return;
  if (process.platform === 'win32' && child.pid) {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }
  child.kill('SIGTERM');
}

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    terminateChild(child);
  }
  process.exit(0);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
