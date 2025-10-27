# Guide de Dépannage - Cookie Space Shooter 🔧

## Problème : "Loading Cookie Space..." en boucle

**✅ RÉSOLU** - Les corrections ont été appliquées dans le dernier commit.

### Ce qui a été corrigé :

1. **Erreurs TypeScript** : Hiérarchie Enemy/Boss corrigée
2. **Compatibilité PixiJS v7** : API canvas/view gérée correctement
3. **Méthodes manquantes** : SaveSystem.setOwnedUpgrades ajoutée
4. **Gestion d'erreurs** : Affichage d'erreurs utilisateur dans main.ts

---

## Vérification de l'Installation

### 1. Vérifier que le Serveur Tourne

```bash
cd ~/cookie_space

# Lancer le serveur de développement
npm run dev
```

**Vous devriez voir** :
```
VITE v5.x.x  ready in 283 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Note** : L'erreur `spawn xdg-open ENOENT` est **normale** sur les systèmes sans GUI - ignorez-la.

### 2. Ouvrir le Jeu dans le Navigateur

```bash
# Depuis Ubuntu avec GUI :
firefox http://localhost:3000

# Ou :
google-chrome http://localhost:3000

# Ou simplement ouvrir Firefox et aller à :
# http://localhost:3000
```

### 3. Vérifier que le Jeu Charge

**Comportement attendu** :
1. ✅ L'écran "Loading Cookie Space..." apparaît **brièvement** (< 1 seconde)
2. ✅ Le menu principal s'affiche avec le titre et le bouton "Play"
3. ✅ Vous pouvez cliquer sur "Play" et commencer

**Si l'écran reste bloqué** sur "Loading..." :
- Ouvrez la console du navigateur (F12)
- Cherchez les erreurs en rouge

---

## Diagnostic des Erreurs

### Ouvrir la Console du Navigateur

**Firefox** : `F12` ou `Ctrl+Shift+K`
**Chrome** : `F12` ou `Ctrl+Shift+J`

### Erreurs Communes et Solutions

#### 1. "Cannot find module" ou erreur d'import

```
✗ Failed to load module
✗ Cannot find module './data/enemies.json'
```

**Solution** :
```bash
# Vérifier que tous les fichiers sont présents
ls -la src/data/

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

#### 2. "WebGL not supported"

```
WebGL: CONTEXT_LOST_WEBGL
```

**Solution** :
```bash
# Vérifier le support WebGL
firefox http://webglreport.com

# Activer l'accélération matérielle dans Firefox :
# about:preferences > "Utiliser l'accélération matérielle"

# Installer les pilotes graphiques :
sudo ubuntu-drivers autoinstall
sudo reboot
```

#### 3. "Application.init is not a function"

**Solution** : Déjà corrigée dans le dernier commit. Si vous voyez encore cette erreur :

```bash
# Tirer les dernières modifications
git pull origin claude/session-011CUYL9XqQfGBDVtUwzfGDw

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

#### 4. Erreurs dans les fichiers TypeScript

```
Type 'Boss' is not assignable to type 'Enemy'
```

**Solution** : Déjà corrigée. Assurez-vous d'avoir la dernière version :

```bash
git log -1 --oneline
# Devrait afficher : "fix: Correct TypeScript errors..."

# Si ce n'est pas le cas :
git pull
```

---

## Commandes de Dépannage Rapide

### Redémarrer le Serveur

```bash
# Arrêter le serveur actuel (Ctrl+C dans le terminal)

# Relancer
npm run dev
```

### Nettoyer et Réinstaller

```bash
# Arrêter le serveur d'abord (Ctrl+C)

# Supprimer le cache
rm -rf node_modules package-lock.json dist .vite

# Réinstaller
npm install

# Relancer
npm run dev
```

### Vider le Cache du Navigateur

**Firefox** :
1. `Ctrl+Shift+Delete`
2. Cocher "Cache"
3. Cliquer "Effacer maintenant"
4. Recharger la page : `Ctrl+F5`

**Chrome** :
1. `Ctrl+Shift+Delete`
2. Cocher "Images et fichiers en cache"
3. Cliquer "Effacer les données"
4. Recharger : `Ctrl+F5`

---

## Tests de Diagnostic

### Test 1 : Serveur Vite

```bash
cd ~/cookie_space
npm run dev

# Si vous voyez "ready in XXX ms" ➜ ✅ OK
# Si erreur "EADDRINUSE" ➜ Port 3000 déjà utilisé
```

**Solution port occupé** :
```bash
# Trouver le processus
sudo lsof -i :3000

# Tuer le processus (remplacer PID)
kill -9 PID

# Ou utiliser un autre port
npm run dev -- --port 3001
```

### Test 2 : Fichiers JSON

```bash
# Vérifier que les fichiers de données existent
cat src/data/enemies.json | head -5

# Devrait afficher du JSON valide
```

### Test 3 : TypeScript

```bash
# Vérifier la compilation
npm run typecheck 2>&1 | head -20

# Devrait compiler sans erreurs critiques
# (quelques warnings sont OK)
```

---

## Vérification Complète

### Script de Diagnostic Complet

Copiez et exécutez ce script :

```bash
#!/bin/bash

echo "=== Diagnostic Cookie Space Shooter ==="

echo -e "\n1. Vérification Node.js:"
node --version
npm --version

echo -e "\n2. Vérification du projet:"
ls -la package.json src/main.ts src/data/enemies.json

echo -e "\n3. Vérification des dépendances:"
npm list pixi.js vite typescript 2>/dev/null | head -5

