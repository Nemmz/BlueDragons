// javascript
import PCHealthSimulator from './computerStatsSimulation.js';

const canvas = document.getElementById('performanceChart');
if (!canvas) {
    console.error('Canvas #performanceChart not found.');
} else {
    const ctx = canvas.getContext('2d');

    const performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'CPU Usage (%)', data: [], borderColor: 'rgba(40,167,69,1)', backgroundColor: 'rgba(40,167,69,0.2)', fill: true, tension: 0.3 },
                { label: 'CPU Temp (°C)', data: [], borderColor: 'rgba(255,99,132,1)', backgroundColor: 'rgba(255,99,132,0.2)', fill: true, tension: 0.3 },
                { label: 'RAM Usage (%)', data: [], borderColor: 'rgba(54,162,235,1)', backgroundColor: 'rgba(54,162,235,0.2)', fill: true, tension: 0.3 }
            ]
        },
        options: {
            responsive: true,
            scales: { x: { title: { display: true, text: 'Time' } }, y: { beginAtZero: true } }
        }
    });

    const sim = new PCHealthSimulator({
        interval: 1000,
        onUpdate: (stats) => {
            const time = new Date(stats.timestamp).toLocaleTimeString();
            const maxPoints = 20;

            performanceChart.data.labels.push(time);
            performanceChart.data.datasets[0].data.push(stats.cpuUsage.value);
            performanceChart.data.datasets[1].data.push(stats.cpuTemp.value);
            performanceChart.data.datasets[2].data.push(stats.ramUsage.value);

            if (performanceChart.data.labels.length > maxPoints) {
                performanceChart.data.labels.shift();
                performanceChart.data.datasets.forEach(ds => ds.data.shift());
            }

            // Use requestAnimationFrame + no animation to avoid queuing many animated updates
            requestAnimationFrame(() => performanceChart.update('none'));
        }
    });

    sim.start();
}
