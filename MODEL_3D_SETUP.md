# Configuration du Modèle 3D ISS

## 📂 Placement du Fichier Modèle

Le fichier `ISS_stationary.glb` doit être placé dans le dossier `public/` de votre projet :

```
public/
├── earth.jpg
└── ISS_stationary.glb  ← Nouveau fichier modèle 3D
```

## 🔧 Ajustements Réalisés

### 1. **Gestion Asynchrone du Chargement**

- Le modèle 3D se charge de manière asynchrone
- Système de fallback vers une sphère en cas d'échec
- Gestion des états de chargement

### 2. **Configuration Centralisée**

```javascript
ISS_MODEL: {
    PATH: '/ISS_stationary.glb',
    SCALE: 0.001,
    ROTATION_SPEED: 0.001,
    INITIAL_ROTATION: { x: Math.PI / 2, y: 0, z: 0 }
}
```

### 3. **Optimisations Performance**

- Nettoyage mémoire approprié pour modèles complexes
- Gestion des textures et matériaux multiples
- Traversée récursive pour disposal

### 4. **Nouvelles Fonctionnalités**

- `updateOrientation()` : Orientation basée sur la vélocité
- `animate()` : Animation subtile de rotation
- `waitForLoad()` : Attendre le chargement du modèle
- `isLoadingModel()` : Vérifier l'état de chargement

### 5. **Amélioration Visuelle**

- Ombres activées sur le modèle
- Émission légère pour meilleure visibilité
- Orientation correcte dans l'espace 3D

## 🎯 Fonctionnalités Ajoutées

### Animation Continue

Le modèle ISS effectue une rotation subtile pour simuler le mouvement orbital.

### Orientation Dynamique

Possibilité d'orienter l'ISS selon sa direction de mouvement (fonctionnalité future).

### Fallback Robuste

Si le modèle 3D ne se charge pas, retour automatique à une sphère rouge.

### Gestion d'Erreurs

- Logs détaillés pour le debug
- Progression de chargement
- Gestion des timeouts réseau

## 🔍 Points de Debug

### Vérifications Importantes

1. **Fichier présent** : `public/ISS_stationary.glb` existe
2. **Console logs** : Messages de chargement/erreurs
3. **Fallback** : Sphère rouge si échec de chargement
4. **Performance** : FPS stable avec le modèle 3D

### Commandes Debug (Console Browser)

```javascript
// Vérifier l'état du marqueur
window.issTrackerApp.issMarker.isLoadingModel();

// Attendre le chargement
await window.issTrackerApp.issMarker.waitForLoad();

// Vérifier la présence du mesh
console.log(window.issTrackerApp.issMarker.getMesh());
```

## 🚀 Prochaines Améliorations

1. **Multiple LOD** : Différents niveaux de détail selon la distance
2. **Animations complexes** : Panneaux solaires rotatifs
3. **Particules** : Traînée lumineuse de l'ISS
4. **Textures** : Éclairage dynamique selon l'ombre terrestre
