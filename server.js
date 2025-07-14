
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize, connectDB } from './config/db.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js'

dotenv.config();

const app = express();


app.use(express.json()); 
app.use(cors()); 

app.use('/api/auth', authRoutes)


app.get('/', (req, res) => {
  res.send('API is running...');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  await connectDB();

  try {
    await sequelize.sync();
    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
});