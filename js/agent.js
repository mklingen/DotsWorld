function wrap(value, minValue, maxValue)
{
    newValue = value;
    if (value < minValue)
    {
        newValue = maxValue;
    }
    else if (value > maxValue)
    {
        newValue = minValue;
    }
    return newValue;
}



var Agent = function()
{
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.position3d = new THREE.Vector3(0, 0, 0);
    this.team = 0;
    this.health = 100;
}

Agent.prototype.get3DPosition = function()
{
    var pos = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
    pos.setLength(1.01);
    return pos;
}

Agent.prototype.update = function(dt)
{
    var velMul = new THREE.Vector3(this.velocity.x, this.velocity.y, this.velocity.z);
    velMul.multiplyScalar(dt);
    this.position.add(velMul);
    this.position3d = this.get3DPosition();
    this.position.set(this.position3d.x, this.position3d.y, this.position3d.z);
}

