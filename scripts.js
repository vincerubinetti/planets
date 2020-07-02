window.onload = function () {
  Canvas = document.getElementById("main_canvas");
  Brush = Canvas.getContext("2d");

  Canvas.width = 800;
  Canvas.height = 800;

  FPS = 60;

  // default values
  NumberOfPlanets = 50;
  PlanetMinSize = 2;
  PlanetMaxSize = 25;
  PlanetStartSpeed = 2;
  GravitationalConstant = 0.1;
  CombinePlanets = true;
  WrapAttraction = true;
  ConstantDistance = false;

  UpdateAllControls();

  Fade = 0.25;
  VelocityLimit = 10;
  AccelerationLimit = 1;

  // for each HTML input control, run UpdateValues() on it when it is changed
  var controls = document.querySelectorAll("input");
  for (var control of controls) control.oninput = UpdateValues;

  Reset();
  Step();
};

function Reset() {
  PlanetObjects = [];
  for (var i = 0; i < NumberOfPlanets; i++) PlanetObjects.push(new Planet());
}

function UpdateValues() {
  // get the new number value of the HTML element that was just changed
  var value = this.type === "checkbox" ? this.checked : Number(this.value);

  // if the new/changed value isn't a number (eg, when starting to type a negative number and only the '-' is in so far), dont change anything and exit
  if (value === NaN) return;

  // update slider control if numberbox was changed, and vice versa
  if (this.dataset.partner)
    document.getElementById(this.dataset.partner).value = value;

  switch (this.id) {
    case "number_of_planets":
    case "number_of_planets_t":
      NumberOfPlanets = value;
      break;
    case "planet_min_size":
    case "planet_min_size_t":
      PlanetMinSize = value;
      break;
    case "planet_max_size":
    case "planet_max_size_t":
      PlanetMaxSize = value;
      break;
    case "planet_start_speed":
    case "planet_start_speed_t":
      PlanetStartSpeed = value;
      break;
    case "gravitation_constant":
    case "gravitation_constant_t":
      GravitationalConstant = value;
      break;
    case "combine_planets":
      CombinePlanets = value;
      break;
    case "wrap_attraction":
      WrapAttraction = value;
      break;
    case "constant_distance":
      ConstantDistance = value;
      break;
  }
}

function UpdateAllControls() {
  document.getElementById("number_of_planets").value = NumberOfPlanets;
  document.getElementById("number_of_planets_t").value = NumberOfPlanets;
  document.getElementById("planet_min_size").value = PlanetMinSize;
  document.getElementById("planet_min_size_t").value = PlanetMinSize;
  document.getElementById("planet_max_size").value = PlanetMaxSize;
  document.getElementById("planet_max_size_t").value = PlanetMaxSize;
  document.getElementById("planet_start_speed").value = PlanetStartSpeed;
  document.getElementById("planet_start_speed_t").value = PlanetStartSpeed;
  document.getElementById("gravitation_constant").value = GravitationalConstant;
  document.getElementById(
    "gravitation_constant_t"
  ).value = GravitationalConstant;
  document.getElementById("combine_planets").checked = CombinePlanets;
  document.getElementById("wrap_attraction").checked = WrapAttraction;
  document.getElementById("constant_distance").checked = ConstantDistance;
}

function Planet() {
  this.x = Math.random() * Canvas.width;
  this.y = Math.random() * Canvas.height;
  this.radius = PlanetMinSize + Math.random() * (PlanetMaxSize - PlanetMinSize);
  this.mass = Math.pow(this.radius, 2);
  var direction = Math.random() * 2 * Math.PI;
  var speed = PlanetStartSpeed * Math.random();
  this.xVelocity = Math.cos(direction) * speed;
  this.yVelocity = -Math.sin(direction) * speed;
  this.xAcceleration = 0;
  this.yAcceleration = 0;

  this.displayRadius = 0;
}

Planet.prototype.draw = function () {
  this.drawCircle(0, 0);

  // wrap planet
  this.drawCircle(-1, 0);
  this.drawCircle(-1, -1);
  this.drawCircle(0, -1);
  this.drawCircle(1, -1);
  this.drawCircle(1, 0);
  this.drawCircle(1, 1);
  this.drawCircle(0, 1);
  this.drawCircle(-1, 1);
};

Planet.prototype.drawCircle = function (xTile, yTile) {
  Brush.globalAlpha = 1;
  Brush.fillStyle = "black";
  Brush.beginPath();
  Brush.arc(
    this.x + xTile * Canvas.width,
    this.y + yTile * Canvas.height,
    this.displayRadius,
    0,
    2 * Math.PI
  );
  Brush.fill();
};

