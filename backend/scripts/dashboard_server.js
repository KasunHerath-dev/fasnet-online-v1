const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());

// Serve static files if we want to host the html from here too, 
// but user asked for html in root. We'll allow CORS so root html works.

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow the local html file to connect
        methods: ["GET", "POST"]
    }
});

const PROCESSES = {
    backend: { process: null, status: 'stopped', logs: [] },
    frontend: { process: null, status: 'stopped', logs: [] }
};

// Helper: Run Command
const runCommand = (key, command, args, cwd) => {
    if (PROCESSES[key].process) return; // Already running

    PROCESSES[key].status = 'starting';
    io.emit('status', { key, status: 'starting' });

    // Using 'npm.cmd' on Windows is essential
    const shell = process.platform === 'win32' ? true : false;
    // Actually, spawning npm directly on windows often requires npm.cmd or shell:true

    console.log(`Starting ${key}...`);

    const child = spawn(command, args, {
        cwd: cwd,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe']
    });

    PROCESSES[key].process = child;
    PROCESSES[key].status = 'running';
    io.emit('status', { key, status: 'running' });

    PROCESSES[key].logs.push(`--- ${key.toUpperCase()} STARTED ---`);
    io.emit('log', { key, data: `--- ${key.toUpperCase()} STARTED ---` });

    child.stdout.on('data', (data) => {
        const str = data.toString();
        // console.log(`[${key}] ${str}`);
        PROCESSES[key].logs.push(str);
        // Keep log size managed?
        if (PROCESSES[key].logs.length > 500) PROCESSES[key].logs.shift();
        io.emit('log', { key, data: str });
    });

    child.stderr.on('data', (data) => {
        const str = data.toString();
        // console.error(`[${key}] ${str}`);
        PROCESSES[key].logs.push(str);
        if (PROCESSES[key].logs.length > 500) PROCESSES[key].logs.shift();
        io.emit('log', { key, data: str });
    });

    child.on('close', (code) => {
        console.log(`${key} exited with code ${code}`);
        PROCESSES[key].process = null;
        PROCESSES[key].status = 'stopped';
        io.emit('status', { key, status: 'stopped' });
        io.emit('log', { key, data: `--- ${key.toUpperCase()} STOPPED (Code ${code}) ---` });
    });
};

// Helper: Stop Command
const stopCommand = (key) => {
    if (!PROCESSES[key].process) return;

    // tree-kill might be needed for full cleanup, but let's try basic encryption first
    // On Windows, child.kill() often doesn't kill the subtree spawned by shell:true

    // Simple approach for now
    const child = PROCESSES[key].process;

    // On Windows, use taskkill
    if (process.platform === 'win32') {
        spawn("taskkill", ["/pid", child.pid, '/f', '/t']);
    } else {
        child.kill();
    }
};

io.on('connection', (socket) => {
    console.log('Client connected');

    // Send initial state
    Object.keys(PROCESSES).forEach(key => {
        socket.emit('status', { key, status: PROCESSES[key].status });
    });

    socket.on('start', ({ key }) => {
        const rootDir = path.resolve(__dirname, '../../');
        if (key === 'backend') {
            runCommand('backend', 'npm', ['run', 'dev'], path.join(rootDir, 'backend'));
        } else if (key === 'frontend') {
            runCommand('frontend', 'npm', ['run', 'dev'], path.join(rootDir, 'frontend'));
        }
    });

    socket.on('stop', ({ key }) => {
        stopCommand(key);
    });

    socket.on('run-task', ({ task, args = [] }) => {
        const rootDir = path.resolve(__dirname, '../../');
        const taskKey = `task-${task}`; // Unique key for logging

        // Initialize process tracking for this task if not exists
        if (!PROCESSES[taskKey]) {
            PROCESSES[taskKey] = { process: null, status: 'stopped', logs: [] };
        }

        if (task === 'seed-all') {
            runCommand(taskKey, 'npm', ['run', 'seed-all'], path.join(rootDir, 'backend'));
        } else if (task === 'seed-academic') {
            runCommand(taskKey, 'npm', ['run', 'seed-academic'], path.join(rootDir, 'backend'));
        } else if (task === 'seed-modules') {
            runCommand(taskKey, 'npm', ['run', 'seed-modules'], path.join(rootDir, 'backend'));
        } else if (task === 'seed-combinations') {
            runCommand(taskKey, 'node', ['scripts/seedCombinations.js'], path.join(rootDir, 'backend'));
        } else if (task === 'create-admin') {
            // args: [username, password]
            runCommand(taskKey, 'node', ['scripts/createAdminUser.js', ...args], path.join(rootDir, 'backend'));
        }
    });
});

const PORT = 8888;
server.listen(PORT, () => {
    console.log(`Dashboard Server running on http://localhost:${PORT}`);
});
