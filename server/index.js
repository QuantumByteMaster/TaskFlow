import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import { initBrevo, startReminderScheduler } from './services/notificationService.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000",
    process.env.CLIENT_URL || "" // Fallback to empty string if not defined to avoid crash, though usually cors handles undefined well or strict matching
  ],
  credentials: true
}));

// Connect to MongoDB
connectDB();

// Initialize services
initBrevo();
startReminderScheduler();

// Routes 
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/events', eventRoutes);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Root route for health check
app.get('/', (req, res) => {
    res.send('TaskFlow API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});