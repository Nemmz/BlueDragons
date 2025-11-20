document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Update button styles
            buttons.forEach(b => {
                b.classList.remove('active');
                b.classList.add('inactive');
            });
            btn.classList.add('active');
            btn.classList.remove('inactive');

            // Show / hide content
            contents.forEach(c => {
                if (c.id === target) {
                    c.classList.add('active');
                } else {
                    c.classList.remove('active');
                }
            });
        });
    });
});

// Read URL params if present
const params = new URLSearchParams(window.location.search);
const requestedTab = params.get("tab");
const requestedDevice = params.get("device");

// Switch tab automatically if requested
if (requestedTab) {
    const tabButton = document.querySelector(`.tab-button[data-tab="${requestedTab}"]`);
    const tabContent = document.getElementById(requestedTab);

    if (tabButton && tabContent) {
        // Remove active from all
        document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));

        // Activate the requested tab
        tabButton.classList.add("active");
        tabContent.classList.add("active");
    }
}

// Auto-select device if provided
if (requestedDevice) {
    const deviceDropdown = document.getElementById("device-selection");
    if (deviceDropdown) {
        deviceDropdown.value = requestedDevice;
    }
}
