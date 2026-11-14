import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

// ==========================================
// 1. SAHNE VERİLERİ (İSTANBUL KAZI ALANLARI)
// ==========================================
const EXCAVATION_SITES = [
  {
    id: 'trex',
    name: 'Tyrannosaurus Rex',
    siteName: 'Sarıyer Kireçtaşı Yamacı',
    meta: 'Geç Kretase • Etçil • ~12.3 Metre',
    card: 'assets/cards/trex_istanbul.jpg',
    x: -24,
    z: -18,
    radius: 5.5,
    color: 0x5c6642,
    desc: 'Sarıyer sırtlarındaki kireçtaşı tabakalarının altından çıkarılan dev kafatası ve diş fosilleri. Boğaz yamaçlarında yankılanan kükremesiyle erken dönem Anadolu-Avrupa kara köprüsünün en güçlü avcısı.'
  },
  {
    id: 'triceratops',
    name: 'Triceratops Horridus',
    siteName: 'Boğaz Falez Terası',
    meta: 'Geç Kretase • Otçul • ~9.0 Metre',
    card: 'assets/cards/triceratops_istanbul.jpg',
    x: -6,
    z: 22,
    radius: 5.5,
    color: 0x736c58,
    desc: 'Boğaz falezlerinin kıyı kayalıklarında bulunan üç boynuzlu zırhlı dev. Fıstık çamları arasında savunma kalkanıyla dolaşarak sürüsünü korur.'
  },
  {
    id: 'spinosaurus',
    name: 'Spinosaurus Aegyptiacus',
    siteName: 'Kıyı Sığlığı Lagünü',
    meta: 'Orta Kretase • Yarı Sucul • ~15.0 Metre',
    card: 'assets/cards/spinosaurus_istanbul.jpg',
    x: 13,
    z: -6,
    radius: 5.5,
    color: 0x455e5a,
    desc: 'İstanbul Boğazı sığ sularında avlanan dev sırt yelkenli yarı sucul dinozor. Kıyıdaki alüvyon tabakasının altında korunan omurga fosilleriyle hayata döndürüldü.'
  }
];

const TIME_PRESETS = [
  {
    label: '☀ Altın Saat',
    sunPos: new THREE.Vector3(75, 24, -65),
    sunColor: 0xffc88a,
    sunIntensity: 3.1,
    hemiSky: 0x9ec5e8,
    hemiGround: 0x3b3328,
    fogColor: 0xc9b9a6,
    fogDensity: 0.0048,
    skyTop: new THREE.Color(0x2d537a),
    skyHorizon: new THREE.Color(0xeab888)
  },
  {
    label: '🌤 Öğlen Güneşi',
    sunPos: new THREE.Vector3(40, 85, -35),
    sunColor: 0xfff6e8,
    sunIntensity: 3.4,
    hemiSky: 0xaad8ff,
    hemiGround: 0x4b4638,
    fogColor: 0xb7cfe0,
    fogDensity: 0.0036,
    skyTop: new THREE.Color(0x1f62a6),
    skyHorizon: new THREE.Color(0xbcd8eb)
  },
  {
    label: '🌫 Boğaz Sisi',
    sunPos: new THREE.Vector3(55, 30, -50),
    sunColor: 0xdbe6f0,
    sunIntensity: 2.1,
    hemiSky: 0x9aaec0,
    hemiGround: 0x30363b,
    fogColor: 0x94a6b5,
    fogDensity: 0.0085,
    skyTop: new THREE.Color(0x475c6e),
    skyHorizon: new THREE.Color(0x9fb0be)
  }
];

const QUALITY_PRESETS = [
  { label: '⚙ Ultra PBR', pixelRatio: Math.min(window.devicePixelRatio, 2), shadowSize: 2048 },
  { label: '⚙ Yüksek', pixelRatio: Math.min(window.devicePixelRatio, 1.5), shadowSize: 1024 },
  { label: '⚙ Dengeli', pixelRatio: 1.0, shadowSize: 512 }
];

// ==========================================
// 2. RENDERER, SAHNE & KAMERA KURULUMU
// ==========================================
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(QUALITY_PRESETS[0].pixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(TIME_PRESETS[0].fogColor, TIME_PRESETS[0].fogDensity);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.2, 420);

