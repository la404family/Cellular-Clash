// Création des particules animées en arrière-plan
document.addEventListener('DOMContentLoaded', function () {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Propriétés aléatoires
        const size = Math.random() * 5 + 2;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 15 + 10;
        const animationDelay = Math.random() * 10;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.animationDelay = `${animationDelay}s`;

        particlesContainer.appendChild(particle);
    }
});