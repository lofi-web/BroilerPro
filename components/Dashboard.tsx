
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Skull, Bird, Utensils, Scale, Box, FlaskConical, 
  Calendar, Minus, BrainCircuit, X, History as HistoryIcon, 
  Sparkles, ArrowRight, Droplets, Trash2, Zap, Save, Bookmark, 
  ClipboardList, CheckCircle2, Calculator, Info, Beaker, ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Batch, DailyRecord, VaccineStatus, ViewState, MedicationUsage, MedicationRecipe, FinancialEntry } from '../types';
import { format, differenceInDays } from 'date-fns';

interface DashboardProps {
  activeBatch: Batch | undefined;
  onUpdateBatch: (batch: Batch) => void;
  onCreateBatch: (batch: Batch) => void;
  setActiveView: (view: ViewState) => void;
  savedRecipes: MedicationRecipe[];
  onSaveRecipe: (recipe: MedicationRecipe) => void;
  onDeleteRecipe: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  activeBatch, onUpdateBatch, onCreateBatch, setActiveView, 
  savedRecipes, onSaveRecipe, onDeleteRecipe 
}) => {
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [activeModal, setActiveModal] = useState<'mortality' | 'feed_consumed' | 'feed_received' | 'weight' | 'vaccine' | 'usage' | 'medicine_cost' | null>(null);

  const stats = useMemo(() => {
    if (!activeBatch) return null;
    const age = differenceInDays(new Date(), new Date(activeBatch.startDate));
    const totalMortality = activeBatch.dailyRecords.reduce((acc, curr) => acc + (curr.mortality || 0), 0);
    const currentCount = activeBatch.initialCount - totalMortality;
    const totalBagsConsumed = activeBatch.dailyRecords.reduce((acc, curr) => acc + (curr.feedBagsConsumed || 0), 0);
    
    const lastWeightRecord = [...activeBatch.dailyRecords]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reverse()
      .find(r => r.weightAverage && r.weightAverage > 0);

    const currentAvgWeightKg = (lastWeightRecord?.weightAverage || 0) / 1000;
    const totalLiveWeightKg = currentCount * currentAvgWeightKg;
    const totalFeedKg = totalBagsConsumed * 50;
    const fcr = totalLiveWeightKg > 0 ? (totalFeedKg / totalLiveWeightKg).toFixed(2) : "0.00";

    return { age, currentCount, totalMortality, lastWeight: lastWeightRecord?.weightAverage || 0, fcr };
  }, [activeBatch]);

  const handleUpdateRecord = (date: string, data: Partial<DailyRecord>) => {
    if (!activeBatch) return;
    const existingIndex = activeBatch.dailyRecords.findIndex(r => r.date === date);
    let updatedRecords = [...activeBatch.dailyRecords];
    
    if (existingIndex >= 0) {
      updatedRecords[existingIndex] = { ...updatedRecords[existingIndex], ...data };
    } else {
      updatedRecords.push({
        id: Date.now().toString(),
        date: date,
        mortality: 0,
        feedBagsConsumed: 0,
        feedConsumedKg: 0,
        feedBagsReceived: 0,
        medicineCost: 0,
        weightAverage: 0,
        ...data
      } as DailyRecord);
    }
    updatedRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    onUpdateBatch({ ...activeBatch, dailyRecords: updatedRecords });
    setActiveModal(null);
  };

  const handleAddFinancial = (entry: FinancialEntry) => {
    if (!activeBatch) return;
    onUpdateBatch({
      ...activeBatch,
      financials: [...activeBatch.financials, entry]
    });
    setActiveModal(null);
  };

  const handleToggleVaccine = (index: number) => {
    if (!activeBatch) return;
    const updatedSchedule = [...activeBatch.vaccineSchedule];
    updatedSchedule[index].isDone = !updatedSchedule[index].isDone;
    onUpdateBatch({ ...activeBatch, vaccineSchedule: updatedSchedule });
  };

  if (!activeBatch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 bg-white rounded-[40px] shadow-2xl shadow-slate-100 border border-slate-100">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-[40px] mb-8 shadow-xl shadow-blue-100">
          <Bird className="text-white" size={64} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">খামারবন্ধু</h2>
        <p className="text-slate-500 mb-10 max-w-xs font-medium">আপনার খামারের হিসাব রাখতে একটি নতুন ব্যাচ শুরু করুন।</p>
        <button 
          onClick={() => setShowNewBatchModal(true)}
          className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center space-x-3"
        >
          <Plus size={24} />
          <span>নতুন ব্যাচ শুরু</span>
        </button>
        {showNewBatchModal && <NewBatchModal onClose={() => setShowNewBatchModal(false)} onSubmit={onCreateBatch} />}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div>
             <div className="flex items-center space-x-2 text-blue-400 mb-2">
                <Calendar size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">ব্যাচ বয়স</span>
             </div>
             <h2 className="text-6xl font-black tracking-tighter leading-none">{stats?.age} <span className="text-xl font-medium text-slate-500">দিন</span></h2>
          </div>
          <div className="text-right space-y-4">
            <div>
              <div className="flex items-center justify-end space-x-2 text-emerald-400 mb-1">
                <Bird size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">জীবিত মুরগি</span>
              </div>
              <h3 className="text-3xl font-black tracking-tighter text-emerald-50">{stats?.currentCount} <span className="text-xs font-medium text-slate-500">টি</span></h3>
            </div>
            <div>
              <div className="flex items-center justify-end space-x-2 text-rose-400 mb-1">
                <Skull size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">মারা গেছে</span>
              </div>
              <h3 className="text-2xl font-black tracking-tighter text-rose-100">{stats?.totalMortality} <span className="text-[10px] font-medium text-slate-500">টি</span></h3>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
           <div className="flex items-center space-x-3">
              <Scale size={18} className="text-blue-400" />
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase">গড় ওজন</p>
                <p className="text-sm font-black">{stats?.lastWeight} গ্রাম</p>
              </div>
           </div>
           <div className="flex items-center space-x-3">
              <Zap size={18} className="text-emerald-400" />
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase">FCR</p>
                <p className="text-sm font-black text-emerald-300">{stats?.fcr}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-1">
        <QuickActionTile icon={<Skull size={24} />} label="মুরগি মৃত্যু" subLabel="Mortality" color="rose" onClick={() => setActiveModal('mortality')} />
        <QuickActionTile icon={<Utensils size={24} />} label="ফিড খাওয়া" subLabel="Feed Used" color="emerald" onClick={() => setActiveModal('feed_consumed')} />
        <QuickActionTile icon={<Box size={24} />} label="নতুন ফিড এল" subLabel="Stock In" color="orange" onClick={() => setActiveModal('feed_received')} />
        <QuickActionTile icon={<Scale size={24} />} label="মুরগির ওজন" subLabel="Weight" color="blue" onClick={() => setActiveModal('weight')} />
        <QuickActionTile icon={<ClipboardList size={24} />} label="প্রয়োগবিধি" subLabel="Library" color="indigo" onClick={() => setActiveModal('usage')} />
        <QuickActionTile icon={<FlaskConical size={24} />} label="ভ্যাকসিন" subLabel="Vaccines" color="amber" onClick={() => setActiveModal('vaccine')} />
        <QuickActionTile icon={<FlaskConical size={24} />} label="ওষুধ খরচ" subLabel="Costs" color="slate" onClick={() => setActiveModal('medicine_cost')} />
      </div>

      <div onClick={() => setActiveView('ai-advisor')} className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden active:scale-95 transition-all cursor-pointer group">
        <div className="absolute -right-8 -bottom-8 bg-white/10 p-20 rounded-full group-hover:scale-110 transition-transform">
            <Sparkles size={80} className="opacity-20 rotate-12" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 bg-indigo-500/50 w-fit px-3 py-1 rounded-full mb-2">
              <BrainCircuit size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">AI Expert</span>
            </div>
            <h4 className="text-2xl font-black tracking-tight">AI পরামর্শ নিন</h4>
            <p className="text-xs text-indigo-100 opacity-80 mt-1">আপনার ব্যাচের FCR বিশ্লেষণ করুন।</p>
          </div>
          <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
            <ArrowRight size={24} />
          </div>
        </div>
      </div>

      {activeModal && !['usage', 'vaccine', 'medicine_cost'].includes(activeModal) && (
        <CategoryDetailedModal 
          type={activeModal} 
          activeBatch={activeBatch}
          onClose={() => setActiveModal(null)} 
          onSubmit={handleUpdateRecord} 
        />
      )}

      {activeModal === 'usage' && (
        <MedicationUsageModal 
          onClose={() => setActiveModal(null)}
          savedRecipes={savedRecipes}
          onSaveRecipe={onSaveRecipe}
          onDeleteRecipe={onDeleteRecipe}
        />
      )}

      {activeModal === 'vaccine' && (
        <VaccineModal 
          activeBatch={activeBatch}
          onClose={() => setActiveModal(null)}
          onToggle={handleToggleVaccine}
        />
      )}

      {activeModal === 'medicine_cost' && (
        <MedicineCostModal 
          onClose={() => setActiveModal(null)}
          onAddFinancial={handleAddFinancial}
        />
      )}

      {showNewBatchModal && <NewBatchModal onClose={() => setShowNewBatchModal(false)} onSubmit={onCreateBatch} />}
    </div>
  );
};

