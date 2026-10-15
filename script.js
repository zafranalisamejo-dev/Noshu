// ========== THREE.JS 3D SCENE ==========
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

// Soft ambient + pink lights
const ambientLight = new THREE.AmbientLight(0xffb6c1, 0.4);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xff6b8a, 1.2, 80);
pointLight1.position.set(15, 10, 20);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x9b59b6, 0.8, 60);
pointLight2.position.set(-20, -5, 15);
scene.add(pointLight2);

// ========== PARTICLE SYSTEM (stars / dust) ==========
const particleCount = 900;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

const colorPalette = [
  new THREE.Color(0xff9a9e),
  new THREE.Color(0xfecfef),
  new THREE.Color(0xffd1ff),
  new THREE.Color(0xffffff),
  new THREE.Color(0xff6b8a),
  new THREE.Color(0xe0b0ff)
];

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 80;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

  const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
  colors[i * 3] = c.r;
  colors[i * 3 + 1] = c.g;
  colors[i * 3 + 2] = c.b;

  sizes[i] = Math.random() * 0.25 + 0.05;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.35,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
  sizeAttenuation: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ========== FLOATING 3D HEARTS ==========
function createHeartShape() {
  const shape = new THREE.Shape();
  const x = 0, y = 0;
  shape.moveTo(x + 0.25, y + 0.25);
  shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
  shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
  shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
  shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
  shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
  shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
  return shape;
}

const heartShape = createHeartShape();
const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
  depth: 0.18,
  bevelEnabled: true,
  bevelThickness: 0.04,
  bevelSize: 0.04,
  bevelSegments: 3
});
heartGeo.center();

const hearts = [];
const heartColors = [0xff6b8a, 0xff9a9e, 0xffb6c1, 0xe91e63, 0xf48fb1, 0xff80ab];

for (let i = 0; i < 18; i++) {
  const mat = new THREE.MeshPhongMaterial({
    color: heartColors[i % heartColors.length],
    emissive: heartColors[i % heartColors.length],
    emissiveIntensity: 0.25,
    shininess: 80,
    transparent: true,
    opacity: 0.9
  });
  const heart = new THREE.Mesh(heartGeo, mat);
  heart.scale.setScalar(1.8 + Math.random() * 2.2);
  heart.position.set(
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 25 - 5
  );
  heart.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  heart.userData = {
    speed: 0.003 + Math.random() * 0.008,
    rotSpeed: (Math.random() - 0.5) * 0.02,
    floatOffset: Math.random() * Math.PI * 2,
    originalY: heart.position.y
  };
  scene.add(heart);
  hearts.push(heart);
}

// ========== BIG CENTRAL GLOWING HEART (subtle) ==========
const centralHeart = new THREE.Mesh(
  heartGeo,
  new THREE.MeshPhongMaterial({
    color: 0xff4d6d,
    emissive: 0xff1744,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide
  })
);
centralHeart.scale.setScalar(12);
centralHeart.position.set(0, 0, -18);
scene.add(centralHeart);

// ========== MOUSE INTERACTION ==========
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Touch support
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
  }
}, { passive: true });

// ========== ANIMATION LOOP ==========
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Gentle camera sway
  camera.position.x += (mouseX * 3 - camera.position.x) * 0.03;
  camera.position.y += (mouseY * 2 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  // Rotate particle field slowly
  particles.rotation.y = t * 0.02;
  particles.rotation.x = Math.sin(t * 0.1) * 0.05;

  // Animate floating hearts
  hearts.forEach((h, i) => {
    h.position.y = h.userData.originalY + Math.sin(t * h.userData.speed * 40 + h.userData.floatOffset) * 1.8;
    h.rotation.y += h.userData.rotSpeed;
    h.rotation.z += h.userData.rotSpeed * 0.6;
    // slight drift
    h.position.x += Math.sin(t * 0.2 + i) * 0.008;
  });

  // Central heart pulse
  const pulse = 1 + Math.sin(t * 1.5) * 0.08;
  centralHeart.scale.setScalar(12 * pulse);
  centralHeart.rotation.z = Math.sin(t * 0.3) * 0.1;

  // Lights gentle movement
  pointLight1.position.x = 15 + Math.sin(t * 0.4) * 5;
  pointLight2.position.y = -5 + Math.cos(t * 0.3) * 4;

  renderer.render(scene, camera);
}

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
animate();

// Hide loader
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hide');
  }, 800);
});

