// src/app/loading.tsx
export default function Loading() {
  return (
    <main className="min-h-screen bg-[#0D1B2A] text-slate-100 font-sans p-4 md:p-8 animate-pulse">
      {/* HEADER SKELETON */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4 opacity-50">
        <div className="h-8 w-32 bg-slate-700 rounded-lg"></div>
        <div className="h-10 w-full md:w-1/3 bg-slate-700 rounded-full"></div>
        <div className="flex gap-4">
          <div className="h-10 w-10 bg-slate-700 rounded-full"></div>
          <div className="h-10 w-10 bg-slate-700 rounded-full"></div>
        </div>
      </header>

      {/* DASHBOARD SKELETON */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* HERO CARD SKELETON */}
        <div className="lg:col-span-1 h-[320px] bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 flex flex-col justify-between">
          <div>
            <div className="h-8 w-40 bg-slate-700 rounded-lg mb-4"></div>
            <div className="h-4 w-24 bg-slate-700 rounded-lg"></div>
          </div>
          <div className="h-16 w-24 bg-slate-700 rounded-lg my-4"></div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-12 bg-slate-700/50 rounded-xl"></div>
            <div className="h-12 bg-slate-700/50 rounded-xl"></div>
            <div className="h-12 bg-slate-700/50 rounded-xl"></div>
          </div>
        </div>

        {/* TABLEAU & GRAPH SKELETON */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="h-[300px] bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6">
            <div className="h-6 w-48 bg-slate-700 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-slate-700/30 rounded-lg"></div>
              <div className="h-8 bg-slate-700/30 rounded-lg"></div>
              <div className="h-8 bg-slate-700/30 rounded-lg"></div>
            </div>
          </div>
          <div className="h-[380px] bg-slate-800/40 rounded-3xl border border-slate-700/50"></div>
        </div>
      </div>
    </main>
  );
}