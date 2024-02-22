const path = require("path");
/*
 
Project: Milestone 1
File Name: main.js
Description:
*
Created Date:
Author:
**/

const IOhandler = require("./IOhandler");
const { pipeline } = require("stream");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");


IOhandler.readDir(pathUnzipped)
.then(
    files => {
        files.forEach(file => {
            IOhandler.grayScale(file,pathProcessed)        
        });
    }
)
