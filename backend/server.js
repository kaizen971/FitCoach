require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3004;

// IMPORTANT: Trust proxy configuration
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: "FitCoach"
})
.then(() => console.log('✅ MongoDB connected successfully to FitCoach database'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, required: true, enum: ['male', 'female'] },
  age: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const WorkoutSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  morphology: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  photoUrl: { type: String },
  workoutPlan: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const WorkoutSession = mongoose.model('WorkoutSession', WorkoutSessionSchema);

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré.' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/FitCoach/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FitCoach API is running',
    timestamp: new Date().toISOString()
  });
});

// Register User
app.post('/FitCoach/register', async (req, res) => {
  try {
    const { email, password, name, gender, age } = req.body;

    if (!email || !password || !name || !gender || !age) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      gender,
      age: parseInt(age)
    });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        age: user.age
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// Login User
app.post('/FitCoach/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        age: user.age
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Get User Profile (Protected)
app.get('/FitCoach/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Update User Profile (Protected)
app.put('/FitCoach/profile', authenticateToken, async (req, res) => {
  try {
    const { name, age, gender } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (age) updateData.age = parseInt(age);
    if (gender) updateData.gender = gender;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

// Generate Workout Session (Protected)
app.post('/FitCoach/workout', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const { morphology, height, weight } = req.body;

    if (!morphology || !height || !weight) {
      return res.status(400).json({
        error: 'Morphologie, taille et poids sont requis'
      });
    }

    // Get user data from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Generate workout plan using OpenAI
    const prompt = `Tu es un coach sportif professionnel. Crée une séance d'entraînement personnalisée pour:
- Genre: ${user.gender === 'male' ? 'Homme' : 'Femme'}
- Âge: ${user.age} ans
- Morphologie: ${morphology}
- Taille: ${height} cm
- Poids: ${weight} kg

Génère une séance complète avec:
1. Échauffement (10 minutes)
2. Exercices principaux (30-40 minutes) avec séries, répétitions et temps de repos
3. Retour au calme / Étirements (10 minutes)

Format la réponse en JSON structuré avec les sections suivantes:
{
  "sessionName": "Nom de la séance",
  "duration": "Durée totale",
  "warmup": [{"exercise": "nom", "duration": "temps", "description": "détails"}],
  "mainWorkout": [{"exercise": "nom", "sets": nombre, "reps": "répétitions", "rest": "repos", "description": "détails"}],
  "cooldown": [{"exercise": "nom", "duration": "temps", "description": "détails"}],
  "tips": ["conseil 1", "conseil 2"],
  "caloriesBurned": estimation
}`;

    let workoutPlan;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Tu es un coach sportif expert qui crée des programmes d'entraînement personnalisés. Réponds toujours en JSON valide."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const responseContent = completion.choices[0].message.content;
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) ||
                        responseContent.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseContent;
      workoutPlan = JSON.parse(jsonString);
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback workout plan
      workoutPlan = {
        sessionName: "Séance Personnalisée",
        duration: "50 minutes",
        warmup: [
          { exercise: "Jumping Jacks", duration: "3 minutes", description: "Échauffement cardio" },
          { exercise: "Rotations des bras", duration: "2 minutes", description: "Mobilité articulaire" }
        ],
        mainWorkout: [
          { exercise: "Squats", sets: 3, reps: "15", rest: "60s", description: "Travail des jambes" },
          { exercise: "Pompes", sets: 3, reps: "10", rest: "60s", description: "Travail du haut du corps" },
          { exercise: "Planche", sets: 3, reps: "30s", rest: "45s", description: "Renforcement du core" }
        ],
        cooldown: [
          { exercise: "Étirements quadriceps", duration: "2 minutes", description: "Étirement des jambes" },
          { exercise: "Étirements dos", duration: "2 minutes", description: "Relâchement du dos" }
        ],
        tips: ["Hydratez-vous régulièrement", "Respectez les temps de repos"],
        caloriesBurned: 300
      };
    }

    // Save workout session
    const session = new WorkoutSession({
      userId: req.user.userId,
      morphology,
      height,
      weight,
      photoUrl,
      workoutPlan
    });
    await session.save();

    res.json({
      success: true,
      session: {
        id: session._id,
        workoutPlan: session.workoutPlan,
        photoUrl: session.photoUrl,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Error generating workout:', error);
    res.status(500).json({ error: 'Failed to generate workout session' });
  }
});

// Get Workout History (Protected)
app.get('/FitCoach/workout/history', authenticateToken, async (req, res) => {
  try {
    const sessions = await WorkoutSession.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Error fetching workout history:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

// Get Specific Workout Session (Protected)
app.get('/FitCoach/workout/:id', authenticateToken, async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!session) {
      return res.status(404).json({ error: 'Séance introuvable' });
    }
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error fetching workout session:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la séance' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FitCoach API server running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}/FitCoach`);
});
