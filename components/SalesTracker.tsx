
import React, { useState, useMemo } from 'react';
import { 
  Plus, ShoppingCart, Calendar, User, Scale, Banknote, 
  CheckCircle2, AlertCircle, Trash2, ArrowRight, Bird,
  Clock, DollarSign, CheckCircle
} from 'lucide-react';
import { Batch, SaleEntry } from '../types';
import { format } from 'date-fns';

interface SalesTrackerProps {
  activeBatch: Batch | undefined;
  onUpdateBatch: (batch: Batch) => void;
}

const SalesTracker: React.FC<SalesTrackerProps> = ({ activeBatch, onUpdateBatch }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const stats = useMemo(() => {
    if (!activeBatch) return null;
    const totalBirds = activeBatch.sales.reduce((acc, curr) => acc + curr.birdCount, 0);
    const totalWeight = activeBatch.sales.reduce((acc, curr) => acc + curr.totalWeight, 0);
    const totalRevenue = activeBatch.sales.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const totalPaid = activeBatch.sales.reduce((acc, curr) => acc + curr.paidAmount, 0);
    const totalDue = totalRevenue - totalPaid;
    const avgWeight = totalBirds > 0 ? (totalWeight / totalBirds).toFixed(2) : "0.00";

    return { totalBirds, totalWeight, totalRevenue, totalPaid, totalDue, avgWeight };
  }, [activeBatch]);

  const handleUpdateSaleStatus = (saleId: string, newStatus: 'paid' | 'unpaid') => {
    if (!activeBatch) return;
    const updatedSales = activeBatch.sales.map(s => {
      if (s.id === saleId) {
        return {
          ...s,
          status: newStatus,
          paidAmount: newStatus === 'paid' ? s.totalPrice : 0
        };
      }
      return s;
    });
    onUpdateBatch({ ...activeBatch, sales: updatedSales });
  };

  const handleDeleteSale = (id: string) => {
    if (!activeBatch) return;
    if (!confirm('আপনি কি এই বিক্রয় রেকর্ডটি মুছে ফেলতে চান?')) return;
    const updatedSales = activeBatch.sales.filter(s => s.id !== id);
    onUpdateBatch({ ...activeBatch, sales: updatedSales });
  };

  if (!activeBatch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-[48px] border-2 border-dashed border-slate-200">
        <div className="bg-slate-100 p-6 rounded-full mb-6">
          <ShoppingCart size={48} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">কোন সক্রিয় ব্যাচ নেই</h2>
        <p className="text-slate-500 mb-8 max-w-sm">বিক্রয় শুরু করতে প্রথমে ড্যাশবোর্ড থেকে একটি ব্যাচ শুরু করুন।</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">পাখি বিক্রয় হিসাব</h2>
          <p className="text-slate-500 font-medium">ব্যাচ: {activeBatch.name}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-blue-100 flex items-center space-x-3 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>নতুন বিক্রয়</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">মোট বিক্রীত</p>
          <div>
            <h4 className="text-2xl font-black text-slate-800">{stats?.totalBirds} <span className="text-xs font-medium text-slate-400">টি</span></h4>
            <p className="text-[10px] font-bold text-slate-400">{stats?.totalWeight} কেজি</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">মোট টাকা</p>
          <h4 className="text-2xl font-black text-slate-800">৳{stats?.totalRevenue.toLocaleString()}</h4>
        </div>
        <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">মোট জমা (Paid)</p>
          <h4 className="text-2xl font-black text-emerald-600">৳{stats?.totalPaid.toLocaleString()}</h4>
        </div>
        <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">মোট বাকি (Due)</p>
          <h4 className="text-2xl font-black text-rose-600">৳{stats?.totalDue.toLocaleString()}</h4>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-black text-slate-800 flex items-center space-x-2">
            <ShoppingCart size={20} className="text-blue-600" />
            <span>বিক্রয় তালিকা</span>
          </h3>
          <div className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            গড় ওজন: {stats?.avgWeight} কেজি / পাখি
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">তারিখ ও ক্রেতা</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">পাখি ও ওজন</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">টাকার পরিমাণ</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">পেমেন্ট অবস্থা</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeBatch.sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-medium italic">কোন বিক্রয় রেকর্ড পাওয়া যায়নি</td>
                </tr>
              ) : (
                [...activeBatch.sales].reverse().map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800">{format(new Date(sale.date), 'dd MMM, yyyy')}</p>
                      <p className="text-sm font-bold text-slate-400">{sale.customerName || 'খুচরা ক্রেতা'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-slate-700">{sale.birdCount} টি</span>
                        <span className="text-xs font-bold text-slate-400">{sale.totalWeight} কেজি</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800">৳{sale.totalPrice.toLocaleString()}</p>
                      {sale.paidAmount < sale.totalPrice && (
                        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">বাকি: ৳{(sale.totalPrice - sale.paidAmount).toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleUpdateSaleStatus(sale.id, 'paid')}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                              sale.status === 'paid' 
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                              : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                          >
                            <CheckCircle size={12} />
                            <span>Paid</span>
                          </button>
                          <button 
                            onClick={() => handleUpdateSaleStatus(sale.id, 'unpaid')}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                              sale.status !== 'paid' 
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-100' 
                              : 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                          >
                            <Clock size={12} />
                            <span>Due</span>
                          </button>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                         onClick={() => handleDeleteSale(sale.id)}
                         className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                       >
                         <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddSaleModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={(newSale) => {
            const updatedSales = [...activeBatch.sales, newSale];
            onUpdateBatch({ ...activeBatch, sales: updatedSales });
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

const AddSaleModal = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (sale: SaleEntry) => void }) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    customerName: '',
    birdCount: 0,
    totalWeight: 0,
    totalPrice: 0,
    isPaid: false
  });

  const avgWeight = formData.birdCount > 0 ? (formData.totalWeight / formData.birdCount) : 0;
  
  const status: 'paid' | 'unpaid' = formData.isPaid ? 'paid' : 'unpaid';
  const paidAmount = formData.isPaid ? formData.totalPrice : 0;

  const handleNumericInput = (field: string, val: string) => {
    const parsed = val === '' ? 0 : parseFloat(val);
    setFormData(prev => ({ ...prev, [field]: parsed }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[48px] w-full max-w-xl p-10 shadow-2xl max-h-[92vh] overflow-y-auto border border-white/20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">বিক্রয় এন্ট্রি</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400">
            <AlertCircle className="rotate-45" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">বিক্রয়ের তারিখ</label>
            <input 
              type="date" 
              className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-[24px] focus:border-blue-500 outline-none font-black text-slate-700"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="col-span-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">ক্রেতার নাম</label>
            <input 
              type="text" 
              placeholder="উদা: পাইকারি বিক্রেতা রহিম"
              className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-[24px] focus:border-blue-500 outline-none font-black text-slate-700 font-medium"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            />
          </div>

          <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100">
            <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">পাখির সংখ্যা</label>
            <input 
              type="number" 
              className="w-full bg-white border-2 border-blue-100 p-4 rounded-2xl focus:border-blue-500 outline-none font-black text-blue-800"
              value={formData.birdCount === 0 ? '' : formData.birdCount}
              placeholder="0"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => handleNumericInput('birdCount', e.target.value)}
            />
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100">
            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">মোট ওজন (কেজি)</label>
            <input 
              type="number" 
              step="0.1"
              className="w-full bg-white border-2 border-indigo-100 p-4 rounded-2xl focus:border-indigo-500 outline-none font-black text-indigo-800"
              value={formData.totalWeight === 0 ? '' : formData.totalWeight}
              placeholder="0.0"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => handleNumericInput('totalWeight', e.target.value)}
            />
            {avgWeight > 0 && (
              <p className="mt-2 text-[10px] font-black text-indigo-600 uppercase">গড়: {avgWeight.toFixed(2)} কেজি</p>
            )}
          </div>

          <div className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100">
            <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">মোট দাম (৳)</label>
            <input 
              type="number" 
              className="w-full bg-white border-2 border-emerald-100 p-4 rounded-2xl focus:border-emerald-500 outline-none font-black text-emerald-800"
              value={formData.totalPrice === 0 ? '' : formData.totalPrice}
              placeholder="0"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => handleNumericInput('totalPrice', e.target.value)}
            />
          </div>

          <div className="bg-slate-50/80 p-6 rounded-[32px] border border-slate-200">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">পেমেন্ট অবস্থা</label>
            <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
              <button 
                type="button"
                onClick={() => setFormData({...formData, isPaid: true})}
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${
                  formData.isPaid 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Paid
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, isPaid: false})}
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${
                  !formData.isPaid 
                  ? 'bg-rose-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Unpaid
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-12 bg-white sticky bottom-0 pt-4 border-t border-slate-50">
          <button onClick={onClose} className="flex-1 py-5 text-slate-400 font-black hover:text-slate-800 transition-colors">বাতিল</button>
          <button 
            onClick={() => {
              if (formData.birdCount <= 0 || formData.totalWeight <= 0 || formData.totalPrice <= 0) {
                alert('দয়া করে সঠিক তথ্য দিন');
                return;
              }
              onSubmit({
                customerName: formData.customerName,
                date: formData.date,
                birdCount: formData.birdCount,
                totalWeight: formData.totalWeight,
                totalPrice: formData.totalPrice,
                paidAmount: paidAmount,
                id: Date.now().toString(),
                averageWeight: avgWeight,
                status
              } as SaleEntry);
            }}
            className="flex-[2] px-10 py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            বিক্রয় নিশ্চিত করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesTracker;