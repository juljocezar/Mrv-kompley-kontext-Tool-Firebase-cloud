import React from 'react';

/**
 * @en A placeholder component for features that are under development.
 * @de Eine Platzhalterkomponente für Funktionen, die sich in der Entwicklung befinden.
 * @returns A React functional component.
 */
const PlaceholderTab: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
                <h2 className="text-2xl font-semibold">Feature in Development / Funktion in Entwicklung</h2>
                <p>This section will be available in a future version. / Dieser Bereich wird in einer zukünftigen Version verfügbar sein.</p>
            </div>
        </div>
    );
};

export default PlaceholderTab;
