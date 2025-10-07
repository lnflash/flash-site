// Keys of the Caribbean - Hunt Landing Page JS

// API Configuration - Points to private backend server
const API_BASE = 'https://kotc.islandbitcoin.com/api';
// For local development, use: const API_BASE = 'http://localhost:8000/api';

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Lightning background animation
const canvas = document.getElementById('lightning-bg');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let canvasWidth = canvas.width = window.innerWidth;
    let canvasHeight = canvas.height = window.innerHeight;

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvasWidth = canvas.width = window.innerWidth;
        canvasHeight = canvas.height = window.innerHeight;
    });

    const minSegmentHeight = 5;
    const lightningThickness = 3;
    const roughness = 2;
    let opacity = 1;

    function getRandomInteger(min, max) {
        const buffer = new Uint32Array(1);
        window.crypto.getRandomValues(buffer);
        let random = buffer[0] / (0xffffffff + 1);
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(random * (max - min + 1)) + min;
    }

    function createLightning() {
        const maxDifference = canvasWidth / 5;
        let top = { x: getRandomInteger(100, canvasWidth - 100), y: 0 };
        let groundHeight = canvasHeight;
        let segmentHeight = groundHeight - top.y;
        let lightning = [];

        lightning.push({ x: top.x, y: top.y });
        lightning.push({ x: Math.random() * (canvasWidth - 200) + 100, y: groundHeight });

        let currDiff = maxDifference;
        while (segmentHeight > minSegmentHeight) {
            let newSegments = [];
            for (let i = 0; i < lightning.length - 1; i++) {
                const start = lightning[i];
                const end = lightning[i + 1];
                const midX = (start.x + end.x) / 2;
                const newX = midX + (Math.random() * 2 - 1) * currDiff;
                newSegments.push(start, { x: newX, y: (start.y + end.y) / 2 });
            }
            newSegments.push(lightning.pop());
            lightning = newSegments;
            currDiff /= roughness;
            segmentHeight /= 2;
        }
        return lightning;
    }

    function drawLightning(lightning, opacity) {
        ctx.strokeStyle = `hsla(187, 100%, 89%, ${opacity})`;
        ctx.shadowColor = 'hsl(187, 100%, 89%)';
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.lineWidth = lightningThickness;
        for (let i = 0; i < lightning.length; i++) {
            ctx.lineTo(lightning[i].x, lightning[i].y);
        }
        ctx.stroke();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.beginPath();
    }

    let currentLightning = [];
    let animating = false;

    function animateLightning() {
        if (!animating) return;

        clearCanvas();
        opacity -= 0.02;

        if (opacity > 0) {
            drawLightning(currentLightning, opacity);
            requestAnimationFrame(animateLightning);
        } else {
            animating = false;
        }
    }

    function triggerLightning() {
        if (animating) return;

        currentLightning = createLightning();
        opacity = 1;
        animating = true;
        animateLightning();
    }

    // Trigger lightning at random intervals
    function scheduleLightning() {
        const delay = Math.random() * 3000 + 2000; // 2-5 seconds
        setTimeout(() => {
            triggerLightning();
            scheduleLightning();
        }, delay);
    }

    scheduleLightning();
    triggerLightning(); // Initial strike
}

// Leaderboard data loading (placeholder for API integration)
async function loadLeaderboard() {
    const leaderboardData = document.getElementById('leaderboard-data');

    try {
        const response = await fetch(`${API_BASE}/leaderboard.php?limit=5`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.hunters && data.hunters.length > 0) {
            leaderboardData.innerHTML = data.hunters.map((hunter, index) => {
                const status = hunter.current_stage === 0 ? 'Registered' :
                              hunter.current_stage === 7 ? 'Completed' :
                              `Stage ${hunter.current_stage}`;
                return `
                <div class="leaderboard-row">
                    <div class="rank-cell">${index + 1}</div>
                    <div class="username-cell">${hunter.username}</div>
                    <div class="stage-cell">Stage ${hunter.current_stage}</div>
                    <div class="sats-cell">${hunter.total_sats_won.toLocaleString()} sats</div>
                    <div class="status-cell">${status}</div>
                </div>
                `;
            }).join('');
        }
    } catch (error) {
        // API not ready yet, keep placeholder
        console.log('Leaderboard API not available yet');
    }
}

// Load leaderboard on page load
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();

    // Refresh leaderboard every 30 seconds
    setInterval(loadLeaderboard, 30000);
});

// Navbar scroll effect
let lastScroll = 0;
const nav = document.querySelector('.hunt-nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav.style.background = 'rgba(11, 14, 17, 0.98)';
    } else {
        nav.style.background = 'rgba(11, 14, 17, 0.95)';
    }

    lastScroll = currentScroll;
});
