/**
 * Network/Constellation Graph Animation
 * Renders animated particles with connecting lines on the hero canvas.
 */
const NetworkCanvas = (() => {
    let canvas, ctx;
    let particles = [];
    let mouse = { x: null, y: null };
    let animationId;

    const CONFIG = {
        particleCount: 70,
        minRadius: 1.5,
        maxRadius: 4,
        speed: 0.4,
        connectionDistance: 150,
        mouseRepelRadius: 120,
        mouseRepelForce: 0.8,
        colors: [
            'rgba(108, 60, 224, 0.6)',   // purple
            'rgba(139, 92, 246, 0.5)',   // lighter purple
            'rgba(0, 212, 170, 0.6)',    // teal
            'rgba(45, 212, 191, 0.5)',   // lighter teal
        ],
        lineColor: {
            r: 108, g: 80, b: 200
        }
    };

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * CONFIG.speed * 2;
            this.vy = (Math.random() - 0.5) * CONFIG.speed * 2;
            this.radius = CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius);
            this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            this.baseX = this.x;
            this.baseY = this.y;
        }

        update() {
            // Drift
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Clamp
            this.x = Math.max(0, Math.min(canvas.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height, this.y));

            // Mouse repulsion
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.mouseRepelRadius && dist > 0) {
                    const force = (CONFIG.mouseRepelRadius - dist) / CONFIG.mouseRepelRadius * CONFIG.mouseRepelForce;
                    this.x += (dx / dist) * force;
                    this.y += (dy / dist) * force;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.connectionDistance) {
                    const opacity = (1 - dist / CONFIG.connectionDistance) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${CONFIG.lineColor.r}, ${CONFIG.lineColor.g}, ${CONFIG.lineColor.b}, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawConnections();

        for (const p of particles) {
            p.update();
            p.draw();
        }

        animationId = requestAnimationFrame(animate);
    }

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        resize();

        // Create particles
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(new Particle());
        }

        // Mouse tracking
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Handle resize
        window.addEventListener('resize', () => {
            resize();
            // Reposition particles that fell outside bounds
            for (const p of particles) {
                if (p.x > canvas.width) p.x = Math.random() * canvas.width;
                if (p.y > canvas.height) p.y = Math.random() * canvas.height;
            }
        });

        animate();
    }

    function destroy() {
        if (animationId) cancelAnimationFrame(animationId);
    }

    return { init, destroy };
})();
