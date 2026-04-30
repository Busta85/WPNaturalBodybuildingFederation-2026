import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

const contentPath = path.join(process.cwd(), 'content.json');

app.get('/api/content', (req, res) => {
  try {
    const data = fs.readFileSync(contentPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read content' });
  }
});

app.post('/api/content', (req, res) => {
  try {
    fs.writeFileSync(contentPath, JSON.stringify(req.body, null, 2));
    res.json({ message: 'Content updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update content' });
  }
});

app.post('/api/register', (req, res) => {
  try {
    const registration = {
      ...req.body,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    const registrationsPath = path.join(process.cwd(), 'registrations.json');
    let registrations = [];
    
    if (fs.existsSync(registrationsPath)) {
      registrations = JSON.parse(fs.readFileSync(registrationsPath, 'utf-8'));
    }
    
    registrations.push(registration);
    fs.writeFileSync(registrationsPath, JSON.stringify(registrations, null, 2));
    
    res.json({ message: 'Registration successful', id: registration.id });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default app;