// Sky Dome Shader
const skyUniforms = {
  topColor: { value: TIME_PRESETS[0].skyTop.clone() },
  bottomColor: { value: TIME_PRESETS[0].skyHorizon.clone() },
  sunDir: { value: TIME_PRESETS[0].sunPos.clone().normalize() }
};
const skyGeo = new THREE.SphereGeometry(260, 32, 20);
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  uniforms: skyUniforms,
  vertexShader: `
    varying vec3 vWorldPos;
    void main() {
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform vec3 sunDir;
    varying vec3 vWorldPos;
    void main() {
      vec3 dir = normalize(vWorldPos);
      float h = clamp(dir.y * 1.4, 0.0, 1.0);
      vec3 col = mix(bottomColor, topColor, pow(h, 0.65));
      float sunAmt = max(dot(dir, sunDir), 0.0);
      col += vec3(1.0, 0.85, 0.6) * pow(sunAmt, 24.0) * 0.45;
      col += vec3(1.0, 0.95, 0.85) * smoothstep(0.997, 0.9995, sunAmt) * 1.2;
      gl_FragColor = vec4(col, 1.0);
    }
  `
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

// Lights
const hemiLight = new THREE.HemisphereLight(TIME_PRESETS[0].hemiSky, TIME_PRESETS[0].hemiGround, 0.95);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(TIME_PRESETS[0].sunColor, TIME_PRESETS[0].sunIntensity);
sunLight.position.copy(TIME_PRESETS[0].sunPos);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 220;
const d = 75;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// ==========================================
// 3. PBR DOKULARIN YÜKLENMESİ (NANO BANANA)
// ==========================================
const loadingBar = document.getElementById('loading-bar');
const loadingStatus = document.getElementById('loading-status');
const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (_url, loaded, total) => {
  const pct = Math.min(100, Math.round((loaded / total) * 100));
  loadingBar.style.width = `${pct}%`;
  loadingStatus.textContent = `PBR Dokular & Boğaz Varlıkları Yükleniyor... (%${pct})`;
};

loadingManager.onLoad = () => {
  loadingBar.style.width = '100%';
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    ls.classList.add('fade-out');
    setTimeout(() => ls.remove(), 650);
  }, 250);
};

