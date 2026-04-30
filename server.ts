import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const contentPath = path.join(__dirname, 'content.json');

  // API Routes
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
      
      const registrationsPath = path.join(__dirname, 'registrations.json');
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

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
