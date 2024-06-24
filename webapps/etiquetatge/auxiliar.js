
const fs = require('fs');

function cargarConfig() {
    const data = fs.readFileSync(__dirname + '/config.json', 'utf-8');
    const config = JSON.parse(data);
    return config
}

module.exports = { cargarConfig };