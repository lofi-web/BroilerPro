
import React, { useState } from 'react';
import { BrainCircuit, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Batch } from '../types';

interface AIAdvisorProps {
  batches: Batch[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ batches }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const getAIAdvice = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    setAdvice(null);

    try {
      // Fixed initialization to strictly use the mandated pattern and process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const activeBatch = batches.find(b => b.status === 'active');
      const dataString = activeBatch ? JSON.stringify({
        name: activeBatch.name,
        initialCount: activeBatch.initialCount,
        records: activeBatch.dailyRecords.slice(-10),
        totalMortality: activeBatch.dailyRecords.reduce((a,c) => a + c.mortality, 0),
        vaccineStatus: activeBatch.vaccineSchedule
      }) : "No active batch data.";

      const prompt = `You are an elite poultry management consultant.
      Context: A broiler farmer in Bangladesh using 'Khambandhu' app.
      Data: ${dataString}.
      User Question: "${input}". 
      
      Instructions:
      1. Analyze FCR (Feed Conversion Ratio) if enough data exists.
      2. Check if vaccines are missed based on the schedule.
      3. Provide response in Bengali (Bengali script).
      4. Use bullet points for clarity.
      5. Keep advice scientifically sound but practical for a rural farmer.`;

      // Fixed: Always use ai.models.generateContent directly and model selection per guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      // Fixed: Extracting text output via property access (not method call)
      setAdvice(response.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।");
    } catch (error) {
      console.error("AI Error:", error);
      setAdvice("AI এর সাথে সংযোগে সমস্যা হচ্ছে। আপনার ইন্টারনেট সংযোগ চেক করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <BrainCircuit size={32} />
            </div>
            <h2 className="text-3xl font-bold">স্মার্ট খামার পরামর্শ</h2>
          </div>
          <p className="text-blue-100 max-w-2xl text-lg font-medium">
            আপনার ব্যাচের FCR, মৃত্যুহার এবং ভ্যাকসিনেশন চার্ট বিশ্লেষণ করে আমি আপনাকে সঠিক দিকনির্দেশনা দিতে পারি।
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-10">
            <BrainCircuit size={300} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative">
          <textarea
            className="w-full border-2 border-slate-100 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all text-gray-700 min-h-[140px] pr-12 text-lg"
            placeholder="আপনার প্রশ্নটি লিখুন... (যেমন: 'আমার FCR কি ঠিক আছে?', 'পাখির ওজন বাড়ছে না কেন?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            onClick={getAIAdvice}
            disabled={loading || !input.trim()}
            className="absolute bottom-5 right-5 bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 disabled:bg-gray-100 transition-all shadow-lg shadow-blue-200"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          </button>
        </div>
      </div>

      {advice && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-indigo-600 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-50 p-3 rounded-2xl shrink-0">
              <Sparkles className="text-indigo-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-4">AI এর বিশ্লেষণ ও পরামর্শ:</h3>
              <div className="text-slate-700 leading-relaxed whitespace-pre-line prose prose-slate max-w-none font-medium">
                {advice}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <AlertCircle size={14} />
              <span>এটি একটি AI পরামর্শ। বিশেষ প্রয়োজনে ভেটেরিনারি চিকিৎসকের পরামর্শ নিন।</span>
            </div>
            <button 
              onClick={() => { setAdvice(null); setInput(''); }}
              className="text-indigo-600 font-bold text-sm hover:underline"
            >
              নতুন করে প্রশ্ন করুন
            </button>
          </div>
        </div>
      )}

      {!advice && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "আমার ব্যাচের বর্তমান FCR কত হওয়া উচিত?",
            "ভ্যাকসিনের পর মুরগি ঝিমোচ্ছে, কি করবো?",
            "খাবার কম খেয়ে ওজন বাড়ানোর কোনো উপায় আছে?",
            "মুরগির ঘরে অ্যামোনিয়া গ্যাস কমানোর উপায় কি?"
          ].map((q, i) => (
            <button
              key={i}
              onClick={() => setInput(q)}
              className="bg-white p-5 rounded-2xl border border-slate-100 text-left text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-sm font-semibold"
            >
              "{q}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
