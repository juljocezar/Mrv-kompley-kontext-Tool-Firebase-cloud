import React from 'react';
import type { ActiveTab } from '../../types';
import Icon from './Icon';

/**
 * @en Props for the SidebarNav component.
 * @de Props für die SidebarNav-Komponente.
 */
interface SidebarNavProps {
    /**
     * @en The currently active tab.
     * @de Der aktuell aktive Tab.
     */
    activeTab: ActiveTab;
    /**
     * @en Callback function to set the active tab.
     * @de Callback-Funktion zum Setzen des aktiven Tabs.
     */
    setActiveTab: (tab: ActiveTab) => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'documents', label: 'Documents / Dokumente', icon: 'File' },
    { id: 'analysis', label: 'Analysis / Analyse', icon: 'BarChart2' },
    { id: 'generation', label: 'Generator', icon: 'Zap' },
    { id: 'dispatch', label: 'Dispatch / Versand', icon: 'Send' },
    { id: 'chronology', label: 'Chronology / Chronologie', icon: 'List' },
    { id: 'entities', label: 'Entities / Stammdaten', icon: 'Users' },
    { id: 'graph', label: 'Graph', icon: 'GitMerge' },
    { id: 'knowledge', label: 'Knowledge Base / Wissensbasis', icon: 'BrainCircuit' },
    { id: 'contradictions', label: 'Contradictions / Widersprüche', icon: 'AlertTriangle' },
    { id: 'strategy', label: 'Strategy / Strategie', icon: 'HeartHandshake' },
    { id: 'kpis', label: 'KPIs', icon: 'Target' },
    { id: 'legal', label: 'Legal Basis / Rechtsgrundlagen', icon: 'Gavel' },
    { id: 'un-submissions', label: 'UN Submissions / UN-Eingaben', icon: 'Mail' },
    { id: 'ethics', label: 'Ethics Analysis / Ethik-Analyse', icon: 'ShieldQuestion' },
    { id: 'library', label: 'Library / Bibliothek', icon: 'Library' },
    { id: 'audit', label: 'Audit Log / Protokoll', icon: 'History' },
    { id: 'agents', label: 'Agents / Agenten', icon: 'Bot' },
    { id: 'settings', label: 'Settings / Einstellungen', icon: 'Settings' },
];

/**
 * @en The main sidebar navigation component for the application.
 * @de Die Haupt-Seitenleisten-Navigationskomponente für die Anwendung.
 * @param props - The component props.
 * @returns A React functional component.
 */
const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, setActiveTab }) => {
    return (
        <nav className="w-64 bg-gray-800 flex-shrink-0 flex flex-col border-r border-gray-700">
            <div className="flex items-center justify-center h-16 border-b border-gray-700">
                <span className="text-white text-2xl font-bold">MRV</span>
            </div>
            <ul className="flex-grow overflow-y-auto">
                {navItems.map(item => (
                    <li key={item.id}>
                        <button
                            onClick={() => setActiveTab(item.id as ActiveTab)}
                            className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                                activeTab === item.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <Icon name={item.icon} className="mr-3 h-5 w-5" />
                            <span>{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default SidebarNav;