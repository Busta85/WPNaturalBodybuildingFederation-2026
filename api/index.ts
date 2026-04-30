import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());

// Resolve paths correctly depending on environment (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback content in case Vercel filesystem fails to find it
const fallbackContent = {
  "hero": {
    "title": "WPNBF",
    "logo": "",
    "year": "2026",
    "subtitle": "THE DAVID ISAACS CLASSIC",
    "date": "13 JUNE 2026",
    "venue": "MITCHELL'S PLAIN, CEDAR HIGH"
  },
  "about": {
    "badge": "THE ELITE STANDARD",
    "title": "A New Era for WP Natural Bodybuilding.",
    "description": "Prepare for the most prestigious natural stage in the Western Cape. We welcome all athletes to share their discipline and dedication. This isn't just a show; it's a testament to the chiseled monolith within."
  },
  "features": [
    {
      "icon": "Gavel",
      "title": "Live Judging",
      "description": "International standards with transparent, real-time feedback systems."
    },
    {
      "icon": "Zap",
      "title": "Elite Stage",
      "description": "Cinematic lighting and concert-grade audio production for maximum impact."
    }
  ],
  "stats": [
    { "label": "50+", "sub": "ELITE ATHLETES" },
    { "label": "12", "sub": "WEIGHT CLASSES" },
    { "label": "R10K", "sub": "GRAND PRIZE POOL" },
    { "label": "100%", "sub": "DRUG TESTED" }
  ],
  "cta": {
    "title": "CLAIM YOUR SPOT IN HISTORY",
    "subtitle": "REGISTRATION CLOSES 1 JUNE 2026. LIMITED SLOTS PER DIVISION."
  },
  "footer": {
    "description": "Dedicated to the growth and promotion of natural bodybuilding in the Western Province. Forging a future of excellence, health, and athletic prestige."
  },
  "sponsors": [
    {
      "name": "AMY'S PRIVATE RANGE",
      "logo": "https://picsum.photos/seed/firing-range/400/200?grayscale",
      "url": "https://www.facebook.com/p/Amys-Private-Range-100063539542017/"
    },
    {
      "name": "ZAHIR'S BILTONG",
      "logo": "https://picsum.photos/seed/biltong-shop/400/200?grayscale",
      "url": "https://www.facebook.com/ZahirsBiltong/"
    },
    {
      "name": "WWW.GOBROWN.CO.ZA",
      "logo": "https://picsum.photos/seed/sun-tanning/400/200?grayscale",
      "url": "https://www.gobrown.co.za"
    }
  ],
  "athletes": [
    {
      "name": "Elite Physique",
      "specialty": "Classic Bodybuilding",
      "image": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
      "bio": "Defining the peak of natural aesthetics."
    },
    {
      "name": "Power Sculpt",
      "specialty": "Men's Physique",
      "image": "https://picsum.photos/seed/bodybuilder2/600/800?grayscale",
      "bio": "Symmetry and strength in perfect balance."
    }
  ],
  "schedule": [
    { "time": "08:00", "task": "Athlete Registration & Weigh-in" },
    { "time": "10:00", "task": "Pre-judging: Men's Divisions" },
    { "time": "13:00", "task": "Pre-judging: Women's Divisions" },
    { "time": "18:30", "task": "Main Event: Finals & Award Ceremony" }
  ],
  "gallery": {
    "title": "THE LEGACY",
    "subtitle": "FOUNDATIONS OF EXCELLENCE",
    "items": [
      {
        "title": "Pioneers of the Golden Era",
        "image": "https://lh3.googleusercontent.com/d/1B-q7WvRzNqX-8pS9Tz6u_VzW-XqD0Y7_",
        "year": "1970s"
      },
      {
        "title": "The Art of Sculpture",
        "image": "https://lh3.googleusercontent.com/d/1C_r8MwS0OrT_9qS0Tz7v_XyW-ZrD1Z8A",
        "year": "1960s"
      },
      {
        "title": "The David Isaacs Standard",
        "image": "https://lh3.googleusercontent.com/d/1D_s9NxT1PsU_0rT1Ua8w_YzX-AsB2A9C",
        "year": "1951"
      }
    ]
  }
};

// Helper to determine the correct path for a file (handles Vercel's read-only /tmp environment)
function getFilePath(filename: string) {
  const isVercel = process.env.VERCEL === '1';
  
  // Try to find the original file in possible locations
  const possiblePaths = [
    path.join(process.cwd(), filename),
    path.join(process.cwd(), '..', filename)
  ];
  
  let sourcePath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      sourcePath = p;
      break;
    }
  }
  
  if (!isVercel) return sourcePath;
  
  // Vercel serverless environment: Use /tmp to allow temporary mutations
  const tmpPath = path.join('/tmp', filename);
  if (!fs.existsSync(tmpPath) && fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, tmpPath);
    } catch (e) {
      console.error(`Failed to copy ${filename} to /tmp:`, e);
    }
  }
  
  return tmpPath;
}

app.get('/api/content', (req, res) => {
  try {
    const contentPath = getFilePath('content.json');
    if (fs.existsSync(contentPath)) {
      const data = fs.readFileSync(contentPath, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json(fallbackContent);
    }
  } catch (error) {
    console.error('Failed to read content:', error);
    res.status(200).json(fallbackContent); // Fail gracefully so frontend doesn't crash
  }
});

app.post('/api/content', (req, res) => {
  try {
    const contentPath = getFilePath('content.json');
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
    
    const registrationsPath = getFilePath('registrations.json');
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
