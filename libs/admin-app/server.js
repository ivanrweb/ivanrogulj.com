'use strict';
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 4001;
const distFolder = path.join(__dirname, 'browser');

app.use(express.static(distFolder));
app.get('*', (_req, res) => res.sendFile(path.join(distFolder, 'index.html')));

app.listen(port, () => console.log(`Admin server running on port ${port}`));
