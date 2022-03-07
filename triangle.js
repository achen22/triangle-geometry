"use strict";

const TEST = true;
const CSVREADER = new FileReader();
const BUTTON = document.getElementById("button");
const FILEINPUT = document.getElementById("file");
/** @type {number[][][]} */
var triangles = [];

/**
 * Returns the distance between two points
 * @param {[number, number]} a the coordinates of the first point
 * @param {[number, number]} b the coordinates of the second point
 * @returns 
 */
function distance(a, b) {
  let x = b[0] - a[0];
  let y = b[1] - a[1];
  return Math.sqrt(x * x + y * y);
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

/**
 * Prints data about the triangle
 * @param {number[][]} triangle the triangle to describe
 * @returns {string} text about the triangle
 */
function print(triangle) {
  const letters = "ABC".split("");
  let lines = [];
  
  // list points
  let line = [];
  for (let i = 0; i < 3; i++) {
    line.push(letters[i] + "(" + triangle[i].join(", ") + ")");
  }
  lines.push(line.join(", "))

  // distances
  for (let i = 0; i < 3; i++) {
    for (let j = i+1; j < 3; j++) {
      lines.push(
        "d(" + letters[i] + letters[j] + ") = " 
            + distance(triangle[i], triangle[j]).toFixed(3)
      );
    }
  }

  return lines.join("<br>");
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
  // distance()
  console.assert(distance([0, 0], [0, 1]) === 1, "distance should be 1");
  console.assert(distance([0, 3], [4, 0]) === 5, "distance should be 5");
  console.assert(distance([-2, 13], [3, 1]) === 13, "distance should be 13");
}