Planet.prototype.step = function () {
  this.xVelocity += this.xAcceleration;
  this.yVelocity += this.yAcceleration;

  if (this.xVelocity > VelocityLimit) this.xVelocity = VelocityLimit;
  if (this.xVelocity < -VelocityLimit) this.xVelocity = -VelocityLimit;
  if (this.yVelocity > VelocityLimit) this.yVelocity = VelocityLimit;
  if (this.yVelocity < -VelocityLimit) this.yVelocity = -VelocityLimit;

  this.x += this.xVelocity;
  this.y += this.yVelocity;

  if (this.x < 0) this.x += Canvas.width;
  if (this.x > Canvas.width) this.x -= Canvas.width;

  if (this.y < 0) this.y += Canvas.height;
  if (this.y > Canvas.height) this.y -= Canvas.height;

  this.displayRadius += (this.radius - this.displayRadius) / 2;

  this.xAcceleration = 0;
  this.yAcceleration = 0;
};

Planet.prototype.attract = function (other, xTile, yTile) {
  var otherX = other.x + xTile * Canvas.width;
  var otherY = other.y + yTile * Canvas.height;

  var distance;
  if (ConstantDistance) distance = 300;
  else
    distance = Math.sqrt(
      Math.pow(otherX - this.x, 2) + Math.pow(otherY - this.y, 2)
    );

  var acceleration =
    (GravitationalConstant * other.mass) / Math.pow(distance, 2);

  if (acceleration > AccelerationLimit) acceleration = AccelerationLimit;

  this.xAcceleration += (acceleration * (otherX - this.x)) / distance;
  this.yAcceleration += (acceleration * (otherY - this.y)) / distance;
};

Planet.prototype.combine = function (other) {
  var distance = Math.sqrt(
    Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2)
  );
  var smallerRadius = Math.min(this.radius, other.radius);
  var largerRadius = Math.max(this.radius, other.radius);

  if (distance + smallerRadius / 2 < largerRadius) {
    var thisProportion = this.mass / (this.mass + other.mass);
    var otherProportion = other.mass / (this.mass + other.mass);

    this.xVelocity =
      this.xVelocity * thisProportion + other.xVelocity * otherProportion;
    this.yVelocity =
      this.yVelocity * thisProportion + other.yVelocity * otherProportion;

    this.x += (other.x - this.x) * otherProportion;
    this.y += (other.y - this.y) * otherProportion;

    this.displayRadius = Math.max(this.displayRadius, other.displayRadius);

    this.mass += other.mass;
    this.radius = Math.sqrt(this.mass);

    return true;
  } else return false;
};

function Step() {
  ClearCanvas();

  for (var i = 0; i < PlanetObjects.length; i++)
    for (var j = 0; j < PlanetObjects.length; j++)
      if (i !== j) {
        PlanetObjects[i].attract(PlanetObjects[j], 0, 0);
        if (WrapAttraction) {
          PlanetObjects[i].attract(PlanetObjects[j], -1, 0);
          PlanetObjects[i].attract(PlanetObjects[j], -1, -1);
          PlanetObjects[i].attract(PlanetObjects[j], 0, -1);
          PlanetObjects[i].attract(PlanetObjects[j], 1, -1);
          PlanetObjects[i].attract(PlanetObjects[j], 1, 0);
          PlanetObjects[i].attract(PlanetObjects[j], 1, 1);
          PlanetObjects[i].attract(PlanetObjects[j], 0, 1);
          PlanetObjects[i].attract(PlanetObjects[j], -1, 1);
        }
      }

  if (CombinePlanets)
    for (var i = 0; i < PlanetObjects.length; i++)
      for (var j = 0; j < PlanetObjects.length; j++)
        if (i < j)
          if (PlanetObjects[i].combine(PlanetObjects[j])) {
            PlanetObjects.splice(j, 1);
            j--;
          }

  for (var i = 0; i < PlanetObjects.length; i++) {
    PlanetObjects[i].draw();
    PlanetObjects[i].step();
  }

  window.setTimeout(Step, 1000 / FPS);
}

function ClearCanvas() {
  Brush.save();
  Brush.setTransform(1, 0, 0, 1, 0, 0);
  Brush.globalAlpha = Fade;
  Brush.fillStyle = "white";
  Brush.fillRect(0, 0, Canvas.width, Canvas.height);
  Brush.restore();
}
