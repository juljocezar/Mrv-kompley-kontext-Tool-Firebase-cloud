import React, { useState } from 'react';
import type { TimelineEvent, Document } from '../../types';

/**
 * @en Props for the ChronologyTab component.
 * @de Props für die ChronologyTab-Komponente.
 */
interface ChronologyTabProps {
    /**
     * @en The list of events in the timeline.
     * @de Die Liste der Ereignisse in der Chronologie.
     */
    timelineEvents: TimelineEvent[];
    /**
     * @en Function to update the list of timeline events.
     * @de Funktion zur Aktualisierung der Liste der Chronologie-Ereignisse.
     */
    setTimelineEvents: React.Dispatch<React.SetStateAction<TimelineEvent[]>>;
    /**
     * @en The list of all available documents to link to events.
     * @de Die Liste aller verfügbaren Dokumente, die mit Ereignissen verknüpft werden können.
     */
    documents: Document[];
}

/**
 * @en A tab for displaying and managing a chronological timeline of case events.
 * @de Ein Tab zur Anzeige und Verwaltung einer chronologischen Zeitleiste von Fallereignissen.
 * @param props - The component props.
 * @returns A React functional component.
 */
const ChronologyTab: React.FC<ChronologyTabProps> = ({ timelineEvents, setTimelineEvents, documents }) => {
    // State for the new event form. Updated to match the 'TimelineEvent' type.
    const [newEvent, setNewEvent] = useState({ date: '', title: '', description: '', documentIds: [] as string[] });

    /**
     * @en Adds a new event to the timeline and resets the form.
     * @de Fügt ein neues Ereignis zur Chronologie hinzu und setzt das Formular zurück.
     */
    const handleAddEvent = () => {
        if (newEvent.date && newEvent.title) {
            // Ensure the new event object conforms to the 'TimelineEvent' type before updating state.
            setTimelineEvents(prev => [...prev, { ...newEvent, id: crypto.randomUUID() }].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            setNewEvent({ date: '', title: '', description: '', documentIds: [] });
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Case Chronology / Chronologie des Falls</h1>

             <div className="bg-gray-800 p-6 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                 <div className="col-span-3 md:col-span-1">
                     <label className="block text-sm font-medium text-gray-300">Date / Datum</label>
                     <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="mt-1 w-full bg-gray-700 p-2 rounded-md"/>
                 </div>
                 <div className="col-span-3 md:col-span-2">
                     <label className="block text-sm font-medium text-gray-300">Title / Titel</label>
                     <input type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="mt-1 w-full bg-gray-700 p-2 rounded-md"/>
                 </div>
                 <div className="col-span-3">
                     <label className="block text-sm font-medium text-gray-300">Description / Beschreibung</label>
                     <textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} rows={3} className="mt-1 w-full bg-gray-700 p-2 rounded-md"/>
                 </div>
                 <div className="col-span-3">
                    <button onClick={handleAddEvent} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md">Add Event / Ereignis hinzufügen</button>
                 </div>
             </div>

            <div className="relative border-l-2 border-gray-700 ml-4">
                {timelineEvents.map((event) => {
                    // Find source documents using the 'documentIds' array.
                    const sourceDocs = documents.filter(d => event.documentIds.includes(d.id));
                    return (
                        <div key={event.id} className="mb-8 ml-8">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full -left-3 ring-8 ring-gray-900">
                                🗓️
                            </span>
                            <div className="p-4 bg-gray-800 rounded-lg shadow-sm">
                                <time className="mb-1 text-sm font-normal leading-none text-gray-400">{new Date(event.date).toLocaleDateString()}</time>
                                <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                                <p className="text-base font-normal text-gray-300">{event.description}</p>
                                {/* Display the names of all linked source documents. */}
                                {sourceDocs.length > 0 && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        Source / Quelle: {sourceDocs.map(doc => doc.name).join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {timelineEvents.length === 0 && <p className="text-center text-gray-500 py-8">No events in the timeline. / Keine Ereignisse in der Chronologie.</p>}
        </div>
    );
};

export default ChronologyTab;