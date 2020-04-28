let ArgumentParser = require("argparse").ArgumentParser;
let fs = require("fs");

let parser = new ArgumentParser({ version: "0.0.1", addHelp: true, description: "Comandos" });

parser.addArgument(["--geojsonFile"], {});
parser.addArgument(["--lngCols"], {});
parser.addArgument(["--latCols"], {});
parser.addArgument(["--outputFile"], { defaultValue: "C:/temp/output.csv" });
parser.addArgument(["--idAtrib"], {});

const args = parser.parseArgs();

let input_geojson = JSON.parse(fs.readFileSync(args.geojsonFile));
let file = fs.createWriteStream(args.outputFile, { encoding: "utf8" });

let propriedades = Object.keys(input_geojson.features[0].properties)
    .filter((prop) => prop != "ID")
    .join(";");
let coords_cabecalho = "";

let type = input_geojson.features[0].geometry.type;
if (type == "LineString") {
    coords_cabecalho = "LNG_INICIAL;LAT_INICIAL;LNG_FINAL;LAT_FINAL;";
}
if (type == "Point") {
    coords_cabecalho = "LNG;LAT;";
}

let cabecalho = `ID;${coords_cabecalho}${propriedades}\n`;
file.write(cabecalho);

input_geojson.features.forEach((element) => {
    let id = `${element.properties["ID"]};`;
    let coords;
    if (type == "LineString") {
        coords = `${element.geometry.coordinates[0][0]};${element.geometry.coordinates[0][1]};${element.geometry.coordinates[1][0]};${element.geometry.coordinates[1][1]};`;
    } else {
        //TODO: Conferir
        coords = `${element.geometry.coordinates[0]};${element.geometry.coordinates[1]};`;
    }

    delete element.properties.ID;
    let properties = Object.values(element.properties).join(";");

    let line = `${id}${coords.replace(/\./g, ",").toString()}${properties}\n`;
    file.write(line);
});

file.end();
