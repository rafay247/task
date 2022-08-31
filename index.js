const express = require('express')
const { connectToDb } = require("./databaseSchema/schema");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
connectToDb();

app.use('/api', require('./authentication/user'));

app.get('/', (req, res) => {
  res.send('The test site is start now')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}`)
})