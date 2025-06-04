import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById('app').appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Create basic shapes array
const shapes = [];

// Create multiple basic shapes
function createBasicShapes() {
    // First row: Basic geometries
    // Cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-8, 0.5, 0);
    cube.castShadow = true;
    scene.add(cube);
    shapes.push(cube);

    const cube2 = new THREE.Mesh(cubeGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    cube2.position.set(0, 1, 10);
    scene.add(cube2);
    shapes.push(cube2);

    const cube3 = new THREE.Mesh(cubeGeometry, new THREE.MeshStandardMaterial({ color: 0xf080ff }));
    cube3.position.set(-8, 0.5, 4);
    scene.add(cube3);
    shapes.push(cube3);

    const cube4 = new THREE.Mesh(cubeGeometry, new THREE.MeshStandardMaterial({ color: 0x00ff9f }));
    cube4.position.set(-8, 0.5, 6);
    scene.add(cube4);
    shapes.push(cube4);

    const cube5 = new THREE.Mesh(cubeGeometry, new THREE.MeshStandardMaterial({ color: 0x00ffff }));
    cube5.position.set(-8, 2, 0);
    scene.add(cube5);
    shapes.push(cube5);

    const cube6 = new THREE.Mesh(cubeGeometry, new THREE.MeshStandardMaterial({ color: 0x00f8ff }));
    cube6.position.set(-8, 4, 0);
    scene.add(cube6);
    shapes.push(cube6);

    const cube7 = new THREE.Mesh(cubeGeometry, new THREE.MeshStandardMaterial({ color: 0x88f8ff }));
    cube7.position.set(-8, 6, 0);
    scene.add(cube7);
    shapes.push(cube7);

    const cube8 = new THREE.Mesh(cubeGeometry, new THREE.MeshStandardMaterial({ color: 0x8888ff }));
    cube8.position.set(-8, 8, 0);
    scene.add(cube8);
    shapes.push(cube8);

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-6, 0.5, 0);
    sphere.castShadow = true;
    scene.add(sphere);
    shapes.push(sphere);

    // Cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(-4, 0.5, 0);
    cylinder.castShadow = true;
    scene.add(cylinder);
    shapes.push(cylinder);

    // Cone
    const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32);
    const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.set(-2, 0.5, 0);
    cone.castShadow = true;
    scene.add(cone);
    shapes.push(cone);

    // Torus
    const torusGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(0, 0.5, 0);
    torus.castShadow = true;
    scene.add(torus);
    shapes.push(torus);

    // Second row: More geometries
    // Octahedron
    const octahedronGeometry = new THREE.OctahedronGeometry(0.5);
    const octahedronMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
    const octahedron = new THREE.Mesh(octahedronGeometry, octahedronMaterial);
    octahedron.position.set(2, 0.5, 0);
    octahedron.castShadow = true;
    scene.add(octahedron);
    shapes.push(octahedron);

    // Tetrahedron
    const tetrahedronGeometry = new THREE.TetrahedronGeometry(0.5);
    const tetrahedronMaterial = new THREE.MeshStandardMaterial({ color: 0xff8800 });
    const tetrahedron = new THREE.Mesh(tetrahedronGeometry, tetrahedronMaterial);
    tetrahedron.position.set(4, 0.5, 0);
    tetrahedron.castShadow = true;
    scene.add(tetrahedron);
    shapes.push(tetrahedron);

    // Icosahedron
    const icosahedronGeometry = new THREE.IcosahedronGeometry(0.5);
    const icosahedronMaterial = new THREE.MeshStandardMaterial({ color: 0x8800ff });
    const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
    icosahedron.position.set(6, 0.5, 0);
    icosahedron.castShadow = true;
    scene.add(icosahedron);
    shapes.push(icosahedron);

    // Dodecahedron
    const dodecahedronGeometry = new THREE.DodecahedronGeometry(0.5);
    const dodecahedronMaterial = new THREE.MeshStandardMaterial({ color: 0x0088ff });
    const dodecahedron = new THREE.Mesh(dodecahedronGeometry, dodecahedronMaterial);
    dodecahedron.position.set(8, 0.5, 0);
    dodecahedron.castShadow = true;
    scene.add(dodecahedron);
    shapes.push(dodecahedron);

    // Third row: More shapes
    // Torus Knot
    const torusKnotGeometry = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16);
    const torusKnotMaterial = new THREE.MeshStandardMaterial({ color: 0xff0088 });
    const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
    torusKnot.position.set(-8, 0.5, 2);
    torusKnot.castShadow = true;
    scene.add(torusKnot);
    shapes.push(torusKnot);

    // Capsule
    const capsuleGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const capsuleMaterial = new THREE.MeshStandardMaterial({ color: 0x88ff00 });
    const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
    capsule.position.set(-6, 0.5, 2);
    capsule.castShadow = true;
    scene.add(capsule);
    shapes.push(capsule);

    // Create texture loader
    const textureLoader = new THREE.TextureLoader();

    // Load textures
    const diffuseTexture = textureLoader.load('./texture/patterned_paving_02_diff_1k.jpg');
    const normalTexture = textureLoader.load('./texture/patterned_paving_02_arm_1k.jpg');
    const aoTexture = textureLoader.load('./texture/patterned_paving_02_ao_1k.jpg');
    const displacementTexture = textureLoader.load('./texture/patterned_paving_02_disp_1k.png');

    // Create textured cube
    const texturedCubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const texturedCubeMaterial = new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        normalMap: normalTexture,
        aoMap: aoTexture,
        displacementMap: displacementTexture,
        displacementScale: 0.1,
        roughness: 0.7,
        metalness: 0.2
    });

    const texturedCube = new THREE.Mesh(texturedCubeGeometry, texturedCubeMaterial);
    texturedCube.position.set(0, 1, 0);
    texturedCube.castShadow = true;
    texturedCube.receiveShadow = true;
    scene.add(texturedCube);
    shapes.push(texturedCube);
}

