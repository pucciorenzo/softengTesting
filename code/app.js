import express from 'express';
import mongoose from 'mongoose';
import router from './routes/route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 3000;

mongoose.set('strictQuery', true);

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api', router);
app.get('/', (req, res) => res.json('Hello World!'));

export { app, port };