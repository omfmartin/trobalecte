const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio')
const { cargarConfig } = require('./auxiliar.js');

// Init app
const app = express();

// Cargar configuracion
const config = cargarConfig();

// Middlewares
app.use(bodyParser.json());
app.use(express.static('./webapps/etiquetatge'));

// Identificer totes los fichièrs
function legirTotesLosFichiers() {
    return fs.readdirSync(config.input.dossier_articles);
}

// Identificar los fichèrs ja etiquetats
function legirFichiersEtiquetat() {
    let donadas = fs.readFileSync(config.output.fichier_etiquetas, "utf-8");
    const linhas = donadas.split("\n").filter(linha => linha.trim() !== "");
    const fichiersEtiquetats = linhas.map(linha => linha.split(',')[0]);
    return fichiersEtiquetats;
}

const totesLosFichiers = legirTotesLosFichiers();
let fichiersEtiquetats = legirFichiersEtiquetat();

// Definir un middleware per manejar errors
const manejarError = (res, estatCodificacion, messatge) => {
    res.status(estatCodificacion).send(messatge);
};

// Foncion per legir repertòri e tornar fichièr aleatòri
function obtenirFichierAleatori() {
    const seleccion = totesLosFichiers.filter(x => !fichiersEtiquetats.includes(x));
    return seleccion[Math.floor(Math.random() * seleccion.length)];
};

// Foncion per legir fichièr e extrach tèxte
const tirarTexteHtml = (caminFichier, callback) => {
    fs.readFile(caminFichier, 'utf8', (err, donadas) => {
        if (err) return callback(err);
        const $ = cheerio.load(donadas);
        let texte = '';
        $('p').each(function () {
            texte += $(this).text() + '\n';
        });
        callback(null, texte, path.basename(caminFichier));
    });
};

// Rota per servir un fichièr HTML aleatòri coma tèxte simple
app.get('/pagina-aleatoria', (req, res) => {
    const nomFichierWiki = obtenirFichierAleatori();
    const caminFichierWiki = config.input.dossier_articles + "/" + nomFichierWiki;

    tirarTexteHtml(caminFichierWiki, (err, texte, nomFichier) => {
        if (err) return manejarError(res, 500, 'Fracàs de la lectura del fichièr.');

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('X-Filename', nomFichier);
        res.send(texte);
    });
});

// Seleccion del dialècte e salvar dins un CSV
app.post('/mandar-dialecte', (req, res) => {
    const { nomFichierWiki, dialecte } = req.body;
    const linhaCSV = `${nomFichierWiki},${dialecte}\n`;
    fs.appendFile(config.output.fichier_etiquetas, linhaCSV, (err) => {
        if (err) {
            return res.status(500).send('Fracàs de salvar las donadas.');
        }
        res.send('Donadas salvadas amb succès.');
    });
    fichiersEtiquetats.push(nomFichierWiki);
});

app.listen(config.parametres.port, () => {
    console.log(`Servidor en execucion a http://localhost:${config.parametres.port}`);
});
