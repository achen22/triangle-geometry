"use strict";

const TEST = true;
const CSVREADER = new FileReader();
const BUTTON = document.getElementById("button");
const FILEINPUT = document.getElementById("file");
/** @type {Triangle[]} */
var triangles = [];

/** Class representing a point in 2D space */
class Point {
  /**
   * Create a point
   * @param {number} x the x coordinate
   * @param {number} y the y coordinate
   * @param {string} label the label for the Point
   */
  constructor(x, y, label = "") {
    this.x = x;
    this.y = y;
    this.label = label;
  }

  get sumOfSquares() {
    return this.x * this.x + this.y * this.y;
  }

  /** @type {number} */
  get distance() { // from origin
    return Math.hypot(this.x, this.y);
  }

  get angle() { // from positive x-axis
    return Math.atan2(this.y, this.x);
  }

  /**
   * Returns a Point representing the given Point's position relative to this Point
   * @param {Point} other the Point to compare
   * @returns {Point} the relative position to this Point
   */
  to(other) {
    return new Point(other.x - this.x, other.y - this.y, this.label + other.label);
  }
}

/** Class representing three Points that form a triangle */
class Triangle {
  /**
   * Create a triangle
   * @param {Point[]} points array containing the three Points
   */
  constructor(...points) {
    this.points = points.slice(0, 3);
  }

  get edges() {
    let copy = this.points.slice();
    let array = [];
    for (let i = 0; i < 3; i++) {
      array.push(copy[1].to(copy[2]));
      copy.push(copy.shift()); // rotate
    }
    return array;
  }

  get angles() {
    let copy = this.points.slice();
    let array = [];
    for (let i = 0; i < 3; i++) {
      array.push(angle(...copy));
      copy.push(copy.shift()); // rotate
    }
    return array;
  }

  get type() {
    let label = "";
    let square_distances = this.edges.map(edge => edge.sumOfSquares);
    if (square_distances.some(d => d == 0)) {
      // some points are the same
      return "degenerate";
    } else if (
      // degenerate if slope is same for any two pairs
      // m = (y1 - y0) / (x1 - x0) = (y2 - y0) / (x2 - x0)
      // (y1 - y0) * (x2 - x0) = (y2 - y0) * (x1 - x0)
      (this.points[1].y - this.points[0].y) * (this.points[2].x - this.points[0].x)
      == (this.points[2].y - this.points[0].y) * (this.points[1].x - this.points[0].x)
    ) {
      // all points lie on the same line
      return "degenerate";
    } else if (square_distances[0] == square_distances[1] && square_distances[0] == square_distances[2]) {
      return "equilateral";
    } else {
      let label = (square_distances[0] == square_distances[1] || square_distances[0] == square_distances[2] || square_distances[1] == square_distances[2])
          ? " isoceles"
          : " scalene";
      
      // diff = c^2 - a^2 - b^2 where c is longest side length
      square_distances.sort((a, b) => a - b);
      let diff = square_distances.pop();
      square_distances.forEach(n => {
        diff -= n;
      });

      if (diff == 0) {
        return "right" + label;
      } else if (diff > 0) {
        return "obtuse" + label;
      } else {
        return "acute" + label;
      }
    }
  }
}

/**
 * Returns the convex angle in radians made by the straight lines connecting 
 * Points `a` to `b` and `a` to `c`
 * @param {Point} a the Point of the angle
 * @param {Point} b the second Point
 * @param {Point} c the third Point
 * @returns {number} the angle in radians at the first Point
 */
function angle(a, b, c) {
  let line_b = a.to(b);
  let line_c = a.to(c);
  // https://stackoverflow.com/questions/1211212/how-to-calculate-an-angle-from-three-points#answer-31334882
  if ((line_b.x == 0 && line_b.y == 0) || (line_c.x == 0 && line_c.y == 0)) {
    // no line segment
    return NaN;
  }
  let angle = line_b.angle - line_c.angle;
  // adjust angle to be between 0 and 2 * Math.PI
  angle = Math.abs(angle);
  // angle > Math.PI if reflex angle (exterior of triangle)
  return angle > Math.PI
      ? 2 * Math.PI - angle
      : angle;
}

