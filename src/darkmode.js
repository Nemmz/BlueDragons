// Grab the theme dropdown (if exists)
const themeSelector = document.getElementById('theme');

// Apply smooth transitions for the whole page
document.body.style.transition = 'background 0.4s ease, color 0.4s ease';


// Apply saved theme on page load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'Dark') {
    document.body.classList.add('dark-mode');
} else if (savedTheme === 'Light') {
    document.body.classList.remove('dark-mode');
}

// Detect system default if chosen
if (!savedTheme || savedTheme === 'System Default') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }
}

// Update theme on dropdown change
if (themeSelector) {
    themeSelector.value = savedTheme || 'System Default'; // reflect saved theme
    themeSelector.addEventListener('change', (e) => {
        const value = e.target.value;
        localStorage.setItem('theme', value);

        if (value === 'Dark') {
            document.body.classList.add('dark-mode');
        } else if (value === 'Light') {
            document.body.classList.remove('dark-mode');
        } else { // System Default
            document.body.classList.remove('dark-mode');
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-mode');
            }
        }
    });
}

