// javascript
import SystemStatusSimulator from './systemStatusSimulation.js';

// helper: animate number change device-by-device
function animateDevices(element, start, end) {
    if (!element) return;
    const difference = end - start;
    if (difference === 0) {
        element.textContent = end;
        return;
    }

    const step = difference > 0 ? 1 : -1;
    let current = start;

    function tick() {
        current += step;
        element.textContent = current;
        if ((step > 0 && current < end) || (step < 0 && current > end)) {
            const delay = 30 + Math.random() * 50;
            setTimeout(tick, delay);
        }
    }

    tick();
}

// update metrics individually
function updateMetricsDevices(stats, prevStats) {
    const elements = {
        total: document.querySelector('#total-devices .metric-value'),
        online: document.querySelector('#online-devices .metric-value'),
        offline: document.querySelector('#offline-devices .metric-value'),
        degraded: document.querySelector('#degraded-devices .metric-value')
    };

    animateDevices(elements.total, prevStats.total, stats.total);
    animateDevices(elements.online, prevStats.online, stats.online);
    animateDevices(elements.offline, prevStats.offline, stats.offline);
    animateDevices(elements.degraded, prevStats.degraded, stats.degraded);
}

/* --- Notification helpers --- */

// Ensure a single toast container and CSS
function ensureToastSetup() {
    if (document.getElementById('__toast-container')) return;

    const container = document.createElement('div');
    container.id = '__toast-container';
    container.style.position = 'fixed';
    container.style.top = '1rem';
    container.style.right = '1rem';
    container.style.zIndex = 9999;
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '0.5rem';
    document.body.appendChild(container);

    const style = document.createElement('style');
    style.textContent = `
        #__toast-container .toast {
            background: rgba(0,0,0,0.8);
            color: #fff;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
            font-size: 13px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateY(-6px);
            transition: opacity 180ms ease, transform 180ms ease;
        }
        #__toast-container .toast.show { opacity: 1; transform: translateY(0); }
        #__toast-container .toast.increase { background: rgba(6, 140, 50, 0.9); }
        #__toast-container .toast.decrease { background: rgba(180, 30, 30, 0.95); }
    `;
    document.head.appendChild(style);
}

function showToast(message, type = '') {
    ensureToastSetup();
    const container = document.getElementById('__toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`.trim();
    t.textContent = message;
    container.prepend(t);

    // trigger show animation
    requestAnimationFrame(() => t.classList.add('show'));

    // auto remove after 3s
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 220);
    }, 3000);
}

function appendToNotificationLog(message) {
    const logContainer = document.getElementById('notification-log-list');
    if (!logContainer) return;

    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.style.padding = "4px 0";
    entry.style.borderBottom = "1px solid #ddd";
    entry.textContent = `[${timestamp}] ${message}`;

    logContainer.prepend(entry);
}

// Compare stats and generate toasts for changes
function notifyChange(stats, prevStats) {
    if (!prevStats) return;
    const labels = {
        total: 'Total',
        online: 'Online',
        offline: 'Offline',
        degraded: 'Degraded'
    };

    ['online', 'offline', 'degraded', 'total'].forEach(key => {
        const prev = Number(prevStats[key] ?? 0);
        const cur = Number(stats[key] ?? 0);
        const diff = cur - prev;
        if (diff === 0) return;

        const sign = diff > 0 ? '+' : '';
        const message = `${labels[key]}: ${prev} → ${cur} (${sign}${diff})`;
        const type = diff > 0 ? 'increase' : 'decrease';
        showToast(message, type);
        appendToNotificationLog(message);
        console.log(`[notify] ${message}`);
    });
}

/* --- Simulator init --- */

function initSimulator() {
    const totalEl = document.getElementById('total-devices');
    const total = totalEl ? parseInt(totalEl.dataset.total, 10) : 15;

    let prevStats = {
        total: total,
        online: Math.max(0, total - 2),
        offline: Math.max(0, total - (total - 2) - 2),
        degraded: 2
    };

    const sim = new SystemStatusSimulator({
        total,
        interval: 1000,
        initialOnlinePct: 0.75,
        jitterMovePct: 0.02,
        onUpdate: stats => {
            updateMetricsDevices(stats, prevStats);
            notifyChange(stats, prevStats);
            prevStats = { ...stats };
        }
    });

    sim.start();
    window.__SystemStatusSimulator = sim;
}

// initialize on DOM ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSimulator);
    } else {
        initSimulator();
    }
}
