const dat = '02/27/2001';

const curr = new Date().getFullYear()
const result = new Date(dat).getFullYear()
console.log(curr - result)