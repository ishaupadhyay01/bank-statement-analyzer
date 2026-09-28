import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

const data = await pdf(fs.readFileSync(process.argv[2]));
console.log(data.text);