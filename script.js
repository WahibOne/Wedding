document.addEventListener("DOMContentLoaded", function() {

    /* ==========================================
       FONCTION DE DÉFILEMENT SUR MESURE
       ========================================== */
    function customSmoothScrollTo(targetPositionY, duration) {
        const startPositionY = window.pageYOffset;
        const distance = targetPositionY - startPositionY;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            const ease = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, startPositionY + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    /* ==========================================
       1. ANIMATION AU DÉFILEMENT (FADE IN)
       ========================================== */
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    /* ==========================================
       2. GESTION DE LA MUSIQUE ET DES RIDEAUX
       ========================================== */
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    const iconSound = document.getElementById('icon-sound');
    const iconMute = document.getElementById('icon-mute');
    
    const curtainOverlay = document.getElementById('curtain-overlay');
    const leftCurtain = document.getElementById('curtain-left');
    const rightCurtain = document.getElementById('curtain-right');

    // Mise à jour visuelle du bouton son
    function updateIcon() {
        if (bgMusic.muted || bgMusic.paused) {
            iconSound.classList.add('hidden');
            iconMute.classList.remove('hidden');
            musicBtn.classList.add('opacity-70');
            musicBtn.classList.remove('opacity-100');
        } else {
            iconMute.classList.add('hidden');
            iconSound.classList.remove('hidden');
            musicBtn.classList.add('opacity-100');
            musicBtn.classList.remove('opacity-70');
        }
    }

    // Gestion du clic sur le bouton son
    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Évite que le clic déclenche autre chose
        if (bgMusic.paused) {
            bgMusic.play();
            bgMusic.muted = false;
        } else {
            bgMusic.muted = !bgMusic.muted;
        }
        updateIcon();
    });

    // Gestion du "Tap for a surprise" (Musique + Ouverture des rideaux)
    if (curtainOverlay) {
        curtainOverlay.addEventListener('click', () => {
            // 1. Lancement de la musique
            bgMusic.play().then(() => {
                bgMusic.muted = false;
                updateIcon();
            }).catch(e => console.log("Audio block bypassé au clic"));

            // 2. Disparition du texte
            curtainOverlay.style.opacity = '0';
            setTimeout(() => {
                curtainOverlay.style.display = 'none';
            }, 500);

            // 3. Ouverture des rideaux
            if (leftCurtain && rightCurtain) {
                leftCurtain.classList.add('curtain-open-left');
                rightCurtain.classList.add('curtain-open-right');
                
                setTimeout(() => {
                    leftCurtain.style.display = 'none';
                    rightCurtain.style.display = 'none';
                }, 2000); 
            }
        });
    }

    /* ==========================================
       3. COMPTE À REBOURS (22 Octobre 2026)
       ========================================== */
    const weddingDate = new Date("October 22, 2026 00:00:00").getTime();

    const countdown = setInterval(function() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("cd-days").innerText = days < 10 ? "0" + days : days;
        document.getElementById("cd-hours").innerText = hours < 10 ? "0" + hours : hours;
        document.getElementById("cd-minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
        document.getElementById("cd-seconds").innerText = seconds < 10 ? "0" + seconds : seconds;

        if (distance < 0) {
            clearInterval(countdown);
            document.getElementById("cd-days").innerText = "00";
            document.getElementById("cd-hours").innerText = "00";
            document.getElementById("cd-minutes").innerText = "00";
            document.getElementById("cd-seconds").innerText = "00";
        }
    }, 1000);

    /* ==========================================
       4. EFFET CARTE À GRATTER & CONFETTIS
       ========================================== */
    let scratchedCardsCount = 0;

    function initScratchCard(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        let isDrawing = false;
        let isCompleted = false;

        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;

        ctx.fillStyle = "#C0A080";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "14px Montserrat";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Grattez", canvas.width / 2, canvas.height / 2);

        function getPointerPos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function scratch(e) {
            if (!isDrawing || isCompleted) return;
            e.preventDefault(); 
            
            const pos = getPointerPos(e);
            
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 18, 0, 2 * Math.PI);
            ctx.fill();
        }

        function checkCompletion() {
            if (isCompleted) return;
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let transparentPixels = 0;
            
            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) transparentPixels++;
            }
            
            const totalPixels = pixels.length / 4;
            const percentage = (transparentPixels / totalPixels) * 100;
            
            if (percentage > 30) {
                isCompleted = true;
                canvas.style.transition = "opacity 0.5s ease";
                canvas.style.opacity = "0";
                
                setTimeout(() => {
                    canvas.style.display = "none";
                }, 500);

                scratchedCardsCount++;
                
                if (scratchedCardsCount === 3) {
                    triggerConfetti();
                    
                    const lockedContent = document.getElementById('locked-content');
                    if (lockedContent) {
                        lockedContent.classList.remove('hidden');
                        
                        setTimeout(() => {
                            const targetPosition = lockedContent.getBoundingClientRect().top + window.pageYOffset/2;
                            // Modifié pour 2000ms comme demandé
                            customSmoothScrollTo(targetPosition, 2000); 
                        }, 1500);
                    }
                }
            }
        }

        canvas.addEventListener("mousedown", () => isDrawing = true);
        canvas.addEventListener("mousemove", scratch);
        window.addEventListener("mouseup", () => { isDrawing = false; checkCompletion(); });

        canvas.addEventListener("touchstart", (e) => { isDrawing = true; scratch(e); }, {passive: false});
        canvas.addEventListener("touchmove", scratch, {passive: false});
        window.addEventListener("touchend", () => { isDrawing = false; checkCompletion(); });
    }

    function triggerConfetti() {
        var duration = 3000;
        var end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#5C2018', '#C0A080', '#ffffff']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#5C2018', '#C0A080', '#ffffff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    /* ==========================================
       5. INITIALISATION DES CARTES AU CHARGEMENT
       ========================================== */
    window.onload = function() {
        // L'ouverture des rideaux a été retirée d'ici pour attendre le clic
        initScratchCard("scratch-day");
        initScratchCard("scratch-month");
        initScratchCard("scratch-year");
    };

});