const texLoader = new THREE.TextureLoader(loadingManager);
function loadTiledTex(path, repeatX, repeatY, isColor = true) {
  const t = texLoader.load(path);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  if (isColor) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const soilAlbedo = loadTiledTex('assets/textures/soil_albedo.jpg', 18, 18, true);
const soilNormal = loadTiledTex('assets/textures/soil_normal.jpg', 18, 18, false);
const soilRoughness = loadTiledTex('assets/textures/soil_roughness.jpg', 18, 18, false);

const skinAlbedo = loadTiledTex('assets/textures/dino_skin_albedo.jpg', 2, 2, true);
const skinNormal = loadTiledTex('assets/textures/dino_skin_normal.jpg', 2, 2, false);
const skinRoughness = loadTiledTex('assets/textures/dino_skin_roughness.jpg', 2, 2, false);

// ==========================================
// 4. İSTANBUL BOĞAZI TOPOGRAFYASI & ARAZİ
// ==========================================
function getTerrainHeight(x, z) {
  // Bosphorus channel runs along x in [22, 85] with gentle meander
  const meander = Math.sin(z * 0.025) * 8.0;
  const xRel = x - meander;

  // Base slope: European shore (west, xRel < 22), Strait (22..85), Anatolian shore (east, xRel > 85)
  let h = 0;
  if (xRel < 22) {
    const distCoast = 22 - xRel;
    h = Math.min(18.5, Math.pow(distCoast * 0.14, 1.35) * 4.5) - 0.6;
  } else if (xRel <= 85) {
    const t = (xRel - 22) / 63;
    h = -4.5 * Math.sin(t * Math.PI) - 0.5;
  } else {
    const distAnatolia = xRel - 85;
    h = Math.min(20.0, Math.pow(distAnatolia * 0.15, 1.3) * 4.8) - 0.6;
  }

  // Multi-octave rocky Istanbul hills
  const n1 = Math.sin(x * 0.06) * Math.cos(z * 0.06) * 2.1;
  const n2 = Math.sin(x * 0.15 + 1.3) * Math.sin(z * 0.14 + 0.7) * 0.75;
  const n3 = Math.cos(x * 0.32 - z * 0.28) * 0.22;
  h += n1 + n2 + n3;

  // Flatten excavation plateaus smoothly
  for (const site of EXCAVATION_SITES) {
    const dx = x - site.x;
    const dz = z - site.z;
    const dist = Math.hypot(dx, dz);
    if (dist < site.radius * 1.9) {
      const targetH = site.id === 'spinosaurus' ? 1.3 : site.id === 'triceratops' ? 4.2 : 7.8;
      const blend = Math.max(0, 1 - Math.max(0, dist - site.radius * 0.7) / (site.radius * 1.2));
      h = THREE.MathUtils.lerp(h, targetH, blend * blend * (3 - 2 * blend));
    }
  }
  return h;
}

const terrainGeo = new THREE.PlaneGeometry(240, 240, 180, 180);
terrainGeo.rotateX(-Math.PI / 2);

const posAttr = terrainGeo.attributes.position;
const colors = new Float32Array(posAttr.count * 3);
const cSand = new THREE.Color(0xb8a586);
const cRock = new THREE.Color(0xc2b7a6);
const cMoss = new THREE.Color(0x6c7c4a);

for (let i = 0; i < posAttr.count; i++) {
  const x = posAttr.getX(i);
  const z = posAttr.getZ(i);
  const y = getTerrainHeight(x, z);
  posAttr.setY(i, y);

  let col = cRock.clone();
  if (y < 1.5) {
    col.lerpColors(cSand, cRock, Math.max(0, y / 1.5));
  } else if (y > 5.5) {
    col.lerpColors(cRock, cMoss, Math.min(1, (y - 5.5) / 5.0));
  }
  colors[i * 3] = col.r;
  colors[i * 3 + 1] = col.g;
  colors[i * 3 + 2] = col.b;
}

terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
terrainGeo.computeVertexNormals();

const terrainMat = new THREE.MeshStandardMaterial({
  map: soilAlbedo,
  normalMap: soilNormal,
  normalScale: new THREE.Vector2(1.25, 1.25),
  roughnessMap: soilRoughness,
  roughness: 0.92,
  metalness: 0.04,
  vertexColors: true
});

const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
terrainMesh.receiveShadow = true;
scene.add(terrainMesh);

// ==========================================
// 5. İSTANBUL BOĞAZI SU GÖLGELENDİRİCİSİ
// ==========================================
const waterUniforms = {
  uTime: { value: 0 },
  uSunDir: { value: TIME_PRESETS[0].sunPos.clone().normalize() },
  uSunColor: { value: new THREE.Color(TIME_PRESETS[0].sunColor) },
  uSkyColor: { value: TIME_PRESETS[0].skyTop.clone() }
};

const waterGeo = new THREE.PlaneGeometry(240, 240, 96, 96);
waterGeo.rotateX(-Math.PI / 2);
const waterMat = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: waterUniforms,
  vertexShader: `
    uniform float uTime;
    varying vec3 vWorldPos;
    varying float vWave;
    void main() {
      vec3 p = position;
      float w1 = sin(p.x * 0.28 + uTime * 1.4) * cos(p.z * 0.22 + uTime * 1.1) * 0.16;
      float w2 = sin(p.x * 0.65 - uTime * 2.1 + p.z * 0.4) * 0.06;
      p.y += w1 + w2;
      vWave = w1 + w2;
      vec4 wp = modelMatrix * vec4(p, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uSunDir;
    uniform vec3 uSunColor;
    uniform vec3 uSkyColor;
    varying vec3 vWorldPos;
    varying float vWave;
    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      vec3 normal = normalize(vec3(
        sin(vWorldPos.x * 0.7 + uTime * 1.8) * 0.12,
        1.0,
        cos(vWorldPos.z * 0.65 + uTime * 1.5) * 0.12
      ));
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);
      vec3 deepCol = vec3(0.04, 0.18, 0.26);
      vec3 shallowCol = vec3(0.08, 0.34, 0.38);
      vec3 baseCol = mix(deepCol, shallowCol, clamp(vWave * 2.5 + 0.5, 0.0, 1.0));
      vec3 col = mix(baseCol, uSkyColor * 0.85, fresnel * 0.72);
      vec3 halfDir = normalize(uSunDir + viewDir);
      float spec = pow(max(dot(normal, halfDir), 0.0), 96.0);
      col += uSunColor * spec * 1.1;
      gl_FragColor = vec4(col, 0.88);
    }
  `
});
const waterMesh = new THREE.Mesh(waterGeo, waterMat);
waterMesh.position.y = 0.0;
scene.add(waterMesh);

