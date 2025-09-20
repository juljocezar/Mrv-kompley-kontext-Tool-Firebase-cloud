import React, { useState, useMemo } from 'react';
import type { KnowledgeItem, Tag } from '../../types';
import TagManagementModal from '../modals/TagManagementModal';

/**
 * @en Props for the KnowledgeBaseTab component.
 * @de Props für die KnowledgeBaseTab-Komponente.
 */
interface KnowledgeBaseTabProps {
    /**
     * @en The list of all items in the knowledge base.
     * @de Die Liste aller Einträge in der Wissensbasis.
     */
    knowledgeItems: KnowledgeItem[];
    /**
     * @en The list of all available tags.
     * @de Die Liste aller verfügbaren Tags.
     */
    tags: Tag[];
    /**
     * @en Callback to update the tags of a knowledge item.
     * @de Callback zur Aktualisierung der Tags eines Wissenseintrags.
     */
    onUpdateKnowledgeItemTags: (itemId: string, newTags: string[]) => void;
}

/**
 * @en A tab for viewing and managing the knowledge base. It allows filtering items by tags.
 * @de Ein Tab zur Anzeige und Verwaltung der Wissensbasis. Er ermöglicht das Filtern von Einträgen nach Tags.
 * @param props - The component props.
 * @returns A React functional component.
 */
const KnowledgeBaseTab: React.FC<KnowledgeBaseTabProps> = ({ knowledgeItems, tags, onUpdateKnowledgeItemTags }) => {
    const [filterTags, setFilterTags] = useState<string[]>([]);
    const [tagModalState, setTagModalState] = useState<{ isOpen: boolean; item: KnowledgeItem | null }>({ isOpen: false, item: null });

    /**
     * @en Toggles a tag in the filter list.
     * @de Schaltet einen Tag in der Filterliste um.
     * @param tagName - The name of the tag to toggle.
     */
    const handleFilterTagToggle = (tagName: string) => {
        setFilterTags(prev => 
            prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
        );
    };

    /**
     * @en Filters the knowledge items based on the selected filter tags.
     * @de Filtert die Wissenseinträge basierend auf den ausgewählten Filter-Tags.
     */
    const filteredItems = useMemo(() => {
        if (filterTags.length === 0) return knowledgeItems;
        return knowledgeItems.filter(item => 
            filterTags.some(filterTag => item.tags.includes(filterTag))
        );
    }, [knowledgeItems, filterTags]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Knowledge Base / Wissensbasis</h1>
            <p className="text-gray-400">A central collection of extracted facts, connections, and manually added information. / Eine zentrale Sammlung von extrahierten Fakten, Zusammenhängen und manuell hinzugefügten Informationen.</p>

            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">Filter by Tags / Nach Tags filtern</h3>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <button
                            key={tag.id}
                            onClick={() => handleFilterTagToggle(tag.name)}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                filterTags.includes(tag.name)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {tag.name}
                        </button>
                    ))}
                    {tags.length === 0 && <p className="text-sm text-gray-500">No tags available. / Keine Tags vorhanden.</p>}
                </div>
            </div>

            <div className="space-y-4">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold text-blue-400">{item.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">Summary / Zusammenfassung: {item.summary}</p>
                                <p className="text-sm text-gray-500 mb-2">Category / Kategorie: {item.category} | Created at / Erstellt am: {new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button 
                                onClick={() => setTagModalState({ isOpen: true, item })}
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-xs"
                            >
                                Manage Tags / Tags verwalten
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {item.tags.map(tag => (
                                <span key={tag} className="bg-gray-700 px-2 py-1 rounded-full text-xs text-gray-300">{tag}</span>
                            ))}
                        </div>
                    </div>
                ))}
                {filteredItems.length === 0 && (
                     <div className="text-center py-12 bg-gray-800 rounded-lg">
                        <p className="text-gray-500">{knowledgeItems.length === 0 ? "The knowledge base is empty. / Die Wissensbasis ist noch leer." : "No entries match the selected filters. / Keine Einträge entsprechen den ausgewählten Filtern."}</p>
                         {knowledgeItems.length === 0 && <p className="text-gray-500 text-sm mt-1">Perform detailed analyses or add entries manually in chat mode. / Führen Sie detaillierte Analysen durch oder fügen Sie im Chat-Modus manuell Einträge hinzu.</p>}
                    </div>
                )}
            </div>

            {tagModalState.isOpen && tagModalState.item && (
                <TagManagementModal
                    isOpen={tagModalState.isOpen}
                    onClose={() => setTagModalState({ isOpen: false, item: null })}
                    availableTags={tags}
                    assignedTags={tagModalState.item.tags}
                    onSave={(newTags) => {
                        onUpdateKnowledgeItemTags(tagModalState.item!.id, newTags);
                    }}
                    itemName={tagModalState.item.title}
                />
            )}
        </div>
    );
};

export default KnowledgeBaseTab;
