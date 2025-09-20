import React from 'react';
import { MRV_AGENTS } from '../../constants';
import { AgentActivity } from '../../types';

/**
 * @en Props for the AgentManagementTab component.
 * @de Props für die AgentManagementTab-Komponente.
 */
interface AgentManagementTabProps {
    /**
     * @en A log of all activities performed by the agents.
     * @de Ein Protokoll aller von den Agenten durchgeführten Aktivitäten.
     */
    agentActivityLog: AgentActivity[];
}

/**
 * @en A tab for managing and viewing AI agents. It displays a list of available agents
 *     and a log of their activities.
 * @de Ein Tab zur Verwaltung und Anzeige von KI-Agenten. Er zeigt eine Liste der verfügbaren
 *     Agenten und ein Protokoll ihrer Aktivitäten an.
 * @param props - The component props.
 * @returns A React functional component.
 */
const AgentManagementTab: React.FC<AgentManagementTabProps> = ({ agentActivityLog }) => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Agent Management / Agentenverwaltung</h1>
            
            <h2 className="text-2xl font-semibold text-gray-300">Available Agents / Verfügbare Agenten</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(MRV_AGENTS).map(agent => (
                    <div key={agent.name} className="bg-gray-800 p-6 rounded-lg shadow flex flex-col">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <span className="text-2xl mr-3">{agent.icon}</span>
                                {agent.name}
                            </h3>
                            <p className="text-sm text-blue-400 font-semibold">{agent.role}</p>
                            <p className="text-gray-400 mt-2 text-sm">{agent.description}</p>
                        </div>
                        <div className="mt-4 border-t border-gray-700 pt-4">
                            <h4 className="text-xs uppercase text-gray-500 font-bold">System Prompt / System-Prompt</h4>
                            <p className="text-xs italic text-gray-400 mt-1">"{agent.systemPrompt}"</p>
                        </div>
                        <div className="mt-4 flex-grow flex flex-col justify-end">
                            <h4 className="text-xs uppercase text-gray-500 font-bold">Capabilities / Fähigkeiten</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {agent.capabilities.map(cap => (
                                    <span key={cap} className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">{cap}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-300 mt-8">Activity Log / Aktivitätsprotokoll</h2>
             <div className="bg-gray-800 rounded-lg shadow">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp / Zeitstempel</th>
                            <th scope="col" className="px-6 py-3">Agent</th>
                            <th scope="col" className="px-6 py-3">Action / Aktion</th>
                            <th scope="col" className="px-6 py-3">Result / Ergebnis</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agentActivityLog.slice().reverse().map(log => (
                            <tr key={log.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-white">{log.agentName}</td>
                                <td className="px-6 py-4">{log.action}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${log.result === 'success' || log.result === 'erfolg' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {log.result}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {agentActivityLog.length === 0 && (
                    <p className="text-center py-8 text-gray-500">No agent activity logged yet. / Noch keine Agenten-Aktivität protokolliert.</p>
                )}
            </div>
        </div>
    );
};

export default AgentManagementTab;