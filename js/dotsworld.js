var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
THREE.ImageUtils.crossOrigin = "anonymous";

var lightTex = THREE.ImageUtils.loadTexture("img/light.png");

var geometry = new THREE.SphereGeometry(1, 32, 32);
var material = new THREE.MeshBasicMaterial(
{
    map : lightTex
});

var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;

var controls = new THREE.OrbitControls(camera);
controls.noPan = true;
controls.minDistance = 1.25;

//create the particle variables
var particleCount = 1800, particles = new THREE.Geometry(), pMaterial = new THREE.PointCloudMaterial(
{
    color : 0xFF0000,
    size : 0.01
});

// now create the individual particles
for ( var p = 0; p < particleCount; p++)
{

    // create a particle with random
    // position values, -250 -> 250
    var t = Math.random() * 6;
    var phi = Math.random() * 6;
    var r = 1.05;
    var pX = r * Math.cos(t) * Math.sin(phi), 
        pY = r * Math.sin(t) * Math.sin(phi),  
        pZ = r * Math.cos(phi),  
        particle = new THREE.Vector3(pX, pY, pZ);
       

    // add it to the geometry
    particles.vertices.push(particle);
}

// create the particle system
var particleSystem = new THREE.PointCloud(particles, pMaterial);
particleSystem.sortParticles = true;
// add it to the scene
scene.add(particleSystem);

function updateParticles()
{
    for (var p = 0; p < particleCount; p++)
    {
        var particle = particleSystem.geometry.vertices[p];
        var t = Math.random() * 6;
        var phi = Math.random() * 6;
        var r = 1.05;
        var pX = r * Math.cos(t) * Math.sin(phi), 
            pY = r * Math.sin(t) * Math.sin(phi),  
            pZ = r * Math.cos(phi);
       
       particle.set(pY, pZ, pX);
      
        
    }
   
    particleSystem.geometry.verticesNeedUpdate = true;
    
}

function render()
{
    updateParticles();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
};

requestAnimationFrame(render);