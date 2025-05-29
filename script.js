document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded!');
    
    // Example: Change header text on click
    const header = document.querySelector('header h1');
    header.addEventListener('click', function() {
        this.textContent = 'You clicked me!';
        setTimeout(() => {
            this.textContent = 'Welcome to My Website';
        }, 2000);
    });
    
    
});