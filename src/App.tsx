import { useState, useEffect, useMemo, FormEvent, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Calendar, 
  MapPin, 
  Gavel, 
  Zap, 
  Trophy, 
  Target, 
  ShieldCheck, 
  ChevronRight, 
  Menu, 
  X,
  Edit3,
  Save,
  Trash2,
  Tv,
  Share2,
  Facebook,
  Instagram,
  Twitter,
  Sparkles,
  Loader2,
  Wand2,
  Search,
  Filter,
  FileText,
  Phone,
  Layers,
  Send,
  Bot,
  Home
} from 'lucide-react';

const SectionHomeButton = () => (
  <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[60] opacity-30 hover:opacity-100 transition-opacity">
    <a href="#home-section" className="flex items-center justify-center w-12 h-12 rounded-full border border-secondary/30 backdrop-blur-md text-secondary hover:text-white hover:bg-secondary/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
      <Home size={20} />
    </a>
  </div>
);

interface Content {
  hero: {
    title: string;
    logo?: string;
    year: string;
    subtitle: string;
    date: string;
    venue: string;
  };
  about: {
    badge: string;
    title: string;
    description: string;
  };
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  stats: Array<{
    label: string;
    sub: string;
  }>;
  cta: {
    title: string;
    subtitle: string;
  };
  footer: {
    description: string;
  };
  sponsors: Array<{
    name: string;
    logo: string;
    url: string;
  }>;
  athletes: Array<{
    name: string;
    specialty: string;
    image: string;
    bio: string;
  }>;
  schedule: Array<{
    time: string;
    task: string;
  }>;
  gallery: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      image: string;
      year: string;
    }>;
  };
}

const ICON_MAP = {
  Calendar,
  MapPin,
  Gavel,
  Zap,
  Trophy,
  Target,
  ShieldCheck,
  Tv
};

const GalleryItem = ({ item, index, handleShare }: { item: any; index: number; handleShare: (item: any) => Promise<void> | void; key?: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.15]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-2, 2]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative aspect-[3/4] overflow-hidden border border-white/10"
    >
      <motion.div 
        style={{ y, scale, rotate }}
        className="absolute inset-0 w-full h-[130%] -top-[15%]"
      >
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none"></div>
      
      <button 
        onClick={() => handleShare(item)}
        className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
        title="Share Image"
      >
        <Share2 size={20} />
      </button>

      <div className="absolute bottom-0 left-0 w-full p-8 translate-y-6 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
        <span className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-2 block">{item.year}</span>
        <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">{item.title}</h3>
      </div>
    </motion.div>
  );
};