// ========== UI INTERACTIONS ==========
const sendBtn = document.getElementById('sendBtn');
const heartsBtn = document.getElementById('heartsBtn');
const successMsg = document.getElementById('successMsg');
const messageInput = document.getElementById('messageInput');

// ========== IMPORTANT: Put your Web3Forms Access Key here ==========
// 1. Go to https://web3forms.com
// 2. Enter your email: zafranalisamejo@gmail.com
// 3. Copy the Access Key and paste it below
const WEB3FORMS_ACCESS_KEY = "9ee3deaf-9d27-4b41-aeb0-744a82668154";   // <-- यहाँ अपना Access Key डालो

function createBurstHearts(x, y, count = 45) {
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'hearts-burst';
    heart.textContent = ['❤️', '💖', '💕', '💗', '💓', '💝', '💘', '💞'][Math.floor(Math.random() * 8)];
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.fontSize = (18 + Math.random() * 22) + 'px';
    document.body.appendChild(heart);

    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.8;
    const distance = 120 + Math.random() * 180;
    const duration = 1.4 + Math.random() * 1.1;

    heart.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 90}px) scale(0.2) rotate(${(Math.random()-0.5)*120}deg)`, opacity: 0 }
    ], {
      duration: duration * 1000,
      easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      fill: 'forwards'
    }).onfinish = () => heart.remove();
  }
}

// Heavy 3D hearts spawn
function spawnHeavy3DHearts(amount = 12) {
  for (let i = 0; i < amount; i++) {
    const mat = new THREE.MeshPhongMaterial({
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
      emissive: 0xff1744,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.95
    });
    const extra = new THREE.Mesh(heartGeo, mat);
    extra.scale.setScalar(2.8 + Math.random() * 3.5);
    extra.position.set(
      (Math.random() - 0.5) * 28,
      -18 + Math.random() * 8,
      (Math.random() - 0.5) * 14
    );
    extra.userData = {
      speed: 0.025 + Math.random() * 0.04,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      floatOffset: Math.random() * 10,
      originalY: extra.position.y
    };
    scene.add(extra);
    hearts.push(extra);

    setTimeout(() => {
      scene.remove(extra);
      const idx = hearts.indexOf(extra);
      if (idx > -1) hearts.splice(idx, 1);
    }, 7000);
  }
}

sendBtn.addEventListener('click', async (e) => {
  const rect = sendBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Heavy visual effect
  createBurstHearts(centerX, centerY, 55);
  spawnHeavy3DHearts(14);

  // Boost existing 3D hearts
  hearts.forEach(h => {
    h.userData.speed *= 2.4;
  });
  setTimeout(() => {
    hearts.forEach(h => {
      h.userData.speed /= 2.4;
    });
  }, 5000);

  const message = messageInput.value.trim();

  // Disable button while sending
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending... 💌";

  // Send to Gmail using Web3Forms
  if (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== "YOUR_ACCESS_KEY_HERE") {
    try {
      const formData = new FormData();
      formData.append("access_key", WEB3FORMS_ACCESS_KEY);
      formData.append("subject", "💌 New Message for Seerat - From Sorry Website");
      formData.append("from_name", "Seerat Sorry Website");
      formData.append("email", "zafranalisamejo@gmail.com");
      formData.append("message", message || "(No message typed – just clicked Send with Love)");
      formData.append("to", "zafranalisamejo@gmail.com");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        successMsg.innerHTML = "✅ Message sent to your Gmail!<br>Check zafranalisamejo@gmail.com";
        successMsg.classList.add('show');
        messageInput.value = "";
      } else {
        successMsg.innerHTML = "⚠️ Could not send. Please check Access Key.";
        successMsg.classList.add('show');
      }
    } catch (err) {
      successMsg.innerHTML = "⚠️ Network error. Message not sent.";
      successMsg.classList.add('show');
    }
  } else {
    // Access key not set yet
    successMsg.innerHTML = "⚠️ Access Key missing!<br>Open js/script.js and put your Web3Forms key.";
    successMsg.classList.add('show');
  }

  // Reset button
  setTimeout(() => {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send with Love 💌";
  }, 2000);
});

heartsBtn.addEventListener('click', (e) => {
  const rect = heartsBtn.getBoundingClientRect();
  createBurstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
  spawnHeavy3DHearts(10);
});

// Continuous soft floating hearts from bottom occasionally
setInterval(() => {
  if (Math.random() > 0.55) {
    const x = Math.random() * window.innerWidth;
    createBurstHearts(x, window.innerHeight + 20, 5);
  }
}, 2200);