const QuickActionTile = ({ icon, label, subLabel, color, onClick }: any) => {
  const colors: any = {
    rose: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
  };
  return (
    <button onClick={onClick} className={`${colors[color]} border-2 p-4 rounded-[32px] flex flex-col items-center text-center space-y-2 active:scale-90 transition-all shadow-sm h-full`}>
      <div className="bg-white p-2.5 rounded-2xl shadow-sm mb-1">{icon}</div>
      <div className="space-y-0.5">
        <span className="block text-[10px] font-black uppercase tracking-tighter leading-tight whitespace-nowrap">{label}</span>
        <span className="block text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">{subLabel}</span>
      </div>
    </button>
  );
};

const MedicationUsageModal = ({ 
  onClose, savedRecipes, onSaveRecipe, onDeleteRecipe 
}: any) => {
  const [medName, setMedName] = useState('');
  const [dose, setDose] = useState(0);
  const [unit, setUnit] = useState<'ml' | 'g'>('ml');
  const [water, setWater] = useState(0);

  const handleSaveToRecipes = () => {
    if (!medName || !dose) return;
    onSaveRecipe({ 
      id: Date.now().toString(), 
      name: medName, 
      dosagePerLiter: dose, 
      unit,
      waterLiters: water 
    });
    setMedName(''); setDose(0); setWater(0);
  };

  const handleApplyRecipe = (recipe: MedicationRecipe) => {
    setMedName(recipe.name);
    setDose(recipe.dosagePerLiter);
    setUnit(recipe.unit);
    setWater(recipe.waterLiters || 0);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex flex-col md:items-center md:justify-center">
      <div className="bg-white w-full md:max-w-lg flex flex-col h-full md:h-[80vh] md:rounded-[50px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
        
        <div className="p-8 pb-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
             <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
                <Bookmark size={24} />
             </div>
             <h3 className="text-2xl font-black text-slate-800 tracking-tighter">মেডিসিন প্রয়োগবিধি</h3>
          </div>
          <button onClick={onClose} className="bg-slate-100 p-3 rounded-full text-slate-400 active:scale-90"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-10 no-scrollbar">
          
          <section className="bg-slate-50 p-6 rounded-[40px] border border-slate-100 space-y-6">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">নতুন এন্ট্রি</span>
                {medName && dose > 0 && (
                   <button onClick={handleSaveToRecipes} className="flex items-center space-x-1.5 text-emerald-600 bg-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-sm border border-emerald-50">
                      <Save size={12}/> <span>লাইব্রেরিতে সেভ</span>
                   </button>
                )}
             </div>

             <div className="space-y-4">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">ওষুধের নাম</label>
                   <input type="text" placeholder="উদা: রেনামাইসিন..." className="w-full bg-transparent outline-none font-black text-slate-700 text-lg" value={medName} onChange={(e) => setMedName(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">ডোজ (লিটার প্রতি)</label>
                      <div className="flex items-center">
                         <input 
                           type="number" 
                           placeholder="0.0" 
                           className="w-full bg-transparent outline-none font-black text-slate-700 text-xl" 
                           value={dose === 0 ? '' : dose} 
                           onWheel={(e) => e.currentTarget.blur()}
                           onChange={(e) => setDose(parseFloat(e.target.value) || 0)} 
                         />
                         <button onClick={() => setUnit(unit === 'ml' ? 'g' : 'ml')} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase">{unit}</button>
                      </div>
                   </div>
                   <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">পানির পরিমাণ (লিটার)</label>
                      <input 
                        type="number" 
                        placeholder="0" 
                        className="w-full bg-transparent outline-none font-black text-slate-700 text-xl text-center" 
                        value={water === 0 ? '' : water} 
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) => setWater(parseFloat(e.target.value) || 0)} 
                      />
                   </div>
                </div>
             </div>
          </section>

          <section className="space-y-4">
             <div className="flex items-center space-x-2 px-2">
                <Bookmark size={14} className="text-slate-400 fill-slate-400" />
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">সংরক্ষিত প্রেসক্রিপশন</h4>
             </div>

             {savedRecipes.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold text-sm">কোন সংরক্ষিত রেকর্ড নেই</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 gap-3">
                   {savedRecipes.map((r: MedicationRecipe) => (
                      <div key={r.id} className="group relative">
                        <div 
                          onClick={() => handleApplyRecipe(r)}
                          className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between active:scale-[0.98] cursor-pointer"
                        >
                           <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${r.unit === 'ml' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                 {r.unit === 'ml' ? <Droplets size={22} /> : <Scale size={22} />}
                              </div>
                              <div>
                                 <p className="font-black text-slate-800">{r.name}</p>
                                 <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase">{r.dosagePerLiter} {r.unit} / L</span>
                                    {r.waterLiters ? (
                                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">• {r.waterLiters}L পানি</span>
                                    ) : null}
                                 </div>
                              </div>
                           </div>
                           <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteRecipe(r.id); }}
                          className="absolute -top-1 -right-1 bg-white text-rose-500 rounded-full p-2 shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                   ))}
                </div>
             )}
          </section>
        </div>

        <div className="p-8 pt-0 shrink-0">
          <button onClick={onClose} className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black shadow-2xl active:scale-95 transition-all uppercase text-sm tracking-[0.3em]">বন্ধ করুন</button>
        </div>
      </div>
    </div>
  );
};

const VaccineModal = ({ activeBatch, onClose, onToggle }: any) => {
  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-200 flex flex-col p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shadow-sm"><FlaskConical /></div>
            <div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">টিকা ও ভ্যাকসিন</h3>
               <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ভ্যাকসিন শিডিউল</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          {activeBatch.vaccineSchedule.map((v: VaccineStatus, idx: number) => (
            <button 
              key={idx}
              onClick={() => onToggle(idx)}
              className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${
                v.isDone 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-white border-slate-100 text-slate-600 hover:border-amber-200 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${v.isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {v.day}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">দিন {v.day}</p>
                  <p className="font-black text-sm">{v.name}</p>
                </div>
              </div>
              <div className={`p-2 rounded-full ${v.isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                <CheckCircle2 size={24} />
              </div>
            </button>
          ))}
        </div>

        <button onClick={onClose} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black shadow-xl active:scale-95 transition-all uppercase text-sm tracking-widest mt-8">বন্ধ করুন</button>
      </div>
    </div>
  );
};

const MedicineCostModal = ({ onClose, onAddFinancial }: any) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState(0);
  const [desc, setDesc] = useState('');

  const handleSubmit = () => {
    if (amount <= 0) return;
    onAddFinancial({
      id: Date.now().toString(),
      date,
      amount,
      type: 'expense',
      category: 'ওষুধ',
      description: desc || 'ওষুধ ক্রয়'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl relative p-8 flex flex-col space-y-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-600"><FlaskConical /></div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">ওষুধের খরচ</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="space-y-4">
           <div className="space-y-1">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">তারিখ</label>
             <input type="date" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-black text-slate-700 outline-none" value={date} onChange={(e) => setDate(e.target.value)} />
           </div>
           <div className="space-y-1">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">পরিমাণ (টাকা)</label>
             <input 
                type="number" 
                className="w-full bg-slate-50 p-6 rounded-[28px] border border-slate-100 font-black text-4xl text-slate-800 outline-none text-center" 
                placeholder="0" 
                value={amount === 0 ? '' : amount} 
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} 
             />
           </div>
           <div className="space-y-1">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">বিবরণ (ঐচ্ছিক)</label>
             <input type="text" placeholder="যেমন: ১ বোতল রেনামাইসিন" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold text-slate-700 outline-none" value={desc} onChange={(e) => setDesc(e.target.value)} />
           </div>
        </div>

        <button onClick={handleSubmit} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-xl active:scale-95 transition-all uppercase text-sm tracking-widest">খরচ সেভ করুন</button>
      </div>
    </div>
  );
};

const CategoryDetailedModal = ({ type, activeBatch, onClose, onSubmit }: any) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const existing = activeBatch.dailyRecords.find((r: any) => r.date === selectedDate);
  const [formData, setFormData] = useState<any>({ mortality: 0, feedBagsConsumed: 0, feedBagsReceived: 0, weightAverage: 0, notes: '' });

  useEffect(() => {
    if (existing) {
      setFormData({ mortality: existing.mortality || 0, feedBagsConsumed: existing.feedBagsConsumed || 0, feedBagsReceived: existing.feedBagsReceived || 0, weightAverage: existing.weightAverage || 0, notes: existing.notes || '' });
    } else {
      setFormData({ mortality: 0, feedBagsConsumed: 0, feedBagsReceived: 0, weightAverage: 0, notes: '' });
    }
  }, [existing, selectedDate, type]);

  const config: any = {
    mortality: { title: 'মুরগি মৃত্যু', color: 'rose', icon: <Skull />, field: 'mortality', unit: 'টি' },
    feed_consumed: { title: 'মুরগির ফিড খাওয়া', color: 'emerald', icon: <Utensils />, field: 'feedBagsConsumed', unit: 'বস্তা' },
    feed_received: { title: 'নতুন ফিড এল', color: 'orange', icon: <Box />, field: 'feedBagsReceived', unit: 'বস্তা' },
    weight: { title: 'মুরগির ওজন মাপ', color: 'blue', icon: <Scale />, field: 'weightAverage', unit: 'গ্রাম' }
  };

  const { title, color, icon, field, unit } = config[type];
  const categoryTotal = useMemo(() => activeBatch.dailyRecords.reduce((acc: number, curr: any) => acc + (curr[field] || 0), 0), [activeBatch.dailyRecords, field]);
  const historyList = activeBatch.dailyRecords.filter((r: any) => r[field] > 0).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  const handleSave = () => {
    const update: any = { ...formData };
    if (type === 'feed_consumed') update.feedConsumedKg = formData.feedBagsConsumed * 50;
    onSubmit(selectedDate, update);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>{icon}</div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">{title}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{format(new Date(selectedDate), 'dd MMMM')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className={`bg-${color}-50/30 p-4 rounded-3xl border border-${color}-100/50 flex items-center justify-between`}>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">মোট</span>
             <span className={`text-xl font-black text-${color}-600`}>{categoryTotal} {unit}</span>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">তারিখ</label>
            <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <Calendar size={18} className="text-slate-400" />
              <input type="date" className="bg-transparent font-black text-slate-700 outline-none w-full" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">পরিমাণ ({unit})</label>
            <div className={`flex items-center justify-center space-x-4 bg-${color}-50/50 p-6 rounded-[32px] border border-${color}-100`}>
              <button onClick={() => setFormData({...formData, [field]: Math.max(0, formData[field] - (type === 'feed_consumed' ? 0.5 : type === 'weight' ? 50 : 1))})} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-100 active:scale-90 transition-transform"><Minus /></button>
              <input 
                type="number" 
                className={`w-28 bg-transparent text-center text-4xl font-black text-${color}-700 outline-none`} 
                value={formData[field] === 0 ? '' : formData[field]} 
                placeholder="0" 
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setFormData({...formData, [field]: parseFloat(e.target.value) || 0})} 
              />
              <button onClick={() => setFormData({...formData, [field]: formData[field] + (type === 'feed_consumed' ? 0.5 : type === 'weight' ? 50 : 1)})} className={`w-14 h-14 bg-${color}-600 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform`}><Plus /></button>
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t border-slate-50 pb-6">
             <div className="flex items-center justify-between px-1"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">পুরানো রেকর্ড</h4><HistoryIcon size={12} className="text-slate-300" /></div>
             <div className="space-y-2">
               {historyList.length === 0 ? <p className="text-[10px] text-slate-400 italic text-center py-6 bg-slate-50 rounded-3xl uppercase tracking-widest">খালি</p> : 
                 historyList.map((h: any) => (
                   <div key={h.id} className="flex items-center justify-between bg-white p-3 px-4 rounded-2xl border border-slate-100 shadow-sm">
                     <span className="text-[11px] font-black text-slate-800">{format(new Date(h.date), 'dd MMMM')}</span>
                     <span className={`text-[13px] font-black text-${color}-700 bg-${color}-50 px-3 py-1 rounded-xl`}>{h[field]} {unit}</span>
                   </div>
                 ))
               }
             </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-50 bg-slate-50/50 rounded-b-[40px] flex gap-3 shrink-0"><button onClick={onClose} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase text-sm">বাতিল</button><button onClick={handleSave} className={`flex-[2] py-4 bg-${color}-600 text-white rounded-[24px] font-black shadow-xl active:scale-95 transition-all hover:brightness-110 uppercase text-sm`}> নিশ্চিত </button></div>
      </div>
    </div>
  );
};

const NewBatchModal = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (batch: Batch) => void }) => {
  const [formData, setFormData] = useState({ name: `Batch-${format(new Date(), 'MMM-yy')}`, startDate: format(new Date(), 'yyyy-MM-dd'), initialCount: 500, chickCost: 45 });
  const handleSubmit = () => {
    const defaultSchedule: VaccineStatus[] = [ { day: 5, name: 'BCRDV (রানীক্ষেত ও আইবি)', isDone: false }, { day: 12, name: 'গামবোরো (১ম ডোজ)', isDone: false }, { day: 18, name: 'গামবোরো (বুস্টার ডোজ)', isDone: false }, { day: 21, name: 'BCRDV (বুস্টার ডোজ)', isDone: false } ];
    onSubmit({ id: Date.now().toString(), name: formData.name, startDate: formData.startDate, initialCount: formData.initialCount, chickCost: formData.chickCost, status: 'active', dailyRecords: [], financials: [], sales: [], vaccineSchedule: defaultSchedule, medicationHistory: [] });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl border border-white/20 animate-in zoom-in-95">
        <h2 className="text-3xl font-black mb-8 text-slate-800 tracking-tight text-center">নতুন ব্যাচ শুরু</h2>
        <div className="space-y-5">
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">ব্যাচের নাম</label><input type="text" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-slate-700" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">শুরুর তারিখ</label><input type="date" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-slate-700" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">সংখ্যা</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-slate-700" 
                value={formData.initialCount === 0 ? '' : formData.initialCount} 
                placeholder="0" 
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setFormData({...formData, initialCount: parseInt(e.target.value) || 0})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">দর (৳)</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-slate-700" 
                value={formData.chickCost === 0 ? '' : formData.chickCost} 
                placeholder="0.0" 
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setFormData({...formData, chickCost: parseFloat(e.target.value) || 0})} 
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-10"><button onClick={onClose} className="flex-1 py-4 font-black text-slate-400 uppercase text-sm">বাতিল</button><button onClick={handleSubmit} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all uppercase text-sm"> ব্যাচ শুরু </button></div>
      </div>
    </div>
  );
};

export default Dashboard;