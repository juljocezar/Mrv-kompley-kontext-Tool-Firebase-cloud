import React from 'react';
import type { AuditLogEntry, AgentActivity } from '../../types';

/**
 * @en Props for the AuditLogTab component.
 * @de Props für die AuditLogTab-Komponente.
 */
interface AuditLogTabProps {
    /**
     * @en The log of user actions.
     * @de Das Protokoll der Benutzeraktionen.
     */
    auditLog: AuditLogEntry[];
    /**
     * @en The log of agent activities.
     * @de Das Protokoll der Agentenaktivitäten.
     */
    agentActivityLog: AgentActivity[];
}

/**
 * @en A tab that displays a combined, immutable log of all important user and system actions
 *     to ensure transparency and traceability.
 * @de Ein Tab, der ein kombiniertes, unveränderliches Protokoll aller wichtigen Benutzer- und Systemaktionen
 *     anzeigt, um Transparenz und Nachvollziehbarkeit zu gewährleisten.
 * @param props - The component props.
 * @returns A React functional component.
 */
const AuditLogTab: React.FC<AuditLogTabProps> = ({ auditLog, agentActivityLog }) => {
    const combinedLog = [
        ...auditLog.map(log => ({ ...log, type: 'user' })),
        ...agentActivityLog.map(log => ({ 
            ...log, 
            type: 'agent', 
            action: log.agentName, 
            details: `${log.action} (${log.result})` 
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Audit Log</h1>
            <p className="text-gray-400">An immutable log of all important user and system actions to ensure transparency and traceability. / Ein unveränderliches Protokoll aller wichtigen Benutzer- und Systemaktionen zur Gewährleistung von Transparenz und Nachvollziehbarkeit.</p>
            
            <div className="bg-gray-800 rounded-lg shadow">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp / Zeitstempel</th>
                            <th scope="col" className="px-6 py-3">Type / Typ</th>
                            <th scope="col" className="px-6 py-3">Actor/Action / Akteur/Aktion</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {combinedLog.map(log => (
                            <tr key={log.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${log.type === 'user' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                        {log.type === 'user' ? 'User / Benutzer' : 'Agent'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-white">{log.action}</td>
                                <td className="px-6 py-4 text-gray-400">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {combinedLog.length === 0 && (
                    <p className="text-center py-8 text-gray-500">No activities logged yet. / Noch keine Aktivitäten protokolliert.</p>
                )}
            </div>
        </div>
    );
};

export default AuditLogTab;
