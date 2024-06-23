import re

import numpy as np
import pandas as pd


def crear_ensemble_donadas(texte_df: pd.DataFrame, lista_dialectes_df: list[pd.DataFrame]) -> pd.DataFrame:
    """
    Combinar etiquetas e tèxte
    """
    # Concatenar etiquetas manualas e automaticas
    dialectes_df = pd.concat(lista_dialectes_df, axis=0)
    dialectes_df = dialectes_df.drop_duplicates(subset=["Article"])
    dialectes_df = dialectes_df.query(
        'Dialecte not in ["void", "exclure", "desconegut", "vivaroalpenc", "lemosin", "aranés"]'
    )

    # Combunar amb lo tèxte
    df = pd.merge(dialectes_df, texte_df, on="Article")

    # Tirar mots tipics de cada dialècte
    df["Texte"] = df["Texte"].apply(_tirar_mots_dialectes)

    return df


def _tirar_mots_dialectes(texte: str) -> str:
    texte = re.sub("auv[eè]rnh.*[ \.]", "", texte)
    texte = re.sub("francoprovenç.*[ \.]", "", texte)
    texte = re.sub("provenç.*[ \.]", "", texte)
    texte = re.sub("gascon.*[ \.]", "", texte)
    texte = re.sub("lengad.*[ \.]", "", texte)
    texte = re.sub("occit.*[ \.]", "", texte)
    texte = re.sub("bearn.*[ \.]", "", texte)
    texte = re.sub("eusker.*[ \.]", "", texte)
    texte = re.sub("basc.*[ \.]", "", texte)
    texte = re.sub("catal.*[ \.]", "", texte)
    texte = re.sub("piren.*[ \.]", "", texte)
    texte = re.sub("tolon.*[ \.]", "", texte)
    texte = re.sub("espanh.*[ \.]", "", texte)
    texte = re.sub("madrid.*[ \.]", "", texte)
    texte = re.sub("borbon.*[ \.]", "", texte)
    texte = re.sub("guiana.*[ \.]", "", texte)
    texte = re.sub("region.*[ \.]", "", texte)
    texte = re.sub("aragon.*[ \.]", "", texte)
    texte = texte.replace(",", "")
    texte = texte.replace(".", "")
    texte = texte.replace("borgada", "")
    texte = texte.replace("província", "")
    texte = texte.replace("districte", "")
    texte = texte.replace("cantons", "")
    texte = texte.replace("departament", "")
    texte = texte.replace("comuna", "")
    texte = texte.replace("municipi", "")
    texte = texte.replace("francés", "")
    texte = texte.replace("francesa", "")
    texte = texte.replace("lemosin", "")
    texte = texte.replace("aquitània", "")
    texte = texte.replace("district", "")
    texte = re.sub(r"\s{2,}", " ", texte)  # Remplaçar espacis consecutius
    return texte
