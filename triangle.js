"use strict";

const TEST = true;
const BUTTON = document.getElementById("button");
const FILEINPUT = document.getElementById("file");
const CSVREADER = new FileReader();
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
