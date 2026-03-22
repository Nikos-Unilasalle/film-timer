# 🎞 FilmTimer — Minuteur de développement argentique

**FilmTimer** est une application web progressive conçue pour guider le développement de pellicule photographique argentique, étape par étape, avec précision.

## ✨ Fonctionnalités

- **Séquences personnalisables** — définissez autant de bains que nécessaire (développeur, stop bath, fixateur, lavage…)
- **Présets intégrés** — C-41 Kodak, Colortex C-41, Fomadon LQN/Excel, Rodinal 1+50, Ilford ID-11, HC-110, T-Max
- **Corrections temporelles automatiques** :
  - Compensation de **température** (formule Q10 d'Ilford : `2^(ΔT/10)`)
  - Compensation **d'épuisement du révélateur** (% configurable par pellicule développée)
- **Retournements** — rappels sonores configurables (fréquence, durée, son)
- **12 sons** disponibles : cloche, alarme, bip, ping, bloc bois, doux, double bip, grave, verre, fanfare…
- **Drag & drop** — réordonnez les bains par glisser-déposer
- **Enchaînement automatique** ou manuel entre les bains
- **Fiche mémo imprimable** — tableau récapitulatif propre avec champs manuels (pellicule, ISO, température, résultat)
- **Mode plein écran**
- **100% local** — aucune dépendance externe, aucune donnée envoyée, fonctionne hors-ligne

## 🚀 Utilisation

Aucune installation requise. Ouvrez simplement `index.html` dans votre navigateur, ou servez le dossier localement :

```bash
python3 -m http.server 8787
# puis ouvrez http://localhost:8787
```

## 📁 Structure

```
Timer/
├── index.html   # Interface principale
├── app.js       # Logique : timer, audio, présets, corrections
└── style.css    # Thème sombre, design moderne
```

## 🌡 Formule de correction de température

La correction utilise la méthode **Q10** recommandée par Ilford :

```
facteur = 2^((T_référence - T_réelle) / 10)
```

Exemple : développer à 24°C avec un révélateur prévu pour 20°C → facteur **× 0.76** (24% de temps en moins).

## 🎞 Compensation d'épuisement

Pour chaque pellicule 36 poses déjà développée, le temps est augmenté d'un pourcentage configurable (par défaut 10%) sur les bains marqués "Appliquer corrections".

Exemple : 3 pellicules développées à 10%/unité → **+30%** sur le temps du développeur.

## 📄 Licence

MIT — libre d'utilisation, de modification et de redistribution.
