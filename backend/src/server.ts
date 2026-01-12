// server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import './cron/yearlySave.cron';
import routes from '../src/routes/urls';

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/api', routes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});



