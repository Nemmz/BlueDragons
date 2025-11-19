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
            // random delay 30–80ms per device for natural feel
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
    animateDevices(elements.degraded, prevStats.degraded, stats.degraded); // stays 2
}

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
            prevStats = { ...stats };
        }
    });

    sim.start();
    window.__SystemStatusSimulator = sim;
}

// initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulator);
} else {
    initSimulator();
}