// ==========================================
// 6. İSTANBUL SİMGELERİ & AĞAÇLAR
// ==========================================
function buildBosphorusBridge() {
  const bridge = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xd8dde3, roughness: 0.45, metalness: 0.7 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x2f3640, roughness: 0.8 });

  // Deck spanning strait at z = -85
  const deck = new THREE.Mesh(new THREE.BoxGeometry(110, 1.2, 5.2), deckMat);
  deck.position.set(54, 15, 0);
  deck.castShadow = true;
  bridge.add(deck);

  // Twin Suspension Towers
  [-18, 18].forEach((offset, idx) => {
    const tx = idx === 0 ? 28 : 80;
    [-2.2, 2.2].forEach((tz) => {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(1.8, 36, 1.8), steelMat);
      pylon.position.set(tx, 17, tz);
      pylon.castShadow = true;
      bridge.add(pylon);
    });
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 5.8), steelMat);
    cross1.position.set(tx, 33, 0);
    bridge.add(cross1);
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 5.8), steelMat);
    cross2.position.set(tx, 23, 0);
    bridge.add(cross2);
  });

  // Main catenary cables
  [-2.2, 2.2].forEach((tz) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const x = THREE.MathUtils.lerp(28, 80, t);
      const sag = 4 * t * (1 - t) * 14;
      pts.push(new THREE.Vector3(x, 34 - sag, tz));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const cableGeo = new THREE.TubeGeometry(curve, 24, 0.22, 6, false);
    bridge.add(new THREE.Mesh(cableGeo, steelMat));
  });

  bridge.position.z = -82;
  scene.add(bridge);
}
buildBosphorusBridge();

function buildWatchtower() {
  const tower = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({
    map: soilAlbedo,
    normalMap: soilNormal,
    color: 0xb8ad9e,
    roughness: 0.9
  });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x3b4856, roughness: 0.6, metalness: 0.2 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.8, 12, 14), stoneMat);
  body.position.y = 6;
  body.castShadow = true;
  body.receiveShadow = true;
  tower.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.9, 4.5, 14), roofMat);
  roof.position.y = 14.2;
  roof.castShadow = true;
  tower.add(roof);

  const tx = -46;
  const tz = -38;
  tower.position.set(tx, getTerrainHeight(tx, tz) - 0.5, tz);
  scene.add(tower);
}
buildWatchtower();

// Istanbul Pine & Cypress Trees
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.95 });
const leafMat = new THREE.MeshStandardMaterial({ color: 0x2c4c2b, roughness: 0.85 });
const trees = [];
for (let i = 0; i < 65; i++) {
  const angle = i * 2.39996;
  const rad = 16 + (i % 14) * 5.2;
  const x = -22 + Math.cos(angle) * rad * 0.75;
  const z = Math.sin(angle) * rad;
  if (x > 16) continue;
  const y = getTerrainHeight(x, z);
  if (y < 4.5) continue;

  // Avoid placing inside excavation sites
  if (EXCAVATION_SITES.some((s) => Math.hypot(x - s.x, z - s.z) < s.radius + 2.5)) continue;

  const tree = new THREE.Group();
  const h = 3.2 + (i % 4) * 0.9;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, h, 7), trunkMat);
  trunk.position.y = h / 2;
  trunk.castShadow = true;
  tree.add(trunk);

  const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.7 + (i % 3) * 0.4, 1), leafMat);
  crown.scale.set(1.2, 0.75, 1.2);
  crown.position.y = h + 0.6;
  crown.castShadow = true;
  tree.add(crown);

  tree.position.set(x, y - 0.2, z);
  tree.userData.phase = i * 0.7;
  scene.add(tree);
  trees.push(tree);
}

