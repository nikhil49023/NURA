import React, { useState } from 'react';
import { 
  Activity, 
  Scan, 
  Utensils, 
  ChevronRight, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Home as HomeIcon,
  Search,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Screen = 'home' | 'report' | 'product' | 'recipe';

const API_BASE = "http://localhost:8080/api/v1";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(true); // New users see quiz
  const [dosha, setDosha] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [showReasoning, setShowReasoning] = useState(false);

  const scanReport = async () => {
    setLoading(true);
    // Simulate file upload
    setTimeout(async () => {
      const res = await fetch(`${API_BASE}/scan-report`, { method: 'POST' });
      const data = await res.json();
      setReportData(data);
      setLoading(false);
    }, 1500);
  };

  const analyzeBarcode = async (code: string) => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/analyze-barcode/${code}`);
    const data = await res.json();
    setProductData(data);
    setLoading(false);
  };

  const fetchRecipes = async (ingredients: string[]) => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/suggest-recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ingredients)
    });
    const data = await res.json();
    setRecipes(data);
    setLoading(false);
  };

  const renderScreen = () => {
    if (loading) return <LoadingScreen />;
    switch (currentScreen) {
      case 'home': return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'report': return <ReportScreen onBack={() => setCurrentScreen('home')} onScan={scanReport} data={reportData} />;
      case 'product': return <ProductScreen onBack={() => setCurrentScreen('home')} onScan={analyzeBarcode} data={productData} />;
      case 'recipe': return <RecipeScreen onBack={() => setCurrentScreen('home')} onFetch={fetchRecipes} data={recipes} />;
      default: return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="container">
      <AnimatePresence mode="wait">
        {showQuiz ? (
          <DoshaQuiz onComplete={(d) => { setDosha(d); setShowQuiz(false); }} />
        ) : renderScreen()}
      </AnimatePresence>
      
      {/* Navigation Bar */}
      <div className="glass-card" style={{ 
        position: 'fixed', 
        bottom: 20, 
        left: 20, 
        right: 20, 
        marginBottom: 0, 
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        borderRadius: '32px'
      }}>
        <NavButton active={currentScreen === 'home'} onClick={() => setCurrentScreen('home')} icon={<HomeIcon size={24} />} label="Home" />
        <NavButton active={currentScreen === 'report'} onClick={() => setCurrentScreen('report')} icon={<Activity size={24} />} label="Stats" />
        <NavButton active={currentScreen === 'product'} onClick={() => setCurrentScreen('product')} icon={<Scan size={24} />} label="Scan" />
        <NavButton active={currentScreen === 'recipe'} onClick={() => setCurrentScreen('recipe')} icon={<Utensils size={24} />} label="Cook" />
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      style={{ width: 64, height: 64, border: '4px solid var(--primary-saffron)', borderTopColor: 'transparent', borderRadius: '50%' }}
    />
    <p style={{ marginTop: 24, fontWeight: 600, color: 'var(--primary-brown)' }}>Syncing with Intelligence Layer...</p>
  </div>
);

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button onClick={onClick} style={{ 
    background: 'none', 
    border: 'none', 
    color: active ? 'var(--primary-saffron)' : 'var(--text-muted)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer'
  }}>
    {icon}
    <span style={{ fontSize: '10px', fontWeight: 600 }}>{label}</span>
  </button>
);

const HomeScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <header style={{ marginBottom: 32, marginTop: 20 }}>
      <h1>NURA</h1>
      <p style={{ color: 'var(--text-muted)' }}>Precision Health, Rooted in Ayurveda.</p>
    </header>

    <div className="glass-card" style={{ background: 'linear-gradient(135deg, var(--primary-saffron), #FFB74D)', color: 'white' }}>
      <h2 style={{ color: 'white', marginBottom: 8 }}>My Wellness Score</h2>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <span style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}>78</span>
        <span style={{ fontSize: 18, opacity: 0.8, marginBottom: 8 }}>/100</span>
      </div>
      <p style={{ marginTop: 16, fontSize: 14 }}>Your Pitta levels are slightly high. Try cooling foods today.</p>
    </div>

    <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(255,255,255,0.5)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
        ⚠️ <strong>Medical Disclaimer:</strong> NURA provides AI-driven nutritional guidance based on Ayurveda and clinical data. It is not a medical device. Always consult a physician for health concerns.
      </p>
    </div>

    <section>
      <h2>Quick Actions</h2>
      <div className="glass-card" onClick={() => onNavigate('report')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ background: '#FFF3E0', padding: 12, borderRadius: 16 }}>
          <Upload color="var(--primary-saffron)" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16 }}>Scan Health Report</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Analyze blood markers with AI</p>
        </div>
        <ChevronRight size={20} color="var(--text-muted)" />
      </div>

      <div className="glass-card" onClick={() => onNavigate('product')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ background: '#E8F5E9', padding: 12, borderRadius: 16 }}>
          <Scan color="var(--primary-green)" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16 }}>Analyze Product</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Is this packaged food safe for you?</p>
        </div>
        <ChevronRight size={20} color="var(--text-muted)" />
      </div>

      <div className="glass-card" onClick={() => onNavigate('recipe')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ background: '#E3F2FD', padding: 12, borderRadius: 16 }}>
          <Utensils color="#1976D2" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16 }}>Personalized Recipes</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cook based on your body markers</p>
        </div>
        <ChevronRight size={20} color="var(--text-muted)" />
      </div>
    </section>
  </motion.div>
);

const ReportScreen = ({ onBack, onScan, data }: { onBack: () => void, onScan: () => void, data: any }) => (
  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <XCircle size={24} color="var(--text-muted)" />
      </button>
      <h2>Report Analysis</h2>
    </header>

    {!data ? (
      <div className="glass-card" style={{ textAlign: 'center', border: '2px dashed var(--glass-border)', padding: '40px 20px' }}>
        <Upload size={48} color="var(--primary-saffron)" style={{ marginBottom: 16 }} />
        <h3>Upload Lab Report</h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>PDF or JPG (max 5MB)</p>
        <button className="btn-primary" style={{ marginTop: 24 }} onClick={onScan}>Select File & Scan</button>
      </div>
    ) : (
      <>
        <div className="glass-card" style={{ background: 'var(--primary-green)', color: 'white' }}>
          <h3 style={{ color: 'white' }}>Ayurvedic Insight</h3>
          <p style={{ fontSize: 14, marginTop: 8 }}>{data.ayurvedic_insight}</p>
        </div>

        <section>
          <h2>Extracted Markers</h2>
          {data.markers.map((m: any) => (
            <div className="glass-card" key={m.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>{m.name}</span>
                <span className={`marker-badge ${m.status.toLowerCase().includes('high') ? 'high' : 'normal'}`}>
                  {m.value}{m.unit}
                </span>
              </div>
              <div style={{ height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ 
                  width: m.status.toLowerCase().includes('high') ? '85%' : '45%', 
                  height: '100%', 
                  background: m.status.toLowerCase().includes('high') ? 'var(--danger)' : 'var(--success)' 
                }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Status: {m.status}</p>
            </div>
          ))}
        </section>

        <section style={{ marginBottom: 100 }}>
          <h2>Recommendations</h2>
          <div className="glass-card">
            <ul style={{ list_style: 'none', padding: 0 }}>
              {data.recommendations.map((r: string) => (
                <li key={r} style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 14 }}>
                  <CheckCircle2 size={18} color="var(--primary-green)" /> {r}
                </li>
              ))}
            </ul>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 16, textAlign: 'center' }}>
            Consult your doctor before making major changes to your diet or health regimen.
          </p>
        </section>
      </>
    )}
  </motion.div>
);

const ProductScreen = ({ onBack, onScan, data }: { onBack: () => void, onScan: (code: string) => void, data: any }) => (
  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <XCircle size={24} color="var(--text-muted)" />
      </button>
      <h2>Product Analyzer</h2>
    </header>

    {!data ? (
      <>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', height: 240, position: 'relative', background: '#000' }}>
          {/* Mock Camera View */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '80%', height: '60%', border: '2px solid white', borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 16, width: '100%', textAlign: 'center', color: 'white', fontSize: 12 }}>
            Align barcode within the frame
          </div>
        </div>
        <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => onScan("8901058860211")}>Simulate Scan (Biscuits)</button>
      </>
    ) : (
      <>
        <div className={`verdict-banner ${data.verdict.toLowerCase()}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {data.verdict === 'Eat' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            <span>{data.verdict.toUpperCase()}: {data.verdict === 'Eat' ? 'GOOD' : data.verdict === 'Caution' ? 'MODERATE' : 'AVOID'} FIT</span>
          </div>
        </div>

        <div className="glass-card">
          <h3>{data.product_name}</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
            Analysis: {data.reason}
          </p>

          <button 
            onClick={() => setShowReasoning(!showReasoning)}
            style={{ marginTop: 16, background: 'none', border: `1px solid var(--glass-border)`, color: 'var(--primary-brown)', padding: '8px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            {showReasoning ? 'Hide Reasoning' : 'Explain Why?'}
          </button>
          
          <AnimatePresence>
            {showReasoning && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ marginTop: 16, padding: 16, background: '#FFF8E1', borderRadius: 16, overflow: 'hidden' }}
              >
                <h4 style={{ fontSize: 14, color: 'var(--primary-brown)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <BookOpen size={16} /> Ayurvedic + Clinical Reasoning
                </h4>
                <p style={{ fontSize: 13, marginTop: 8, color: '#795548', lineHeight: 1.5 }}>
                  {data.ayurvedic_perspective}
                </p>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: 11, color: 'var(--text-muted)' }}>
                  <strong>Sources:</strong> {data.sources.join(', ')} <br/>
                  <strong>AI Confidence:</strong> {(data.confidence * 100).toFixed(0)}%
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 24, fontStyle: 'italic' }}>
            {data.disclaimer}
          </p>

          <button className="btn-primary" style={{ marginTop: 24, background: 'var(--text-muted)' }} onClick={() => { setProductData(null); setShowReasoning(false); }}>Scan Another</button>
        </div>
      </>
    )}
  </motion.div>
);

