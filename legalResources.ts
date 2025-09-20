/**
 * @en A curated collection of legal resources, primarily focusing on UN Special Procedures.
 * @de Eine kuratierte Sammlung von rechtlichen Ressourcen, mit einem Hauptaugenmerk auf UN-Sonderverfahren.
 */
export const legalResources = {
    unSpecialProcedures: {
        title: 'UN Special Procedures / UN Sonderverfahren',
        description: 'Information on submitting cases to UN Special Rapporteurs, Independent Experts, and Working Groups. / Informationen zur Einreichung von Fällen bei den UN-Sonderberichterstattern, unabhängigen Experten und Arbeitsgruppen.',
        submissionInfo: [
            { title: 'Identity of the victim(s) / Identität des/der Opfer', content: 'Full name, date of birth, nationality, and other relevant identifying information. / Vollständiger Name, Geburtsdatum, Nationalität und andere relevante Identifikationsmerkmale.' },
            { title: 'Consent / Zustimmung', content: 'Informed consent from the victim or their family is mandatory. It must be clarified whether the victim\'s name may be published. / Eine informierte Zustimmung des Opfers oder seiner Familie ist zwingend erforderlich. Es muss geklärt werden, ob der Name des Opfers veröffentlicht werden darf.' },
            { title: 'Identity of the alleged perpetrators / Identität der mutmaßlichen Täter', content: 'Name, title, state unit, or group. Any information that helps in identification. / Name, Titel, staatliche Einheit oder Gruppe. Jede Information, die zur Identifizierung beiträgt.' },
            { title: 'Date, place, and description of the incident / Datum, Ort und Beschreibung des Vorfalls', content: 'A detailed, chronological, and fact-based account of the human rights violation. / Eine detaillierte, chronologische und faktenbasierte Darstellung der Menschenrechtsverletzung.' },
            { title: 'Exhaustion of domestic remedies / Erschöpfung nationaler Rechtsmittel', content: 'Explanation of what legal steps have been taken at the national level and why they were not successful, available, or effective. / Darlegung, welche rechtlichen Schritte auf nationaler Ebene unternommen wurden und warum diese nicht erfolgreich, nicht verfügbar oder nicht effektiv waren.' },
            { title: 'Connection to international human rights norms / Bezug zu internationalen Menschenrechtsnormen', content: 'Which articles of which conventions (e.g., UDHR, ICCPR) were violated? / Welche Artikel welcher Konventionen (z.B. AEMR, UN-Zivilpakt) wurden verletzt?' },
        ],
        submissionChannels: [
            { type: 'General email for submissions / Allgemeine E-Mail für Einreichungen', value: 'submissions@ohchr.org' },
            { type: 'Email for Urgent Appeals / E-Mail für dringende Appelle', value: 'urgent-action@ohchr.org' },
            { type: 'Online Portal / Online-Portal', value: 'https://spsubmission.ohchr.org/' },
        ],
        helpfulLinks: [
            { name: 'Official Page of the Special Procedures / Offizielle Seite der Sonderverfahren', url: 'https://www.ohchr.org/en/special-procedures-human-rights-council' },
            { name: 'Directory of Mandate Holders / Verzeichnis der Mandatsträger', url: 'https://www.ohchr.org/en/special-procedures/find-mandate-holders-and-their-mandates' },
        ]
    },
};

/**
 * @en A collection of other useful resources, including OHCHR databases and key external portals.
 * @de Eine Sammlung weiterer nützlicher Ressourcen, einschließlich OHCHR-Datenbanken und wichtiger externer Portale.
 */
export const otherResources = {
    ohchrDatabases: {
        title: 'OHCHR Databases / OHCHR-Datenbanken',
        description: 'Specialized databases from the Office of the High Commissioner for Human Rights (OHCHR) for researching documents, jurisprudence, and recommendations. / Spezialisierte Datenbanken des Hochkommissariats für Menschenrechte (OHCHR) zur Recherche von Dokumenten, Rechtsprechung und Empfehlungen.',
        items: [
            {
                title: 'Search Library',
                description: 'Central search access to all public OHCHR documents. / Zentraler Suchzugang zu allen öffentlichen OHCHR-Dokumenten.',
                url: 'https://searchlibrary.ohchr.org/?ln=en'
            },
            {
                title: 'Anti-discrimination Database',
                description: 'Information, policies, and measures to combat racism and discrimination. / Informationen, Richtlinien und Maßnahmen zur Bekämpfung von Rassismus und Diskriminierung.',
                url: 'http://adsdatabase.ohchr.org/'
            },
            // ... other databases with bilingual descriptions
        ]
    },
    otherKeyResources: {
        title: 'Other Key Resources / Weitere Schlüsselressourcen',
        description: 'Important external databases and information portals from partner organizations. / Wichtige externe Datenbanken und Informationsportale von Partnerorganisationen.',
        items: [
            {
                title: 'Right-Docs',
                description: 'Documentation resource for human rights defenders. / Dokumentationsressource für Menschenrechtsverteidiger.',
                url: 'https://www.right-docs.org/'
            },
            // ... other resources with bilingual descriptions
        ]
    }
};