// ==========================================
// 7. 3D EKLEMLİ DİNOZOR MODELLERİ & KAZI ALANLARI
// ==========================================
function createDinosaurModel(site) {
  const dino = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({
    map: skinAlbedo,
    normalMap: skinNormal,
    normalScale: new THREE.Vector2(1.4, 1.4),
    roughnessMap: skinRoughness,
    color: site.color,
    roughness: 0.72,
    metalness: 0.05
  });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xe6dec8, roughness: 0.5 });

  // Torso
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(1.15, 2.2, 8, 14), skinMat);
  torso.rotation.z = Math.PI / 2.2;
  torso.position.set(0, 2.7, 0);
  torso.castShadow = true;
  dino.add(torso);

  // Tail
  const tailPivot = new THREE.Group();
  tailPivot.position.set(-1.3, 2.6, 0);
  const tail1 = new THREE.Mesh(new THREE.ConeGeometry(0.75, 3.8, 10), skinMat);
  tail1.rotation.z = Math.PI / 2;
  tail1.position.set(-1.8, 0.1, 0);
  tail1.castShadow = true;
  tailPivot.add(tail1);
  dino.add(tailPivot);

  // Head & Neck
  const headPivot = new THREE.Group();
  headPivot.position.set(1.4, 3.3, 0);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.8, 1.5, 10), skinMat);
  neck.rotation.z = -Math.PI / 4;
  neck.position.set(0.4, 0.5, 0);
  neck.castShadow = true;
  headPivot.add(neck);

  const skull = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.95, 0.95), skinMat);
  skull.position.set(1.3, 1.0, 0);
  skull.castShadow = true;
  headPivot.add(skull);

  if (site.id === 'triceratops') {
    const frill = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.22, 14), skinMat);
    frill.rotation.z = Math.PI / 2.6;
    frill.position.set(0.75, 1.35, 0);
    frill.castShadow = true;
    headPivot.add(frill);

    [-0.35, 0.35].forEach((hz) => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.13, 1.4, 8), boneMat);
      horn.rotation.z = -Math.PI / 2.2;
      horn.position.set(2.1, 1.35, hz);
      headPivot.add(horn);
    });
  } else if (site.id === 'spinosaurus') {
    for (let i = -3; i <= 3; i++) {
      const hSpine = 2.2 - Math.abs(i) * 0.3;
      const spine = new THREE.Mesh(new THREE.BoxGeometry(0.32, hSpine, 0.14), skinMat);
      spine.position.set(i * 0.34 - 0.1, 3.7 + hSpine * 0.35, 0);
      spine.castShadow = true;
      dino.add(spine);
    }
  }

  dino.add(headPivot);

  // Legs
  const legs = [];
  const legPositions = site.id === 'triceratops'
    ? [[0.9, -0.75], [0.9, 0.75], [-0.9, -0.75], [-0.9, 0.75]]
    : [[-0.2, -0.75], [-0.2, 0.75]];

  legPositions.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.28, 2.2, 10), skinMat);
    leg.position.set(lx, 1.1, lz);
    leg.castShadow = true;
    dino.add(leg);
    legs.push(leg);
  });

  dino.userData = { tailPivot, headPivot, legs, homeX: site.x, homeZ: site.z, angle: 0 };
  return dino;
}

const siteObjects = [];
const fossilMat = new THREE.MeshStandardMaterial({ color: 0xded3b8, roughness: 0.65 });
const moundMat = new THREE.MeshStandardMaterial({
  map: soilAlbedo,
  normalMap: soilNormal,
  color: 0x9c8970,
  roughness: 0.95
});

EXCAVATION_SITES.forEach((site) => {
  const y = getTerrainHeight(site.x, site.z);
  const group = new THREE.Group();
  group.position.set(site.x, y, site.z);

  const mound = new THREE.Mesh(new THREE.SphereGeometry(2.6, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), moundMat);
  mound.scale.set(1.2, 0.45, 1.2);
  mound.receiveShadow = true;
  mound.castShadow = true;
  group.add(mound);

  // Half-buried fossil ribs
  for (let r = -1; r <= 1; r++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.12, 8, 14, Math.PI * 0.7), fossilMat);
    rib.position.set(r * 0.65, 0.35, 0);
    rib.rotation.y = Math.PI / 2;
    rib.castShadow = true;
    group.add(rib);
  }

  // Holographic pulse ring
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(site.radius * 0.78, site.radius * 0.86, 36), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.12;
  group.add(ring);

  scene.add(group);
  siteObjects.push({
    data: site,
    group,
    ring,
    mound,
    progress: 0,
    discovered: false,
    dino: null
  });
});

