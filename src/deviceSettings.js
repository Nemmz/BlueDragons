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