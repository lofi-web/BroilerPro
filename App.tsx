
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Bird, 
  Wallet, 
  BrainCircuit, 
  History,
  ShoppingCart
} from 'lucide-react';
import { Batch, ViewState, MedicationRecipe } from './types';
import Dashboard from './components/Dashboard';
import BatchList from './components/BatchList';
import Financials from './components/Financials';
import AIAdvisor from './components/AIAdvisor';
import SalesTracker from './components/SalesTracker';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<MedicationRecipe[]>([]);

  // Load data from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem('broiler_farm_data');
    const savedRecipesData = localStorage.getItem('medication_recipes');
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBatches(parsed);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }

    if (savedRecipesData) {
      try {
        setSavedRecipes(JSON.parse(savedRecipesData));
      } catch (e) {
        console.error("Failed to parse recipes", e);
      }
    }
  }, []);

  // Save data to LocalStorage
  useEffect(() => {
    localStorage.setItem('broiler_farm_data', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('medication_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  const activeBatch = useMemo(() => batches.find(b => b.status === 'active'), [batches]);

  const handleCreateBatch = (newBatch: Batch) => {
    const hasActive = batches.some(b => b.status === 'active');
    if (hasActive) {
      alert("ইতিমধ্যে একটি সক্রিয় ব্যাচ চলছে। নতুন ব্যাচ খোলার আগে আগেরটি বন্ধ করুন।");
      return;
    }
    setBatches([...batches, newBatch]);
  };

  const updateBatch = (updatedBatch: Batch) => {
    setBatches(batches.map(b => b.id === updatedBatch.id ? updatedBatch : b));
  };

  const handleSaveRecipe = (recipe: MedicationRecipe) => {
    // Check if recipe already exists (by name and dose)
    const exists = savedRecipes.find(r => r.name.toLowerCase() === recipe.name.toLowerCase() && r.dosagePerLiter === recipe.dosagePerLiter && r.unit === recipe.unit);
    if (!exists) {
      setSavedRecipes([...savedRecipes, recipe]);
    }
  };

  const handleDeleteRecipe = (id: string) => {
    setSavedRecipes(savedRecipes.filter(r => r.id !== id));
  };

  const BottomNavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col items-center justify-center space-y-1 flex-1 py-2 transition-all duration-300 ${
        activeView === view 
          ? 'text-blue-600 scale-110' 
          : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className={`p-2 rounded-2xl transition-colors ${activeView === view ? 'bg-blue-50' : ''}`}>
        <Icon size={24} strokeWidth={activeView === view ? 2.5 : 2} />
      </div>
      <span className={`text-[10px] font-black uppercase tracking-tighter ${activeView === view ? 'opacity-100' : 'opacity-70'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-24">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-[18px] shadow-lg shadow-blue-100">
            <Bird className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">খামারবন্ধু</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Farm Manager</p>
          </div>
        </div>
        {activeBatch && (
          <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-black text-emerald-700 uppercase tracking-tight">{activeBatch.name}</span>
          </div>
        )}
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-lg mx-auto w-full">
        {activeView === 'dashboard' && (
          <Dashboard 
            activeBatch={activeBatch} 
            onUpdateBatch={updateBatch} 
            onCreateBatch={handleCreateBatch} 
            setActiveView={setActiveView}
            savedRecipes={savedRecipes}
            onSaveRecipe={handleSaveRecipe}
            onDeleteRecipe={handleDeleteRecipe}
          />
        )}
        {activeView === 'sales' && (
          <SalesTracker 
            activeBatch={activeBatch}
            onUpdateBatch={updateBatch}
          />
        )}
        {activeView === 'ai-advisor' && (
          <AIAdvisor batches={batches} />
        )}
        {activeView === 'financials' && (
          <Financials 
            batches={batches} 
            onUpdateBatch={updateBatch}
          />
        )}
        {activeView === 'batches' && (
          <BatchList 
            batches={batches} 
            onUpdateBatch={updateBatch}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-2 py-2 flex items-center justify-around z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <BottomNavItem view="dashboard" icon={LayoutDashboard} label="হোম" />
        <BottomNavItem view="sales" icon={ShoppingCart} label="বিক্রয়" />
        <BottomNavItem view="ai-advisor" icon={BrainCircuit} label="AI হেল্প" />
        <BottomNavItem view="financials" icon={Wallet} label="আয়-ব্যয়" />
        <BottomNavItem view="batches" icon={History} label="ব্যাচ" />
      </nav>
    </div>
  );
};

export default App;
