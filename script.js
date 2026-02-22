// --- 1. STARFIELD ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('starfield'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(3000 * 3);
for(let i=0; i<9000; i++) starPos[i] = (Math.random() - 0.5) * 1000;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.8}));
scene.add(stars);
camera.position.z = 1;
let warp = 0.2;

function animateStars() {
    requestAnimationFrame(animateStars);
    const p = starGeo.attributes.position.array;
    for(let i=2; i<p.length; i+=3) { p[i] += warp; if(p[i] > 500) p[i] = -500; }
    starGeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}
animateStars();

// --- 2. INTRO ---
const tl = gsap.timeline();
tl.to(".intro-lx", { opacity: 1, scale: 1, duration: 1.5, ease: "expo.out" });
tl.to("#welcome-msg", { opacity: 1, duration: 1 }, "-=0.5");
tl.to({}, { duration: 1, onUpdate: () => { warp += 0.7; } });
tl.to("#intro-overlay", { opacity: 0, display: "none", duration: 1, onStart: () => {
    gsap.to("#sidebar", { x: 0, duration: 0.6 });
    lucide.createIcons();
    initMentors();
    initLeaderboard();
}});

// --- 3. PRACTICE LOGIC (NO WINDOW OPENED) ---
function triggerPractice() {
    console.log("Practice Mode Initialized - Staying on current page.");
    // This function can trigger a specific in-page toast or small animation instead of an overlay.
    alert("Practice Mode Activated! Click Mentors to start a specific logic drill.");
}

// --- 4. DATA & UI ---
const mentorData = [
    { name: "Alex Rivera", spec: "Full Stack Expert", price: "$45", emoji: "👨‍🚀" },
    { name: "Sarah Chen", spec: "AI & Neural Nets", price: "$60", emoji: "👩‍💻" },
    { name: "Marcus Vane", spec: "Cybersecurity", price: "$55", emoji: "🕵️‍♂️" },
    { name: "Elena Ross", spec: "UI/UX Architect", price: "$40", emoji: "🦄" },
    { name: "D-01 Bot", spec: "Logic Engine", price: "Free", emoji: "🤖" }
];

const leaders = [
    { name: "Sarah Tech", streak: "45", xp: "12,400" },
    { name: "CodeKing", streak: "22", xp: "11,200" },
    { name: "DevMaster", streak: "18", xp: "9,800" }
];

function initMentors() {
    document.getElementById('mentor-grid').innerHTML = mentorData.map(m => `
        <div class="glass-panel text-center group border-white/5 hover:border-blue-500">
            <div class="text-4xl mb-4 transition">${m.emoji}</div>
            <h4 class="font-bold text-sm uppercase italic">${m.name}</h4>
            <p class="text-[9px] text-blue-400 font-black uppercase tracking-widest mt-1 mb-4">${m.spec}</p>
            <div class="flex flex-col gap-2">
                <button onclick="openChat('${m.name}')" class="text-[10px] bg-blue-600/20 py-2 rounded-lg font-bold">Free Chat</button>
                <button onclick="alert('Proceeding to Session...')" class="text-[10px] bg-white/5 py-2 rounded-lg font-bold">Paid: ${m.price}/hr</button>
            </div>
        </div>
    `).join('');
}

function initLeaderboard() {
    document.getElementById('leader-list').innerHTML = leaders.map(l => `
        <div class="glass-panel flex justify-between items-center cursor-pointer hover:border-blue-500 transition" onclick="openProfile('${l.name}', '${l.streak}', '${l.xp}')">
            <span class="font-bold text-sm italic uppercase tracking-tighter">${l.name}</span>
            <div class="flex items-center gap-4">
                <span class="text-orange-500 text-xs font-bold">🔥 ${l.streak}</span>
                <span class="text-blue-500 font-mono text-xs">${l.xp} XP</span>
            </div>
        </div>
    `).join('');
}

function openProfile(n, s, x) {
    closeOverlays();
    document.getElementById('prof-name').innerHTML = `IDENTITY: <span class="text-blue-500">${n}</span>`;
    document.getElementById('prof-streak').innerText = `🔥 ${s}`;
    document.getElementById('prof-xp').innerText = x;
    document.getElementById('profile-overlay').style.display = 'block';
    initBadge3D();
}

function openMentors() { closeOverlays(); document.getElementById('mentor-overlay').style.display = 'block'; }
function openLeaderboard() { closeOverlays(); document.getElementById('leaderboard-overlay').style.display = 'block'; }
function closeOverlays() { document.querySelectorAll('.overlay').forEach(o => o.style.display='none'); toggleChat(false); }

function openChat(name) {
    document.getElementById('chat-title').innerText = name + " (AI)";
    document.getElementById('chat-window').style.display = 'block';
}

function toggleChat(s) { document.getElementById('chat-window').style.display = s ? 'block' : 'none'; }

function sendMsg() {
    const input = document.getElementById('chat-input');
    const box = document.getElementById('chat-msgs');
    if(!input.value) return;
    box.innerHTML += `<div class="bg-blue-600 p-2 rounded-lg self-end text-right max-w-[85%] mb-2 ml-auto">${input.value}</div>`;
    const userQ = input.value.toLowerCase();
    input.value = '';
    document.getElementById('typing').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('typing').classList.add('hidden');
        let r = "System processing your logic...";
        if(userQ.includes("javascript")) r = "In JS, check your 'this' context and asynchronous handlers.";
        if(userQ.includes("python")) r = "Python relies heavily on whitespace. Ensure your indentations match.";
        box.innerHTML += `<div class="bg-white/10 p-2 rounded-lg border-l-2 border-blue-500 max-w-[85%] mb-2">${r}</div>`;
        box.scrollTop = box.scrollHeight;
    }, 1200);
}

// --- 5. 3D BADGE ---
let bScene, bCamera, bRenderer, bMesh;
function initBadge3D() {
    const canv = document.getElementById('badge-canvas');
    if(bRenderer) return;
    bScene = new THREE.Scene();
    bCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    bRenderer = new THREE.WebGLRenderer({ canvas: canv, antialias: true, alpha: true });
    bRenderer.setSize(300, 300);
    bMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), new THREE.MeshPhongMaterial({ color: 0x3b82f6, shininess: 100 }));
    bScene.add(bMesh);
    const l = new THREE.PointLight(0xffffff, 1.5, 100); l.position.set(5,5,5);
    bScene.add(l, new THREE.AmbientLight(0x404040));
    bCamera.position.z = 5;
    function an() { requestAnimationFrame(an); bMesh.rotation.y += 0.02; bRenderer.render(bScene, bCamera); }
    an();
}