// ES Module version of PCHealthSimulator
// Works in Node (with "type": "module") and browser

export default class PCHealthSimulator {
    constructor({ interval = 1000, jitter = 0.02, metrics = {}, onUpdate = null } = {}) {
        this.interval = interval;
        this.jitter = jitter;
        this.onUpdate = typeof onUpdate === 'function' ? onUpdate : null;

        // default metrics
        this.metrics = {
            cpuTemp: { value: 45, min: 30, max: 95, drift: 0.6, unit: '°C' },
            cpuUsage: { value: 12, min: 0,  max: 100, drift: 4, unit: '%' },
            ramUsage: { value: 30, min: 0,  max: 100, drift: 3, unit: '%' },
            diskUsage: { value: 20, min: 0, max: 100, drift: 1.5, unit: '%' },
            fanSpeed: { value: 1200, min: 600, max: 5000, drift: 120, unit: 'RPM' },
            ...metrics
        };

        this._timer = null;
    }

    // Box-Muller gaussian noise
    _gaussRandom() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    _clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    _updateMetric(def) {
        const noise = this._gaussRandom() * this.jitter * (def.max - def.min);
        const drift = (Math.random() - 0.5) * def.drift;
        let next = def.value + drift + noise;
        next = this._clamp(next, def.min, def.max);
        def.value = +(Number.isInteger(def.value) ? Math.round(next) : Number(next.toFixed(1)));
    }

    tick() {
        for (const def of Object.values(this.metrics)) {
            this._updateMetric(def);
        }
        const stats = this.getStats();
        if (this.onUpdate) this.onUpdate(stats);
        return stats;
    }

    getStats() {
        const snapshot = {};
        for (const [k, def] of Object.entries(this.metrics)) {
            snapshot[k] = { value: def.value, unit: def.unit };
        }
        snapshot.timestamp = Date.now();
        return snapshot;
    }

    start() {
        if (this._timer) return;
        this._timer = setInterval(() => this.tick(), this.interval);
        this.tick(); // initial tick immediately
    }

    stop() {
        if (!this._timer) return;
        clearInterval(this._timer);
        this._timer = null;
    }

    setMetric(name, params = {}) {
        if (!this.metrics[name]) this.metrics[name] = { value: 0, min: 0, max: 100, drift: 1, unit: '' };
        Object.assign(this.metrics[name], params);
    }
}

// Node-friendly quick demo
if (typeof window === 'undefined') {
    const sim = new PCHealthSimulator({ interval: 1000, jitter: 0.03, onUpdate: stats => {
            const lines = Object.entries(stats)
                .filter(([k]) => k !== 'timestamp')
                .map(([k, v]) => `${k.padEnd(10)} : ${String(v.value).padStart(6)} ${v.unit}`);
            console.clear();
            console.log('PC Health —', new Date(stats.timestamp).toLocaleTimeString());
            console.log(lines.join('\n'));
        }});

    sim.start();

    setTimeout(() => {
        sim.stop();
        console.log('\nSimulator stopped.');
    }, 60000);
}
