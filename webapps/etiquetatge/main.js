import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

import helpers from "./modules/helpers.mjs";

// Init app
const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(express.static('./webapps/etiquetatge'));

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Globals
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Cargar configuracion
const config = helpers.legirConfiguracion();

// Cargar paginas
const paginasTotas = helpers.legirPaginasTotas(config);
let paginasEtiquetadas = helpers.legirPaginasEtiquetatas(config);
let paginasFichierSeleccion = helpers.legirPaginasFichierSeleccion(config);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Endpoints
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Rota per servir una pagina Wikipedia
app.get('/pagina', (req, res) => {
    let nomFichierWiki = "";
    try {
        if (req.query.tecnicaSeleccionPagina == "aleatori") {
            nomFichierWiki = helpers.obtenirPaginaAleatoria(paginasTotas, paginasEtiquetadas);
        } else if (req.query.tecnicaSeleccionPagina == "fichier") {
            nomFichierWiki = helpers.obtenirPaginaFichier(paginasFichierSeleccion, paginasEtiquetadas);
        }
    }
    catch (error) {
        return helpers.manejarError(res, 400, error);
    }
    console.log(nomFichierWiki);

    const caminFichierWiki = config.input.dossier_articles + "/" + nomFichierWiki;
    helpers.tirarTexteHtml(caminFichierWiki, (error, texte, nomFichier) => {
        if (error) {
            return helpers.manejarError(res, 500, 'Fracàs de la lectura del fichièr.');
        }
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('X-Filename', nomFichier);
        res.send(texte);
    });
});

// Seleccion del dialècte e salvar dins un CSV
app.post('/mandar-dialecte', (req, res) => {
    const { nomPagina, dialecte } = req.body;
    const linhaCSV = `${nomPagina},${dialecte}\n`;
    fs.appendFile(config.output.fichier_etiquetas, linhaCSV, (err) => {
        if (err) {
            return helpers.manejarError(res, 500, 'Fracàs de salvar las donadas.');
        }
        res.send('Donadas salvadas amb succès.');
    });
    paginasEtiquetadas.push(nomPagina);
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// App listen
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(config.parametres.port, () => {
    console.log(`Servidor en execucion a http://localhost:${config.parametres.port}`);
});
