
import React from 'react';
import { useStore } from '../store';
import { Clock, ShieldAlert, User, Search } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const { auditLogs } = useStore();

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="text-amber-500" size={20} />
            System Security Logs
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search logs..." className="pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="space-y-4">
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <div key={log.id} className="flex gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      log.action.includes('CREATED') ? 'bg-emerald-100 text-emerald-700' :
                      log.action.includes('DELETED') ? 'bg-rose-100 text-rose-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{log.details}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <User size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-500">Performed by: <span className="font-bold">@{log.userId}</span></span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400">
              No system activity logs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
