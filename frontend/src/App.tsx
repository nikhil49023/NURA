import React, { useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Home as HomeIcon,
  Scan,
  Search,
  Upload,
  Utensils,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import heroImage from './assets/hero.png';
import './App.css';

type Screen = 'home' | 'report' | 'product' | 'recipe';

type Marker = {
  name: string;
  value: string | number;
  unit?: string;
  status: string;
};

type ReportData = {
  ayurvedic_insight: string;
  markers: Marker[];
  recommendations: string[];
};

type ProductData = {
  verdict: 'Eat' | 'Caution' | 'Avoid';
  product_name: string;
  reason: string;
  ayurvedic_perspective: string;
  sources: string[];
  confidence: number;
  disclaimer: string;
};

type Recipe = {
  name: string;
  health_score: number;
  prep_time: string;
  ingredients: string[];
  ayurvedic_benefit: string;
};

const API_BASE = 'http://localhost:8082/api/v1';

const screenMeta: Record<
  Screen,
  { label: string; sublabel: string; icon: React.ReactNode }
> = {
  home: {
    label: 'Home',
    sublabel: 'Overview',
    icon: <HomeIcon size={18} />,
  },
  report: {
    label: 'Reports',
    sublabel: 'Biomarkers',
    icon: <Activity size={18} />,
  },
  product: {
    label: 'Products',
    sublabel: 'Barcode fit',
    icon: <Scan size={18} />,
  },
  recipe: {
    label: 'Recipes',
    sublabel: 'Kitchen guidance',
    icon: <Utensils size={18} />,
  },
};

const motionTransition = { duration: 0.32, ease: 'easeOut' as const };

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(true);
  const [dosha, setDosha] = useState<string>('Pitta');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const scanReport = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/scan-report?dosha=${dosha}`, {
        method: 'POST',
        body: formData,
      });
      const data = (await res.json()) as ReportData;
      setReportData(data);
    } catch (error) {
      console.error('Scan failed', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBarcode = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analyze-barcode/${code}?dosha=${dosha}`);
      const data = (await res.json()) as ProductData;
      setProductData(data);
    } catch (error) {
      console.error('Barcode analysis failed', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async (ingredients: string[]) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/suggest-recipes?dosha=${dosha}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingredients),
      });
      const data = (await res.json()) as Recipe[];
      setRecipes(data);
    } catch (error) {
      console.error('Recipe fetch failed', error);
    } finally {
      setLoading(false);
    }
  };

  const renderScreen = () => {
    if (loading) {
      return <LoadingScreen />;
    }

    switch (currentScreen) {
      case 'report':
        return (
          <ReportScreen
            dosha={dosha}
            data={reportData}
            onBack={() => setCurrentScreen('home')}
            onReset={() => setReportData(null)}
            onScan={scanReport}
          />
        );
      case 'product':
        return (
          <ProductScreen
            dosha={dosha}
            data={productData}
            onBack={() => setCurrentScreen('home')}
            onReset={() => setProductData(null)}
            onScan={analyzeBarcode}
          />
        );
      case 'recipe':
        return (
          <RecipeScreen
            dosha={dosha}
            data={recipes}
            onBack={() => setCurrentScreen('home')}
            onFetch={fetchRecipes}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen
            dosha={dosha}
            onNavigate={setCurrentScreen}
            productData={productData}
            recipeCount={recipes.length}
            reportData={reportData}
          />
        );
    }
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="ambient ambient-c" />

      <div className="layout-shell">
        <aside className="sidebar glass-card">
          <div className="brand-lockup">
            <p className="eyebrow">Ayurvedic Intelligence</p>
            <h1>NURA</h1>
            <p className="brand-copy">
              A luxury wellness interface for reports, nutrition checks, and
              kitchen guidance.
            </p>
          </div>

          <div className="sidebar-hero">
            <img src={heroImage} alt="NURA wellness composition" />
          </div>

          <div className="sidebar-panel">
            <span className="sidebar-label">Active profile</span>
            <div className="profile-chip">
              <span className="profile-dot" />
              <div>
                <strong>{dosha}</strong>
                <p>Personalized recommendations enabled</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {(
              Object.entries(screenMeta) as Array<
                [Screen, { label: string; sublabel: string; icon: React.ReactNode }]
              >
            ).map(([screen, meta]) => (
              <button
                key={screen}
                className={`nav-rail-button ${
                  currentScreen === screen ? 'is-active' : ''
                }`}
                onClick={() => setCurrentScreen(screen)}
                type="button"
              >
                <span className="nav-rail-icon">{meta.icon}</span>
                <span>
                  <strong>{meta.label}</strong>
                  <small>{meta.sublabel}</small>
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="content-shell">
          <AnimatePresence mode="wait">
            {showQuiz ? (
              <DoshaQuiz
                key="quiz"
                onComplete={(selectedDosha) => {
                  setDosha(selectedDosha);
                  setShowQuiz(false);
                }}
              />
            ) : (
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={motionTransition}
                className="screen-frame"
              >
                {renderScreen()}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {!showQuiz && (
        <div className="mobile-nav glass-card">
          {(
            Object.entries(screenMeta) as Array<
              [Screen, { label: string; sublabel: string; icon: React.ReactNode }]
            >
          ).map(([screen, meta]) => (
            <button
              key={screen}
              className={`mobile-nav-button ${
                currentScreen === screen ? 'is-active' : ''
              }`}
              onClick={() => setCurrentScreen(screen)}
              type="button"
            >
              {meta.icon}
              <span>{meta.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LoadingScreen = () => (
  <section className="loading-state glass-card">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className="loading-ring"
    />
    <p className="eyebrow">Syncing your intelligence layer</p>
    <h2>Preparing personalized guidance</h2>
  </section>
);

const HomeScreen = ({
  dosha,
  onNavigate,
  productData,
  recipeCount,
  reportData,
}: {
  dosha: string;
  onNavigate: (screen: Screen) => void;
  productData: ProductData | null;
  recipeCount: number;
  reportData: ReportData | null;
}) => (
  <div className="page-stack">
    <section className="hero-panel glass-card">
      <div className="hero-copy">
        <p className="eyebrow">Personal dashboard</p>
        <h2>Precision health, composed with calmer visual weight.</h2>
        <p className="hero-text">
          Your current profile is tuned to <strong>{dosha}</strong>. The
          interface balances report reading, product decisions, and recipe
          discovery in a single responsive workspace.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => onNavigate('report')} type="button">
            Scan latest report
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('product')} type="button">
            Check a product
          </button>
        </div>
      </div>

      <div className="score-panel">
        <span className="score-label">Wellness score</span>
        <div className="score-value-row">
          <strong>78</strong>
          <span>/100</span>
        </div>
        <p>
          Cooling foods and simpler packaged ingredients will keep today’s
          balance steadier.
        </p>
      </div>
    </section>

    <section className="metrics-grid">
      <MetricCard
        label="Report intelligence"
        value={reportData ? `${reportData.markers.length} markers` : 'Ready'}
        detail={reportData ? 'Parsed from your latest upload' : 'Upload bloodwork to begin'}
      />
      <MetricCard
        label="Product check"
        value={productData?.verdict ?? 'Idle'}
        detail={productData ? productData.product_name : 'Scan a barcode for a quick fit'}
      />
      <MetricCard
        label="Kitchen library"
        value={recipeCount > 0 ? `${recipeCount} recipes` : 'Curate'}
        detail="Generate healing meals from pantry ingredients"
      />
    </section>

    <section className="quick-grid">
      <ActionCard
        title="Scan Health Report"
        copy="Upload biomarkers and convert them into clear Ayurvedic and clinical guidance."
        icon={<Upload size={20} />}
        accent="gold"
        onClick={() => onNavigate('report')}
      />
      <ActionCard
        title="Analyze Product"
        copy="Review ingredient-level fit before a purchase with a cleaner verdict flow."
        icon={<Scan size={20} />}
        accent="sage"
        onClick={() => onNavigate('product')}
      />
      <ActionCard
        title="Build Recipes"
        copy="Turn pantry items into dosha-aware recipes with preparation and health scoring."
        icon={<Utensils size={20} />}
        accent="rose"
        onClick={() => onNavigate('recipe')}
      />
    </section>

    <section className="disclaimer-banner glass-card">
      <p>
        NURA provides AI-assisted nutrition and wellness guidance. It does not
        replace medical diagnosis, treatment, or clinician review.
      </p>
    </section>
  </div>
);

const MetricCard = ({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) => (
  <article className="metric-card glass-card">
    <span className="metric-label">{label}</span>
    <strong>{value}</strong>
    <p>{detail}</p>
  </article>
);

const ActionCard = ({
  accent,
  copy,
  icon,
  onClick,
  title,
}: {
  accent: 'gold' | 'sage' | 'rose';
  copy: string;
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}) => (
  <button className={`action-card glass-card accent-${accent}`} onClick={onClick} type="button">
    <span className="action-icon">{icon}</span>
    <div className="action-copy">
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
    <ChevronRight size={18} className="action-arrow" />
  </button>
);

const ReportScreen = ({
  data,
  dosha,
  onBack,
  onReset,
  onScan,
}: {
  data: ReportData | null;
  dosha: string;
  onBack: () => void;
  onReset: () => void;
  onScan: (file: File) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Clinical intelligence"
        title="Report Analysis"
        subtitle={`Personalized for your ${dosha} profile.`}
        onBack={onBack}
      />

      {!data ? (
        <section className="upload-shell glass-card">
          <div className="upload-icon">
            <Upload size={32} />
          </div>
          <h3>Upload a lab report</h3>
          <p>Use PDF or image files. NURA will extract markers and summarize patterns.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden-input"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onScan(file);
              }
            }}
          />
          <button className="btn-primary" onClick={() => fileInputRef.current?.click()} type="button">
            Select file and analyze
          </button>
        </section>
      ) : (
        <>
          <section className="insight-banner glass-card">
            <p className="eyebrow">Ayurvedic insight</p>
            <h3>{data.ayurvedic_insight}</h3>
          </section>

          <section className="report-grid">
            <div className="glass-card section-card">
              <div className="section-head">
                <h3>Extracted markers</h3>
                <span>{data.markers.length} tracked</span>
              </div>
              <div className="marker-list">
                {data.markers.map((marker) => {
                  const state = marker.status.toLowerCase();
                  const tone = state.includes('high')
                    ? 'high'
                    : state.includes('low')
                      ? 'low'
                      : 'normal';

                  return (
                    <article key={marker.name} className="marker-card">
                      <div className="marker-row">
                        <div>
                          <strong>{marker.name}</strong>
                          <p>Status: {marker.status}</p>
                        </div>
                        <span className={`marker-badge ${tone}`}>
                          {marker.value}
                          {marker.unit ?? ''}
                        </span>
                      </div>
                      <div className="meter-track">
                        <div className={`meter-fill ${tone}`} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="glass-card section-card">
              <div className="section-head">
                <h3>Recommended next steps</h3>
                <span>For review</span>
              </div>
              <ul className="recommendation-list">
                {data.recommendations.map((recommendation) => (
                  <li key={recommendation}>
                    <CheckCircle2 size={18} />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-secondary" onClick={onReset} type="button">
                Analyze another report
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const ProductScreen = ({
  data,
  dosha,
  onBack,
  onReset,
  onScan,
}: {
  data: ProductData | null;
  dosha: string;
  onBack: () => void;
  onReset: () => void;
  onScan: (code: string) => void;
}) => {
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Ingredient intelligence"
        title="Product Analyzer"
        subtitle={`Barcode verdicts tuned to ${dosha}.`}
        onBack={onBack}
      />

      {!data ? (
        <section className="scanner-layout">
          <div className="camera-shell glass-card">
            <div className="scan-frame">
              <div className="scan-box" />
              <span>Align the barcode within the frame</span>
            </div>
          </div>

          <div className="glass-card section-card">
            <h3>Start with a simulated scan</h3>
            <p>
              Use the built-in demo barcode to verify the flow and inspect the
              improved reasoning panel.
            </p>
            <button className="btn-primary" onClick={() => onScan('8901058860211')} type="button">
              Simulate biscuit scan
            </button>
          </div>
        </section>
      ) : (
        <section className="product-layout">
          <div className={`verdict-banner ${data.verdict.toLowerCase()}`}>
            <div className="verdict-row">
              {data.verdict === 'Eat' ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
              <div>
                <span className="verdict-label">{data.verdict}</span>
                <p>{data.reason}</p>
              </div>
            </div>
          </div>

          <div className="glass-card section-card">
            <div className="section-head">
              <h3>{data.product_name}</h3>
              <span>{Math.round(data.confidence * 100)}% confidence</span>
            </div>
            <p className="body-copy">{data.reason}</p>

            <button
              className="btn-secondary"
              onClick={() => setShowReasoning((current) => !current)}
              type="button"
            >
              {showReasoning ? 'Hide reasoning' : 'Explain this verdict'}
            </button>

            <AnimatePresence initial={false}>
              {showReasoning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={motionTransition}
                  className="reasoning-panel"
                >
                  <div className="reasoning-head">
                    <BookOpen size={16} />
                    <strong>Ayurvedic and clinical reasoning</strong>
                  </div>
                  <p>{data.ayurvedic_perspective}</p>
                  <div className="reasoning-meta">
                    <span>Sources: {data.sources.join(', ')}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="fine-print">{data.disclaimer}</p>

            <button
              className="btn-primary"
              onClick={() => {
                setShowReasoning(false);
                onReset();
              }}
              type="button"
            >
              Scan another product
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

const RecipeScreen = ({
  data,
  dosha,
  onBack,
  onFetch,
}: {
  data: Recipe[];
  dosha: string;
  onBack: () => void;
  onFetch: (ingredients: string[]) => void;
}) => {
  const [query, setQuery] = useState('');

  const handleFetch = () => {
    const ingredients = query
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (ingredients.length > 0) {
      onFetch(ingredients);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Kitchen guidance"
        title="Healing Recipes"
        subtitle={`Build ${dosha}-aware meals from available ingredients.`}
        onBack={onBack}
      />

      <section className="search-shell glass-card">
        <div className="search-input-row">
          <Search size={18} />
          <input
            type="text"
            value={query}
            placeholder="Try mung dal, rice, cumin, bottle gourd"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleFetch();
              }
            }}
          />
        </div>
        <button className="btn-primary" onClick={handleFetch} type="button">
          Generate recipes
        </button>
      </section>

      {data.length === 0 ? (
        <section className="empty-state glass-card">
          <Utensils size={36} />
          <h3>No recipes yet</h3>
          <p>Search pantry ingredients to generate lighter, more personalized meals.</p>
        </section>
      ) : (
        <section className="recipe-grid">
          {data.map((recipe) => (
            <RecipeCard key={recipe.name} recipe={recipe} />
          ))}
        </section>
      )}
    </div>
  );
};

const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
  <article className="glass-card recipe-card">
    <div className="recipe-head">
      <div className="recipe-icon">
        <Utensils size={20} />
      </div>
      <div>
        <h3>{recipe.name}</h3>
        <p>Prep: {recipe.prep_time}</p>
      </div>
      <span className="recipe-score">{recipe.health_score}%</span>
    </div>

    <p className="body-copy">{recipe.ayurvedic_benefit}</p>

    <div className="tag-row">
      {recipe.ingredients.map((ingredient) => (
        <span key={ingredient} className="tag">
          {ingredient}
        </span>
      ))}
    </div>
  </article>
);

const DoshaQuiz = ({ onComplete }: { onComplete: (dosha: string) => void }) => (
  <motion.section
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -18 }}
    transition={motionTransition}
    className="quiz-shell glass-card"
  >
    <p className="eyebrow">Personalization</p>
    <h2>Discover your dosha profile</h2>
    <p className="hero-text">
      Choose the description that best matches your baseline digestion pattern
      to calibrate recommendations.
    </p>

    <div className="quiz-options">
      <QuizOption
        label="Strong and intense"
        note="Pitta"
        onClick={() => onComplete('Pitta')}
      />
      <QuizOption
        label="Slow and heavy"
        note="Kapha"
        onClick={() => onComplete('Kapha')}
      />
      <QuizOption
        label="Irregular and light"
        note="Vata"
        onClick={() => onComplete('Vata')}
      />
    </div>
  </motion.section>
);

const QuizOption = ({
  label,
  note,
  onClick,
}: {
  label: string;
  note: string;
  onClick: () => void;
}) => (
  <button className="quiz-option" onClick={onClick} type="button">
    <div>
      <strong>{label}</strong>
      <p>{note}</p>
    </div>
    <ChevronRight size={18} />
  </button>
);

const PageHeader = ({
  eyebrow,
  onBack,
  subtitle,
  title,
}: {
  eyebrow: string;
  onBack: () => void;
  subtitle: string;
  title: string;
}) => (
  <header className="page-header">
    <button className="icon-button" onClick={onBack} type="button" aria-label="Go back">
      <XCircle size={20} />
    </button>
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="subtitle">{subtitle}</p>
    </div>
  </header>
);

export default App;
