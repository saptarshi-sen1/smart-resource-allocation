// Theme management script
(function() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Set initial theme
    if (savedTheme === 'light') {
        body.classList.remove('dark-theme');
        if (themeToggle) themeToggle.checked = false;
    } else {
        body.classList.add('dark-theme');
        if (themeToggle) themeToggle.checked = true;
    }

    // Handle toggle change
    window.handleThemeToggle = function(checked) {
        if (checked) {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    };
})();