const AIGeneratorModal = ({ onClose, onGenerated }: { onClose: () => void, onGenerated: (image: string, prompt: string) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `Hyper-realistic natural bodybuilding photo, chiseled muscles, dramatic lighting, elite stage presence, cinematic, high contrast, black and white aesthetic. Prompt: ${prompt}`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4"
          }
        },
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        onGenerated(imageUrl, prompt);
        onClose();
      } else {
        throw new Error('No image was generated. Please try a different prompt.');
      }
    } catch (err) {
      console.error('AI Generation Failed:', err);
      setError('The monolith is still being carved. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-neutral-onyx border border-white/10 p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[100px] rounded-full"></div>
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"><X size={24} /></button>
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-primary" size={32} />
          </div>
          <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter mb-4">Legacy Architect</h2>
          <p className="text-white/40 text-sm tracking-widest uppercase">Forge a new vision of natural excellence using AI</p>
        </div>

        <form onSubmit={generateImage} className="space-y-8">
          <div>
            <label className="block text-primary text-[10px] font-black tracking-[0.4em] uppercase mb-4">Prompt Theme</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A champion bodybuilder performing a back lat spread under golden stage lights..."
              className="w-full bg-black border border-white/10 p-5 text-white font-sans text-sm outline-none focus:border-primary/50 transition-all min-h-[120px] resize-none"
              disabled={isGenerating}
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}

          <button 
            type="submit"
            disabled={isGenerating}
            className="w-full bg-primary text-black font-display font-black py-5 tracking-[0.3em] uppercase hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
          >
            {isGenerating ? (
              <><Loader2 className="animate-spin" size={20} /> ANALYZING FORM...</>
            ) : (
              <><Wand2 size={20} /> GENERATE LEGACY IMAGE</>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: "SYS_ONLINE // HOW CAN I ASSIST YOUR EVENT PREPARATION TODAY?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!chatRef.current) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            chatRef.current = ai.chats.create({
                model: "gemini-3.1-pro-preview",
                config: {
                    systemInstruction: "You are the SYS_SUPPORT_BOT for the David Isaacs Classic 2026, a natural bodybuilding event organized by WPNBF. Respond with a concise, highly robotic futuristic cyberpunk tone.",
                }
            });
        } catch (err) {
            console.error("Chatbot init failed", err);
        }
    }
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatRef.current || isTyping) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userText });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "ERR // SYSTEM FAILURE COMMUNICATING WITH CORE. PLEASE TRY AGAIN." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full bg-surface shadow-[0_0_20px_#ffffff] flex items-center justify-center neon-border-secondary hover:scale-110 transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Bot className="text-secondary drop-shadow-[0_0_5px_#ffffff]" size={30} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[150] w-[380px] max-w-[calc(100vw-2rem)] h-[500px] bg-surface/90 backdrop-blur-xl neon-border-secondary rounded-lg flex flex-col card-3d overflow-hidden"
          >
            <div className="p-4 border-b border-secondary/30 bg-surface flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[50px] rounded-full pointer-events-none"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-sm bg-secondary/20 flex items-center justify-center neon-border-secondary">
                  <Bot className="text-secondary" size={18} />
                </div>
                <div>
                  <h3 className="font-display font-black text-white tracking-widest text-sm chiseled-text">SYS_SUPPORT_BOT</h3>
                  <p className="text-[9px] text-secondary tracking-[0.3em] font-black uppercase shadow-[0_0_5px_rgba(255,255,255,0.5)]">ONLINE</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-secondary transition-colors relative z-10">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 text-sm font-sans tracking-wide leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary/20 text-white neon-border rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                        : 'bg-black/40 text-white border border-secondary/30 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)] rounded-tl-lg rounded-tr-lg rounded-br-lg'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className={`text-[8px] font-display font-black tracking-widest uppercase mt-1 ${msg.role === 'user' ? 'text-primary/50' : 'text-secondary/50'}`}>
                    {msg.role === 'user' ? 'USER_INPUT' : 'SYS_RESPONSE'}
                  </span>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-black/40 border border-secondary/30 p-4 rounded-tl-lg rounded-tr-lg rounded-br-lg flex gap-2 items-center">
                    <Loader2 className="animate-spin text-secondary" size={16} />
                    <span className="text-[10px] font-display text-secondary tracking-widest uppercase">PROCESSING...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-secondary/30 bg-black/50">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="ENTER QUERY..."
                  className="w-full bg-surface border border-secondary/50 text-white text-xs font-display tracking-widest p-3 pr-12 focus:outline-none focus:border-secondary focus:shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all uppercase"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function App() {
  const [content, setContent] = useState<Content | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAIGenOpen, setIsAIGenOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [galleryYearFilter, setGalleryYearFilter] = useState('All');
  const [gallerySearchQuery, setGallerySearchQuery] = useState('');
  const { scrollYProgress } = useScroll();

  const filteredGalleryItems = useMemo(() => {
    if (!content) return [];
    return content.gallery.items.filter(item => {
      const matchesYear = galleryYearFilter === 'All' || item.year === galleryYearFilter;
      const matchesSearch = item.title.toLowerCase().includes(gallerySearchQuery.toLowerCase());
      return matchesYear && matchesSearch;
    });
  }, [content, galleryYearFilter, gallerySearchQuery]);

  const uniqueYears = useMemo<string[]>(() => {
    if (!content) return ['All'];
    const years = content.gallery.items.map(item => String(item.year));
    const yearList = Array.from(new Set(years));
    return ['All', ...yearList].sort((a: string, b: string) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return b.localeCompare(a); 
    });
  }, [content]);

  const handleAIGenerated = (imageUrl: string, promptText: string) => {
    if (!content) return;
    const newItem = {
      title: `AI Vision: ${promptText.slice(0, 20)}...`,
      image: imageUrl,
      year: "2026 CONCEPT"
    };
    
    const newContent = {
      ...content,
      gallery: {
        ...content.gallery,
        items: [newItem, ...content.gallery.items]
      }
    };
    setContent(newContent);
  };

  const handleShare = async (item: { title: string, image: string }) => {
    const shareData = {
      title: `WPNBF Legacy - ${item.title}`,
      text: `Witness the legacy of natural bodybuilding: ${item.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Clipboard failed:', err);
      }
    }
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2026-06-13T09:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    fetch('/api/content', { signal: controller.signal })
      .then(res => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(data => {
        if (data && data.hero) {
          setContent(data);
        } else {
          throw new Error('Invalid content format');
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        // Fallback content if API fails (like on Vercel)
        setContent({
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
        });
      });

    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  if (!content) return <div className="min-h-screen bg-neutral-onyx flex items-center justify-center font-display text-primary uppercase tracking-[0.5em]">L O A D I N G . . .</div>;

  return (
    <div className="relative overflow-x-hidden bg-neutral-onyx font-sans">
      <div className="cyber-grid"></div> {/* Added 3D cyber grid background */}
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#03030c]/80 backdrop-blur-md flex justify-between items-center px-8 py-4 border-b border-primary/20 shadow-[0_0_20px_rgba(0,243,255,0.1)]">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="text-2xl font-black tracking-tighter text-primary font-display uppercase hidden sm:block leading-[0.8] transition-colors group-hover:text-white chiseled-text">
            {content.hero.title}<br/><span className="text-[9px] tracking-[0.5em] text-secondary uppercase">Natural Bodybuilding</span>
          </div>
        </div>
        <div className="hidden lg:flex gap-10 items-center">
          <a href="#about-section" className="font-display font-bold text-xs tracking-[0.2em] uppercase text-white/40 hover:text-primary transition-colors">About</a>
          <a href="#athletes-section" className="font-display font-bold text-xs tracking-[0.2em] uppercase text-white/40 hover:text-primary transition-colors">Athletes</a>
          <a href="#gallery-section" className="font-display font-bold text-xs tracking-[0.2em] uppercase text-white/40 hover:text-primary transition-colors">Gallery</a>
          <a href="#location-section" className="font-display font-bold text-xs tracking-[0.2em] uppercase text-white/40 hover:text-primary transition-colors">Location</a>
          <a href="#social-hub" className="font-display font-bold text-xs tracking-[0.2em] uppercase text-white/40 hover:text-primary transition-colors">Social</a>
          <a href="#sponsors-section" className="font-display font-bold text-xs tracking-[0.2em] uppercase text-white/40 hover:text-primary transition-colors">Sponsors</a>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="gold-gradient text-neutral-onyx font-display font-black px-8 py-3 tracking-widest text-[11px] hover:scale-110 hover:shadow-[0_0_20px_rgba(0,243,255,0.8)] neon-border transition-all active:scale-95 hidden sm:block uppercase"
          >
            SYS_REGISTER()
          </button>
          
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-primary p-2 hover:bg-primary/20 rounded-md neon-border transition-all"
          >
            <Menu size={24} />
          </button>

          {isAdmin && (
            <button 
              onClick={() => setIsAdmin(false)}
              className="p-2 text-primary hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home-section" className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-transparent perspective-container">
        <motion.div 
          style={{ y: heroY }}
          className="absolute inset-0 z-0 card-3d"
        >
          <img 
            className="w-full h-full object-cover opacity-30 mix-blend-screen grayscale hover:grayscale-0 transition-all duration-1000 scale-105" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoE02qzAc2Eq27-n5FWbpQiS0xuhgeskc9YZ2O-MaU-Sx_gzGUnfamxAw2inNDuiLGS44IlDiVUrbJSuf0UvxY_9oPGGf543v0yHXlp6mWUpvC8vA0Bp7AHwurip5IH8oGCaAFCerk00Eyd8H6BybAN84mk62mCbFtSyLAzbf15IEvIE2yIK0w1xWtfQNsJnkGlZc6q_tiVvfWWIHEBA7r3Gyz1QGA9-dcEg6-KCEYNQ1-ojVmU-ltLojYXKa8qjtCYwWiQJ3usOj-"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-onyx via-transparent to-black/80"></div>
        </motion.div>
        
        <div className="relative z-10 container mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ opacity: heroOpacity }}
            className="max-w-4xl card-3d p-8 bg-surface/40 backdrop-blur-md rounded-xl neon-border-secondary"
          >
            <div className="flex items-center gap-6 mb-8 group">
              <div className="w-16 h-[3px] bg-secondary group-hover:w-24 transition-all duration-500 shadow-[0_0_10px_#ffffff]"></div>
              <div className="inline-block text-primary font-display font-black text-xl md:text-2xl tracking-[0.3em] uppercase relative">
                <span className="chiseled-text">
                  {content.hero.subtitle}
                </span>
              </div>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-display font-black leading-[0.85] tracking-tighter mb-10 chiseled-text uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]">
              {content.hero.title}<br/><span className="text-white italic text-6xl md:text-8xl">{content.hero.year}</span>
            </h1>

            {/* Countdown Timer */}
            <div className="flex gap-4 md:gap-10 mb-12 border-b border-primary/30 pb-10">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Min', value: timeLeft.minutes },
                { label: 'Sec', value: timeLeft.seconds }
              ].map((unit, i) => (
                <div key={i} className="flex flex-col items-start min-w-[70px]">
                  <span className="text-primary font-display font-black text-5xl md:text-6xl tracking-tighter tabular-nums text-stroke-primary drop-shadow-[0_0_10px_rgba(0,243,255,0.9)]">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                  <span className="text-primary/70 text-[9px] font-display font-black uppercase tracking-[0.4em] mt-1">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 border-l-2 border-primary/30 pl-8">
              <div className="flex items-center gap-6">
                <Calendar className="text-primary" size={50} />
                <div>
                  <p className="text-white/40 text-[10px] font-display font-black uppercase tracking-[0.3em] mb-1">Competition Date</p>
                  <p className="text-2xl font-display font-bold text-white tracking-widest">{content.hero.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Target className="text-primary" size={50} />
                <div>
                  <p className="text-white/40 text-[10px] font-display font-black uppercase tracking-[0.3em] mb-1">Official Venue</p>
                  <p className="text-2xl font-display font-bold text-white tracking-widest">{content.hero.venue}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 perspective-container mt-8">
              <button 
                onClick={() => setIsRegisterOpen(true)}
                className="gold-gradient text-neutral-onyx font-display font-black px-12 py-5 text-xl tracking-[0.15em] hover:scale-105 transition-all shadow-2xl neon-border uppercase card-3d"
              >
                INITIALIZE_JOIN()
              </button>
              <button 
                onClick={() => setIsCategoriesOpen(true)}
                className="bg-surface/50 neon-border-secondary hover:bg-secondary/20 text-white font-display font-black px-12 py-5 text-xl tracking-[0.15em] transition-all backdrop-blur-md uppercase card-3d"
              >
                ACCESS_CATEGORIES
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-32 bg-transparent relative z-10 text-white perspective-container">
        <SectionHomeButton />
        <div className="container mx-auto px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
            <motion.div 
              initial={{ opacity: 0, x: -50, rotateY: 15 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true }}
              className="bg-surface/80 p-16 neon-border relative overflow-hidden backdrop-blur-lg card-3d floating"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h2 className="text-xs font-display font-black text-secondary tracking-[0.6em] mb-8 uppercase text-shadow-[0_0_10px_#ffffff]">
                {content.about.badge}
              </h2>
              <p className="text-4xl md:text-5xl font-display font-black leading-[1.1] mb-10 tracking-tight text-white chiseled-text">
                {content.about.title}
              </p>
              <p className="text-white/70 text-lg leading-relaxed mb-10 font-light font-sans relative z-10">
                {content.about.description}
              </p>
              <div className="flex items-center gap-6">
                <div className="h-[1px] flex-grow bg-primary/30 shadow-[0_0_10px_#ffe600]"></div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.features.map((feature, i) => {
                const Icon = (ICON_MAP as any)[feature.icon] || Zap;
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`card-3d p-10 flex flex-col justify-between relative group overflow-hidden ${i === 1 ? 'gold-gradient text-neutral-onyx neon-border' : 'bg-surface/60 backdrop-blur-md neon-border-secondary text-white'}`}
                  >
                    {i === 0 && <img className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen group-hover:scale-110 transition-transform duration-700" src="https://picsum.photos/seed/contest/400/400" referrerPolicy="no-referrer" />}
                    <Icon className={i === 1 ? 'text-neutral-onyx drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]' : 'text-secondary drop-shadow-[0_0_10px_#ffffff]'} size={40} />
                    <div className="relative z-10">
                      <h3 className="font-display font-black text-2xl uppercase tracking-tighter mt-4 chiseled-text">{feature.title}</h3>
                      <p className={`text-sm mt-2 leading-relaxed ${i === 1 ? 'text-black/80 font-bold' : 'text-white/70 font-medium'}`}>{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
              
              <div className="md:col-span-2 bg-surface/40 backdrop-blur-md p-10 flex flex-col md:flex-row justify-between items-center gap-8 neon-border transition-all group card-3d">
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 bg-black/50 flex items-center justify-center neon-border-secondary shadow-[0_0_15px_#ffffff]">
                    <MapPin className="text-secondary" size={30} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-2xl uppercase tracking-tighter text-white">Professional Venue</h3>
                    <p className="text-primary uppercase tracking-[0.2em] text-[10px] font-bold mt-1 text-shadow-[0_0_5px_#ffe600]">
                      {content.hero.venue}
                    </p>
                  </div>
                </div>
                <button className="px-8 py-4 bg-primary/10 text-primary neon-border hover:bg-primary transition-all hover:text-black hover:shadow-[0_0_20px_#ffe600] font-display font-black text-[10px] tracking-widest uppercase flex items-center gap-3">
                  VIEW LOCATION MAP <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Header */}
      <section id="athletes-section" className="py-32 bg-black relative">
        <SectionHomeButton />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-primary/5 tracking-tighter uppercase whitespace-nowrap">TITAN ELITE</div>
        </div>
        <div className="container mx-auto px-8 relative z-10 flex flex-col lg:flex-row justify-between items-end gap-12 mb-20">
          <div className="max-w-3xl">
            <h2 className="text-7xl md:text-9xl font-display font-black uppercase leading-[0.8] tracking-tighter text-white">
              Where <span className="text-stroke-primary">Legends</span><br/><span className="text-primary italic">Are Made</span>
            </h2>
            <div className="h-1 w-24 bg-primary mt-8"></div>
          </div>
          <div className="lg:w-1/3">
            <p className="text-primary font-display font-bold tracking-[0.3em] uppercase text-xs mb-4">Elite Sporting Event 2026</p>
            <p className="text-white/60 text-lg leading-relaxed italic border-l-2 border-primary/30 pl-6">
              Forging a legacy through natural excellence. This is the ultimate stage for the dedicated athlete.
            </p>
          </div>
        </div>

        {/* Athlete Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 mt-20 perspective-container">
          {content.athletes.map((athlete, i) => (
            <div key={i} className="relative h-[700px] overflow-hidden group card-3d neon-border rounded-lg">
              <img 
                src={athlete.image}
                className="w-full h-full object-cover mix-blend-luminosity brightness-50 group-hover:mix-blend-normal group-hover:brightness-100 group-hover:scale-105 transition-all duration-1000"
                referrerPolicy="no-referrer"
                alt={athlete.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-onyx via-neutral-onyx/50 to-transparent flex flex-col justify-end p-12">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-secondary font-display font-black text-5xl italic opacity-50 drop-shadow-[0_0_15px_#ffffff]">0{i + 1}</span>
                  <div className="h-[2px] w-8 bg-secondary shadow-[0_0_10px_#ffffff]"></div>
                </div>
                <h4 className="text-3xl font-display font-black uppercase text-white tracking-tighter mb-2 group-hover:translate-x-2 transition-transform chiseled-text">
                  {athlete.name}
                </h4>
                <p className="text-primary text-[10px] font-black tracking-[0.4em] uppercase opacity-70 group-hover:opacity-100 transition-opacity mb-2 drop-shadow-[0_0_5px_#ffe600]">
                  {athlete.specialty}
                </p>
                <p className="text-white/70 text-xs font-light italic opacity-0 group-hover:opacity-100 transition-opacity max-w-xs">
                  {athlete.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery-section" className="py-32 bg-transparent relative overflow-hidden perspective-container">
        <SectionHomeButton />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/5 -skew-x-[20deg] translate-x-1/2 blur-2xl"></div>
        <div className="container mx-auto px-8 relative z-10">
          <div className="mb-20 flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="card-3d">
              <p className="text-secondary font-display font-black text-[10px] tracking-[0.6em] uppercase mb-4 text-shadow-[0_0_10px_#ffffff]">{content.gallery.subtitle}</p>
              <h2 className="text-7xl md:text-8xl font-display font-black text-white uppercase tracking-tighter leading-none chiseled-text">
                {content.gallery.title}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto card-3d">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                <input 
                  type="text"
                  placeholder="SEARCH ARCHIVES..."
                  value={gallerySearchQuery}
                  onChange={(e) => setGallerySearchQuery(e.target.value)}
                  className="w-full bg-surface/80 border border-primary/30 py-3 pl-12 pr-4 text-white font-display font-black text-[10px] tracking-[0.2em] uppercase focus:border-primary focus:shadow-[0_0_10px_#ffe600] outline-none transition-all"
                />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar max-w-full">
                {uniqueYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setGalleryYearFilter(year)}
                    className={`px-4 py-2 text-[10px] font-display font-black tracking-widest uppercase transition-all whitespace-nowrap ${galleryYearFilter === year ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:text-white border border-white/10'}`}
                  >
                    {year}
                  </button>
                ))}
              </div>

              <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>

              <button 
                onClick={() => setIsAIGenOpen(true)}
                className="flex items-center gap-4 px-8 py-4 border border-primary/30 text-primary font-display font-black text-[10px] tracking-[0.3em] uppercase hover:bg-primary hover:text-black transition-all group shrink-0"
              >
                <Sparkles className="group-hover:rotate-12 transition-transform" size={18} />
                GENERATE WITH AI
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredGalleryItems.map((item, i) => (
                <GalleryItem key={item.image + i} item={item} index={i} handleShare={handleShare} />
              ))}
            </AnimatePresence>
          </div>
          
          {filteredGalleryItems.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <p className="text-white/20 font-display font-black text-xl tracking-[0.3em] uppercase">No archives found matching your criteria</p>
              <button 
                onClick={() => { setGalleryYearFilter('All'); setGallerySearchQuery(''); }}
                className="mt-6 text-primary font-display font-black text-[10px] tracking-[0.4em] uppercase hover:underline"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-[#f6f3f2] border-b border-black/5 relative">
        <SectionHomeButton />
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center text-neutral-onyx">
            {content.stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="text-7xl font-display font-black text-primary mb-4 group-hover:scale-110 transition-transform">
                  {stat.label}
                </div>
                <div className="text-[10px] font-display font-black uppercase tracking-[0.4em]">
                  {stat.sub}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsor Carousel */}
      <section id="sponsors-section" className="py-24 bg-[#fcf9f8] overflow-hidden relative">
        <SectionHomeButton />
        <div className="container mx-auto px-8 mb-12 text-center">
          <p className="text-primary font-display font-black text-[10px] tracking-[0.4em] uppercase mb-2">Our Partners</p>
          <div className="h-[2px] w-12 bg-primary mx-auto"></div>
        </div>
        
        <div className="relative flex whitespace-nowrap overflow-hidden group">
          <div className="flex animate-scroll hover:[animation-play-state:paused]">
            {[...content.sponsors, ...content.sponsors].map((sponsor, i) => (
              <a 
                key={i}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center min-w-[300px] px-12 group/sponsor transition-all duration-300"
              >
                <img 
                  alt={sponsor.name} 
                  className="h-16 lg:h-20 w-auto object-contain mb-4 grayscale group-hover/sponsor:grayscale-0 group-hover/sponsor:scale-110 transition-all duration-500 drop-shadow-[0_0_0px_rgba(212,175,55,0)] group-hover/sponsor:drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                  src={sponsor.logo} 
                  referrerPolicy="no-referrer"
                />
                <span className="font-display font-black text-xs lg:text-sm text-black/20 group-hover/sponsor:text-primary transition-colors uppercase tracking-[0.2em]">
                  {sponsor.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 bg-surface relative overflow-hidden text-center cyber-grid-overlay">
        <SectionHomeButton />
        <div className="absolute inset-0 bg-secondary/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0a0a16_100%)] z-0"></div>
        <div className="relative z-10 container mx-auto px-8 text-white card-3d">
          <h2 className="text-6xl md:text-8xl font-display font-black mb-10 tracking-tighter uppercase leading-[0.9] chiseled-text text-shadow-[0_0_20px_#ffe600]">
            {content.cta.title}
          </h2>
          <p className="text-primary text-lg font-bold mb-16 uppercase tracking-[0.3em] drop-shadow-[0_0_5px_#ffe600]">
            {content.cta.subtitle}
          </p>
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="bg-transparent neon-border hover:bg-primary/20 text-primary font-display font-black px-20 py-8 text-2xl tracking-[0.2em] hover:scale-105 transition-all shadow-2xl hover:shadow-[0_0_30px_#ffe600] card-3d"
          >
            SYS_SECURE_ENTRY
          </button>
        </div>
      </section>

      {/* Location Section */}
      <section id="location-section" className="py-32 bg-transparent border-t border-primary/20 perspective-container relative">
        <SectionHomeButton />
        <div className="container mx-auto px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/3 card-3d">
              <h2 className="text-5xl font-display font-black text-white uppercase tracking-tighter mb-6 chiseled-text">
                THE <span className="text-secondary italic drop-shadow-[0_0_10px_#ffffff]">ARENA</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-primary mt-1 drop-shadow-[0_0_5px_#ffe600]" size={24} />
                  <div>
                    <p className="text-white/40 text-[10px] font-display font-black uppercase tracking-[0.3em] mb-1">Venue Name</p>
                    <p className="text-xl font-display font-bold text-white uppercase tracking-widest leading-tight">Cedar High School</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Calendar className="text-primary mt-1 drop-shadow-[0_0_5px_#ffe600]" size={24} />
                  <div>
                    <p className="text-white/40 text-[10px] font-display font-black uppercase tracking-[0.3em] mb-1">City</p>
                    <p className="text-xl font-display font-bold text-white uppercase tracking-widest leading-tight">Mitchell's Plain, Cape Town</p>
                  </div>
                </div>
              </div>
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=Cedar+High+School+Mitchells+Plain" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-10 px-8 py-4 border border-secondary/50 text-secondary font-display font-black text-[10px] tracking-widest uppercase hover:bg-secondary hover:text-white transition-all shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_#ffffff]"
              >
                ENGAGE_DIRECTIONS()
              </a>
            </div>
            <div className="lg:w-2/3 w-full h-[500px] grayscale brightness-75 contrast-125 neon-border hover:grayscale-0 hover:brightness-100 transition-all duration-700 card-3d">
               <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0 }}
                src="https://maps.google.com/maps?q=Cedar%20High%20School%20Mitchells%20Plain&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Social Hub Section */}
      <section id="social-hub" className="py-32 bg-transparent border-t border-primary/20 relative overflow-hidden perspective-container">
        <SectionHomeButton />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="container mx-auto px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/3 card-3d">
              <div className="flex items-center gap-4 mb-6">
                <Facebook className="text-secondary drop-shadow-[0_0_10px_#ffffff]" size={32} />
                <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter chiseled-text">
                  Social <span className="text-secondary italic drop-shadow-[0_0_10px_#ffffff]">Feed</span>
                </h2>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-10 font-light">
                Stay updated with the latest from the <strong className="text-primary drop-shadow-[0_0_5px_#ffe600]">WP Natural Body Building - Wpnbbu</strong> community. Follow our journey, athlete features, and official union announcements.
              </p>
              <div className="space-y-4">
                <a 
                  href="https://www.facebook.com/WPNBF/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-6 bg-surface/80 neon-border-secondary hover:bg-secondary/10 transition-all group shadow-[0_0_15px_#ffffff]"
                >
                  <span className="font-display font-black text-xs text-white uppercase tracking-widest">CONNECT(FACEBOOK)</span>
                  <ChevronRight className="text-secondary group-hover:translate-x-2 transition-transform" />
                </a>
              </div>
            </div>
            
            <div className="lg:w-2/3 w-full bg-surface/40 neon-border p-4 min-h-[500px] card-3d backdrop-blur-md">
              <div className="w-full h-[500px] overflow-hidden rounded mix-blend-screen">
                <iframe 
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FWPNBF%2F&tabs=timeline&width=500&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none', overflow: 'hidden' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  className="grayscale hover:grayscale-0 contrast-125 transition-all duration-700 w-full rounded"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface py-20 border-t border-primary/20 px-8 neon-border-secondary">
        <div className="container mx-auto flex flex-col lg:flex-row justify-between items-start gap-16 relative z-10">
          <div className="max-w-md card-3d">
            <div className="flex items-center gap-6 mb-8">
              <div className="text-2xl font-black text-primary font-display uppercase leading-tight tracking-tighter">
                {content.hero.title}<br/>EST. 1951
              </div>
            </div>
            <p className="text-primary/60 text-sm leading-relaxed mb-8">
              {content.footer.description}
            </p>
            <div className="flex gap-4 mb-8">
              {[
                { Icon: Facebook, url: "https://www.facebook.com/WPNBF/" },
                { Icon: Instagram, url: "https://www.instagram.com/wpnbf/" },
                { Icon: Twitter, url: "https://twitter.com/wpnbf" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary/60 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <social.Icon size={18} />
                </a>
              ))}
            </div>
            <p className="text-primary/40 text-[10px] tracking-widest uppercase font-display">
              © 2026 <span className="text-primary font-black">DAVID ISAACS CLASSIC</span>. WESTERN PROVINCE NATURAL BODYBUILDING UNION.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <h5 className="text-primary font-display font-black text-xs tracking-widest uppercase mb-8">Resources</h5>
              <ul className="space-y-4 text-[10px] text-primary/60 uppercase tracking-widest">
                <li><button onClick={() => setIsPrivacyOpen(true)} className="hover:text-primary transition-colors text-left uppercase tracking-widest">Privacy Policy</button></li>
                <li><button onClick={() => setIsRulesOpen(true)} className="hover:text-primary transition-colors text-left uppercase tracking-widest">Rules & Regulations</button></li>
                <li><a href="#" className="hover:text-primary transition-colors">Athletes Handbook</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Athlete Resources</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-primary font-display font-black text-xs tracking-widest uppercase mb-8">Support</h5>
              <ul className="space-y-4 text-[10px] text-primary/60 uppercase tracking-widest">
                <li><button onClick={() => setIsOrganizerOpen(true)} className="hover:text-primary transition-colors text-left uppercase tracking-widest">Contact Organizer</button></li>
                <li><a href="#" className="hover:text-primary transition-colors">Media Accreditation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sponsorship Inquiry</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* CMS Side Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/95 backdrop-blur-md z-[150]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#0a0a0a] z-[160] border-l border-white/5 p-12 flex flex-col"
            >
              <div className="flex justify-between items-center mb-16">
                <div className="flex flex-col">
                  <span className="text-primary font-display font-black text-2xl uppercase tracking-tighter leading-none">WPNBF</span>
                  <span className="text-[8px] font-black tracking-[0.4em] text-white/40 uppercase mt-1">Direct Nav Portal</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-white/5 hover:bg-primary hover:text-black rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-8 flex-1">
                {[
                  { label: 'Foundations', href: '#about-section' },
                  { label: 'Titan Elite', href: '#athletes-section' },
                  { label: 'Digital Legacy', href: '#gallery-section' },
                  { label: 'Strategic Venue', href: '#location-section' },
                  { label: 'Visual Socials', href: '#social-hub' },
                  { label: 'Global Partners', href: '#sponsors-section' }
                ].map((link, i) => (
                  <motion.a 
                    key={i}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-4xl font-display font-black text-white hover:text-primary transition-all uppercase tracking-tighter hover:translate-x-3"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>

              <div className="mt-auto pt-10 border-t border-white/5">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setIsRegisterOpen(true); }}
                  className="w-full gold-gradient text-black font-display font-black py-6 uppercase tracking-widest text-xs shadow-[0_20px_50px_rgba(212,175,55,0.1)] active:scale-95 transition-all"
                >
                  Join the Ranks
                </button>
                <div className="mt-8 flex justify-between items-center text-white/20 text-[9px] font-black uppercase tracking-[0.34em]">
                  <span>EST. 2024</span>
                  <span className="text-primary/40 italic">NATURAL ONLY</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRegisterOpen && (
          <RegistrationModal 
            onClose={() => {
              setIsRegisterOpen(false);
              setRegistrationSuccess(false);
            }} 
            onSuccess={() => setRegistrationSuccess(true)}
            success={registrationSuccess}
          />
        )}
        {isAIGenOpen && (
          <AIGeneratorModal 
            onClose={() => setIsAIGenOpen(false)}
            onGenerated={handleAIGenerated}
          />
        )}
        {isPrivacyOpen && (
          <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} />
        )}
        {isOrganizerOpen && (
          <OrganizerContactModal onClose={() => setIsOrganizerOpen(false)} />
        )}
        {isRulesOpen && (
          <RulesRegulationsModal onClose={() => setIsRulesOpen(false)} />
        )}
        {isCategoriesOpen && (
          <CategoriesModal onClose={() => setIsCategoriesOpen(false)} />
        )}
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white text-black z-[100] shadow-2xl p-8 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Content Manager</h2>
                <p className="text-[10px] text-black/40 font-black tracking-widest uppercase mt-1">Live Site Architecture</p>
              </div>
              <button onClick={() => setIsAdmin(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={24} /></button>
            </div>
            
            <AdminEditor content={content} onUpdate={async (newContent) => {
              const btn = document.querySelector('#save-content-btn');
              if (btn) btn.innerHTML = '<span class="animate-spin inline-block mr-2">◌</span> DEPLOYING...';
              
              try {
                const res = await fetch('/api/content', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newContent)
                });
                
                if (res.ok) {
                  setContent(newContent);
                  if (btn) {
                    btn.innerHTML = '✓ CONTENT DEPLOYED';
                    btn.classList.replace('gold-gradient', 'bg-green-500');
                    setTimeout(() => {
                      if (btn) {
                        btn.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Deploy Content Updates';
                        btn.classList.replace('bg-green-500', 'gold-gradient');
                      }
                    }, 3000);
                  }
                } else {
                  throw new Error('Failed to persist');
                }
              } catch (err) {
                console.error('CMS Error:', err);
                if (btn) btn.innerHTML = '✕ SAVE FAILED';
              }
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AIChatbot />
    </div>
  );
}

function CategoriesModal({ onClose }: { onClose: () => void }) {
  const categories = [
    {
      title: "Men's Divisions",
      items: ["Men's Bodybuilding", "Classic Bodybuilding", "Men's Physique", "Junior Under 23", "Masters Over 40"]
    },
    {
      title: "Women's Divisions",
      items: ["Women's Figure", "Bikini", "Women's Physique", "Fit Model", "Junior Under 23"]
    },
    {
      title: "Special Categories",
      items: ["Mixed Pairs", "Disabled Athletes", "Transformation", "Novice"]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-neutral-onyx border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="p-10 border-b border-white/10 flex justify-between items-center bg-neutral-onyx z-10 relative">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-primary/10 flex items-center justify-center rounded">
              <Layers className="text-primary" size={30} />
            </div>
            <div>
              <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none mb-2">Categories</h2>
              <p className="text-[10px] text-primary/60 font-black tracking-[0.4em] uppercase">Official WPNBF Divisions 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/5 p-8 hover:border-primary/30 transition-all group"
            >
              <h3 className="text-primary font-display font-black text-[10px] tracking-[0.4em] uppercase mb-8 pb-4 border-b border-primary/20">{cat.title}</h3>
              <ul className="space-y-4">
                {cat.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-3 text-white/70 group-hover:text-white transition-colors">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full"></div>
                    <span className="font-display font-black text-sm uppercase tracking-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="p-10 bg-black/40 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-white/30 text-[10px] font-display font-black tracking-[0.2em] uppercase max-w-lg text-center md:text-left">
            Additional weight classes or subdivisions may be created based on total registrations.<br/>
            Consult the Rulebook for specific physique requirements.
          </p>
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-primary text-black font-display font-black text-xs tracking-widest uppercase hover:bg-white transition-colors shadow-2xl"
          >
            Acknowledge
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RulesRegulationsModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl bg-neutral-onyx border border-white/10 h-[85vh] flex flex-col relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
        
        <div className="p-8 border-b border-white/10 flex justify-between items-center z-10 bg-neutral-onyx">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary flex items-center justify-center rounded">
              <ShieldCheck className="text-black" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter leading-none">Rules & Regulations</h2>
              <p className="text-[10px] text-primary/60 font-black tracking-[0.4em] uppercase mt-1">Official WPNBF Standard 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 font-sans text-sm text-white/70 leading-relaxed custom-scrollbar">
          <section>
            <h3 className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary"></span> 1. Drug-Free Eligibility
            </h3>
            <p className="mb-4">
              The WPNBF maintains the highest standard of natural bodybuilding. All athletes must meet the following criteria:
            </p>
            <ul className="list-none space-y-4 text-white/50 border-l border-white/5 pl-6">
              <li><strong className="text-white uppercase tracking-widest text-[10px]">Natural Status:</strong> Athletes must be 100% drug-free for a minimum of 7 consecutive years prior to the competition date.</li>
              <li><strong className="text-white uppercase tracking-widest text-[10px]">Prohibited Substances:</strong> Any use of anabolic steroids, growth hormones, or masking agents within the 7-year window results in permanent disqualification.</li>
              <li><strong className="text-white uppercase tracking-widest text-[10px]">Testing:</strong> Every athlete is subject to polygraph testing and/or urinalysis both in and out of competition.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary"></span> 2. Posing & Attire
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white/50">
              <div className="bg-white/5 p-6 border border-white/5">
                <h4 className="text-white text-[10px] font-black uppercase mb-3 tracking-widest">Men's Categories</h4>
                <p>Standard posing trunks required. Trunks must be solid color, non-reflective, and maintain professional coverage of the glutes.</p>
              </div>
              <div className="bg-white/5 p-6 border border-white/5">
                <h4 className="text-white text-[10px] font-black uppercase mb-3 tracking-widest">Women's Categories</h4>
                <p>Two-piece competition suit required. Jewelry is permitted but must not obstruct the view of the musculature.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary"></span> 3. Division Standards
            </h3>
            <p className="mb-4">Athletes are judged on four main pillars: Symmetry, Muscularity, Conditioning, and Stage Presence.</p>
            <div className="space-y-4">
              <div className="p-4 border-l-2 border-primary bg-primary/5">
                <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">Conditioning Policy</p>
                <p>Extreme "death-face" conditioning or signs of dangerous dehydration are not encouraged. We prioritize healthy, sustainable natural looks.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary"></span> 4. Scoring Transparency
            </h3>
            <p>
              WPNBF utilizes the Olympic-style drop-high/drop-low scoring system to ensure fairness. Official scorecards will be released to all athletes within 48 hours of the event conclusion.
            </p>
          </section>

          <section className="bg-primary/10 p-8 border border-primary/20">
            <h3 className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-4">Finality of Decisions</h3>
            <p className="text-primary/80 italic">
              All judge decisions are final. Professionalism is expected toward the stage staff and fellow competitors at all times.
            </p>
          </section>
        </div>

        <div className="p-8 border-t border-white/10 flex justify-end z-10 bg-neutral-onyx">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-primary text-black font-display font-black text-[11px] tracking-[0.3em] uppercase hover:bg-white transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)]"
          >
            I Accept the Standards
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function OrganizerContactModal({ onClose }: { onClose: () => void }) {
  const organizers = [
    { role: 'President', name: 'Haroun', phone: '+27813564430' },
    { role: 'Finance', name: 'Andrew', phone: '+27721601131' },
    { role: 'Secretary', name: 'Jackie', phone: '+27795927850' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-neutral-onyx border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="p-10 border-b border-white/10 flex justify-between items-center bg-neutral-onyx z-10 relative">
          <div>
            <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none mb-2">Organizer Contact</h2>
            <p className="text-[10px] text-primary/60 font-black tracking-[0.4em] uppercase">Executive Committee - WPNBF</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-6">
          {organizers.map((person, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 border border-white/5 hover:border-primary/30 transition-all gap-6"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-primary/10 rounded flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                  <span className="font-display font-black text-xl italic">{person.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-primary font-display font-black text-[10px] tracking-[0.3em] uppercase mb-1">{person.role}</p>
                  <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">{person.name}</h3>
                </div>
              </div>
              
              <a 
                href={`tel:${person.phone}`}
                className="flex items-center gap-4 bg-black border border-white/10 px-6 py-4 text-white hover:bg-primary hover:text-black transition-all group/btn"
              >
                <Phone size={16} className="text-primary group-hover/btn:text-black" />
                <span className="font-mono text-sm tracking-widest">{person.phone}</span>
              </a>
            </motion.div>
          ))}
        </div>

        <div className="p-10 bg-black/40 border-t border-white/10 text-center">
          <p className="text-white/30 text-[10px] font-display font-black tracking-[0.2em] uppercase leading-relaxed">
            Please observe professional etiquette when contacting officials.<br/>
            Office hours: Mon-Fri | 09:00 - 17:00
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PrivacyPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-3xl bg-neutral-onyx border border-white/10 h-[85vh] flex flex-col relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="p-8 border-b border-white/10 flex justify-between items-center z-10 bg-neutral-onyx">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded">
              <FileText className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter leading-none">Privacy Policy</h2>
              <p className="text-[10px] text-primary/60 font-black tracking-widest uppercase mt-1">Version 1.0 - Effective April 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 font-sans text-sm text-white/70 leading-relaxed custom-scrollbar">
          <section>
            <h3 className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-4">1. Data Collection & Athletics</h3>
            <p className="mb-4">
              The Western Province Natural Bodybuilding Federation (WPNBF) collects personal information necessary for athlete registration, competition management, and anti-doping verification. This includes, but is not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/50">
              <li>Full legal names, identity numbers, and contact details.</li>
              <li>Competitive history and division classifications.</li>
              <li>Official competition imagery and videography captured during sanctioned events.</li>
              <li>Health declarations relative to natural status and medical clearance.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-4">2. Use of Information</h3>
            <p>
              Your data is utilized to facilitate high-performance competition environments. This includes verifying eligibility for the David Isaacs Classic and other WPNBF sanctioned events, publishing official results, and managing the Federation's digital archives/gallery.
            </p>
          </section>

          <section>
            <h3 className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-4">3. Image Rights & Media</h3>
            <p>
              By participating in WPNBF events, athletes acknowledge that high-resolution imagery and video are part of the Federation's public historical archive. These images may be used in our Gallery for legacy preservation, promotional material, and social media coverage.
            </p>
          </section>

          <section>
            <h3 className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-4">4. POPIA Compliance</h3>
            <p>
              In accordance with the Protection of Personal Information Act (POPIA), the WPNBF is committed to safeguarding the integrity and confidentiality of your data. We utilize industry-standard encryption and access controls to prevent unauthorized data breaches.
            </p>
          </section>

          <section>
            <h3 className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-4">5. Third-Party Sharing</h3>
            <p>
              WPNBF does not sell your data to third-party advertisers. Data may only be shared with official governing bodies and anti-doping laboratories strictly for verification and sanctioning purposes.
            </p>
          </section>

          <section className="pb-12">
            <h3 className="text-primary font-display font-black text-xs tracking-[0.3em] uppercase mb-4">6. Contact & Rights</h3>
            <p>
              Athletes retain the right to access, rectify, or request the deletion of their personal records within legal and competitive retention periods. For inquiries regarding data protection, contact our Data Officer via the Support links in our footer.
            </p>
          </section>
        </div>

        <div className="p-8 border-t border-white/10 flex justify-end z-10 bg-neutral-onyx">
          <button 
            onClick={onClose}
            className="px-10 py-3 bg-primary text-black font-display font-black text-[10px] tracking-widest uppercase hover:bg-white transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RegistrationModal({ onClose, onSuccess, success }: { onClose: () => void, onSuccess: () => void, success: boolean }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    division: 'Mens Physique',
    category: 'Senior'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please chiseled your details completely.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSuccess();
      } else {
        throw new Error('Server rejected registration');
      }
    } catch (err) {
      console.error(err);
      setError("The portal encountered a barrier. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white text-black w-full max-w-xl overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-black/20 hover:text-black z-10"><X size={24} /></button>
        
        <div className="flex">
          <div className="hidden md:block w-1/3 bg-primary p-10 text-black">
            <Trophy size={40} className="mb-6" />
            <h3 className="text-3xl font-display font-black leading-none uppercase tracking-tighter">Join The Elite</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-4 opacity-70">WP Natural Bodybuilding 2026</p>
          </div>
          
          <div className="flex-1 p-10 pt-20">
            {success ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={40} className="text-primary" />
                </div>
                <h3 className="text-3xl font-display font-black uppercase tracking-tighter">Registration Complete</h3>
                <p className="text-sm text-black/50 mt-4 leading-relaxed">Your entry has been received. Our team will contact you shortly regarding the next steps.</p>
                <button onClick={onClose} className="mt-10 gold-gradient text-black font-display font-black px-10 py-3 uppercase tracking-widest text-[10px]">Close Portal</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <Field label="Full Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
                  <Field label="Email Address" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
                  <Field label="Phone Number" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-black/30">Division</label>
                      <select 
                        className="w-full bg-gray-50 border-none p-3 text-sm outline-none focus:bg-gray-100 transition-colors cursor-pointer"
                        value={formData.division}
                        onChange={e => setFormData({...formData, division: e.target.value})}
                      >
                        <option>Mens Physique</option>
                        <option>Mens Bodybuilding</option>
                        <option>Classic Physique</option>
                        <option>Womens Figure</option>
                        <option>Womens Bikini</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-black/30">Age Category</label>
                      <select 
                        className="w-full bg-gray-50 border-none p-3 text-sm outline-none focus:bg-gray-100 transition-colors cursor-pointer"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        <option>Junior</option>
                        <option>Senior</option>
                        <option>Master</option>
                      </select>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-2 border-red-500 p-4 flex items-center gap-3">
                    <div className="text-red-500"><ShieldCheck size={18} /></div>
                    <p className="text-[10px] font-black uppercase text-red-700 tracking-wider font-display">{error}</p>
                  </div>
                )}

                <p className="text-[9px] text-black/40 leading-relaxed uppercase tracking-tight">By registering, you agree to the WPNBF rules and drug testing protocols. Verified natural athletes only.</p>
                
                <button 
                  disabled={loading}
                  className="w-full gold-gradient text-black font-display font-black py-5 uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Processing Entry...' : 'Submit Official Registration'}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AdminEditor({ content, onUpdate }: { content: Content, onUpdate: (c: Content) => void }) {
  const [localContent, setLocalContent] = useState(content);

  const updateArrayItem = (section: keyof Content, index: number, field: string, value: string) => {
    const newArray = [...(localContent[section] as any[])];
    newArray[index] = { ...newArray[index], [field]: value };
    setLocalContent({ ...localContent, [section]: newArray });
  };

  const addArrayItem = (section: keyof Content, template: any) => {
    setLocalContent({ ...localContent, [section]: [...(localContent[section] as any[]), template] });
  };

  const removeArrayItem = (section: keyof Content, index: number) => {
    const newArray = (localContent[section] as any[]).filter((_, i) => i !== index);
    setLocalContent({ ...localContent, [section]: newArray });
  };

  return (
    <div className="space-y-12 pb-20">
      <Section label="Hero Section">
        <Field label="Logo URL" value={localContent.hero.logo} onChange={(v: string) => setLocalContent({...localContent, hero: {...localContent.hero, logo: v}})} />
        <Field label="Title" value={localContent.hero.title} onChange={(v: string) => setLocalContent({...localContent, hero: {...localContent.hero, title: v}})} />
        <Field label="Year" value={localContent.hero.year} onChange={(v: string) => setLocalContent({...localContent, hero: {...localContent.hero, year: v}})} />
        <Field label="Subtitle" value={localContent.hero.subtitle} onChange={(v: string) => setLocalContent({...localContent, hero: {...localContent.hero, subtitle: v}})} />
        <Field label="Date" value={localContent.hero.date} onChange={(v: string) => setLocalContent({...localContent, hero: {...localContent.hero, date: v}})} />
        <Field label="Venue" value={localContent.hero.venue} onChange={(v: string) => setLocalContent({...localContent, hero: {...localContent.hero, venue: v}})} />
      </Section>

      <Section label="About Section">
        <Field label="Badge" value={localContent.about.badge} onChange={(v: string) => setLocalContent({...localContent, about: {...localContent.about, badge: v}})} />
        <Field label="Title" value={localContent.about.title} onChange={(v: string) => setLocalContent({...localContent, about: {...localContent.about, title: v}})} />
        <TextArea label="Description" value={localContent.about.description} onChange={(v: string) => setLocalContent({...localContent, about: {...localContent.about, description: v}})} />
      </Section>

      <Section label="Sponsors Management">
        {localContent.sponsors.map((sponsor, i) => (
          <div key={i} className="p-4 bg-gray-50 mb-4 relative group/item">
            <button onClick={() => removeArrayItem('sponsors', i)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"><Trash2 size={16} /></button>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sponsor Name" value={sponsor.name} onChange={(v: string) => updateArrayItem('sponsors', i, 'name', v)} />
              <Field label="Logo URL" value={sponsor.logo} onChange={(v: string) => updateArrayItem('sponsors', i, 'logo', v)} />
            </div>
            <Field label="Website URL" value={sponsor.url} onChange={(v: string) => updateArrayItem('sponsors', i, 'url', v)} />
          </div>
        ))}
        <button onClick={() => addArrayItem('sponsors', { name: '', logo: '', url: '#' })} className="w-full border-2 border-dashed border-gray-200 py-3 text-xs font-black text-gray-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-all">+ Add Sponsor</button>
      </Section>

      <Section label="Athlete Profiles">
        {localContent.athletes.map((athlete, i) => (
          <div key={i} className="p-4 bg-gray-50 mb-4 relative group/item border-l-4 border-primary">
            <button onClick={() => removeArrayItem('athletes', i)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"><Trash2 size={16} /></button>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Athlete Name" value={athlete.name} onChange={(v: string) => updateArrayItem('athletes', i, 'name', v)} />
              <Field label="Specialty" value={athlete.specialty} onChange={(v: string) => updateArrayItem('athletes', i, 'specialty', v)} />
            </div>
            <Field label="Image URL" value={athlete.image} onChange={(v: string) => updateArrayItem('athletes', i, 'image', v)} />
            <TextArea label="Short Bio" value={athlete.bio} onChange={(v: string) => updateArrayItem('athletes', i, 'bio', v)} />
          </div>
        ))}
        <button onClick={() => addArrayItem('athletes', { name: '', specialty: '', image: '', bio: '' })} className="w-full border-2 border-dashed border-gray-200 py-3 text-xs font-black text-gray-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-all">+ Add Athlete Profile</button>
      </Section>

      <Section label="Gallery Settings">
        <Field label="Title" value={localContent.gallery.title} onChange={(v: string) => setLocalContent({...localContent, gallery: {...localContent.gallery, title: v}})} />
        <Field label="Subtitle" value={localContent.gallery.subtitle} onChange={(v: string) => setLocalContent({...localContent, gallery: {...localContent.gallery, subtitle: v}})} />
      </Section>

      <Section label="Footer">
        <TextArea label="Description" value={localContent.footer.description} onChange={(v: string) => setLocalContent({...localContent, footer: {...localContent.footer, description: v}})} />
      </Section>

      <button onClick={() => onUpdate(localContent)} className="gold-gradient text-black font-display font-black w-full py-6 shadow-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all text-sm uppercase tracking-widest">
        <Save size={20} /> Deploy Content Updates
      </button>
    </div>
  );
}

function Section({ label, children }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-display font-black text-primary border-b border-gray-100 pb-2 uppercase tracking-widest">{label}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase text-black/30">{label}</label>
      <input className="w-full bg-gray-50 border-none p-3 text-sm outline-none focus:bg-gray-100 transition-colors" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function TextArea({ label, value, onChange }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase text-black/30">{label}</label>
      <textarea rows={4} className="w-full bg-gray-50 border-none p-3 text-sm outline-none focus:bg-gray-100 transition-colors resize-none" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
