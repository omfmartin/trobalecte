async function cargarPagina() {
    // Selecionar pagina
    responsa = await fetch('/pagina-aleatoria')
        .catch(error => console.error('Fracàs de la lectura del fichièr HTML:', error));

    document.getElementById('contengutWiki').innerHTML = await responsa.text();

    const nomFichierWiki = await responsa["headers"].get("x-filename");
    document.getElementById("nomFichierWiki").innerHTML = 'Titre: ' + nomFichierWiki;
    document.querySelector('input[name="nomFichierWiki"]').value = nomFichierWiki;

    // Apondre botons radiò
    const response = await fetch('./etiquetas.json');
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
            cargarPagina();
        })
        .catch(error => console.error('Fracàs del mandadís del dialècte:', error));
}