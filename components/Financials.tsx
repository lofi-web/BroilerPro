
import React, { useState, useMemo } from 'react';
import { Batch, FinancialEntry } from '../types';
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';
import { format } from 'date-fns';

interface FinancialsProps {
  batches: Batch[];
  onUpdateBatch: (batch: Batch) => void;
}

const Financials: React.FC<FinancialsProps> = ({ batches, onUpdateBatch }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const activeBatch = batches.find(b => b.status === 'active');

  const allFinancials = useMemo(() => {
    return batches.flatMap(b => b.financials.map(f => ({ ...f, batchName: b.name })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [batches]);

  const filteredFinancials = allFinancials.filter(f => activeTab === 'all' ? true : f.type === activeTab);

  const stats = useMemo(() => {
    const expenses = allFinancials.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const income = allFinancials.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    
    // Add chick costs as expenses
    const chickExpenses = batches.reduce((acc, curr) => acc + (curr.initialCount * curr.chickCost), 0);
    const totalSaleIncome = batches.reduce((acc, curr) => acc + (curr.totalSalePrice || 0), 0);

    return {
      totalExpenses: expenses + chickExpenses,
      totalIncome: income + totalSaleIncome,
      net: (income + totalSaleIncome) - (expenses + chickExpenses)
    };
  }, [allFinancials, batches]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800">আয়-ব্যয় হিসাব</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          disabled={!activeBatch}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all ${
            activeBatch ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus size={20} />
          <span>লেনদেন যুক্ত করুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-gray-500 mb-1">মোট খরচ</p>
          <h3 className="text-2xl font-bold text-rose-600">৳{stats.totalExpenses.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-gray-500 mb-1">মোট আয়</p>
          <h3 className="text-2xl font-bold text-emerald-600">৳{stats.totalIncome.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-gray-500 mb-1">নিট লাভ/লোকসান</p>
          <h3 className={`text-2xl font-bold ${stats.net >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            ৳{stats.net.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-4 border-b flex items-center justify-between flex-wrap gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >সব</button>
            <button 
              onClick={() => setActiveTab('expense')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'expense' ? 'bg-white shadow-sm text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
            >খরচ</button>
            <button 
              onClick={() => setActiveTab('income')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >আয়</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="খুঁজুন..." 
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm w-full sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">তারিখ</th>
                <th className="px-6 py-4 font-semibold">বিবরণ</th>
                <th className="px-6 py-4 font-semibold">বিভাগ</th>
                <th className="px-6 py-4 font-semibold">ব্যাচ</th>
                <th className="px-6 py-4 font-semibold text-right">পরিমাণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFinancials.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 text-sm">{format(new Date(item.date), 'dd/MM/yy')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {item.type === 'expense' ? <ArrowDownCircle className="text-rose-500" size={18} /> : <ArrowUpCircle className="text-emerald-500" size={18} />}
                      <span className="font-medium text-gray-800">{item.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-500 uppercase">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{item.batchName}</td>
                  <td className={`px-6 py-4 text-right font-bold ${item.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {item.type === 'expense' ? '-' : '+'} ৳{item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredFinancials.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">কোন তথ্য পাওয়া যায়নি</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && activeBatch && (
        <AddTransactionModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={(entry) => {
            onUpdateBatch({
              ...activeBatch,
              financials: [...activeBatch.financials, entry]
            });
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

const AddTransactionModal = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (entry: FinancialEntry) => void }) => {
  const [formData, setFormData] = useState<Partial<FinancialEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense',
    category: 'খাদ্য',
    amount: 0,
    description: ''
  });

  const categories = formData.type === 'expense' 
    ? ['খাদ্য', 'ওষুধ', 'ভুষি', 'গাড়ি ভাড়া', 'লেবার', 'বিদ্যুৎ বিল', 'অন্যান্য']
    : ['পাখি বিক্রয়', 'সার বিক্রয়', 'অন্যান্য'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">নতুন লেনদেন</h2>
        <div className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setFormData({...formData, type: 'expense', category: 'খাদ্য'})}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${formData.type === 'expense' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}
            >খরচ</button>
            <button 
              onClick={() => setFormData({...formData, type: 'income', category: 'পাখি বিক্রয়'})}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${formData.type === 'income' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}
            >আয়</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
            <input 
              type="date" 
              className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">বিভাগ</label>
              <select 
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (টাকা)</label>
              <input 
                type="number" 
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.amount}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ (ঐচ্ছিক)</label>
            <input 
              type="text" 
              className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="উদা: ১ বস্তা সোনামনি ফিড"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>
        <div className="flex space-x-4 mt-8">
          <button onClick={onClose} className="flex-1 px-4 py-3 border rounded-xl font-semibold hover:bg-gray-50">বাতিল</button>
          <button 
            onClick={() => onSubmit({ ...formData, id: Date.now().toString() } as FinancialEntry)}
            className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold shadow-lg transition-all ${
              formData.type === 'expense' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >সংরক্ষণ</button>
        </div>
      </div>
    </div>
  );
};

export default Financials;