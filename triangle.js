"use strict";

const TEST = true;
const CSVREADER = new FileReader();
const BUTTON = document.getElementById("button");
const FILEINPUT = document.getElementById("file");
/** @type {Point[][]} */
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
    return new Point(other.x - this.x, other.y - this.y);
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
 * @param {Point[]} triangle the triangle to describe
 * @returns {string} text about the triangle
 */
function print(triangle) {
  // list points
  let lines = [];
  lines.push(triangle.map((point) => `${point.label}(${point.x}, ${point.x})`));

  let square_distances = triangle.map(point => {
    let points = triangle.filter(p => p != point);
    return points[0].to(points[1]).sumOfSquares
  });

  if (square_distances.some(d => d == 0)) {
    // duplicate points
    if (square_distances.every(d => d == 0)) {
      lines.push("All points are the same!");
    } else {
      lines.push("Two points are the same!");
      let squared = square_distances.reduce((a, b) => a + b) / 2; // sum all elements (0 + squared + squared)
      lines.push("Distance between non-identical points is " + Math.sqrt(squared).toFixed(3));
    }
    lines.push("This is a degenerate triangle");

  } else if (square_distances[0] == square_distances[1] && square_distances[0] == square_distances[2]) {
    // equilateral triangle
    lines.push("Distance between any two points is " + Math.sqrt(square_distances[0]).toFixed(3));
    lines.push("This is an equilateral triangle");

  } else if (square_distances[0] == square_distances[1] || square_distances[0] == square_distances[2] || square_distances[1] == square_distances[2]) {
    // isoceles triangle
    let i;
    let others;
    for (i = 0; i < 3; i++) {
      let connected = square_distances.filter(d => d != square_distances[i]);
      if (connected[0] == connected[1]) {
        others = triangle.filter(p => p != triangle[i]);
        lines.push("Distance between " + others.map(p => p.label).join(" and ") + " is " + Math.sqrt(square_distances[i]).toFixed(3));
        others.map(p => p.label).forEach(l => {
          lines.push("Distance between " + [triangle[i].label, l].join(" and ") + " is " + Math.sqrt(connected[0]).toFixed(3));
        });
        break;
      }
    }

    // https://en.wikipedia.org/wiki/Isosceles_triangle
    // only need to check one angle
    let midpoint = new Point((others[0].x + others[1].x) / 2, (others[0].y + others[1].y) / 2);
    if (triangle[i].x == midpoint.x && triangle[i].y == midpoint.y) {
      lines.push("This is a degenerate triangle");
    } else {
      let squared = square_distances[i];
      let diff = squared - square_distances.filter(d => d != squared).reduce((a, b) => a + b);
      if (diff == 0) {
        lines.push("This is a right isoceles triangle")
      } else if (diff > 0) {
        lines.push("This is an obtuse isoceles triangle")
      } else {
        lines.push("This is an acute isoceles triangle");
      }
    }

  } else {
    // scalene triangle
    const largest = Math.max(...square_distances);
    let diff = largest;
    for (let i = 0; i < 3; i++) {
      let labels = triangle.filter(p => p != triangle[i]).map(p => p.label);
      lines.push("Distance between " + labels.join(" and ") + " is " + Math.sqrt(square_distances[i]).toFixed(3));
      if (square_distances[i] != largest) {
        diff -= square_distances[i];
      }
    }

    // degenerate if slope is same for any two pairs
    // m = (y1 - y0) / (x1 - x0) = (y2 - y0) / (x2 - x0)
    // (y1 - y0) * (x2 - x0) = (y2 - y0) * (x1 - x0)
    if (
      (triangle[1].y - triangle[0].y) * (triangle[2].x - triangle[0].x)
          == (triangle[2].y - triangle[0].y) * (triangle[1].x - triangle[0].x)
    ) {
      lines.push("This is a degenerate triangle");
    } else if (diff == 0) {
      lines.push("This is a right scalene triangle")
    } else if (diff > 0) {
      lines.push("This is an obtuse scalene triangle")
    } else {
      lines.push("This is an acute scalene triangle");
    }
  }
  
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
      return [
        new Point(converted[0], converted[1], "A"),
        new Point(converted[2], converted[3], "B"),
        new Point(converted[4], converted[5], "C")
      ];
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
  // this test fails due to rounding errors :(
    console.assert(test == Math.PI / 3, `angle should be ${Math.PI / 3}`, test);
  }