// ==========================================
// 8. KEŞİF ARACI (ROVER) & PARÇACIKLAR
// ==========================================
const rover = new THREE.Group();
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.45 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.3 });

const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 2.6), bodyMat);
chassis.position.y = 0.65;
chassis.castShadow = true;
rover.add(chassis);

const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.55, 1.3), darkMat);
cabin.position.set(0, 1.22, -0.2);
cabin.castShadow = true;
rover.add(cabin);

[[-0.9, 0.9], [0.9, 0.9], [-0.9, -0.9], [0.9, -0.9]].forEach(([wx, wz]) => {
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.32, 14), darkMat);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(wx, 0.42, wz);
  wheel.castShadow = true;
  rover.add(wheel);
});

const startX = -16;
const startZ = 6;
rover.position.set(startX, getTerrainHeight(startX, startZ), startZ);
scene.add(rover);

// Dust / Rock Particles for Excavation
const particles = [];
const particleGeo = new THREE.DodecahedronGeometry(0.14, 0);
const particleMat = new THREE.MeshStandardMaterial({ color: 0x9e8b70, roughness: 0.9 });

function spawnDigParticles(pos) {
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(particleGeo, particleMat);
    p.position.set(
      pos.x + (Math.random() - 0.5) * 1.8,
      pos.y + 0.5,
      pos.z + (Math.random() - 0.5) * 1.8
    );
    p.userData = {
      vx: (Math.random() - 0.5) * 4.5,
      vy: 3.5 + Math.random() * 4.0,
      vz: (Math.random() - 0.5) * 4.5,
      life: 0.7
    };
    scene.add(p);
    particles.push(p);
  }
}

// ==========================================
// 9. KONTROLLER (TOUCH JOYSTICK + KLAVYE/FARE)
// ==========================================
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

let joyVec = { x: 0, y: 0 };
const joyZone = document.getElementById('joystick-zone');
const joyKnob = document.getElementById('joystick-knob');
let joyTouchId = null;

function updateJoystick(clientX, clientY) {
  const rect = joyZone.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const maxR = 42;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist > maxR) {
    dx = (dx / dist) * maxR;
    dy = (dy / dist) * maxR;
  }
  joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  joyVec.x = dx / maxR;
  joyVec.y = dy / maxR;
}

joyZone.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const t = e.changedTouches[0];
  joyTouchId = t.identifier;
  updateJoystick(t.clientX, t.clientY);
});

window.addEventListener('touchmove', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier === joyTouchId) {
      updateJoystick(t.clientX, t.clientY);
    }
  }
});

window.addEventListener('touchend', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier === joyTouchId) {
      joyTouchId = null;
      joyVec = { x: 0, y: 0 };
      joyKnob.style.transform = 'translate(0px, 0px)';
    }
  }
});

// Camera Orbit (Drag on canvas)
let camYaw = 0.6;
let camPitch = 0.42;
let isDragging = false;
let lastPtr = { x: 0, y: 0 };
let camTouchId = null;

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastPtr = { x: e.clientX, y: e.clientY };
});
window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  camYaw -= (e.clientX - lastPtr.x) * 0.005;
  camPitch = THREE.MathUtils.clamp(camPitch + (e.clientY - lastPtr.y) * 0.004, 0.15, 1.05);
  lastPtr = { x: e.clientX, y: e.clientY };
});
window.addEventListener('mouseup', () => { isDragging = false; });

canvas.addEventListener('touchstart', (e) => {
  const t = e.changedTouches[0];
  if (t.identifier !== joyTouchId) {
    camTouchId = t.identifier;
    lastPtr = { x: t.clientX, y: t.clientY };
  }
});
canvas.addEventListener('touchmove', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier === camTouchId) {
      camYaw -= (t.clientX - lastPtr.x) * 0.006;
      camPitch = THREE.MathUtils.clamp(camPitch + (t.clientY - lastPtr.y) * 0.005, 0.15, 1.05);
      lastPtr = { x: t.clientX, y: t.clientY };
    }
  }
});
canvas.addEventListener('touchend', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier === camTouchId) camTouchId = null;
  }
});