// Create ground
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// Add lights
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// Hemisphere light
const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
hemisphereLight.position.set(0, 10, 0);
scene.add(hemisphereLight);

// Spot light
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(-5, 5, 0);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.1;
spotLight.decay = 2;
spotLight.distance = 50;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);

// Point light
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(0, 5, 5);
pointLight.castShadow = true;
scene.add(pointLight);

// Add light helpers
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(directionalLightHelper);

// Load HDR environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
    './hdr/sky.hdr',
    function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;
    },
    undefined,
    function(error) {
        console.error('An error happened while loading HDR:', error);
    }
);

// Load custom model
const loader = new GLTFLoader();
let gardenTable;

loader.load(
    './model/garden_table.glb',
    (gltf) => {
        gardenTable = gltf.scene;
        // Adjust model size
        gardenTable.scale.set(2, 2, 2);
        // Adjust model position
        gardenTable.position.set(0, 0, -5);
        gardenTable.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        scene.add(gardenTable);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('An error happened', error);
    }
);

// Create basic shapes
createBasicShapes();

// Create firework particle system
function createFirework(x, y, z) {
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    // Random color
    const color = new THREE.Color();
    color.setHSL(Math.random(), 1, 0.5);

    // Randomly select firework shape
    const shapeType = Math.floor(Math.random() * 3); // 0: Circle, 1: Spiral, 2: Heart

    for (let i = 0; i < particleCount; i++) {
        // Position
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Color
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Calculate velocity based on shape type
        let velocity;
        const speed = 0.2 + Math.random() * 0.1; // Random speed variation

        switch(shapeType) {
            case 0: // Circle
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * speed;
                velocity = new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    (Math.random() - 0.5) * speed * 0.5
                );
                break;

            case 1: // Spiral
                const spiralAngle = (i / particleCount) * Math.PI * 8;
                const spiralRadius = (i / particleCount) * speed;
                velocity = new THREE.Vector3(
                    Math.cos(spiralAngle) * spiralRadius,
                    Math.sin(spiralAngle) * spiralRadius,
                    (Math.random() - 0.5) * speed * 0.5
                );
                break;

            case 2: // Heart
                const heartAngle = (i / particleCount) * Math.PI * 2;
                const heartRadius = speed * (1 + Math.sin(heartAngle));
                velocity = new THREE.Vector3(
                    Math.cos(heartAngle) * heartRadius,
                    Math.sin(heartAngle) * heartRadius,
                    (Math.random() - 0.5) * speed * 0.5
                );
                break;
        }

        // Add some randomness
        velocity.x += (Math.random() - 0.5) * 0.05;
        velocity.y += (Math.random() - 0.5) * 0.05;
        velocity.z += (Math.random() - 0.5) * 0.05;

        velocities.push(velocity);
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
    });

    const firework = new THREE.Points(particles, material);
    firework.userData.velocities = velocities;
    firework.userData.life = 1.0;
    firework.userData.shapeType = shapeType;
    scene.add(firework);

    return firework;
}

