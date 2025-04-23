const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hello World</title>
      </head>
      <body>
        <h1>Hello, World!</h1>
        <p>If you can see this message, the server is working correctly.</p>
      </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hello World server running on http://0.0.0.0:${PORT}`);
});