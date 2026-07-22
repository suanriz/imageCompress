const path = require('path');

const express = require('express');
const cors = require('cors');

const imagesRoute = require('./routes/images');
const registerAllJobs = require('./jobs');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

app.use('/images', imagesRoute);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Page not found' });
});

const PORT = 3000;
app.listen(PORT, () => {
  registerAllJobs()
  console.log(`Server listening on http://localhost:${PORT}`);
});
