import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, RotateCw, Info, MapPin, Scale, Ruler, Utensils, Calendar, Sparkles, Key, AlertCircle, ArrowRight, X } from 'lucide-react';
import { DinoCardData, DinoStats } from './types';
import { generateDinoStats, generateDinoImage, checkApiKey, openApiKeyDialog } from './services/gemini';

// --- Components ---

const Typewriter = ({ text, speed = 20, onComplete }: { text: string; speed?: number; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, speed, onComplete]);

  return <span className="typing-cursor">{displayedText}</span>;
};

const ApiKeyPrompt = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-black border-2 border-white rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-center"
      >
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
          <Key className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-4 text-white">API Key Required</h2>
        <p className="text-zinc-400 mb-8 font-sans">
          To generate high-quality images with Nano Banana Pro, you need to select a paid Google Cloud project API key.
        </p>
        <button
          onClick={async () => {
            await openApiKeyDialog();
            onComplete();
          }}
          className="w-full py-3 px-6 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Select API Key
        </button>
        <p className="mt-4 text-xs text-zinc-500">
          Learn more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-400">Gemini API billing</a>.
        </p>
      </motion.div>
    </div>
  );
};

const CardFront = ({ stats, imageUrl }: { stats: DinoStats; imageUrl: string }) => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-black border-4 border-black">
      {/* Background Image */}
      <img 
        src={imageUrl} 
        alt={stats.name} 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

