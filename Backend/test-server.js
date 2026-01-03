import express from 'express';

const app = express();
app.use(express.json());

app.post('/test', async (req, res) => {
  console.log('Request received:', req.body);
  res.json({ message: 'Test successful', body: req.body });
});

app.listen(3001, () => {
  console.log('Test server running on http://localhost:3001');
});
