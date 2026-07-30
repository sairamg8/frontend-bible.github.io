import { useState } from 'react';
import { type ReactConcept, REACT_BIBLE_MODULES, REACT_CONCEPTS_DATA } from '../data/reactBibleData';
import { Cpu, Briefcase, Code, AlertTriangle, Search, CheckCircle2, Copy, Check, ChevronRight, BookOpen } from 'lucide-react';

export function ReactBibleExplorer() {
  const [selectedConcept, setSelectedConcept] = useState<ReactConcept>(REACT_CONCEPTS_DATA[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredConcepts = REACT_CONCEPTS_DATA.filter((concept) => {
    return concept.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           concept.summary.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedConcept.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur shrink-0 px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-xs">
            ⚛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                React 19 Bible & Ecosystem
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-semibold">
                Port 5173 Active
              </span>
            </div>
            <p className="text-xs text-slate-500">Eye-Friendly Documentation Hub for 50-60 LPA Architect Mastery</p>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 19 Hooks, RSC, DOM APIs..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-inner"
          />
        </div>
      </header>

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Single Unified Document Tree */}
        <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto p-4 space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Document Tree
          </div>

          <nav className="space-y-6">
            {REACT_BIBLE_MODULES.map((mod) => {
              const moduleConcepts = filteredConcepts.filter((c) => c.category === mod.id);
              if (moduleConcepts.length === 0) return null;

              return (
                <div key={mod.id} className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-700 font-mono px-2 py-1 bg-slate-100/70 rounded border border-slate-200/60 flex items-center justify-between">
                    <span>{mod.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({moduleConcepts.length})</span>
                  </h3>

                  <div className="space-y-1 pl-1">
                    {moduleConcepts.map((concept) => {
                      const isSelected = selectedConcept.id === concept.id;
                      return (
                        <button
                          key={concept.id}
                          onClick={() => setSelectedConcept(concept)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between border ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold shadow-xs'
                              : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="truncate">{concept.title}</span>
                          </div>
                          {concept.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono shrink-0">
                              {concept.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Right Content View: Unified Continuous Reading Article */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-8">
          {/* Article Header Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono text-indigo-700 font-semibold px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full">
                {selectedConcept.categoryName}
              </span>
              <span className="text-xs text-emerald-700 font-mono flex items-center gap-1.5 bg-emerald-50 px-3 py-1 border border-emerald-200 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> 50-60 LPA Architect Pattern
              </span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              {selectedConcept.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
              {selectedConcept.summary}
            </p>
          </div>

          {/* Section 1: Fiber Mechanics */}
          <section className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
              <Cpu className="w-5 h-5 text-indigo-600" /> 1. Fiber Architecture & Under-The-Hood Engine
            </h3>
            <div className="space-y-2.5">
              {selectedConcept.mechanics.map((mech, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed font-mono flex gap-3">
                  <span className="text-indigo-600 font-bold shrink-0">{i + 1}.</span>
                  <span>{mech}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Real-World Scenario */}
          <section className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
              <Briefcase className="w-5 h-5 text-emerald-600" /> 2. Real-World Production Scenario
            </h3>
            <div className="p-5 bg-emerald-50/50 border border-emerald-200/60 rounded-xl space-y-2">
              <h4 className="text-sm font-bold text-slate-900">{selectedConcept.scenario.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedConcept.scenario.description}
              </p>
            </div>
          </section>

          {/* Section 3: Production Code */}
          <section className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
                <Code className="w-5 h-5 text-indigo-600" /> 3. Production TypeScript & React 19 Implementation
              </h3>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs rounded-lg text-slate-700 font-medium flex items-center gap-1.5 transition shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            {/* Eye-friendly dark slate code container for high code readability */}
            <pre className="p-5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
              <code>{selectedConcept.code}</code>
            </pre>
          </section>

          {/* Section 4: Senior Edge Cases & Pitfalls */}
          <section className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
              <AlertTriangle className="w-5 h-5 text-amber-600" /> 4. Senior Engineer Edge Cases & Anti-Patterns
            </h3>
            <div className="space-y-2.5">
              {selectedConcept.pitfalls.map((pitfall, i) => (
                <div key={i} className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed font-mono flex gap-3">
                  <span className="text-amber-600 font-bold shrink-0">⚠️</span>
                  <span>{pitfall}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
