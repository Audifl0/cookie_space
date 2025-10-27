# Installation sur Ubuntu - Cookie Space Shooter

Guide d'installation détaillé étape par étape pour Ubuntu (testé sur Ubuntu 20.04, 22.04, et 24.04).

## Prérequis Système

- Ubuntu 20.04 ou supérieur
- Connexion Internet
- Au moins 500 Mo d'espace disque libre
- Accès terminal

---

## Étape 1 : Installation de Node.js et npm

Le jeu nécessite Node.js version 18 ou supérieure.

### Option A : Installation via NodeSource (Recommandé)

```bash
# Mettre à jour les paquets système
sudo apt update
sudo apt upgrade -y

# Installer curl si pas déjà installé
sudo apt install -y curl

# Ajouter le dépôt NodeSource pour Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Installer Node.js et npm
sudo apt install -y nodejs

# Vérifier l'installation
node --version    # Devrait afficher v20.x.x
npm --version     # Devrait afficher 10.x.x
```

### Option B : Installation via nvm (Alternative)

```bash
# Installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recharger le terminal
source ~/.bashrc

# Installer Node.js LTS
nvm install --lts

# Vérifier l'installation
node --version
npm --version
```

---

## Étape 2 : Installation de Git (si nécessaire)

```bash
# Vérifier si git est installé
git --version

# Si git n'est pas installé :
sudo apt install -y git

# Configurer git (remplacer par vos informations)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

---

## Étape 3 : Cloner le Projet

```bash
# Naviguer vers le dossier où vous voulez installer le jeu
cd ~

# Cloner le dépôt
git clone https://github.com/votre-username/cookie_space.git

# Ou si vous avez téléchargé une archive ZIP :
# unzip cookie_space.zip
# cd cookie_space
```

---

## Étape 4 : Installation des Dépendances

```bash
# Naviguer dans le dossier du projet
cd cookie_space

# Installer toutes les dépendances npm
npm install

# Cette commande va télécharger et installer :
# - PixiJS (moteur de rendu)
# - Vite (serveur de développement)
# - TypeScript (compilateur)
# - Vitest (tests)
# - Environ 143 packages au total
```

**Note** : L'installation peut prendre 2-5 minutes selon votre connexion Internet.

---

## Étape 5 : Lancer le Jeu

### Mode Développement (Recommandé pour jouer)

```bash
# Lancer le serveur de développement
npm run dev

# Le terminal affichera quelque chose comme :
#   VITE v5.0.8  ready in 423 ms
#   ➜  Local:   http://localhost:3000/
#   ➜  Network: http://192.168.1.x:3000/
```

Le jeu s'ouvre automatiquement dans votre navigateur par défaut à l'adresse `http://localhost:3000`

Si le navigateur ne s'ouvre pas automatiquement :
1. Ouvrez manuellement votre navigateur (Firefox, Chrome, etc.)
2. Allez à l'adresse : `http://localhost:3000`

### Mode Production (Build optimisé)

```bash
# Construire la version optimisée
npm run build

# Prévisualiser le build
npm run preview

# Le jeu sera accessible à http://localhost:4173
```

---

## Étape 6 : Résolution des Problèmes Courants

### Problème : "npm: command not found"

**Solution** :
```bash
# Vérifier si Node.js est installé
which node

# Si vide, réinstaller Node.js (voir Étape 1)
```

### Problème : "Permission denied" lors de npm install

**Solution** :
```bash
# Option 1 : Changer le propriétaire du dossier
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ./cookie_space

# Option 2 : Utiliser nvm au lieu de l'installation système
```

### Problème : Port 3000 déjà utilisé

**Solution** :
```bash
# Trouver le processus utilisant le port 3000
sudo lsof -i :3000

# Tuer le processus (remplacer PID par le numéro affiché)
kill -9 PID

# Ou lancer sur un autre port
npm run dev -- --port 3001
```

### Problème : Erreurs de compilation TypeScript

**Solution** :
Le jeu fonctionne malgré quelques warnings TypeScript. Si cela bloque le lancement :

```bash
# Éditer temporairement tsconfig.json
nano tsconfig.json

# Changer "strict": true en "strict": false
# Sauvegarder (Ctrl+O, Enter, Ctrl+X)

# Relancer
npm run dev
```

### Problème : Le navigateur ne charge pas le jeu

**Solution** :
```bash
# Vider le cache du navigateur
# Firefox : Ctrl+Shift+Delete
# Chrome : Ctrl+Shift+Delete

# Ou utiliser le mode navigation privée
# Firefox : Ctrl+Shift+P
# Chrome : Ctrl+Shift+N
```

### Problème : Pas de son dans le jeu

**Solution** :
1. Vérifier que le son n'est pas coupé dans le navigateur
2. Cliquer une fois dans la fenêtre du jeu (requis par les navigateurs modernes)
3. Vérifier les paramètres audio d'Ubuntu :
```bash
# Ouvrir les paramètres son
gnome-control-center sound
```

---

## Étape 7 : Tester que Tout Fonctionne

### Tests Unitaires

```bash
# Lancer les tests
npm test

# Vous devriez voir :
# ✓ tests/rng.test.ts (4 tests)
# ✓ tests/pool.test.ts (4 tests)
# ✓ tests/spatial.test.ts (5 tests)
# ✓ tests/upgrade.test.ts (5 tests)
# ✓ tests/wave.test.ts (5 tests)
```

