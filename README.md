# Trobalècte

Trobalècte permet de reconéisser los diferents dialèctes occitans amb Processament del Lengatge Natural. Aqueste espleit es util per los lingüistas, los estudiants e quin que siá interessat per la diversitat lingüistica de l'occitan.

## Instalacion

Seguratz-vos d'aver [Miniconda](https://docs.conda.io/en/latest/miniconda.html) installat per l'environament d'execucion.

1. **Crear e activar un environament Conda:**

```bash
conda env create -f ./environment.yml
conda activate trobalecte
```

2. **Installar lo mòdul Python:**

```bash
pip install ./trobalecte
```

3. **Installar las aplicacions web:**

```bash
cd webapps/etiquetatge/ && npm install && cd ../..
cd webapps/classificar/ && npm install && cd ../..
```

## Donadas

### Articles Wikipedia

Per començar, cal telecargar lo _dump_ de Wikipedia en occitan. Aquò se pòt faire en anant sul ligam e en telecargant lo fichièr `wikipedia_oc_all_nopic*.zim`: https://dumps.wikimedia.org/other/kiwix/zim/wikipedia/

```shell
curl -L -o donadas/brut/wikipedia_oc_all_nopic_2024-05.zim https://dumps.wikimedia.org/other/kiwix/zim/wikipedia/wikipedia_oc_all_nopic_2024-05.zim
```

Un còp lo fichièr telecargat, caldrà descomprimir los fichièrs utilizant `zimdump`:

```shell
zimdump dump --dir=donadas/brut/wikipedia ./donadas/brut/wikipedia_oc_all_nopic_2024-05.zim
```

### Etiquetatge

L'etiquetatge consistís a asssociar de paginas Wikipedia amb un dialècte occitan. Se pòt faire de dos manièiras: automàticament e manualment:

L'**etiquetatge manual** se fa amb l'espleit d'etiquetatge. Trobaretz los resultats dins lo fichièr `./donadas/etiquetas/wikipedia_etiquetat_manual.csv`. Per lançar l'otís d'etiquetatge:

```shell
node ./webapps/etiquetatge/servidor.js
```

L'**etiquetatge automàtic** se fa utilizant dels mots típics e únics als dialèctes occitans . Per ejemple la conjugación del vèrb èstre "z-es" permet de saber que se tracta de l'auvèrnhat.
