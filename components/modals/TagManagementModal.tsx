import React, { useState, useEffect } from 'react';
import type { Tag } from '../../types';

/**
 * @en Props for the TagManagementModal component.
 * @de Props für die TagManagementModal-Komponente.
 */
interface TagManagementModalProps {
    /**
     * @en Whether the modal is open.
     * @de Ob das Modal geöffnet ist.
     */
    isOpen: boolean;
    /**
     * @en Callback function to close the modal.
     * @de Callback-Funktion zum Schließen des Modals.
     */
    onClose: () => void;
    /**
     * @en The list of all available tags.
     * @de Die Liste aller verfügbaren Tags.
     */
    availableTags: Tag[];
    /**
     * @en The list of tags currently assigned to the item.
     * @de Die Liste der dem Element aktuell zugewiesenen Tags.
     */
    assignedTags: string[];
    /**
     * @en Callback function to save the updated tag assignments.
     * @de Callback-Funktion zum Speichern der aktualisierten Tag-Zuweisungen.
     */
    onSave: (newTags: string[]) => void;
    /**
     * @en The name of the item being tagged.
     * @de Der Name des Elements, das getaggt wird.
     */
    itemName: string;
}

/**
 * @en A modal for assigning and unassigning tags to an item.
 * @de Ein Modal zum Zuweisen und Entfernen von Tags zu einem Element.
 * @param props - The component props.
 * @returns A React functional component.
 */
const TagManagementModal: React.FC<TagManagementModalProps> = ({ isOpen, onClose, availableTags, assignedTags, onSave, itemName }) => {
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            setSelectedTags(new Set(assignedTags));
        }
    }, [isOpen, assignedTags]);

    if (!isOpen) return null;

    /**
     * @en Toggles the selection state of a tag.
     * @de Schaltet den Auswahlstatus eines Tags um.
     * @param tagName - The name of the tag to toggle.
     */
    const handleToggleTag = (tagName: string) => {
        setSelectedTags(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tagName)) {
                newSet.delete(tagName);
            } else {
                newSet.add(tagName);
            }
            return newSet;
        });
    };

    /**
     * @en Saves the current selection of tags.
     * @de Speichert die aktuelle Auswahl an Tags.
     */
    const handleSave = () => {
        onSave(Array.from(selectedTags));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md flex flex-col border border-gray-700">
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white truncate pr-4">Tags for "{itemName}" / Tags für "{itemName}"</h2>
                     <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </header>
                <div className="p-6 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableTags.map(tag => (
                            <label key={tag.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700/50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedTags.has(tag.name)}
                                    onChange={() => handleToggleTag(tag.name)}
                                    className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-gray-200">{tag.name}</span>
                            </label>
                        ))}
                    </div>
                    {availableTags.length === 0 && <p className="text-gray-500 text-center py-4">No tags available. Create some in the settings. / Keine Tags verfügbar. Erstellen Sie welche in den Einstellungen.</p>}
                </div>
                <footer className="p-4 border-t border-gray-700 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md">Cancel / Abbrechen</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md">Save / Speichern</button>
                </footer>
            </div>
        </div>
    );
};

export default TagManagementModal;
