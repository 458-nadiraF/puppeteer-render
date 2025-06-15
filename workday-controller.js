// workday-controller.js
const { spawn, exec } = require('child_process');

const START_HOUR = parseInt(process.env.START_HOUR) || 0;  // Default 8 AM
const WORK_HOURS = parseInt(process.env.WORK_HOURS) || 8;  // Default 8 hours

let ngrokProcess = null;
let isRunning = false;
let stopTimeout = null;

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function isWorkday() {
    const now = new Date();
    const day = now.getDay();
    // Monday = 1, Friday = 5
    return day >= 1 && day <= 5;
}

function isWorkHours() {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= START_HOUR && currentHour < (START_HOUR + WORK_HOURS);
}

function startServices() {
    if (isRunning) {
        log('Services already running');
        return;
    }
    
    if (!isWorkday()) {
        log('Not a workday, skipping start');
        return;
    }
    
    log('Starting workday services...');
    isRunning = true;
    
    // Start the Node.js app with PM2
    exec('pm2 start index.js --name stock-monitor --time', (error, stdout, stderr) => {
        if (error) {
            log(`Error starting stock-monitor: ${error.message}`);
        } else {
            log('Stock monitor started successfully');
        }
    });
    
    // Start ngrok
    ngrokProcess = spawn('ngrok', [
        'http',
        '--url=engaging-purely-rabbit.ngrok-free.app',
        '3000'
    ], {
        stdio: ['ignore', 'pipe', 'pipe']
    });
    
    ngrokProcess.stdout.on('data', (data) => {
        log(`Ngrok: ${data.toString().trim()}`);
    });
    
    ngrokProcess.stderr.on('data', (data) => {
        log(`Ngrok error: ${data.toString().trim()}`);
    });
    
    // Calculate when to stop (end of work hours)
    const now = new Date();
    const stopTime = new Date(now);
    stopTime.setHours(START_HOUR + WORK_HOURS, 0, 0, 0);
    
    const msUntilStop = stopTime - now;
    log(`Services will stop at ${stopTime.toLocaleTimeString()} (in ${Math.floor(msUntilStop / 1000 / 60)} minutes)`);
    
    // Schedule stop
    stopTimeout = setTimeout(() => {
        stopServices();
    }, msUntilStop);
}

function stopServices() {
    if (!isRunning) {
        log('Services not running');
        return;
    }
    
    log('Stopping services...');
    isRunning = false;
    
    // Clear the stop timeout if it exists
    if (stopTimeout) {
        clearTimeout(stopTimeout);
        stopTimeout = null;
    }
    
    // Kill ngrok
    if (ngrokProcess) {
        ngrokProcess.kill();
        ngrokProcess = null;
        log('Ngrok stopped');
    }
    
    // Stop PM2 app
    exec('pm2 stop stock-monitor && pm2 delete stock-monitor', (error, stdout, stderr) => {
        if (error) {
            log(`Error stopping PM2: ${error.message}`);
        } else {
            log('Stock monitor stopped');
        }
    });
}

function checkAndManageServices() {
    const shouldRun = isWorkday() && isWorkHours();
    
    if (shouldRun && !isRunning) {
        startServices();
    } else if (!shouldRun && isRunning) {
        stopServices();
    }
}

// Status logger
function logStatus() {
    const now = new Date();
    const status = isRunning ? 'RUNNING' : 'STOPPED';
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    
    log(`Status: ${status} | Day: ${dayName} | Time: ${now.toLocaleTimeString()}`);
    
    if (!isRunning && isWorkday()) {
        const nextStart = new Date(now);
        nextStart.setHours(START_HOUR, 0, 0, 0);
        if (now.getHours() >= START_HOUR) {
            // Next start is tomorrow
            nextStart.setDate(nextStart.getDate() + 1);
        }
        log(`Next start: ${nextStart.toLocaleString()}`);
    }
}

// Initial check
log(`Workday controller started. Work hours: ${START_HOUR}:00 - ${START_HOUR + WORK_HOURS}:00 (Monday-Friday)`);
checkAndManageServices();

// Check every minute
setInterval(checkAndManageServices, 60 * 1000);

// Log status every 30 minutes
setInterval(logStatus, 30 * 60 * 1000);

// Handle graceful shutdown
process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully...');
    stopServices();
    setTimeout(() => process.exit(0), 5000);
});

process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully...');
    stopServices();
    setTimeout(() => process.exit(0), 5000);
});