const RecipeScreen = ({ onBack, onFetch, data }: { onBack: () => void, onFetch: (ing: string[]) => void, data: any[] }) => (
  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <XCircle size={24} color="var(--text-muted)" />
      </button>
      <h2>Healing Recipes</h2>
    </header>

    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
      <div className="glass-card" style={{ flex: 1, marginBottom: 0, padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Search size={16} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="What's in your pantry? (e.g. mung dal, rice)" 
          style={{ background: 'none', border: 'none', fontSize: 14, width: '100%', outline: 'none' }} 
          onKeyDown={(e) => {
            if (e.key === 'Enter') onFetch((e.target as HTMLInputElement).value.split(','));
          }}
        />
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 100 }}>
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <Utensils size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <p>Search ingredients to find recipes that heal you.</p>
        </div>
      ) : (
        data.map((r) => (
          <RecipeCard 
            key={r.name}
            name={r.name} 
            score={r.health_score} 
            time={r.prep_time} 
            tags={r.ingredients} 
            color={r.health_score > 90 ? 'var(--primary-green)' : 'var(--primary-saffron)'} 
            benefit={r.ayurvedic_benefit}
          />
        ))
      )}
    </div>
  </motion.div>
);

const RecipeCard = ({ name, score, time, tags, color, benefit }: any) => (
  <div className="glass-card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <div style={{ width: 60, height: 60, background: color + '22', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Utensils color={color} size={24} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: 15, margin: 0 }}>{name}</h3>
        <span style={{ fontSize: 11, fontWeight: 700, color: color }}>{score}%</span>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Prep: {time}</p>
      <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--primary-brown)' }}>"{benefit}"</p>
    </div>
  </div>
);

const DoshaQuiz = ({ onComplete }: { onComplete: (d: string) => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 20 }}>
    <Activity size={48} color="var(--primary-saffron)" style={{ marginBottom: 24 }} />
    <h1>Discover Your Dosha</h1>
    <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Answer 5 questions to personalize NURA to your Prakriti (body constitution).</p>
    
    <div className="glass-card" style={{ textAlign: 'left' }}>
      <h3 style={{ fontSize: 16, marginBottom: 16 }}>How is your digestion usually?</h3>
      <QuizOption label="Strong & Intense (Pitta)" onClick={() => onComplete('Pitta')} />
      <QuizOption label="Slow & Heavy (Kapha)" onClick={() => onComplete('Kapha')} />
      <QuizOption label="Irregular & Gassy (Vata)" onClick={() => onComplete('Vata')} />
    </div>
  </motion.div>
);

const QuizOption = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    style={{ width: '100%', textAlign: 'left', padding: '16px', background: 'white', border: '1px solid var(--glass-border)', borderRadius: 12, marginBottom: 12, cursor: 'pointer', fontWeight: 600, color: 'var(--primary-brown)' }}
  >
    {label}
  </button>
);

export default App;
