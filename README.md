# FitCoach 💪

Une application personnelle de coaching sportif professionnel propulsée par l'IA.

## 🌟 Fonctionnalités

- ✅ **Authentification sécurisée** : Login/Register avec JWT et bcrypt
- 🤖 **Séances générées par IA** : Programmes d'entraînement personnalisés via OpenAI GPT-4
- 👤 **Profil utilisateur** : Gestion de profil et suivi des performances
- 📊 **Historique des séances** : Consultez toutes vos séances précédentes
- 📸 **Upload de photos** : Ajoutez des photos pour un coaching plus personnalisé
- 🎨 **UI/UX moderne** : Interface sombre élégante et intuitive
- 🔒 **Sécurisé** : Protection des routes API et stockage sécurisé des tokens

## 🏗️ Architecture

```
FitCoach/
├── backend/              # Serveur Node.js Express
│   ├── server.js        # Point d'entrée du serveur
│   ├── uploads/         # Stockage des photos
│   └── .env             # Variables d'environnement
│
├── frontend/            # Application React Native Expo
│   ├── screens/         # Écrans de l'application
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ProfileScreen.js
│   │   └── WorkoutResultScreen.js
│   ├── contexts/        # Contexts React
│   │   └── AuthContext.js
│   ├── components/      # Composants réutilisables
│   │   ├── Toast.js
│   │   └── LoadingOverlay.js
│   ├── config.js        # Configuration API
│   └── App.js           # Point d'entrée de l'app
│
└── README.md
```

## 🚀 Installation

### Prérequis

- Node.js >= 16
- MongoDB (connexion à 192.168.1.72:27017)
- Expo CLI
- Clé API OpenAI

### 1. Configuration du Backend

```bash
cd backend

# Les dépendances sont déjà installées
# Configurer les variables d'environnement dans .env
```

**Fichier `.env` :**
```env
MONGODB_URI=mongodb://kaizen971:secret@192.168.1.72:27017/
OPENAI_API_KEY=votre_clé_api_openai_ici
PORT=3001
JWT_SECRET=fitcoach_secret_key_change_in_production_2024
```

### 2. Configuration du Frontend

```bash
cd frontend

# Les dépendances sont déjà installées
# Vérifier la configuration API dans config.js
```

**Fichier `config.js` :**
```javascript
export const API_BASE_URL = 'https://mabouya.servegame.com/FitCoach/FitCoach';
```

### 3. Configuration Caddy

Ajouter cette configuration dans `/home/cheetoh/postiz-app/Caddyfile` :

```caddy
mabouya.servegame.com {
  handle_path /FitCoach* {
    reverse_proxy 192.168.1.72:3001
  }

  # ... autres configurations
}
```

Redémarrer Caddy après modification :
```bash
sudo systemctl restart caddy
```

## 🎮 Utilisation

### Démarrer le Backend

```bash
cd /home/cheetoh/pi-agent/repo/FitCoach/backend
npm start
```

Le serveur démarre sur `http://localhost:3001`

### Démarrer le Frontend

```bash
cd frontend
npm start
```

Scannez le QR code avec l'application Expo Go sur votre téléphone.

## 📱 Écrans de l'Application

### 1. **Login / Register**
- Authentification sécurisée avec email/mot de passe
- Validation des formulaires
- Gestion des erreurs avec messages clairs

### 2. **Home (Nouvelle Séance)**
- Sélection de la morphologie (Ectomorphe, Mésomorphe, Endomorphe)
- Saisie de la taille et du poids
- Upload optionnel d'une photo
- Génération de séance personnalisée

### 3. **Résultat de Séance**
- Plan d'entraînement détaillé
- Échauffement, exercices principaux, retour au calme
- Séries, répétitions, temps de repos
- Conseils personnalisés
- Estimation des calories brûlées

### 4. **Profil & Historique**
- Informations utilisateur
- Statistiques (nombre de séances, calories totales)
- Historique complet des séances
- Consultation des séances passées
- Déconnexion

## 🔐 Sécurité

- **Mots de passe hashés** avec bcrypt (10 rounds)
- **Tokens JWT** avec expiration de 30 jours
- **Routes API protégées** avec middleware d'authentification
- **Stockage sécurisé** des tokens avec AsyncStorage
- **Validation des données** côté backend et frontend

## 🛠️ Technologies Utilisées

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Bcrypt.js
- OpenAI API (GPT-4)
- Multer (upload de fichiers)

### Frontend
- React Native + Expo
- React Navigation
- AsyncStorage
- Axios
- Expo Image Picker

## 🎨 Design

- **Thème sombre** élégant (#0A0E27, #1A1F3A)
- **Couleur primaire** bleue (#4C6FFF)
- **Typographie** moderne et lisible
- **Feedback visuel** avec loaders et animations
- **Responsive** et optimisé mobile

## 📡 API Endpoints

### Publics
- `POST /FitCoach/register` - Créer un compte
- `POST /FitCoach/login` - Se connecter
- `GET /FitCoach/health` - Vérifier le statut de l'API

### Protégés (nécessitent un token JWT)
- `GET /FitCoach/profile` - Récupérer le profil
- `PUT /FitCoach/profile` - Mettre à jour le profil
- `POST /FitCoach/workout` - Générer une séance
- `GET /FitCoach/workout/history` - Historique des séances
- `GET /FitCoach/workout/:id` - Détails d'une séance

## 🐛 Résolution de Problèmes

### Le backend ne démarre pas
- Vérifier que MongoDB est accessible
- Vérifier les variables d'environnement dans `.env`
- Vérifier que le port 3001 est disponible

### Erreur de connexion depuis le frontend
- Vérifier que Caddy est configuré et redémarré
- Vérifier l'URL dans `frontend/config.js`
- Vérifier que le backend est démarré

### Erreur OpenAI
- Vérifier que la clé API est valide dans `.env`
- Vérifier les quotas de l'API OpenAI
- Le fallback s'active automatiquement en cas d'erreur

## 📄 Licence

Projet personnel - Usage privé

## 👨‍💻 Auteur

Développé avec ❤️ pour le coaching sportif personnalisé

---

**Note** : Cette application utilise OpenAI GPT-4 pour générer des programmes d'entraînement personnalisés. Assurez-vous d'avoir une clé API valide avec suffisamment de crédits.