/**
 * Prints data about the triangle
 * @param {Triangle} triangle the triangle to describe
 * @returns {string} text about the triangle
 */
function print(triangle) {
  let lines = [];

  // list points
  lines.push(triangle.points.map((point) => `${point.label}(${point.x}, ${point.x})`).join(", "));

  // list lengths
  triangle.edges.forEach(edge => {
    lines.push("Distance between " + edge.label.split("").join(" and ") + " is " + edge.distance);
  });

  // classify triangle
  let line = triangle.type;
  line = (line[0].match(/[aeiou]/))
      ? `This is an ${line} triangle`
      : `This is a ${line} triangle`;
  lines.push(line);
  
  return lines.join("<br>");
}

/**
 * Updates the given d3.Selection to display the triangle
 * @param {d3.Selection} div the d3.Selection
 * @returns {d3.Selection} the updated d3.Selection
 */
function display_triangle(div) {
  // TODO: implement this
  return div;
}

function display_triangles() {
  d3.select("body")
    .selectAll("p")
    .data(triangles)
    .join(
      function (enter) {
        return enter.append("p")
          .html(print);
      },
      function (update) {
        return update
          .html(print);
      },
      function (exit) {
        return exit
          .remove();
      }
    );
}

CSVREADER.onload = function (event) {
  // process the file
  /** @type {string[]} */
  let data = this.result.trim().split(/\n/);
  try {
    triangles = data.map(function (line, i) {
      let values = line.trim().split(",");
      if (values.length < 6) {
        let msg = `Line ${i} contains only ${values.length} items`;
        throw new Error(msg);
      }
      let converted = values.map(function (value) {
        let n = parseFloat(value);
        if (Number.isNaN(n)) {
          throw new Error(`${value} cannot be parsed as float`);
        }
        return n;
      });
      return new Triangle(
        new Point(converted[0], converted[1], "A"),
        new Point(converted[2], converted[3], "B"),
        new Point(converted[4], converted[5], "C")
      );
    });
    display_triangles();
  } catch (error) {
    console.error(error);
    alert("Unable to process file!");
  }
}

BUTTON.onclick = function (event) {
  FILEINPUT.click();
}

FILEINPUT.onchange = function (event) {
  // read the selected file
  CSVREADER.readAsText(this.files[0]);
}

if (TEST) {
  let test;
  // Point.distance
  test = new Point(0, 1).distance;
  console.assert(test == 1, "distance should be 1", test);
  test = new Point(3, 4).distance;
  console.assert(test === 5, "distance should be 5", test);
  test = new Point(12, 5).distance;
  console.assert(test === 13, "distance should be 13", test);

  // Point.angle
  test = new Point(1, 0).angle;
  console.assert(test == 0, "angle should be 0", test);
  test = new Point(0, 1).angle;
  console.assert(test == Math.PI / 2, `angle should be ${Math.PI / 2}`, test);
  test = new Point(1, 1).angle;
  console.assert(test == Math.PI / 4, `angle should be ${Math.PI / 4}`, test);
  test = new Point(1, Math.sqrt(3)).angle;
  console.assert(test == Math.PI / 3, `angle should be ${Math.PI / 3}`, test);

  // angle()
  test = angle(...[[1,2], [1,2], [1,3]].map(p => new Point(...p)));
  console.assert(isNaN(test), "angle should be NaN");
  test = angle(...[[0,1], [1,0], [0,1]].map(p => new Point(...p)));
  console.assert(isNaN(test), "angle should be NaN");
  test = angle(...[[0,0], [1,0], [0,1]].map(p => new Point(...p)));
  console.assert(test == Math.PI / 2, `angle should be ${Math.PI / 2}`, test);
  test = angle(...[[0,1], [1,1], [1,0]].map(p => new Point(...p)));
  console.assert(test == Math.PI / 4, `angle should be ${Math.PI / 4}`, test);
  test = angle(...[[0,Math.sqrt(3)], [1,0],[-1,0]].map(p => new Point(...p)));
  // this test fails due to rounding errors (tested on Firefox)
    console.assert(test == Math.PI / 3, `angle should be ${Math.PI / 3}`, test);
  }
