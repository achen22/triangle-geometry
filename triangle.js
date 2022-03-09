"use strict";

const TEST = true;
const CSVREADER = new FileReader();
const BUTTON = document.getElementById("button");
const FILEINPUT = document.getElementById("file");
/** @type {number[][][]} */
var triangles = [];

/**
 * Returns the square of the distance between two points
 * @param {[number, number]} a the coordinates of the first point
 * @param {[number, number]} b the coordinates of the second point
 * @returns {number} the square of the distance between the two points
 */
 function distance_squared(a, b) {
  let x = b[0] - a[0];
  let y = b[1] - a[1];
  return x * x + y * y;
}

/**
 * Returns the distance between two points
 * @param {[number, number]} a the coordinates of the first point
 * @param {[number, number]} b the coordinates of the second point
 * @returns {number} the distance between the two points
 */
function distance(a, b) {
  return Math.sqrt(distance_squared(a, b));
}

/**
 * Returns the angle in radians at the first point
 * @param {number[]} a the coordinates of the point of the angle
 * @param {number[]} b the coordinates of the second point
 * @param {number[]} c the coordinates of the third point
 * @returns {number} the angle in radians at the first point
 */
function angle(a, b, c) {
  // https://stackoverflow.com/questions/1211212/how-to-calculate-an-angle-from-three-points#answer-31334882
  if (distance(a, b) == 0 || distance(a, c) == 0) {
    // no line segment
    return NaN;
  }
  // atan2(y, x) gives the anti-clockwise angle of vector (x, y) from (1, 0)
  let angle = Math.atan2(b[1] - a[1], b[0] - a[0]) - Math.atan2(c[1] - a[1], c[0] - a[0]);
  // adjust angle to be between 0 and 2 * Math.PI
  angle = Math.abs(angle);
  // angle > Math.PI if reflex angle (exterior of triangle)
  return angle > Math.PI
    ? 2 * Math.PI - angle
    : angle;
}

/**
 * Prints data about the triangle
 * @param {number[][]} triangle the triangle to describe
 * @returns {string} text about the triangle
 */
function print(triangle) {
  const letters = "ABC";
  let lines = [];
  
  // list points
  let line = [];
  for (let i = 0; i < 3; i++) {
    line.push(letters[i] + "(" + triangle[i].join(", ") + ")");
  }
  lines.push(line.join(", "))

  // distances
  /** @type {number[]} */
  let square_distances = [];
  for (let i = 0; i < 3; i++) {
    let points = triangle.filter(p => p != triangle[i]);
    square_distances.push(distance_squared(...points));
  }

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
    let index;
    for (let i = 0; i < 3; i++) {
      let connected = square_distances.filter(p => p != square_distances[i]);
      if (connected[0] == connected[1]) {
        let others = letters.split("").filter(l => l != letters[i]);
        lines.push("Distance between " + others.join(" and ") + " is " + Math.sqrt(square_distances[i]).toFixed(3));
        others.forEach(l => {
          lines.push("Distance between " + [letters[i], l].join(" and ") + " is " + Math.sqrt(connected[0]).toFixed(3));
        });
        index = i;
        break;
      }
    }

    // https://en.wikipedia.org/wiki/Isosceles_triangle
    // only need to check one angle
    let others = triangle.filter(p => p != triangle[index]);
    let midpoint = [(others[0][0] + others[1][0]) / 2, (others[0][1] + others[1][1]) / 2];
    if (triangle[index].every((d, i) => d == midpoint[i])) {
      lines.push("This is a degenerate triangle");
    } else {
      let squared = square_distances[index];
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
    let largest = Math.max(...square_distances);
    let diff = largest;
    for (let i = 0; i < 3; i++) {
      let others = letters.split("").filter(l => l != letters[i]);
      lines.push("Distance between " + others.join(" and ") + " is " + Math.sqrt(square_distances[i]).toFixed(3));
      if (square_distances[i] != largest) {
        diff -= square_distances[i];
      }
    }

    // degenerate if slope is same for any two pairs
    // m = (y1 - y0) / (x1 - x0) = (y2 - y0) / (x2 - x0)
    // (y1 - y0) * (x2 - x0) = (y2 - y0) * (x1 - x0)
    if (
      (triangle[1][1] - triangle[0][1]) * (triangle[2][0] - triangle[0][0])
          == (triangle[2][1] - triangle[0][1]) * (triangle[1][0] - triangle[0][0])
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

function update() {
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
          .remove()
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
        let msg = "Line " + i.toString() + " contains only "
                  + values.length.toString() + " items";
        throw new Error(msg);
      }
      let converted = values.map(function (value) {
        let n = parseFloat(value);
        if (Number.isNaN(n)) {
          throw new Error(value + " cannot be parsed as float");
        }
        return n;
      });
      return [
        [converted[0], converted[1]],
        [converted[2], converted[3]],
        [converted[4], converted[5]]
      ];
    });
    update();
  } catch (error) {
    console.log(error);
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
  // distance()
  test = distance([0, 0], [0, 1]);
  console.assert(test === 1, "distance should be 1", test);
  test = distance([0, 3], [4, 0]);
  console.assert(test === 5, "distance should be 5", test);
  test = distance([-2, 13], [3, 1]);
  console.assert(test === 13, "distance should be 13", test);

  // angle()
  test = angle([1,2], [1,2], [1,3]);
  console.assert(isNaN(test), "angle should be NaN");
  test = angle([0,1], [1,0], [0,1]);
  console.assert(isNaN(test), "angle should be NaN");
  test = angle([0,0], [1,0], [0,1]);
  console.assert(test == Math.PI / 2, "angle should be " + Math.PI / 2, test);
  test = angle([0,1], [1,1], [1,0]);
  console.assert(test == Math.PI / 4, "angle should be " + Math.PI / 4, test);
  test = angle([0,Math.sqrt(3)], [1,0],[-1,0]);
  // this test fails due to rounding errors :(
  console.assert(test == Math.PI / 3, "angle should be " + Math.PI / 3, test);
}