// Dig Button State
let isDigging = false;
const btnDig = document.getElementById('btn-dig');
btnDig.addEventListener('pointerdown', () => { isDigging = true; });
window.addEventListener('pointerup', () => { isDigging = false; });

// ==========================================
// 10. ARAYÜZ & MODALLAR (NANO BANANA KARTLAR)
// ==========================================
let timeIdx = 0;
let qualityIdx = 0;

document.getElementById('btn-time').addEventListener('click', (e) => {
  timeIdx = (timeIdx + 1) % TIME_PRESETS.length;
  const p = TIME_PRESETS[timeIdx];
  e.target.textContent = p.label;
  sunLight.position.copy(p.sunPos);
  sunLight.color.setHex(p.sunColor);
  sunLight.intensity = p.sunIntensity;
  hemiLight.color.setHex(p.hemiSky);
  hemiLight.groundColor.setHex(p.hemiGround);
  scene.fog.color.setHex(p.fogColor);
  scene.fog.density = p.fogDensity;
  skyUniforms.topColor.value.copy(p.skyTop);
  skyUniforms.bottomColor.value.copy(p.skyHorizon);
  skyUniforms.sunDir.value.copy(p.sunPos).normalize();
  waterUniforms.uSunDir.value.copy(p.sunPos).normalize();
  waterUniforms.uSunColor.value.setHex(p.sunColor);
  waterUniforms.uSkyColor.value.copy(p.skyTop);
});

document.getElementById('btn-quality').addEventListener('click', (e) => {
  qualityIdx = (qualityIdx + 1) % QUALITY_PRESETS.length;
  const q = QUALITY_PRESETS[qualityIdx];
  e.target.textContent = q.label;
  renderer.setPixelRatio(q.pixelRatio);
  sunLight.shadow.mapSize.set(q.shadowSize, q.shadowSize);
  if (sunLight.shadow.map) {
    sunLight.shadow.map.dispose();
    sunLight.shadow.map = null;
  }
});

function openDinoCard(siteData) {
  document.getElementById('modal-img').src = siteData.card;
  document.getElementById('modal-title').textContent = siteData.name;
  document.getElementById('modal-meta').textContent = siteData.meta;
  document.getElementById('modal-desc').textContent = siteData.desc;
  document.getElementById('card-modal').classList.remove('hidden');
}

document.getElementById('btn-modal-close').onclick = () => document.getElementById('card-modal').classList.add('hidden');
document.getElementById('modal-close-bg').onclick = () => document.getElementById('card-modal').classList.add('hidden');

document.getElementById('btn-guide').onclick = () => {
  const list = document.getElementById('guide-list');
  list.innerHTML = '';
  siteObjects.forEach((s) => {
    const item = document.createElement('div');
    item.className = `guide-item ${s.discovered ? '' : 'locked'}`;
    item.innerHTML = `
      <img src="${s.data.card}" alt="${s.data.name}" />
      <div>
        <div class="guide-item-title">${s.discovered ? s.data.name : '??? (Henüz Kazılmadı)'}</div>
        <div class="guide-item-sub">${s.data.siteName}</div>
      </div>
    `;
    if (s.discovered) {
      item.onclick = () => {
        document.getElementById('guide-modal').classList.add('hidden');
        openDinoCard(s.data);
      };
    }
    list.appendChild(item);
  });
  document.getElementById('guide-modal').classList.remove('hidden');
};
document.getElementById('btn-guide-close').onclick = () => document.getElementById('guide-modal').classList.add('hidden');
document.getElementById('guide-close-bg').onclick = () => document.getElementById('guide-modal').classList.add('hidden');

