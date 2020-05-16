const fs = require('fs');
const https = require('https');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('config');

const postRouter = require('./routes/post');
const authRouter = require('./routes/auth');

const app = express();

const SERVER_FILES_PATH = config.get('SERVER_FILES_PATH');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(`/${SERVER_FILES_PATH}`, express.static(path.resolve(__dirname, '../', 'uploads')));
app.use('/posts', postRouter);
app.use('/auth', authRouter);

const PORT = config.get('PORT') || 5000;
const MONGO_DB_URL = process.env.MONGO_DB_URL;

const start = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      app.use('/', express.static(path.join(__dirname, 'client', 'dist')));

      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
      });

      const key = fs.readFileSync(config.get('PRIVATE_KEY_PATH'));
      const cert = fs.readFileSync(config.get('CERTIFICATE_PATH'));

      https.createServer({ key, cert }, app).listen(PORT, () => {
        console.log(`Сервер запущен на ${PORT} порте`);
      });
    } else {
      app.listen(PORT, () => console.log(`Сервер запущен на ${PORT} порте`));
    }

    await mongoose.connect(MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
  } catch (e) {
    console.log('Server error', e.measure);
    process.exit(1);
  }
};

start();