const CardBack = ({ stats }: { stats: DinoStats }) => {
  return (
    <div className="w-full h-full bg-white border-4 border-black p-6 flex flex-col overflow-hidden relative text-black">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h3 className="text-2xl font-serif italic font-bold text-black">Battle Stats</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono bg-black text-white px-1.5 py-0.5">LV.{stats.level}</span>
              <span className="text-[10px] font-mono border border-black px-1.5 py-0.5">HP {stats.hp}</span>
              <span className="text-[10px] font-mono border border-black px-1.5 py-0.5 uppercase">{stats.energyType}</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Serial #DINO-{Math.floor(Math.random() * 9000) + 1000}</div>
        </div>

        <div className="space-y-6 flex-grow">
          {/* Attacks Section */}
          <div className="space-y-4">
            {stats.attacks.map((attack, idx) => (
              <div key={idx} className="border-b border-zinc-200 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm uppercase tracking-tight">{attack.name}</h4>
                  <span className="font-mono font-bold text-sm">{attack.damage}</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-tight italic">{attack.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-4 pt-4 border-t border-zinc-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <Ruler className="w-3 h-3" />
                <span className="text-[9px] uppercase font-bold tracking-wider">Height</span>
              </div>
              <div className="text-sm font-mono text-black">{stats.height}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <Scale className="w-3 h-3" />
                <span className="text-[9px] uppercase font-bold tracking-wider">Weight</span>
              </div>
              <div className="text-sm font-mono text-black">{stats.weight}</div>
            </div>
          </div>

          {/* Fun Fact */}
          <div className="mt-auto p-3 bg-zinc-50 border border-zinc-200">
            <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest block mb-1">Field Note</span>
            <p className="text-[10px] text-zinc-700 leading-relaxed">
              {stats.funFact}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-black flex justify-center">
          <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
             <div className="w-6 h-6 bg-black flex items-center justify-center text-[8px] font-bold text-white">
               DNA
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

const DINO_TREE: TreeNode = {
  name: "Dinosauria",
  children: [
    {
      name: "Saurischia",
      children: [
        {
          name: "Theropoda",
          children: [
            { name: "Tyrannosaurus Rex" },
            { name: "Velociraptor" },
            { name: "Spinosaurus" },
            { name: "Allosaurus" },
          ],
        },
        {
          name: "Sauropodomorpha",
          children: [
            { name: "Brachiosaurus" },
            { name: "Diplodocus" },
            { name: "Apatosaurus" },
          ],
        },
      ],
    },
    {
      name: "Ornithischia",
      children: [
        {
          name: "Thyreophora",
          children: [
            { name: "Stegosaurus" },
            { name: "Ankylosaurus" },
          ],
        },
        {
          name: "Marginocephalia",
          children: [
            { name: "Triceratops" },
            { name: "Pachycephalosaurus" },
          ],
        },
        {
          name: "Ornithopoda",
          children: [
            { name: "Parasaurolophus" },
            { name: "Iguanodon" },
          ],
        },
      ],
    },
  ],
};

const flattenTree = (node: TreeNode): string[] => {
  let names = [node.name];
  if (node.children) {
    node.children.forEach(child => {
      names = [...names, ...flattenTree(child)];
    });
  }
  return names;
};

const ALL_DINO_NAMES = flattenTree(DINO_TREE);

const TreeItem = ({ 
  node, 
  onSelect, 
  selectedIndex, 
  allNames, 
  isRoot = false 
}: { 
  node: TreeNode; 
  onSelect: (name: string) => void; 
  selectedIndex: number;
  allNames: string[];
  isRoot?: boolean 
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = allNames[selectedIndex] === node.name;

  return (
    <div className="relative flex flex-col">
      <div className="flex items-center">
        {!isRoot && (
          <div className="w-6 h-[1px] bg-white/20 mr-0" />
        )}
        <button
          onClick={() => onSelect(node.name)}
          className={`font-mono text-sm py-1.5 px-3 rounded transition-all text-left uppercase tracking-[0.2em] ${
            isSelected 
              ? 'text-white bg-white/20' 
              : 'text-white/40 hover:text-white hover:bg-white/10'
          }`}
        >
          {node.name}
        </button>
      </div>

      {hasChildren && (
        <div className="ml-[12px] border-l border-white/20 flex flex-col">
          {node.children!.map((child, i) => (
            <div key={child.name} className="relative">
              {/* This div hides the vertical line below the last child's horizontal connector */}
              {i === node.children!.length - 1 && (
                <div className="absolute top-[12px] -left-[1px] w-[2px] h-full bg-black z-10" />
              )}
              {/* Horizontal connector for the child */}
              <div className="absolute top-[12px] -left-[1px] w-3 h-[1px] bg-white/20" />
              <div className="pl-3">
                <TreeItem 
                  node={child} 
                  onSelect={onSelect} 
                  selectedIndex={selectedIndex}
                  allNames={allNames}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DinoTree = ({ 
  onSelect, 
  selectedIndex, 
  allNames 
}: { 
  onSelect: (name: string) => void; 
  selectedIndex: number;
  allNames: string[];
}) => {
  return (
    <div className="w-full pb-12 overflow-x-auto flex justify-start">
      <div className="min-w-max">
        <TreeItem 
          node={DINO_TREE} 
          onSelect={onSelect} 
          selectedIndex={selectedIndex}
          allNames={allNames}
          isRoot={true} 
        />
      </div>
    </div>
  );
};

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<DinoCardData | null>(null);
  const [tempStats, setTempStats] = useState<DinoStats | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [view, setView] = useState<'landing' | 'card'>('landing');
  const [typingFinished, setTypingFinished] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSearch = useCallback(async (dinoName?: string) => {
    const searchTerm = dinoName || query;
    if (!searchTerm.trim() || loading) return;

    setCurrentDinoName(searchTerm);
    setView('card');
    setLoading(true);
    setGeneratingImage(false);
    setError(null);
    setCardData(null);
    setTempStats(null);
    setIsFlipped(false);
    setTypingFinished(false);

    try {
      // Step 1: Generate Stats (Fast)
      const stats = await generateDinoStats(searchTerm);
      setTempStats(stats);
      setGeneratingImage(true);
      
      // Step 2: Generate Image (Slow)
      const imageUrl = await generateDinoImage(stats);
      
      setCardData({ stats, imageUrl });
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Requested entity was not found') || err.message?.includes('API key')) {
        setNeedsApiKey(true);
      } else {
        setError("Failed to bring this dinosaur back to life. Please try again.");
      }
    } finally {
      setLoading(false);
      setGeneratingImage(false);
    }
  }, [query, loading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'landing') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % ALL_DINO_NAMES.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + ALL_DINO_NAMES.length) % ALL_DINO_NAMES.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch(ALL_DINO_NAMES[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, selectedIndex, handleSearch]);

  useEffect(() => {
    const checkKey = async () => {
      const hasKey = await checkApiKey();
      if (!hasKey) {
        setNeedsApiKey(true);
      }
    };
    checkKey();
  }, []);

  const [currentDinoName, setCurrentDinoName] = useState('');

  return (
    <div className="min-h-screen bg-black selection:bg-white selection:text-black">
      {needsApiKey && <ApiKeyPrompt onComplete={() => setNeedsApiKey(false)} />}

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full min-h-screen flex flex-col items-center p-12 overflow-y-auto bg-black"
          >
            {/* Background Hand Icon Removed */}

            <div className="w-full max-w-[600px] flex flex-col items-start mt-4">
              <div className="space-y-2 mb-6">
                <h1 className="text-4xl font-londrina font-black uppercase tracking-widest text-white">
                  dinodex
                </h1>
                <div className="h-1 w-12 bg-white" />
                <p className="text-[10px] font-mono text-transparent uppercase tracking-[0.2em] select-none">
                  &nbsp;
                </p>
              </div>

              {/* Family Tree Container */}
              <div className="w-full">
                <DinoTree 
                  onSelect={handleSearch} 
                  selectedIndex={selectedIndex}
                  allNames={ALL_DINO_NAMES}
                />
              </div>
            </div>
          </motion.main>
        ) : (
          <motion.main
            key="card-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center p-12 bg-black"
          >
            <div className="w-full max-w-[600px] flex flex-col items-start mt-4">
              {/* Header - Always visible in card view */}
              <div className="space-y-2 mb-6 cursor-pointer group" onClick={() => setView('landing')}>
                <h2 className="text-4xl font-londrina font-black uppercase tracking-widest text-white group-hover:text-zinc-400 transition-colors">
                  {currentDinoName}
                </h2>
                <div className="h-1 w-12 bg-white group-hover:bg-zinc-400 transition-colors" />
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to return
                </p>
              </div>

              <div className="w-full">
                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.div 
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-4 text-center w-full py-12"
                    >
                      <AlertCircle className="w-12 h-12 text-red-500" />
                      <p className="text-white font-mono">{error}</p>
                      <button 
                        onClick={() => setView('landing')}
                        className="brutalist-pill !px-4 !py-2 !text-sm mt-4"
                      >
                        Return to Tree
                      </button>
                    </motion.div>
                  ) : (!cardData || !typingFinished) ? (
                    <motion.div 
                      key="loading-stats"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.8 } }}
                      className="space-y-8 font-mono text-white"
                    >
                      {tempStats && (
                        <div className="text-lg leading-relaxed text-zinc-300">
                          <Typewriter 
                            text={tempStats.description} 
                            speed={15} 
                            onComplete={() => setTypingFinished(true)} 
                          />
                        </div>
                      )}

                      {!tempStats && (
                        <p className="text-zinc-400 italic animate-pulse">
                          Accessing fossil records...
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1 }}
                      className="flex flex-col items-center gap-12 w-full"
                    >
                      <div 
                        className="perspective-1000 w-[400px] aspect-[3/4] cursor-pointer mx-auto"
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        <motion.div 
                          className="w-full h-full relative preserve-3d"
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                          <div className="absolute inset-0 backface-hidden">
                            <CardFront stats={cardData.stats} imageUrl={cardData.imageUrl} />
                          </div>
                          <div className="absolute inset-0 backface-hidden rotate-y-180">
                            <CardBack stats={cardData.stats} />
                          </div>
                        </motion.div>
                      </div>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white text-xs font-bold uppercase tracking-widest font-mono"
                      >
                        click card to flip
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
