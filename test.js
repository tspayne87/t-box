class Test {
  constructor() {
  }
}

let item = new Test();
let item2 = new Test(...[]);
let arr = [];
let item3 = new Test(...arr);

console.log(item instanceof Test);
console.log(item2 instanceof Test);
console.log(item3 instanceof Test);