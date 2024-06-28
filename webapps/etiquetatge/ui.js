// Cargar tota la pagina
async function cargar() {
    seleccionarPaginaWikipedia();
    apondreBotonsRadio();
}

// Selecionar pagina
async function seleccionarPaginaWikipedia() {

    tecnicaSeleccionPagina = document.querySelector('#tecnicaSeleccionPagina').value;

    let text = '';
    let nomFichierWiki = '';
    try {
        response = await fetch(`/pagina?tecnicaSeleccionPagina=${tecnicaSeleccionPagina}`);
        text = await response.text();
        nomFichierWiki = response["headers"].get("x-filename");
    } catch (error) {
        console.error(error);
    }

    document.getElementById('contengutWiki').innerHTML = text;
    document.getElementById("nomFichierWiki").innerHTML = `<a href="https://oc.wikipedia.org/wiki/${nomFichierWiki}">${nomFichierWiki}</a>`;
    document.querySelector('input[name="nomFichierWiki"]').value = nomFichierWiki;
}

// Apondre botons radiò
async function apondreBotonsRadio() {
    response = await fetch('./config.json');
    const data = await response.json();
    const container = document.getElementById('dialectOptions');
    data.etiquetas.forEach(dialect => {
        const label = document.createElement('label');
        label.htmlFor = dialect.id;
        label.textContent = dialect.name;

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = dialect.id;
        radio.name = 'dialecte';
        radio.value = dialect.id;

        container.appendChild(radio);
        container.appendChild(label);
        container.appendChild(document.createElement('br'));
    });
}


function mandarDialecte() {
    const nomFichierWiki = document.querySelector('input[name="nomFichierWiki"]').value;
    const dialecte = document.querySelector('input[name="dialecte"]:checked').value;
    fetch('/mandar-dialecte', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nomFichierWiki, dialecte }),
    })
        .then(responsa => responsa.text())
        .then(resultat => {
            console.log(resultat);
            seleccionarPaginaWikipedia();
        })
        .catch(error => console.error('Fracàs del mandadís del dialècte:', error));
}