### Vérification TypeScript

```bash
# Vérifier les types (optionnel)
npm run typecheck
```

---

## Étape 8 : Jouer au Jeu

Une fois le jeu lancé dans le navigateur :

1. **Menu Principal** : Cliquez sur "Play"
2. **Contrôles** :
   - Déplacement : **WASD** ou **Flèches**
   - Viser : **Souris**
   - Tirer : **Clic gauche**
   - Dash : **Espace**
   - Pause : **Échap**

3. **Objectif** : Survivre aux vagues d'ennemis cookies !

4. **Shop** : Entre chaque vague, améliorez votre vaisseau

5. **Missions** : Consultez les missions dans le menu

---

## Configuration Recommandée pour Ubuntu

### Navigateurs Supportés

- **Firefox** (Recommandé - installé par défaut sur Ubuntu)
- **Chrome / Chromium**
- **Microsoft Edge**

Installation de Chromium si nécessaire :
```bash
sudo apt install -y chromium-browser
```

### Optimisation des Performances

Pour de meilleures performances :

1. **Activer l'accélération matérielle** dans votre navigateur
   - Firefox : about:preferences → "Utiliser l'accélération matérielle"
   - Chrome : chrome://settings → "Système" → "Accélération matérielle"

2. **Fermer les applications lourdes** en arrière-plan

3. **Utiliser une résolution native** (pas de mise à l'échelle)

---

## Désinstallation

Si vous souhaitez désinstaller le jeu :

```bash
# Supprimer le dossier du projet
cd ~
rm -rf cookie_space

# (Optionnel) Désinstaller Node.js
sudo apt remove nodejs npm
sudo apt autoremove

# (Optionnel) Supprimer les caches npm
rm -rf ~/.npm
```

---

## Commandes Utiles

```bash
# Mettre à jour les dépendances
cd ~/cookie_space
npm update

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Voir les logs détaillés en cas de problème
npm run dev --verbose

# Construire pour la production
npm run build

# Lancer les tests en mode watch
npm test -- --watch
```

---

## Support et Aide

### Logs de Débogage

Si vous rencontrez des problèmes :

```bash
# Activer les logs détaillés
DEBUG=* npm run dev

# Ou créer un fichier de log
npm run dev > game.log 2>&1
```

### Vérification Système

```bash
# Vérifier les versions installées
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "Git: $(git --version)"
echo "Ubuntu: $(lsb_release -d)"

# Vérifier l'espace disque
df -h ~

# Vérifier la mémoire disponible
free -h
```

### Communauté

- Consultez le fichier `README.md` pour plus de détails
- Consultez `QUICKSTART.md` pour un démarrage rapide
- Ouvrez une issue sur GitHub si problème persistant

---

## Configuration Avancée (Optionnel)

### Créer un Lanceur de Bureau

Créer un fichier `cookie-space.desktop` :

```bash
cat > ~/.local/share/applications/cookie-space.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Cookie Space Shooter
Comment=A delicious space shoot'em up
Exec=bash -c "cd ~/cookie_space && npm run dev"
Icon=applications-games
Terminal=true
Categories=Game;ArcadeGame;
EOF

# Rendre exécutable
chmod +x ~/.local/share/applications/cookie-space.desktop
```

Le jeu apparaîtra maintenant dans votre menu d'applications Ubuntu.

### Exécution en Arrière-Plan

```bash
# Lancer le serveur en arrière-plan
cd ~/cookie_space
npm run dev &

# Noter le PID affiché, puis :
echo $! > game.pid

# Pour arrêter plus tard :
kill $(cat game.pid)
```

---

## Performance et Optimisation Ubuntu

### Pilotes Graphiques

Pour de meilleures performances WebGL :

```bash
# Vérifier le pilote graphique
glxinfo | grep "OpenGL"

# Installer les pilotes recommandés
sudo ubuntu-drivers autoinstall
```

### Allocation Mémoire Node.js

Si vous avez peu de RAM :

```bash
# Limiter la mémoire utilisée par Node.js
NODE_OPTIONS="--max-old-space-size=512" npm run dev
```

---

## FAQ Ubuntu

**Q : Le jeu lag sur mon vieux PC Ubuntu ?**
A : Réduisez les effets visuels dans les options du jeu, fermez les applications en arrière-plan.

**Q : Puis-je jouer en plein écran ?**
A : Oui, appuyez sur F11 dans votre navigateur pour le mode plein écran.

**Q : Le jeu fonctionne-t-il sur Ubuntu Server (sans GUI) ?**
A : Non, le jeu nécessite un navigateur web avec support WebGL.

**Q : Puis-je héberger le jeu sur mon réseau local ?**
A : Oui ! Le serveur Vite affiche l'adresse réseau. Les autres appareils peuvent s'y connecter.

**Q : Quelle est la configuration minimale ?**
A : Ubuntu 20.04+, 2 Go RAM, CPU dual-core, GPU avec support WebGL.

---

## Résumé en Une Commande

Pour les utilisateurs expérimentés :

```bash
sudo apt update && \
sudo apt install -y curl git && \
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt install -y nodejs && \
cd ~ && \
git clone https://github.com/votre-username/cookie_space.git && \
cd cookie_space && \
npm install && \
npm run dev
```

---

**Bon jeu ! Détruisez tous ces cookies aliens ! 🍪🚀**

Pour toute question, consultez le README.md ou ouvrez une issue sur GitHub.
