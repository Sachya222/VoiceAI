'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase/client';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  BookOpen,
  HelpCircle,
  Plus,
  Trash2,
  FileText,
  Search,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { FAQ, KnowledgeEntry, KnowledgeSourceType } from '@/types';

export default function KnowledgeBasePage() {
  const { business, isDemoMode } = useAuth();
  const businessId = business?.id || 'demo-biz-apex';

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'faqs' | 'docs'>('faqs');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Form states
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('General');

  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docSourceType, setDocSourceType] = useState<KnowledgeSourceType>('policy');

  useEffect(() => {
    async function loadData() {
      if (isDemoMode || !db) {
        setFaqs([
          {
            id: 'f1',
            businessId,
            question: 'Do you offer warranty on laptop repairs?',
            answer: 'Yes! All parts and labor include a 60-day replacement warranty against manufacturer defects.',
            category: 'Warranty & Policies',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'f2',
            businessId,
            question: 'How long does a hardware diagnostic take?',
            answer: 'Standard bench diagnostics take between 30 to 45 minutes.',
            category: 'Service Timelines',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'f3',
            businessId,
            question: 'Do I need to leave my charger when dropping off a device?',
            answer: 'Yes, please bring your OEM power adapter so our technicians can stress-test charging circuits.',
            category: 'Preparation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);

        setKnowledge([
          {
            id: 'k1',
            businessId,
            title: 'Parking and Accessibility Guidelines',
            content: 'Free customer parking is located directly behind our building on Innovation Way. The facility has ground-floor ramp access and elevator service.',
            sourceType: 'location',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'k2',
            businessId,
            title: 'Data Privacy & Hard Drive Handling Policy',
            content: 'We adhere to strict data privacy standards. Customer storage drives are never cloned or accessed without explicit authorization. Drive diagnostics are performed with hardware-level read integrity.',
            sourceType: 'policy',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        return;
      }

      try {
        const faqSnap = await getDocs(collection(db, 'businesses', businessId, 'faqs'));
        setFaqs(faqSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as FAQ)));

        const knSnap = await getDocs(collection(db, 'businesses', businessId, 'knowledge'));
        setKnowledge(knSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as KnowledgeEntry)));
      } catch (err) {
        console.warn('Error fetching knowledge base from Firestore:', err);
      }
    }

    loadData();
  }, [businessId, isDemoMode]);

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion || !faqAnswer) return;

    const newFaq: Omit<FAQ, 'id'> = {
      businessId,
      question: faqQuestion,
      answer: faqAnswer,
      category: faqCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let newId = `faq-${Date.now()}`;
    if (!isDemoMode && db) {
      try {
        const docRef = await addDoc(collection(db, 'businesses', businessId, 'faqs'), {
          ...newFaq,
          serverCreatedAt: serverTimestamp(),
        });
        newId = docRef.id;
      } catch (err) {
        console.error('Error adding FAQ:', err);
      }
    }

    setFaqs((prev) => [...prev, { id: newId, ...newFaq }]);
    setFaqQuestion('');
    setFaqAnswer('');
    setIsFaqModalOpen(false);
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Delete this FAQ entry?')) return;
    if (!isDemoMode && db) {
      try {
        await deleteDoc(doc(db, 'businesses', businessId, 'faqs', id));
      } catch (err) {
        console.error('Error deleting FAQ:', err);
      }
    }
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docContent) return;

    const newDoc: Omit<KnowledgeEntry, 'id'> = {
      businessId,
      title: docTitle,
      content: docContent,
      sourceType: docSourceType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let newId = `doc-${Date.now()}`;
    if (!isDemoMode && db) {
      try {
        const docRef = await addDoc(collection(db, 'businesses', businessId, 'knowledge'), {
          ...newDoc,
          serverCreatedAt: serverTimestamp(),
        });
        newId = docRef.id;
      } catch (err) {
        console.error('Error adding document:', err);
      }
    }

    setKnowledge((prev) => [...prev, { id: newId, ...newDoc }]);
    setDocTitle('');
    setDocContent('');
    setIsDocModalOpen(false);
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Delete this knowledge entry?')) return;
    if (!isDemoMode && db) {
      try {
        await deleteDoc(doc(db, 'businesses', businessId, 'knowledge', id));
      } catch (err) {
        console.error('Error deleting document:', err);
      }
    }
    setKnowledge((prev) => prev.filter((k) => k.id !== id));
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocs = knowledge.filter(
    (k) =>
      k.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Knowledge Base & Business Grounding</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Answers and policies registered here are strictly followed by your AI assistant to prevent hallucinations.
          </p>
        </div>

        <div>
          {activeTab === 'faqs' ? (
            <button
              onClick={() => setIsFaqModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ</span>
            </button>
          ) : (
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Knowledge Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'faqs'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions ({faqs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'docs'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Business Policies & Knowledge ({knowledge.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search knowledge..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>
      </div>

      {/* FAQS TAB */}
      {activeTab === 'faqs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFaqs.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                    {f.category || 'FAQ'}
                  </span>
                  <button
                    onClick={() => handleDeleteFaq(f.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{f.question}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  {f.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KNOWLEDGE DOCUMENTS TAB */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((k) => (
            <div
              key={k.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200/60 uppercase">
                    {k.sourceType}
                  </span>
                  <button
                    onClick={() => handleDeleteDoc(k.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{k.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  {k.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQ MODAL */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add Frequently Asked Question</h3>
              <button onClick={() => setIsFaqModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFaq} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. Do you offer warranty on repairs?"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Answer *</label>
                <textarea
                  rows={3}
                  required
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="e.g. Yes! All repairs come with a standard 60-day parts and labor warranty."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  placeholder="e.g. Warranty & Policies"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOC MODAL */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add Knowledge Document</h3>
              <button onClick={() => setIsDocModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Parking and Accessibility Guidelines"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source Type</label>
                <select
                  value={docSourceType}
                  onChange={(e) => setDocSourceType(e.target.value as KnowledgeSourceType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                >
                  <option value="policy">Policy / Rules</option>
                  <option value="location">Location / Directions Guide</option>
                  <option value="manual">Operation Manual</option>
                  <option value="general">General Information</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content *</label>
                <textarea
                  rows={4}
                  required
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Detailed instructions or rules for the AI assistant..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Save Knowledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
