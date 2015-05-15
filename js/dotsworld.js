var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
THREE.ImageUtils.crossOrigin = "anonymous";


function constrainAngle(x)
{
    x = x % (2 * Math.PI);
    if (x < 0)
        x += 2 * Math.PI;
    return x;
}

var lightTex = THREE.ImageUtils.loadTexture
(
        "img/light.jpg"
);
var numTeams = 10;
cities = [];
for(var i = 0; i < city_data.length; i++)
{
    var data = city_data[i];
    var city = new City();
    city.health = data.Pop * 0.0001;
    city.population = data.Pop;
    city.setFromLatLong(data.Long + 90, -data.Lat + 90, 1.01);
    
    if (Math.random() < 0.1)
    {
        city.team = Math.floor(Math.random() * numTeams);
    }
    
    cities.push(city);
}


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
controls.maxDistance = 2.1;

teams = [];


teams = [];

for (var t = 0; t < numTeams; t++)
{
    var team = new Team();
    if (t == 0)
    {
        team.color.setHSL(1, 1, 1);
    }
    else
    {
        team.color.setHSL(Math.random(), 1.0, 0.6);        
    }

    team.index = t;
    teams.push(team);
}


agents = [];

var numAgents = 1800;

for (var a = 0; a < numAgents; a++)
{
    var agent = new Agent();
    agent.health = -1;
    agent.position = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    agent.velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    agent.team = Math.floor(Math.random() * (numTeams - 1)) + 1;
    agents.push(agent);
}



//create the particle variables
var particleCount = cities.length + numAgents, 
particles = new THREE.Geometry(), 
pMaterial = new THREE.PointCloudMaterial
(
    {
        color : 0xFFFFFF,
        size : 0.01,
        vertexColors: THREE.VertexColors,
    }
);

particleColors = [];

// now create the individual particles
for ( var p = 0; p < particleCount; p++)
{

    // create a particle with random
    // position values, -250 -> 250
    var t = Math.random() * 6;
    var phi = Math.random() * 6;
    var r = 1.01;
    var pX = r * Math.cos(t) * Math.sin(phi), 
        pY = r * Math.sin(t) * Math.sin(phi),  
        pZ = r * Math.cos(phi),  
        particle = new THREE.Vector3(0, 0, 0);
       
    particleColors[p] = new THREE.Color(0xffffff);
    particleColors[p].setHSL(Math.random(), Math.random(), Math.random());
    // add it to the geometry
    particles.vertices.push(particle);
}

particles.colors = particleColors;

// create the particle system
var particleSystem = new THREE.PointCloud(particles, pMaterial);
particleSystem.sortParticles = true;
// add it to the scene
scene.add(particleSystem);

function spawnNewAgent(pos, team)
{
    for (var a = 0; a < numAgents; a++)
    {
        var agent = agents[a];
        
        if (agent.health < 0)
        {
            agent.team = team;
            agent.health = 1;
            agent.position.set(pos.x, pos.y, pos.z);
            break;
        }
    }
}

function updateAgents(agents)
{
    for (var c = 0; c < cities.length; c++)
    {
        var city = cities[c];
        city.update();
        
        if (city.health > 0 && city.team > 0 && Math.random() < 0.01)
        {
            for (var n = 0; n < city.population / 1000000; n++)
                spawnNewAgent(city.position3d, city.team);
        }
    }
    
    for (var a = 0; a < numAgents; a++)
    {
        var agent = agents[a];
        agent.update(0.01);
        
        if (agent.health <= 0)
        {
            continue;
        }
        
        var nearest = undefined;
        var nearestDist = 9999999;
        for (var c = 0; c < cities.length; c++)
        {
            var dist = cities[c].position3d.distanceToSquared(agent.position3d);
            
            if (dist < nearestDist && cities[c].team != agent.team)
            {
                nearestDist = dist;
                nearest = cities[c];
            }
        }
        
        for (var x = 0; x < numAgents; x++)
        {

            if (agents[x].team != agent.team && agents[x].health > 0)
            {
                var dist = agents[x].position3d.distanceToSquared(agent.position3d);
                
                if (dist < nearestDist)
                {
                    nearestDist = dist;
                    nearest = agents[x];
                }
            }
        }
        
        if (nearest != undefined)
        {
            if (nearestDist < 0.001 && nearest.health <= 0)
            {
                nearest.team = agent.team;
            }
            else if (nearestDist < 0.001 && nearest.health > 0)
            {
                nearest.health -= 0.05;
                agent.health -= 0.01;
            }
            
            var vx = (nearest.position3d.x - agent.position3d.x) + (Math.random() - 0.5) * 0.05;
            var vy = (nearest.position3d.y - agent.position3d.y) + (Math.random() - 0.5) * 0.05;
            var vz = (nearest.position3d.z - agent.position3d.z) + (Math.random() - 0.5) * 0.05;
            agent.velocity.set(vx, vy, vz);
            agent.velocity.setLength(0.1);
        }
    }
    
}

function updateParticles()
{
    for (var p = 0; p < numAgents; p++)
    {
        var particle = particleSystem.geometry.vertices[p];
        var agent = agents[p];
        var pos3d = agent.position3d;
        
        if (agent.health > 0)
        {
            particleSystem.geometry.colors[p] = teams[agent.team].color;
            particle.set(pos3d.x, pos3d.y, pos3d.z);
        }
        else
        {
            particle.set(0, 0, 0);
        }
    }
    
    for (var a = numAgents; a < numAgents + cities.length; a++)
    {
        var particle = particleSystem.geometry.vertices[a];
        var city = cities[a - numAgents];
        var pos3d = city.position3d;
    
        particleSystem.geometry.colors[a] = teams[city.team].color;
        particle.set(pos3d.x, pos3d.y, pos3d.z);
    }
    
    for (var p = numAgents + cities.length; p < particleCount; p++)
    {
        var particle = particleSystem.geometry.vertices[p];
        particle.set(9999, 9999, 9999);
    }
    
    
   
    particleSystem.geometry.verticesNeedUpdate = true;
    particleSystem.geometry.colorsNeedUpdate = true;
}

function render()
{
    updateAgents(agents);
    updateParticles();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
};

requestAnimationFrame(render);