// Store all fireworks
const fireworks = [];

// Create new firework periodically
function createRandomFirework() {
    const x = (Math.random() - 0.5) * 10;
    const y = Math.random() * 5;
    const z = (Math.random() - 0.5) * 10;
    const firework = createFirework(x, y, z);
    fireworks.push(firework);
}

// Create new firework every 2 seconds
setInterval(createRandomFirework, 2000);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate all basic shapes
    shapes.forEach((shape, index) => {
        shape.rotation.x += 0.01;
        shape.rotation.y += 0.01;
    });

    // Update light helpers
    spotLightHelper.update();
    directionalLightHelper.update();

    // Update fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];
        const positions = firework.geometry.attributes.position.array;
        const velocities = firework.userData.velocities;

        // Update each particle's position
        for (let j = 0; j < positions.length; j += 3) {
            positions[j] += velocities[j/3].x;
            positions[j + 1] += velocities[j/3].y;
            positions[j + 2] += velocities[j/3].z;

            // Add gravity effect
            velocities[j/3].y -= 0.001;

            // Add additional effects based on shape type
            switch(firework.userData.shapeType) {
                case 0: // Circle
                    // Add rotation effect
                    const angle = Math.atan2(positions[j + 1], positions[j]);
                    const radius = Math.sqrt(positions[j] * positions[j] + positions[j + 1] * positions[j + 1]);
                    positions[j] = Math.cos(angle + 0.01) * radius;
                    positions[j + 1] = Math.sin(angle + 0.01) * radius;
                    break;

                case 1: // Spiral
                    // Maintain spiral shape
                    const spiralAngle = Math.atan2(positions[j + 1], positions[j]);
                    const spiralRadius = Math.sqrt(positions[j] * positions[j] + positions[j + 1] * positions[j + 1]);
                    positions[j] = Math.cos(spiralAngle + 0.02) * spiralRadius;
                    positions[j + 1] = Math.sin(spiralAngle + 0.02) * spiralRadius;
                    break;

                case 2: // Heart
                    // Maintain heart shape
                    const heartAngle = Math.atan2(positions[j + 1], positions[j]);
                    const heartRadius = Math.sqrt(positions[j] * positions[j] + positions[j + 1] * positions[j + 1]);
                    positions[j] = Math.cos(heartAngle + 0.01) * heartRadius;
                    positions[j + 1] = Math.sin(heartAngle + 0.01) * heartRadius;
                    break;
            }
        }

        firework.geometry.attributes.position.needsUpdate = true;

        // Decrease life value
        firework.userData.life -= 0.01;
        firework.material.opacity = firework.userData.life;

        // Remove firework if it's gone
        if (firework.userData.life <= 0) {
            scene.remove(firework);
            fireworks.splice(i, 1);
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();
