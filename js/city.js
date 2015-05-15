var City = function()
{    
	this.population = 0;    
	this.position = new THREE.Vector3(0, 0, 0);    
	this.position3d = new THREE.Vector3(0, 0, 0);    
	this.health = 0;    
	this.team = 0;
}

City.prototype.setFromLatLong = function(lat, long, rad)
{    
	var multiplier = 0.0174532925;    
	this.position.set(lat * multiplier, long * multiplier, rad);
}

City.prototype.get3DPosition = function()
{     
	var pX = this.position.z * Math.cos(this.position.x) * Math.sin(this.position.y),         
	pY = this.position.z * Math.sin(this.position.x) * Math.sin(this.position.y),          
	pZ = this.position.z * Math.cos(this.position.y);     
	return new THREE.Vector3(pY, pZ, pX);
}

City.prototype.update = function(dt)
{    
    this.position3d = this.get3DPosition();
    if (this.team > 0)  
    {
         this.health += 0.01;
    }
    this.health = Math.min(this.health, this.population * 0.0001);

}