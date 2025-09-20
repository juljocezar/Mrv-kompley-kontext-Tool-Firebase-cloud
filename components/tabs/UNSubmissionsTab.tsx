import React, { useState } from 'react';
import type { UNSubmission } from '../../types';

/**
 * @en Props for the UNSubmissionsTab component.
 * @de Props für die UNSubmissionsTab-Komponente.
 */
interface UNSubmissionsTabProps {
    submissions: UNSubmission[];
    setSubmissions: React.Dispatch<React.SetStateAction<UNSubmission[]>>;
    onGenerateSection: (sectionTitle: string, currentContent: { [key: string]: string }) => Promise<string>;
    onFinalize: () => Promise<void>;
    isLoading: boolean;
    loadingSection: string;
}

const submissionSections = [
    'I. INFORMATION ON THE VICTIM(S) / INFORMATIONEN ZUM OPFER/ZU DEN OPFERN',
    'II. INFORMATION ON THE INCIDENT / INFORMATIONEN ZUM VORFALL',
    'III. INFORMATION ON THE PERPETRATORS / INFORMATIONEN ZU DEN MUTMASSLICHEN TÄTERN',
    'IV. EXHAUSTION OF DOMESTIC REMEDIES / ERSCHÖPFUNG NATIONALER RECHTSMITTEL',
    'V. CONSENT / ZUSTIMMUNG',
    'VI. ACTION REQUESTED / GEWÜNSCHTE MASSNAHMEN'
];

/**
 * @en A tab for creating, managing, and editing submissions to UN Special Procedures.
 * @de Ein Tab zum Erstellen, Verwalten und Bearbeiten von Eingaben an UN-Sonderverfahren.
 * @param props - The component props.
 * @returns A React functional component.
 */
const UNSubmissionsTab: React.FC<UNSubmissionsTabProps> = ({ submissions, setSubmissions, onGenerateSection, onFinalize, isLoading, loadingSection }) => {
    const [currentSubmission, setCurrentSubmission] = useState<UNSubmission | null>(null);

    /**
     * @en Creates a new, empty submission and opens the editor view.
     * @de Erstellt eine neue, leere Eingabe und öffnet die Bearbeitungsansicht.
     */
    const handleNewSubmission = () => {
        const newSub: UNSubmission = {
            id: crypto.randomUUID(),
            title: `UN Submission ${new Date().toLocaleDateString()} / UN-Einreichung ${new Date().toLocaleDateString()}`,
            status: 'draft',
            content: submissionSections.reduce((acc, section) => ({ ...acc, [section]: '' }), {})
        };
        setCurrentSubmission(newSub);
    };

    /**
     * @en Saves the current submission (new or existing) to the main list and closes the editor view.
     * @de Speichert die aktuelle Eingabe (neu oder vorhanden) in der Hauptliste und schließt die Bearbeitungsansicht.
     */
    const handleSaveSubmission = () => {
        if (currentSubmission) {
            setSubmissions(prev => {
                const existing = prev.find(s => s.id === currentSubmission.id);
                if (existing) {
                    return prev.map(s => s.id === currentSubmission.id ? currentSubmission : s);
                }
                return [...prev, currentSubmission];
            });
            setCurrentSubmission(null);
        }
    };

    /**
     * @en Triggers the AI to generate content for a specific section of the submission.
     * @de Löst die KI aus, um Inhalte für einen bestimmten Abschnitt der Eingabe zu generieren.
     * @param sectionTitle - The title of the section to generate.
     */
    const handleGenerate = async (sectionTitle: string) => {
        if (!currentSubmission) return;
        const generatedText = await onGenerateSection(sectionTitle, currentSubmission.content);
        setCurrentSubmission(prev => {
            if (!prev) return null;
            return {
                ...prev,
                content: {
                    ...prev.content,
                    [sectionTitle]: generatedText,
                }
            };
        });
    };
    
    /**
     * @en Handles changes to the content of a submission section.
     * @de Behandelt Änderungen am Inhalt eines Eingabeabschnitts.
     * @param sectionTitle - The title of the section being edited.
     * @param text - The new text content.
     */
    const handleContentChange = (sectionTitle: string, text: string) => {
        if (!currentSubmission) return;
        setCurrentSubmission(prev => {
            if (!prev) return null;
            return {
                ...prev,
                content: {
                    ...prev.content,
                    [sectionTitle]: text,
                }
            };
        });
    };

    if (currentSubmission) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <input 
                        type="text"
                        value={currentSubmission.title}
                        onChange={(e) => setCurrentSubmission({...currentSubmission, title: e.target.value})}
                        className="text-3xl font-bold text-white bg-transparent border-b-2 border-gray-700 focus:outline-none focus:border-blue-500"
                    />
                     <div>
                        <button onClick={() => setCurrentSubmission(null)} className="mr-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md">Cancel / Abbrechen</button>
                        <button onClick={handleSaveSubmission} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md">Save & Close / Speichern & Schließen</button>
                    </div>
                </div>
                <div className="space-y-4">
                    {submissionSections.map(section => (
                        <details key={section} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden" open>
                            <summary className="cursor-pointer p-4 font-semibold text-white text-lg hover:bg-gray-700/50 flex justify-between items-center">
                                {section}
                                <button
                                    onClick={(e) => { e.preventDefault(); handleGenerate(section); }}
                                    disabled={isLoading && loadingSection === `un-section-${section}`}
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs disabled:bg-gray-500"
                                >
                                    {isLoading && loadingSection === `un-section-${section}` ? '...' : 'Generate / Generieren'}
                                </button>
                            </summary>
                            <div className="p-4 border-t border-gray-700">
                                <textarea
                                    value={currentSubmission.content[section] || ''}
                                    onChange={(e) => handleContentChange(section, e.target.value)}
                                    rows={8}
                                    className="w-full bg-gray-700/50 p-2 rounded-md"
                                    placeholder={`Enter or generate content for section "${section}"... / Inhalt für Sektion "${section}" eingeben oder generieren...`}
                                />
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">UN Submissions / UN-Eingaben</h1>
                <button onClick={handleNewSubmission} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md">
                    Create New Submission / Neue Eingabe erstellen
                </button>
            </div>
            <p className="text-gray-400">
                Manage your drafts for submissions to UN Special Rapporteurs and other mechanisms here. /
                Verwalten Sie hier Ihre Entwürfe für Eingaben an UN-Sonderberichterstatter und andere Mechanismen.
            </p>

            <div className="space-y-4">
                {submissions.map(sub => (
                    <div key={sub.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-white">{sub.title}</h3>
                            <p className="text-sm text-gray-400">Status: {sub.status}</p>
                        </div>
                        <button onClick={() => setCurrentSubmission(sub)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm">Edit / Bearbeiten</button>
                    </div>
                ))}
                 {submissions.length === 0 && (
                    <p className="text-center py-8 text-gray-500">No submissions created yet. / Noch keine Eingaben erstellt.</p>
                )}
            </div>
        </div>
    );
};

export default UNSubmissionsTab;