echo -e "\n4. Test de compilation rapide:"
npx tsc --noEmit --skipLibCheck 2>&1 | head -10

echo -e "\n5. Ports utilisés:"
sudo lsof -i :3000 2>/dev/null || echo "Port 3000 libre"

echo -e "\n=== Fin du diagnostic ==="
```

**Sauvegardez** dans `diagnostic.sh`, puis :
```bash
chmod +x diagnostic.sh
./diagnostic.sh
```

---

## Si le Problème Persiste

### 1. Vérifier les Logs Détaillés

```bash
# Lancer avec logs verbeux
DEBUG=* npm run dev 2>&1 | tee debug.log

# Puis consultez debug.log
less debug.log
```

### 2. Tester avec un Build de Production

```bash
# Compiler pour production
npm run build

# Si succès, prévisualiser
npm run preview

# Ouvrir http://localhost:4173
```

### 3. Console du Navigateur - Recherche d'Erreurs

Dans la console F12, cherchez :
- Messages en **rouge** = erreurs critiques
- Messages en **jaune** = warnings (généralement OK)
- `Failed to load` = fichier manquant
- `undefined` ou `null` = problème de données

### 4. Informations Système

```bash
# Version Ubuntu
lsb_release -a

# Informations graphiques
glxinfo | grep "OpenGL version"

# Mémoire disponible
free -h

# Espace disque
df -h ~
```

---

## Solutions Avancées

### Forcer la Réinitialisation Complète

```bash
# ATTENTION : Ceci supprime TOUTES les modifications locales

cd ~/cookie_space

# Sauvegarder vos modifications si nécessaire
git stash

# Récupérer la version propre
git fetch origin
git reset --hard origin/claude/session-011CUYL9XqQfGBDVtUwzfGDw

# Nettoyer tout
rm -rf node_modules package-lock.json dist .vite

# Réinstaller
npm install

# Tester
npm run dev
```

### Changer le Port

Si le port 3000 cause des problèmes :

```bash
# Éditer vite.config.ts
nano vite.config.ts

# Changer la ligne :
# port: 3000,
# en
# port: 5173,

# Sauvegarder et relancer
npm run dev
```

### Mode Sans Erreurs TypeScript

Si TypeScript bloque tout :

```bash
# Éditer tsconfig.json temporairement
nano tsconfig.json

# Changer :
# "strict": true
# en
# "strict": false

# Ajouter :
# "skipLibCheck": true

# Relancer
npm run dev
```

---

## Vérifier que Tout Fonctionne

### Checklist Finale

- [ ] `npm run dev` démarre sans erreur fatale
- [ ] Le navigateur affiche http://localhost:3000
- [ ] L'écran "Loading..." disparaît rapidement
- [ ] Le menu principal s'affiche
- [ ] Le bouton "Play" est cliquable
- [ ] Le jeu démarre (vaisseau visible, étoiles en arrière-plan)
- [ ] Le HUD affiche Gold, Wave, HP
- [ ] Déplacement avec WASD fonctionne
- [ ] Tir avec clic souris fonctionne

**Si tous les points sont cochés : ✅ Le jeu fonctionne !**

---

## Contacter le Support

Si le problème persiste après avoir essayé toutes ces solutions :

1. **Collectez les informations** :
   ```bash
   echo "=== System Info ===" > support-info.txt
   lsb_release -a >> support-info.txt
   node --version >> support-info.txt
   npm --version >> support-info.txt
   echo -e "\n=== Git Log ===" >> support-info.txt
   git log -1 >> support-info.txt
   echo -e "\n=== Package.json ===" >> support-info.txt
   cat package.json >> support-info.txt
   ```

2. **Capturez l'erreur** :
   - Ouvrez F12 dans le navigateur
   - Faites une capture d'écran des erreurs
   - Copiez le texte des erreurs

3. **Logs du serveur** :
   ```bash
   npm run dev > server.log 2>&1
   # Laissez tourner quelques secondes
   # Ctrl+C pour arrêter
   cat server.log
   ```

4. **Ouvrez une issue** sur GitHub avec :
   - Le fichier `support-info.txt`
   - Les captures d'écran des erreurs
   - Le contenu de `server.log`

---

## FAQ Dépannage

**Q : Le serveur démarre mais la page est blanche ?**
R : Vérifiez la console F12, probablement une erreur JavaScript.

**Q : "EADDRINUSE: address already in use" ?**
R : Le port 3000 est déjà utilisé. Utilisez `--port 3001` ou tuez le processus.

**Q : Le jeu est très lent / FPS bas ?**
R : Activez l'accélération matérielle dans le navigateur, fermez les autres applications.

**Q : Pas de son ?**
R : Cliquez dans la fenêtre du jeu (requis par les navigateurs modernes).

**Q : Les contrôles ne fonctionnent pas ?**
R : Vérifiez que la fenêtre du jeu est active (cliquez dedans).

**Q : Erreur "Cannot read property of undefined" ?**
R : Fichier de données manquant ou mal formaté. Vérifiez `src/data/*.json`.

---

## Commande Ultra-Rapide de Réparation

Si vous voulez tout réparer d'un coup :

```bash
cd ~/cookie_space && \
git pull && \
rm -rf node_modules package-lock.json dist .vite && \
npm install && \
echo "✅ Réparation terminée ! Lancez : npm run dev"
```

---

**Bon jeu ! 🍪🚀**

Si après avoir suivi ce guide le jeu ne fonctionne toujours pas, ouvrez une issue sur GitHub avec tous les détails.
