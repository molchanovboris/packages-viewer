const fs = require("fs");

const writeTextFile = (filePath, data) => {
    fs.writeFile(filePath, data, function(err) {
        if (err) {
            throw err;
        }
        console.log(`${filePath} has been saved`);
    });
};

const readTextFileAsync = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
};

const getCurrentNodeVersion = (command) => {
    const { exec } = require("child_process");

    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            if (stderr) {
                reject(stderr);
            }
            if (stdout.trim()) {
                resolve(stdout.trim());
            }
        });
    });
};

const run = async () => {
    const packageJson = await readTextFileAsync("./package.json");

    const dependencies = packageJson && JSON.parse(packageJson).dependencies;

    if (!dependencies) {
        throw new Error("Cannor read package.json");
    }

    const nodeVersion = await getCurrentNodeVersion("node -v");
    const npmVersion = await getCurrentNodeVersion("npm -v");

    dependencies["nodeVersion"] = nodeVersion;
    dependencies["npmVersion"] = npmVersion;

    const tsFilePath = "./test.ts";
    const tsFileContent = `export const MAIN_DEPENDENCIES = ${JSON.stringify(dependencies, null, 4)};`;
    writeTextFile(tsFilePath, tsFileContent);

    const keyValueArray = Object
        .keys(dependencies)
        .map((key) => {
            return [key, dependencies[key]]
        });

    const csvFilePath = "./test.csv";
    const csvFileContent = keyValueArray
        .map((keyValuePair) => {
            return keyValuePair.join(",");
        })
        .join("\n");
    writeTextFile(csvFilePath, csvFileContent);
};

(async () => await run())();