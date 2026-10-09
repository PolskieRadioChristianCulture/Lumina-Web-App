
import React, { useEffect, useState } from 'react';

export const SystemHealth: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    const checks = [];
    const currentHost = window.location.hostname;
    
    checks.push(`Host: ${currentHost}`);
    checks.push(`Protocol: ${window.location.protocol}`);
    
    const isProduction = currentHost === 'cclite.pl';
    const isPreview = currentHost.includes('run.app') || currentHost.includes('googleusercontent.com');
    const isLocal = currentHost === 'localhost' || currentHost === '127.0.0.1';
    
    if (isProduction || isPreview || isLocal) {
      setStatus('ok');
    } else {
      setStatus('error');
      checks.push("Warning: Domain mismatch or local dev");
    }

    setDetails(checks);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-[3000] p-3 bg-black/80 border border-white/10 rounded-xl backdrop-blur-md pointer-events-none">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${status === 'ok' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-[8px] font-black text-white uppercase tracking-widest">System Health v4.5.345</span>
      </div>
      <div className="space-y-0.5">
        {details.map((d, i) => (
          <p key={i} className="text-[7px] text-zinc-500 font-mono uppercase">{d}</p>
        ))}
      </div>
    </div>
  );
};
