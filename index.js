const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const utcTime = new Date().toISOString();
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>1Touch tester</title>
      </head>
      <body>
        <h1>1Touch tester</h1>
        <p>Current UTC time: ${utcTime}</p>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Apex-Tester-App listening on port ${PORT}`);
  });
}

module.exports = app;