// ==========================================
// 11. ANA OYUN DÖNGÜSÜ
// ==========================================
const clock = new THREE.Clock();
const radarText = document.getElementById('radar-text');
const digWrap = document.getElementById('dig-progress-wrap');
const digFill = document.getElementById('dig-progress-fill');
const foundCountEl = document.getElementById('found-count');
const locLabel = document.getElementById('location-label');

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;

  waterUniforms.uTime.value = elapsed;

  // Rover movement relative to camera yaw
  let moveX = joyVec.x;
  let moveY = joyVec.y;
  if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

  const mag = Math.hypot(moveX, moveY);
  if (mag > 0.05) {
    const nx = moveX / Math.max(1, mag);
    const ny = moveY / Math.max(1, mag);
    const sinY = Math.sin(camYaw);
    const cosY = Math.cos(camYaw);
    const worldDirX = nx * cosY + ny * sinY;
    const worldDirZ = -nx * sinY + ny * cosY;

    const speed = 11.5 * dt;
    const nextX = THREE.MathUtils.clamp(rover.position.x + worldDirX * speed, -65, 22);
    const nextZ = THREE.MathUtils.clamp(rover.position.z + worldDirZ * speed, -65, 65);
    const nextY = getTerrainHeight(nextX, nextZ);

    if (nextY > 0.35) {
      rover.position.set(nextX, nextY, nextZ);
      rover.rotation.y = Math.atan2(worldDirX, worldDirZ);
    }
  }

  // Nearest excavation site check
  let nearest = null;
  let minDist = Infinity;
  siteObjects.forEach((s) => {
    const d = Math.hypot(rover.position.x - s.data.x, rover.position.z - s.data.z);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
    s.ring.material.opacity = 0.35 + Math.sin(elapsed * 3.5) * 0.25;

    // Animate discovered dinosaurs
    if (s.dino) {
      const u = s.dino.userData;
      u.angle += dt * 0.35;
      const px = u.homeX + Math.cos(u.angle) * 3.2;
      const pz = u.homeZ + Math.sin(u.angle) * 3.2;
      s.dino.position.set(px, getTerrainHeight(px, pz), pz);
      s.dino.rotation.y = -u.angle;
      u.tailPivot.rotation.y = Math.sin(elapsed * 3.2) * 0.22;
      u.headPivot.rotation.y = Math.sin(elapsed * 1.4) * 0.18;
      u.legs.forEach((leg, idx) => {
        leg.rotation.z = Math.sin(elapsed * 4.5 + idx * Math.PI) * 0.25;
      });
    }
  });

  if (nearest && !nearest.discovered && minDist < nearest.data.radius) {
    btnDig.disabled = false;
    locLabel.textContent = nearest.data.siteName;
    radarText.textContent = `${nearest.data.siteName} • Kazı Hazır (%${Math.round(nearest.progress)})`;
    digWrap.classList.add('active');
    digFill.style.width = `${nearest.progress}%`;

    if (isDigging || keys['Space'] || keys['KeyE']) {
      nearest.progress = Math.min(100, nearest.progress + dt * 42);
      if (Math.random() < 0.45) spawnDigParticles(nearest.group.position);
      if (nearest.progress >= 100 && !nearest.discovered) {
        nearest.discovered = true;
        nearest.ring.visible = false;
        nearest.dino = createDinosaurModel(nearest.data);
        scene.add(nearest.dino);
        foundCountEl.textContent = siteObjects.filter((s) => s.discovered).length;
        isDigging = false;
        openDinoCard(nearest.data);
      }
    }
  } else {
    btnDig.disabled = true;
    digWrap.classList.remove('active');
    if (nearest && !nearest.discovered) {
      radarText.textContent = `Hedef: ${nearest.data.siteName} (${Math.round(minDist)}m)`;
    } else if (siteObjects.every((s) => s.discovered)) {
      radarText.textContent = 'Tüm İstanbul fosilleri keşfedildi!';
    }
  }

  // Update dig particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.userData.vy -= 14 * dt;
    p.position.x += p.userData.vx * dt;
    p.position.y += p.userData.vy * dt;
    p.position.z += p.userData.vz * dt;
    p.userData.life -= dt;
    if (p.userData.life <= 0) {
      scene.remove(p);
      particles.splice(i, 1);
    }
  }

  // Wind sway on trees
  trees.forEach((tr) => {
    tr.rotation.z = Math.sin(elapsed * 1.4 + tr.userData.phase) * 0.025;
  });

  // Smooth third-person camera follow
  const camDist = 13.5;
  const targetCamX = rover.position.x + Math.sin(camYaw) * Math.cos(camPitch) * camDist;
  const targetCamY = rover.position.y + 2.2 + Math.sin(camPitch) * camDist;
  const targetCamZ = rover.position.z + Math.cos(camYaw) * Math.cos(camPitch) * camDist;
  camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
  camera.lookAt(rover.position.x, rover.position.y + 1.4, rover.position.z);

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
