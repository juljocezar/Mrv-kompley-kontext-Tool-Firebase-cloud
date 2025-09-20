import React, { useState } from 'react';
import type { AppSettings, Tag } from '../../types';

/**
 * @en Props for the SettingsTab component.
 * @de Props für die SettingsTab-Komponente.
 */
interface SettingsTabProps {
    /**
     * @en The current application settings.
     * @de Die aktuellen Anwendungseinstellungen.
     */
    settings: AppSettings;
    /**
     * @en Function to update the application settings.
     * @de Funktion zum Aktualisieren der Anwendungseinstellungen.
     */
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    /**
     * @en The list of all available tags.
     * @de Die Liste aller verfügbaren Tags.
     */
    tags: Tag[];
    /**
     * @en Callback to create a new global tag.
     * @de Callback zum Erstellen eines neuen globalen Tags.
     */
    onCreateTag: (name: string) => void;
    /**
     * @en Callback to delete a global tag.
     * @de Callback zum Löschen eines globalen Tags.
     */
    onDeleteTag: (tagId: string) => void;
}

/**
 * @en A tab for configuring application settings, including AI parameters, tag management, and workload calculation thresholds.
 * @de Ein Tab zur Konfiguration der Anwendungseinstellungen, einschließlich KI-Parameter, Tag-Verwaltung und Schwellenwerte für die Aufwandskalkulation.
 * @param props - The component props.
 * @returns A React functional component.
 */
const SettingsTab: React.FC<SettingsTabProps> = ({ settings, setSettings, tags, onCreateTag, onDeleteTag }) => {
    const [newTagName, setNewTagName] = useState('');
    
    /**
     * @en Handles changes to AI settings inputs.
     * @de Behandelt Änderungen an den Eingabefeldern für die KI-Einstellungen.
     * @param e - The React change event.
     */
    const handleAIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            ai: { ...prev.ai, [name]: parseFloat(value) }
        }));
    };

    /**
     * @en Handles changes to complexity threshold inputs.
     * @de Behandelt Änderungen an den Eingabefeldern für die Komplexitätsschwellen.
     * @param e - The React change event.
     */
    const handleComplexityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            complexity: { ...prev.complexity, [name]: parseInt(value) }
        }));
    };

    /**
     * @en Handles the creation of a new tag.
     * @de Behandelt die Erstellung eines neuen Tags.
     */
    const handleCreateTag = () => {
        if (newTagName.trim()) {
            onCreateTag(newTagName.trim());
            setNewTagName('');
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white">Settings / Einstellungen</h1>

            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-4">AI Settings / KI-Einstellungen</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="temperature" className="block text-sm font-medium text-gray-300">
                            Temperature (Creativity) / Temperatur (Kreativität): {settings.ai.temperature}
                        </label>
                        <input
                            type="range"
                            id="temperature"
                            name="temperature"
                            min="0"
                            max="1"
                            step="0.05"
                            value={settings.ai.temperature}
                            onChange={handleAIChange}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label htmlFor="topP" className="block text-sm font-medium text-gray-300">
                            Top-P (Word Choice Precision) / Top-P (Wortauswahl-Präzision): {settings.ai.topP}
                        </label>
                         <input
                            type="range"
                            id="topP"
                            name="topP"
                            min="0"
                            max="1"
                            step="0.05"
                            value={settings.ai.topP}
                            onChange={handleAIChange}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Tag Management / Tag-Verwaltung</h2>
                <p className="text-sm text-gray-400 mb-4">Manage the globally available tags here. / Verwalten Sie hier die global verfügbaren Tags.</p>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                        placeholder="Enter new tag name / Neuen Tag-Namen eingeben"
                        className="flex-grow bg-gray-700 text-gray-200 p-2 rounded-md border border-gray-600"
                    />
                    <button onClick={handleCreateTag} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md">Create / Erstellen</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tags.map(tag => (
                        <div key={tag.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                            <span className="text-gray-200">{tag.name}</span>
                            <button onClick={() => onDeleteTag(tag.id)} className="text-red-400 hover:text-red-300 text-sm font-semibold">Delete / Löschen</button>
                        </div>
                    ))}
                     {tags.length === 0 && <p className="text-center text-gray-500 py-4">No tags exist. / Keine Tags vorhanden.</p>}
                </div>
            </div>

             <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Workload Calculation / Aufwandskalkulation</h2>
                 <p className="text-sm text-gray-400 mb-4">Define the hour thresholds for the complexity assessment. / Definieren Sie die Stundengrenzen für die Komplexitätsbewertung.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="low" className="block text-sm font-medium text-gray-300">"Low" Threshold (hours) / Grenze "Niedrig" (Stunden)</label>
                        <input
                            type="number"
                            id="low"
                            name="low"
                            value={settings.complexity.low}
                            onChange={handleComplexityChange}
                            className="mt-1 w-full bg-gray-700 text-gray-200 p-2 rounded-md border border-gray-600"
                        />
                    </div>
                     <div>
                        <label htmlFor="medium" className="block text-sm font-medium text-gray-300">"Medium" Threshold (hours) / Grenze "Mittel" (Stunden)</label>
                        <input
                            type="number"
                            id="medium"
                            name="medium"
                            value={settings.complexity.medium}
                            onChange={handleComplexityChange}
                            className="mt-1 w-full bg-gray-700 text-gray-200 p-2 rounded-md border border-gray-600"
                        />
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default SettingsTab;
