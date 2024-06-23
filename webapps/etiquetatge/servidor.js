const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio')

const app = express();
const port = 3000;

// Global path configurations
const DOSSIER_ARTICLES = './donadas/brut/wikipedia/A';
const FICHIER_ETIQUETAS = './donadas/etiquetas/wikipedia_dialectes_manual.csv';

// Middlewares
app.use(bodyParser.json());
app.use(express.static('./webapps/etiquetatge'));

// Identificer totes los fichièrs
function legirTotesLosFichiers() {
    return fs.readdirSync(DOSSIER_ARTICLES);
}

// Identificar los fichèrs ja etiquetats
function legirFichiersEtiquetat() {
    let donadas = fs.readFileSync(FICHIER_ETIQUETAS, "utf-8");
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
    const caminFichierWiki = DOSSIER_ARTICLES + "/" + nomFichierWiki;

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
    fs.appendFile(FICHIER_ETIQUETAS, linhaCSV, (err) => {
        if (err) {
            return res.status(500).send('Fracàs de salvar las donadas.');
        }
        res.send('Donadas salvadas amb succès.');
    });
    fichiersEtiquetats.push(nomFichierWiki);
});

app.listen(port, () => {
    console.log(`Servidor en execucion a http://localhost:${port}`);
});
