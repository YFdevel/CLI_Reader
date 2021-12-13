#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const inquirer = require("inquirer");
const colors = require("colors");


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const request = (str) => {
    return new Promise((resolve) => rl.question(str, answer => resolve(answer)))
}

const isFile = fileName => {
    return fs.lstatSync(fileName).isFile();
}

// функция чтения файла
const reader = (inputedPath, query) => {
    const readFile = readline.createInterface({
        input: fs.createReadStream(inputedPath, "utf-8"),
        output: process.stdout,
        terminal: false
    });
    readFile.on('line', (line) => {
        if (query) {
            const regexp = new RegExp(`${query}`, 'giu')
            console.log(line.replace(regexp, colors.red(query.toUpperCase())));
        } else {
            console.log(line);
        }
    })
    readFile.on('close', () => {
        readFile.close();
        process.exit(0);

    })
}

//основная функция - точка входа
(async () => {
    try {
        let inputedPath = await request("Please enter the path to the directory or . to get the current directory: ");
        if (!inputedPath) {
            throw new Error("Enter directory or file name");
        }
        let query = await request("Please enter your search query: ");
        if (isFile(inputedPath)) {
            await reader(inputedPath, query);
            rl.close();
        } else {
            let currentDirectory = process.cwd();

            if (inputedPath === ".") {
                inputedPath = currentDirectory;
            }
            let listDir = fs.readdirSync(inputedPath);
            prompt(inputedPath, listDir, query);
        }
    }catch(err){
        console.error(err)
        process.exit(1);
    }
})();

// проваливаемся в директории
const prompt = (inputedPath, listDir, query) => {
    inquirer.prompt([{
        name: "fileName",
        type: "list",
        message: "Choose file:",
        choices: listDir,
    }])
        .then((answer) => {
            let filePath = path.join(inputedPath, answer.fileName);
            if (isFile(filePath)) {
                reader(filePath, query);
                rl.close();
            } else {
                inputedPath = filePath;
                listDir = fs.readdirSync(filePath);
                prompt(inputedPath, listDir,query);
            }
        }).catch((err) => {
        if (err) {
            console.error(err)
            process.exit(1);
        }
    })
}



