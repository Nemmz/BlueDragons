export default class SystemStatusSimulator {
    constructor(options = {}) {
        const {
            total = 50,
            initialOnlinePct = 0.75,
            onUpdate = null
        } = options;

        this.total = Math.max(3, Math.floor(total)); // minimum 3
        this.onUpdate = typeof onUpdate === 'function' ? onUpdate : null;

        // device counts
        this.degraded = 2; // always 2
        this.online = Math.max(0, Math.round(this.total * initialOnlinePct));
        this.offline = this.total - this.online - this.degraded;

        this._timer = null;
        this._elements = this._locateElements();
        this._render();
    }

    _locateElements() {
        const ids = ['total-devices', 'online-devices', 'offline-devices', 'degraded-devices'];
        const map = {};
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) {
                map[id] = null;
                return;
            }
            let span = el.querySelector('.metric-value');
            if (!span) {
                span = document.createElement('div');
                span.className = 'metric-value';
                span.style.fontSize = '1.4em';
                span.style.marginTop = '6px';
                el.appendChild(span);
            }
            map[id] = span;
        });
        return map;
    }

    // pick which state to move a device from (only online/offline)
    _pickSourceState() {
        const weights = [
            { name: 'online', w: this.online },
            { name: 'offline', w: this.offline }
        ];
        const totalWeight = weights.reduce((s, w) => s + w.w, 0);
        if (totalWeight <= 0) return null;
        let r = Math.random() * totalWeight;
        for (const item of weights) {
            if (r < item.w) return item.name;
            r -= item.w;
        }
        return weights[weights.length - 1].name;
    }

    tick() {
        const src = this._pickSourceState();
        if (!src) return;

        const target = src === 'online' ? 'offline' : 'online';
        if (this[src] > 0) {
            this[src] -= 1;
            this[target] += 1;
        }

        this.degraded = 2; // enforce degraded always = 2

        // maintain total consistency
        const sum = this.online + this.offline + this.degraded;
        if (sum !== this.total) {
            this.offline += this.total - sum;
            if (this.offline < 0) this.offline = 0;
        }

        this._render();
        if (this.onUpdate) this.onUpdate(this.getStats());
        return this.getStats();
    }

    getStats() {
        return {
            total: this.total,
            online: this.online,
            offline: this.offline,
            degraded: this.degraded,
            timestamp: Date.now()
        };
    }

    _render() {
        const eTotal = this._elements['total-devices'];
        const eOnline = this._elements['online-devices'];
        const eOffline = this._elements['offline-devices'];
        const eDegraded = this._elements['degraded-devices'];

        if (eTotal) eTotal.textContent = String(this.total);
        if (eOnline) eOnline.textContent = String(this.online);
        if (eOffline) eOffline.textContent = String(this.offline);
        if (eDegraded) eDegraded.textContent = String(this.degraded);
    }

    start() {
        if (this._timer) return;

        const scheduleNext = () => {
            // random interval between 15–45 seconds
            const interval = 15000 + Math.random() * 30000;
            this._timer = setTimeout(() => {
                this.tick();
                scheduleNext();
            }, interval);
        };

        scheduleNext();
        this.tick(); // initial tick
    }

    stop() {
        if (!this._timer) return;
        clearTimeout(this._timer);
        this._timer = null;
    }

    setTotal(newTotal) {
        const n = Math.max(3, Math.floor(newTotal));
        const scale = n / this.total;
        this.online = Math.max(0, Math.round(this.online * scale));
        this.degraded = 2;
        this.total = n;
        this.offline = Math.max(0, this.total - this.online - this.degraded);
        this._render();
    }
}

// auto-start for quick demo
if (typeof window !== 'undefined') {
    if (!window.__SystemStatusSimulatorAutoStarted) {
        window.__SystemStatusSimulatorAutoStarted = true;
        const _sim = new SystemStatusSimulator({ total: 15 });
        _sim.start();
        window.__SystemStatusSimulator = _sim;
    }
}
