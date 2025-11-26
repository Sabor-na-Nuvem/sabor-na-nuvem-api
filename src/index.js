import dotenv from 'dotenv';
import app from './app.js';

// --- IMPORTAÇÃO DOS JOBS ---

// Comentado para deploy gratuito
// import './jobs/scheduler.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
