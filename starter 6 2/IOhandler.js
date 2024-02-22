/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */
const yauzl = require('yauzl-promise'),
fs = require("fs"),
PNG = require("pngjs").PNG,
path = require("path");
const {pipeline} = require('stream/promises');


/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
async function unzip (pathIn, pathOut) {
  const zip = await yauzl.open(pathIn);
  try {
  for await (const entry of zip) {
    if (entry.filename.endsWith('/')) {
      await fs.promises.mkdir(`${pathOut}/${entry.filename}`);
    } else {
      const readStream = await entry.openReadStream();
      const writeStream = fs.createWriteStream(`${pathOut}/${entry.filename}`);
      await pipeline(readStream, writeStream);
    }
  }
} finally {
  await zip.close();

}
  
};


/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {
  return new Promise((resolve, reject) =>{
    fs.readdir(dir, "utf-8", (err, files) => {
      if (err) {
        reject(err);
      } else {
        const targetFiles = files.filter(file => {
          return path.extname(file).toLowerCase() === ".png";
        });
        resolve(targetFiles);
        console.log(targetFiles)
      }
    });
  });
};

/**
 * 
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = async (pathIn, pathOut) => {
  fs.createReadStream(path.join(__dirname,"unzipped",pathIn))
  .pipe(
    new PNG({
      filterType: 4,
    })
  )
  .on("parsed", function () {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {

        let idx = (this.width * y + x) << 2;
        let gray = (0.2126 * this.data[idx]) + (0.7152 * this.data[idx + 1]) + (0.0722 * this.data[idx + 2])
        this.data[idx] = gray
        this.data[idx + 1] = gray
        this.data[idx + 2] = gray
      }
    }

    this.pack().pipe(fs.createWriteStream(`${pathOut}/${pathIn}`));
  });

};

module.exports = {
  unzip,
  readDir,
  grayScale,
};

//idx = RGB in that order
//need to do math to gray scale it
//(R+G+B)/3