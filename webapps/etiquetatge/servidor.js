const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio')

// Init app
const app = express();

// Cargar configuracion
const config = cargarConfig();

// Middlewares
app.use(bodyParser.json());
app.use(express.static('./webapps/etiquetatge'));

const totesLosFichiers = legirTotesLosFichiers();
let fichiersEtiquetats = legirFichiersEtiquetat();
let fichierSeleccionArticles = legirFichierSeleccionArticles();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fonccions
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Cargar configuracion
function cargarConfig() {
    const data = fs.readFileSync(__dirname + '/config.json', 'utf-8');
    const config = JSON.parse(data);
    return config
}

// Definir un middleware per manejar errors
const manejarError = (res, estatCodificacion, messatge) => {
    res.status(estatCodificacion).send(messatge);
};

// Legir totes los fichièrs de Wikipedia
function legirTotesLosFichiers() {
    return fs.readdirSync(config.input.dossier_articles);
}

// Identificar los fichèrs ja etiquetats
function legirFichiersEtiquetat() {
    let donadas = fs.readFileSync(config.output.fichier_etiquetas, "utf-8");
    const linhas = donadas.split("\n").filter(linha => linha.trim() !== "");
    const fichiers = linhas.map(linha => linha.split(',')[0]);
    return fichiers;
}

function legirFichierSeleccionArticles() {
    try {
        let donadas = fs.readFileSync(config.input.fichier_seleccion_articles, "utf-8");
        const linhas = donadas.split("\n").filter(linha => linha.trim() !== "");
        return linhas;
    } catch (error) {
        return [];
    }
}

// Tornar paginas
function obtenirPaginaAleatoria() {
    const seleccion = totesLosFichiers.filter(x => !fichiersEtiquetats.includes(x));
    if (seleccion.length === 0) {
        throw new Error('I a pas de pagina seleccionable!');
    }
    return seleccion[Math.floor(Math.random() * seleccion.length)];
};

function obtenirPaginaFichier() {
    const seleccion = fichierSeleccionArticles.filter(x => !fichiersEtiquetats.includes(x));
    if (seleccion.length === 0) {
        throw new Error('I a pas de pagina seleccionable!');
    }
    return seleccion[0];
};

// Legir fichièr e extraire tèxte
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Endpoints
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Rota per servir una pagina Wikipedia
app.get('/pagina', (req, res) => {
    debugger;

    let nomFichierWiki = "";
    try {
        if (req.query.tecnicaSeleccionFichier == "aleatori") {
            nomFichierWiki = obtenirPaginaAleatoria();
        } else if (req.query.tecnicaSeleccionFichier == "fichier") {
            nomFichierWiki = obtenirPaginaFichier();
        }
    }
    catch (error) {
        return manejarError(res, 400, error);
    }
    console.log(nomFichierWiki);

    const caminFichierWiki = config.input.dossier_articles + "/" + nomFichierWiki;
    tirarTexteHtml(caminFichierWiki, (error, texte, nomFichier) => {
        if (error) {
            return manejarError(res, 500, 'Fracàs de la lectura del fichièr.');
        }
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// App listen
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(config.parametres.port, () => {
    console.log(`Servidor en execucion a http://localhost:${config.parametres.port}`);
});
