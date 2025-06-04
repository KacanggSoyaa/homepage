document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded!');
    
    // Example: Change header text on click
    const header = document.querySelector('header h1');
    if (header) {
        header.addEventListener('click', function() {
            this.textContent = 'You clicked me!';
            setTimeout(() => {
                this.textContent = 'Welcome to My Website';
            }, 2000);
        });
    }

    // Random Quote Generator for section.none
    const quotes = [
        "The best way to get started is to quit talking and begin doing. – Walt Disney",
        "Don't let yesterday take up too much of today. – Will Rogers",
        "Success is not in what you have, but who you are. – Bo Bennett",
        "The only limit to our realization of tomorrow is our doubts of today. – Franklin D. Roosevelt",
        "Creativity is intelligence having fun. – Albert Einstein",
        "Do what you can with all you have, wherever you are. – Theodore Roosevelt",
        "Believe you can and you're halfway there. – Theodore Roosevelt",
        "It always seems impossible until it's done. – Nelson Mandela",
        "You are never too old to set another goal or to dream a new dream. – C.S. Lewis",
        "Happiness is not by chance, but by choice. – Jim Rohn"
    ];
    const quoteElem = document.getElementById('random-quote');
    if (quoteElem) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElem.textContent = quotes[randomIndex];
    }

    // Rock-Paper-Scissors Mini Game
    const rpsButtons = document.querySelectorAll('.rps-btn');
    const rpsResult = document.getElementById('rps-result');
    if (rpsButtons.length && rpsResult) {
        const choices = ['rock', 'paper', 'scissors'];
        const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
        rpsButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const userChoice = this.getAttribute('data-choice');
                const computerChoice = choices[Math.floor(Math.random() * 3)];
                let result = '';
                if (userChoice === computerChoice) {
                    result = `Draw! You both chose ${emojis[userChoice]}`;
                } else if (
                    (userChoice === 'rock' && computerChoice === 'scissors') ||
                    (userChoice === 'paper' && computerChoice === 'rock') ||
                    (userChoice === 'scissors' && computerChoice === 'paper')
                ) {
                    result = `You Win! ${emojis[userChoice]} beats ${emojis[computerChoice]}`;
                } else {
                    result = `You Lose! ${emojis[computerChoice]} beats ${emojis[userChoice]}`;
                }
                rpsResult.textContent = result;
            });
        });
    }
});