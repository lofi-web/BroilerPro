
import React, { useState } from 'react';
import { Batch } from '../types';
import { format, differenceInDays } from 'date-fns';
import { CheckCircle2, Circle, Trash2, ExternalLink } from 'lucide-react';

interface BatchListProps {
  batches: Batch[];
  onUpdateBatch: (batch: Batch) => void;
}

const BatchList: React.FC<BatchListProps> = ({ batches, onUpdateBatch }) => {
  const [closingBatch, setClosingBatch] = useState<Batch | null>(null);

  const handleCloseBatch = (saleWeight: number, salePrice: number) => {
    if (!closingBatch) return;
    onUpdateBatch({
      ...closingBatch,
      status: 'closed',
      closedDate: new Date().toISOString(),
      totalSaleWeight: saleWeight,
      totalSalePrice: salePrice
    });
    setClosingBatch(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">ব্যাচ ইতিহাস</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {batches.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 text-gray-400">
            কোন ব্যাচ পাওয়া যায়নি
          </div>
        ) : (
          batches.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(batch => (
            <div key={batch.id} className={`bg-white p-6 rounded-2xl shadow-sm border ${batch.status === 'active' ? 'border-blue-200 ring-2 ring-blue-50' : 'border-slate-100'}`}>
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${batch.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {batch.status === 'active' ? <Circle size={24} className="animate-pulse fill-current" /> : <CheckCircle2 size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{batch.name}</h3>
                    <p className="text-gray-500 text-sm">
                      {format(new Date(batch.startDate), 'dd MMM yyyy')} {batch.status === 'closed' && `- ${format(new Date(batch.closedDate!), 'dd MMM yyyy')}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">পাখির সংখ্যা</p>
                    <p className="text-lg font-bold text-gray-700">{batch.initialCount} টি</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">স্থিতি</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${batch.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {batch.status === 'active' ? 'চলমান' : 'সম্পন্ন'}
                    </span>
                  </div>
                  {batch.status === 'active' && (
                    <button 
                      onClick={() => setClosingBatch(batch)}
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors"
                    >
                      ব্যাচ সমাপ্ত করুন
                    </button>
                  )}
                </div>
              </div>

              {batch.status === 'closed' && (
                <div className="mt-6 pt-6 border-t grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">মোট বিক্রয় ওজন</p>
                    <p className="font-bold text-gray-700">{batch.totalSaleWeight} কেজি</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">মোট বিক্রয় মূল্য</p>
                    <p className="font-bold text-gray-700">৳{batch.totalSalePrice?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">সারভাইভাল রেট</p>
                    <p className="font-bold text-gray-700">
                      {(((batch.initialCount - batch.dailyRecords.reduce((a,c) => a+c.mortality, 0))/batch.initialCount)*100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">মোট দিন</p>
                    <p className="font-bold text-gray-700">
                      {differenceInDays(new Date(batch.closedDate!), new Date(batch.startDate))} দিন
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {closingBatch && (
        <CloseBatchModal 
          onClose={() => setClosingBatch(null)} 
          onSubmit={handleCloseBatch} 
        />
      )}
    </div>
  );
};

const CloseBatchModal = ({ onClose, onSubmit }: any) => {
  const [data, setData] = useState({ weight: 0, price: 0 });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">ব্যাচ সমাপ্ত করুন</h2>
        <p className="text-gray-500 mb-6">বিক্রয়ের তথ্য দিন। এটি ব্যাচটিকে পাকাপাকিভাবে বন্ধ করে দেবে।</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মোট বিক্রয় ওজন (কেজি)</label>
            <input 
              type="number" 
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="উদা: 850"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => setData({...data, weight: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মোট বিক্রয় মূল্য (টাকা)</label>
            <input 
              type="number" 
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="উদা: 150000"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => setData({...data, price: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>
        <div className="flex space-x-4 mt-8">
          <button onClick={onClose} className="flex-1 px-4 py-3 border rounded-xl font-semibold hover:bg-gray-50">বাতিল</button>
          <button 
            onClick={() => onSubmit(data.weight, data.price)}
            className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 shadow-lg"
          >
            ব্যাচ বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchList;