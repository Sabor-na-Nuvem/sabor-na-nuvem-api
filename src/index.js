import dotenv from 'dotenv';
import app from './app.js';

// --- IMPORTAÇÃO DOS JOBS ---
import './jobs/scheduler.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {});
