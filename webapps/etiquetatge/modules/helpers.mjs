import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

import errors from './errors.mjs'

// Cargar configuracion
function legirConfiguracion() {
    const configPath = process.argv[2];
    const data = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(data);
    return config
}

// Legir totes las paginas de Wikipedia
function legirPaginasTotas(config) {
    return fs.readdirSync(config.input.dossier_articles);
}


// Identificar los fichèrs ja etiquetats
function legirPaginasEtiquetatas(config) {
    const dossierEtiquetas = config.output.dossier_etiquetas;
    const fichiers = fs.readdirSync(dossierEtiquetas).filter(f => path.extname(f) === '.csv');

    const paginas = fichiers.flatMap(f => {
        const camin = path.join(dossierEtiquetas, f);
        const donadas = fs.readFileSync(camin, 'utf-8');
        return donadas
            .split('\n')
            .filter(linha => linha.trim() !== '')
            .map(linha => linha.split(',')[0]);
    });

    return paginas;
}


function legirPaginasFichierSeleccion(config) {
    try {
        let donadas = fs.readFileSync(config.input.fichier_seleccion_articles, "utf-8");
        const linhas = donadas.split("\n").filter(linha => linha.trim() !== "");
        return linhas;
    } catch (error) {
        // TODO: manejar error
        return [];
    }
}

// Tornar paginas
function obtenirPaginaAleatoria(paginasTotas, paginasEtiquetadas) {
    const seleccion = paginasTotas.filter(x => !paginasEtiquetadas.includes(x));
    if (seleccion.length === 0) {
        throw new errors.CapDePaginaError('I a pas de pagina seleccionable!');
    }
    return seleccion[Math.floor(Math.random() * seleccion.length)];
};

function obtenirPaginaFichier(paginasFichierSeleccion, paginasEtiquetadas) {
    const seleccion = paginasFichierSeleccion.filter(x => !paginasEtiquetadas.includes(x));
    if (seleccion.length === 0) {
        throw new errors.CapDePaginaError('I a pas de pagina seleccionable!');
    }
    return seleccion[0];
};

// Legir fichièr e extraire tèxte
function tirarTexteHtml(caminFichier, callback) {
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

// Definir un middleware per manejar errors
function manejarError(res, estatCodificacion, messatge) {
    res.status(estatCodificacion).send(messatge);
}


export default {
    legirConfiguracion, legirPaginasTotas,
    legirPaginasEtiquetatas, legirPaginasFichierSeleccion,
    obtenirPaginaAleatoria, obtenirPaginaFichier,
    tirarTexteHtml,
    manejarError
}