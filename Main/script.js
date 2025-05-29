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
    
    document.getElementById('commentForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const comment = document.getElementById('comment').value.trim();
      if (name && comment) {
        const commentDiv = document.createElement('div');
        commentDiv.innerHTML = `<strong>${name}:</strong> ${comment}`;
        document.getElementById('comments').appendChild(commentDiv);
        this.reset();
      }
    });
});