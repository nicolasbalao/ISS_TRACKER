# ISS Tracker 3D - Version Refactorisée

Une application web moderne pour suivre la Station Spatiale Internationale (ISS) en temps réel dans un environnement 3D interactif.

## 🚀 Fonctionnalités

- **Visualisation 3D** : Affichage interactif de la Terre avec la position de l'ISS
- **Temps réel** : Mise à jour automatique de la position ISS toutes les 5 secondes
- **Interface moderne** : Design responsive avec animations fluides
- **Contrôles intuitifs** : Rotation automatique ou manuelle de la caméra
- **Accessibilité** : Support des préférences utilisateur et navigation au clavier

## 🏗️ Architecture Clean Code

### Structure du Projet

```
src/
├── classes/              # Classes métier modulaires
│   ├── ISSPositionService.js    # Service de récupération des données ISS
│   ├── ISSMarker.js            # Gestion du marqueur ISS en 3D
│   ├── SceneManager.js         # Gestionnaire de la scène 3D
│   ├── UIManager.js            # Gestionnaire de l'interface utilisateur
│   └── MathUtils.js            # Utilitaires mathématiques
├── config/              # Configuration centralisée
│   └── config.js             # Constantes et configuration
├── main.js              # Point d'entrée principal
└── style.css            # Styles CSS modernes
```

### Principes Clean Code Appliqués

#### 1. **Séparation des Responsabilités (SRP)**

- **ISSPositionService** : Responsable uniquement de la récupération des données API
- **SceneManager** : Gère exclusivement la scène 3D et le rendu
- **UIManager** : S'occupe uniquement de l'interface utilisateur
- **ISSMarker** : Représente et gère le marqueur ISS
- **MathUtils** : Fonctions utilitaires mathématiques réutilisables

#### 2. **Inversion de Dépendance (DIP)**

- Les classes de haut niveau ne dépendent pas des détails d'implémentation
- Configuration centralisée dans `config.js`
- Injection de dépendances via les constructeurs

#### 3. **Ouvert/Fermé (OCP)**

- Classes extensibles sans modification du code existant
- Utilisation de callbacks et d'événements pour la communication
- Interfaces flexibles pour l'ajout de nouvelles fonctionnalités

#### 4. **Principe de Responsabilité Unique**

- Chaque méthode a une responsabilité claire et unique
- Nommage explicite des fonctions et variables
- Fonctions courtes et focalisées

### Classes Principales

#### 🛰️ **ISSPositionService**

```javascript
// Responsable de la récupération des données ISS
-fetchCurrentPosition() - // Récupère la position actuelle
  startPolling() - // Démarre la surveillance périodique
  addPositionListener(); // Ajoute un écouteur d'événements
```

#### 🌍 **SceneManager**

```javascript
// Gère la scène 3D et le rendu
-initialize() - // Initialise la scène 3D
  startAnimation() - // Démarre la boucle d'animation
  setRotationEnabled(); // Active/désactive la rotation
```

#### 📍 **ISSMarker**

```javascript
// Représente le marqueur ISS dans la scène
-updatePosition() - // Met à jour la position 3D
  setVisible() - // Contrôle la visibilité
  updateColor(); // Change la couleur du marqueur
```

#### 🖥️ **UIManager**

```javascript
// Gère l'interface utilisateur
-updatePositionDisplay() - // Affiche les coordonnées
  showStatus() - // Affiche les messages de statut
  on(event, callback); // Système d'événements
```

## 🔧 Configuration

Toute la configuration est centralisée dans `src/config/config.js` :

```javascript
export const CONFIG = {
  API: {
    ISS_POSITION_URL: "http://api.open-notify.org/iss-now.json",
    POLLING_INTERVAL: 5000,
  },
  SCENE: {
    CAMERA_FOV: 45,
    EARTH_RADIUS: 1,
    ISS_ORBIT_HEIGHT: 1.05,
  },
  // ... autres configurations
};
```

## 🎨 Améliorations Interface

### Design Moderne

- **Palette de couleurs** : Thème spatial avec dégradés
- **Typographie** : Police Space Grotesk pour un look futuriste
- **Animations** : Transitions fluides et feedback visuel
- **Responsive** : Adaptation mobile et tablette

### Composants UI

- **Panneau de contrôles** : Toggle moderne pour la rotation
- **Panneau d'informations** : Affichage des coordonnées en temps réel
- **Indicateurs de statut** : Messages colorés avec auto-masquage
- **Overlay de chargement** : Spinner et messages informatifs

### Accessibilité

- Support des préférences `prefers-reduced-motion`
- Navigation au clavier
- Contraste élevé
- Textes alt et descriptions

## 🚀 Utilisation

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

### Build Production

```bash
npm run build
```

### Aperçu

```bash
npm run preview
```

## 🔄 Cycle de Vie de l'Application

1. **Initialisation** (`main.js`)

   - Création des instances des classes
   - Configuration des écouteurs d'événements
   - Démarrage des services

2. **Boucle Principale**

   - Récupération périodique des données ISS
   - Mise à jour de la position 3D
   - Rendu de la scène
   - Mise à jour de l'interface

3. **Gestion des Événements**
   - Interactions utilisateur (rotation, zoom)
   - Redimensionnement de fenêtre
   - Gestion des erreurs réseau

## 🧪 Points d'Extension Futurs

Grâce à l'architecture modulaire, il est facile d'ajouter :

- **Historique des trajectoires** : Nouvelle classe `ISSTrajectory`
- **Prédictions d'orbite** : Service `OrbitPredictor`
- **Modes de caméra** : Extension de `SceneManager`
- **Thèmes visuels** : Configuration dynamique des couleurs
- **Export de données** : Service `DataExporter`

## 📚 Technologies Utilisées

- **Three.js** : Rendu 3D et WebGL
- **ES6+ Modules** : Architecture modulaire
- **CSS3** : Animations et design moderne
- **Web APIs** : Fetch, RequestAnimationFrame
- **Vite** : Build tool moderne

## 🎯 Bonnes Pratiques Implémentées

- ✅ **Naming conventions** : Noms explicites et cohérents
- ✅ **Error handling** : Gestion robuste des erreurs
- ✅ **Documentation** : JSDoc pour toutes les méthodes
- ✅ **Performance** : Optimisations mobile et disposal correct
- ✅ **Maintainability** : Code modulaire et testé
- ✅ **Scalability** : Architecture extensible

Cette refactorisation transforme le code procédural initial en une architecture orientée objet claire, maintenable et extensible, suivant les principes SOLID et les meilleures pratiques du développement moderne.
