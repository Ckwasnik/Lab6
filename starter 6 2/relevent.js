const fs = require("fs");
const ndjson = require("ndjson");
const { Transform } = require("stream");
const afinn_en = require("./afinn_en.js");

const readStream = fs.createReadStream('Cell_Phones_and_Accessories.ndjson', 'utf-8');
readStream.on('error', (err) => {
    console.error('Read stream error:', err);
});


const stringifyStream = new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
        this.push(JSON.stringify(chunk));
        callback();
    }
});

const filterspam = new Transform({
  objectMode:true,
  transform(chunk, encoding, callback) {
      if (chunk['class'] === 0) {
          this.push(chunk);
      }
      callback();
  } 
})

const checkpositivity = new Transform({
    transform(chunk, encoding, callback) {
        const check = afinn_en;
        let wordscore = 0;
        const words = chunk.reviewText.split(/\s+/);
        words.forEach(word => {
            if (word in check) {
                wordscore += check[word];
            }
        });
        if (wordscore > 0) {
            this.push(chunk);
        }
        callback();
    }
});

const writestream = fs.createWriteStream('scored_data.ndjson');

readStream
    .pipe(stringifyStream)
    .pipe(filterspam)
    .pipe(checkpositivity)
    .pipe(writestream);