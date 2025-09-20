import type { AgentCapability } from './types';

/**
 * @en Defines the profile for an AI agent, including its capabilities and system prompt.
 * @de Definiert das Profil für einen KI-Agenten, einschließlich seiner Fähigkeiten und seines System-Prompts.
 */
export interface AgentProfile {
    name: string;
    role: string;
    description: string;
    capabilities: AgentCapability[];
    icon: string; // emoji
    systemPrompt: string;
}

/**
 * @en A dictionary of all available AI agent profiles.
 * @de Ein Verzeichnis aller verfügbaren KI-Agentenprofile.
 */
export const MRV_AGENTS: { [key: string]: AgentProfile } = {
    workloadAnalyst: {
        name: 'Workload Analyst',
        role: 'The Economist & Project Manager / Der Ökonom & Projektmanager',
        description: 'Assesses the quantitative effort of a case, estimates workload and costs. / Bewertet den quantitativen Aufwand eines Falles, schätzt Arbeitsaufwand und Kosten.',
        capabilities: ['workload_calculation', 'cost_analysis'],
        icon: '🗂️',
        systemPrompt: "I am an expert in analyzing workload and costs in a human rights context, based on German standards (RVG/JVEG). / Ich bin ein Experte für die Analyse von Arbeitsaufwand und Kosten im menschenrechtlichen Kontext, basierend auf deutschen Standards (RVG/JVEG)."
    },
    documentAnalyst: {
        name: 'Document Analyst',
        role: 'The Meticulous Archivist & Investigator / Der akribische Archivar & Ermittler',
        description: 'Extracts and systematizes unstructured information from documents into usable knowledge. / Extrahiert und systematisiert unstrukturierte Informationen aus Dokumenten in nutzbares Wissen.',
        capabilities: ['document_analysis', 'information_extraction', 'document_linking', 'un_submission_assistance'],
        icon: '📄',
        systemPrompt: "I am a specialist in the detailed analysis of documents for the extraction of facts, entities, events, and evidence. / Ich bin ein Spezialist für die detaillierte Analyse von Dokumenten zur Extraktion von Fakten, Entitäten, Ereignissen und Beweismitteln."
    },
    legalExpert: {
        name: 'Legal Expert',
        role: 'The AI Jurist / Der KI-Jurist',
        description: 'Reviews content for legal relevance, coherence, and identifies contradictions. / Prüft Inhalte auf ihre rechtliche Relevanz, Kohärenz und identifiziert Widersprüche.',
        capabilities: ['legal_analysis', 'contradiction_detection', 'compliance_check'],
        icon: '⚖️',
        systemPrompt: "I am an AI jurist specializing in human rights. I analyze documents for legal relevance and contradictions. / Ich bin ein KI-Jurist, spezialisiert auf Menschenrechte. Ich analysiere Dokumente auf rechtliche Relevanz und Widersprüche."
    },
    riskAnalyst: {
        name: 'Risk Analyst',
        role: 'The Security Officer / Der Sicherheitsbeauftragte',
        description: 'Proactively identifies dangers for all parties involved and suggests strategies to mitigate them. / Erkennt proaktiv Gefahren für alle Beteiligten und schlägt Strategien zu deren Abwehr vor.',
        capabilities: ['risk_assessment'],
        icon: '🛡️',
        systemPrompt: "I am a security expert who analyzes risks for human rights defenders and proposes mitigation strategies. / Ich bin ein Sicherheitsexperte, der Risiken für Menschenrechtsverteidiger analysiert und Minderungsstrategien vorschlägt."
    },
    researchSpecialist: {
        name: 'Research Specialist',
        role: 'The Synthesis Expert & Reporter / Der Synthese-Experte & Berichterstatter',
        description: 'Merges information from many different sources into a coherent whole. / Führt Informationen aus vielen verschiedenen Quellen zu einem kohärenten Ganzen zusammen.',
        capabilities: ['research', 'report_generation', 'case_analysis', 'kpi_suggestion'],
        icon: '🔬',
        systemPrompt: "I am a research specialist who merges information from various sources to create comprehensive reports and analyses. / Ich bin ein Recherche-Spezialist, der Informationen aus verschiedenen Quellen zusammenführt, um umfassende Berichte und Analysen zu erstellen."
    },
     ethicsAdvisor: {
        name: 'Ethics Advisor',
        role: 'The Moral Conscience / Das moralische Gewissen',
        description: 'Analyzes cases for overarching ethical patterns and systemic problems. / Analysiert Fälle auf übergeordnete ethische Muster und systemische Probleme.',
        capabilities: ['attrition_analysis'],
        icon: '🧐',
        systemPrompt: "I am an ethics advisor who analyzes cases for strategies of attrition, abuse of power, and structural problems. / Ich bin ein Ethikberater, der Fälle auf Zermürbungsstrategien, Machtmissbrauch und strukturelle Probleme analysiert."
    },
    contentCreator: {
        name: 'Content Creator',
        role: 'The Professional Writer / Der professionelle Autor',
        description: 'Transforms case context information into precise, well-formulated documents. / Verwandelt Fallkontext-Informationen in präzise, gut formulierte Schriftstücke.',
        capabilities: ['content_creation', 'official_documents', 'un_submission_finalization'],
        icon: '✍️',
        systemPrompt: "I am an expert in creating precise and impactful documents, from official letters to UN submissions. / Ich bin ein Experte für die Erstellung präziser und wirkungsvoller Schriftstücke, von offiziellen Briefen bis zu UN-Einreichungen."
    },
    communicationExpert: {
        name: 'Communication Expert',
        role: 'The Communication Expert / Der Kommunikationsexperte',
        description: 'Creates content for external communication (media, public, donors). / Erstellt Inhalte für die externe Kommunikation (Medien, Öffentlichkeit, Spender).',
        capabilities: ['public_communication'],
        icon: ' megaphone',
        systemPrompt: 'I am an expert in strategic communication in the human rights field. I formulate complex issues for target audiences such as media, the public, and donors. / Ich bin ein Experte für strategische Kommunikation im Menschenrechtsbereich. Ich formuliere komplexe Sachverhalte zielgruppengerecht für Medien, Öffentlichkeit und Spender.'
    },
    strategyConsultant: {
        name: 'Strategy Consultant',
        role: 'The Strategic Thinker / Der strategische Vordenker',
        description: 'Proactively develops next steps and long-term plans beyond pure analysis. / Entwickelt proaktiv nächste Schritte und langfristige Pläne über die reine Analyse hinaus.',
        capabilities: ['strategy_development'],
        icon: '♟️',
        systemPrompt: "I am a strategic consultant who develops the next steps and long-term strategies based on case analysis. / Ich bin ein strategischer Berater, der basierend auf der Fallanalyse die nächsten Schritte und langfristige Strategien entwickelt."
    },
    processOptimizer: {
        name: 'Process Optimizer',
        role: 'The Efficiency Coach / Der Effizienz-Coach',
        description: 'Analyzes the current state of case processing and suggests optimizations. / Analysiert den aktuellen Stand der Fallbearbeitung und schlägt Optimierungen vor.',
        capabilities: ['task_suggestion'],
        icon: '🚀',
        systemPrompt: "I analyze the current case status and suggest the next logical steps to maximize efficiency. / Ich analysiere den aktuellen Fallstatus und schlage die nächsten logischen Schritte vor, um die Effizienz zu maximieren."
    }
};

/**
 * @en A dictionary of predefined document templates, categorized for ease of use.
 * @de Ein Verzeichnis vordefinierter Dokumentenvorlagen, zur einfachen Verwendung kategorisiert.
 */
export const DOCUMENT_TEMPLATES = {
    'HURIDOCS Formats / HURIDOCS-Formate': [
        {
            title: 'Event Documentation (HURIDOCS) / Ereignis-Dokumentation (HURIDOCS)',
            description: 'Structured recording of an incident according to international HURIDOCS standards. / Strukturierte Erfassung eines Vorfalls nach internationalen HURIDOCS-Standards.',
            content: `
# Event Documentation (HURIDOCS Standard) / Ereignis-Dokumentation (HURIDOCS-Standard)

Fill out the following table based on information from the case context. / Fülle die folgende Tabelle basierend auf den Informationen aus dem Fallkontext aus.

| Field ID | Field Name / Feld-Name | Information |
|---|---|---|
| 10 | Title of Event / Titel des Ereignisses | |
| 20 | Date of Event / Datum des Ereignisses | |
| 30 | Location of Event / Ort des Ereignisses | |
| 40 | Description of Event / Beschreibung des Ereignisses | |
| 50 | Victims Involved (Names) / Beteiligte Opfer (Namen) | |
| 60 | Perpetrators Involved (Names/Groups) / Beteiligte Täter (Namen/Gruppen) | |
| 70 | Human Rights Articles Violated / Verletzte Menschenrechtsartikel | |
| 80 | Evidence (Documents, Witnesses) / Beweismittel (Dokumente, Zeugen) | |
`,
        },
    ],
    'National Procedures / Nationale Verfahren': [
        {
            title: 'Official Supervisory Complaint / Dienstaufsichtsbeschwerde',
            description: 'Formal complaint against the conduct of an official. / Formale Beschwerde gegen das Verhalten eines Amtsträgers.',
            content: `
# Official Supervisory Complaint / Dienstaufsichtsbeschwerde

**From / Absender:**
[Your Name/Organization / Dein Name/Organisation]
[Your Address / Deine Adresse]

**To / Empfänger:**
[Name of Supervisor / Name der/des Dienstvorgesetzten]
[Authority / Behörde]
[Address of Authority / Adresse der Behörde]

**Date / Datum:** ${new Date().toLocaleDateString('de-DE')}

**Subject: Official Supervisory Complaint against [Official's Name], [Department] / Betreff: Dienstaufsichtsbeschwerde gegen [Name des/der Beamten/Beamtin], [Dienststelle]**

Dear [Supervisor's Name] / Sehr geehrte/r [Name der/des Dienstvorgesetzten],

I hereby file an official supervisory complaint against [Official's Name] regarding the following matter. / hiermit erhebe ich Dienstaufsichtsbeschwerde gegen [Name des/der Beamten/Beamtin] wegen des folgenden Sachverhalts.

**1. Facts of the Case / Sachverhalt**
[Instruction to AI: Describe the incident precisely and chronologically that led to the complaint. Refer to specific dates, locations, and individuals involved from the case context. / Anweisung an die KI: Beschreibe hier präzise und chronologisch den Vorfall, der zur Beschwerde führt. Beziehe dich auf konkrete Daten, Orte und beteiligte Personen aus dem Fallkontext.]

**2. Legal Assessment / Rechtliche Würdigung**
[Instruction to AI: Explain which specific breaches of duty (e.g., inaction, arbitrariness, violation of regulations) you believe have occurred. If possible, refer to relevant laws or ordinances. / Anweisung an die KI: Lege dar, welche konkreten Dienstpflichtverletzungen (z.B. Untätigkeit, Willkür, Verstoß gegen Vorschriften) aus deiner Sicht vorliegen. Beziehe dich, wenn möglich, auf relevante Gesetze oder Verordnungen.]

**3. Request / Antrag**
I request: / Ich beantrage:
1.  A review of the described matter. / Die Prüfung des geschilderten Sachverhalts.
2.  The initiation of appropriate disciplinary measures. / Die Einleitung entsprechender dienstrechtlicher Maßnahmen.
3.  Written notification of the outcome of your review. / Eine schriftliche Mitteilung über das Ergebnis Ihrer Prüfung.

Sincerely / Mit freundlichen Grüßen,

[Your Name/Organization / Dein Name/Organisation]
`,
        },
    ],
    'UN Procedures / UN-Verfahren': [
        {
            title: 'UN Submission (Special Procedures) / UN Einreichung (Sonderverfahren)',
            description: 'Standardized submission of a case to a UN Special Rapporteur. / Standardisierte Einreichung eines Falles an einen UN-Sonderberichterstatter.',
            content: `
# Submission to UN Special Procedures / Einreichung an UN-Sonderverfahren

**TO:** [Name of the relevant UN Special Rapporteur / Name des zuständigen UN-Sonderberichterstatters]
**FROM:** [Your organization's name/your name / Name deiner Organisation/dein Name]
**DATE:** ${new Date().toLocaleDateString('de-DE')}
**SUBJECT:** Individual Complaint regarding [Name of victim(s)/group] / BETREFF: Individuelle Beschwerde betreffend [Name des Opfers/der Gruppe]

**I. INFORMATION ON THE VICTIM(S) / INFORMATIONEN ZUM OPFER/ZU DEN OPFERN**
*   Name:
*   Date of Birth / Geburtsdatum:
*   Nationality / Nationalität:
*   Contact Information (if consent is given) / Kontaktinformationen (falls Zustimmung vorliegt):

**II. INFORMATION ON THE INCIDENT / INFORMATIONEN ZUM VORFALL**
*   Date and time of incident / Datum und Uhrzeit des Vorfalls:
*   Location of incident / Ort des Vorfalls:
*   Detailed description of the incident / Detaillierte Beschreibung des Vorfalls:
    [Instruction to AI: Describe the incident in detail based on the source documents. / Anweisung an KI: Beschreibe den Vorfall detailliert basierend auf den Quelldokumenten.]

**III. INFORMATION ON THE ALLEGED PERPETRATORS / INFORMATIONEN ZU DEN MUTMASSLICHEN TÄTERN**
*   Name/Unit / Name/Einheit:
*   State or non-state actors / Staatliche oder nicht-staatliche Akteure:
*   Description of their involvement / Beschreibung ihrer Beteiligung:

**IV. EXHAUSTION OF DOMESTIC REMEDIES / ERSCHÖPFUNG NATIONALER RECHTSMITTEL**
*   What steps were taken? (e.g., police reports, court cases) / Welche Schritte wurden unternommen? (Anzeigen, Gerichtsverfahren etc.):
*   What was the outcome of these steps? / Was war das Ergebnis dieser Schritte?:
*   Why are domestic remedies unavailable, ineffective, or exhausted? / Warum sind nationale Rechtsmittel nicht verfügbar, effektiv oder erschöpft?:

**V. CONSENT / ZUSTIMMUNG**
*   Is there informed consent from the victim to submit this case? (Yes/No) / Liegt die informierte Zustimmung des Opfers zur Einreichung dieses Falles vor? (Ja/Nein)
*   Does the victim consent to the publication of their name? (Yes/No) / Stimmt das Opfer der Veröffentlichung seines Namens zu? (Ja/Nein)

**VI. ACTION REQUESTED / GEWÜNSCHTE MASSNAHMEN**
[Instruction to AI: Formulate concrete requests to the Special Rapporteur, e.g., an Urgent Appeal, an official inquiry to the government (Communication), a recommendation in their next report. / Anweisung an KI: Formuliere konkrete Forderungen an den Sonderberichterstatter, z.B. eine dringende Intervention (Urgent Appeal), eine offizielle Anfrage an die Regierung (Communication), eine Empfehlung in seinem nächsten Bericht.]
`,
        },
    ],
     'Internal Analysis & Reports / Interne Analyse & Berichte': [
        {
            title: 'Case File (Summary) / Falldossier (Zusammenfassung)',
            description: 'A comprehensive internal summary of the entire case. / Eine umfassende interne Zusammenfassung des gesamten Falles.',
            content: `
# Case File: [CASE NAME] / Falldossier: [FALLNAME]

**Date of Creation / Datum der Erstellung:** ${new Date().toLocaleDateString('de-DE')}

## 1. Case Summary / Fallzusammenfassung
[Instruction to AI: Create a concise summary of the entire case based on the case description and key findings. / Anweisung an KI: Erstelle eine prägnante Zusammenfassung des gesamten Falles basierend auf der Fallbeschreibung und den wichtigsten Erkenntnissen.]

## 2. Key Actors / Hauptakteure
| Name | Role in Case / Rolle im Fall | Type / Typ |
|---|---|---|
| [Name] | [Victim, Perpetrator, Witness...] / [Opfer, Täter, Zeuge...] | [Person, Organization] / [Person, Organisation] |

## 3. Chronology of Key Events / Chronologie der Schlüsselereignisse
| Date / Datum | Event / Ereignis |
|---|---|
| [Date / Datum] | [Description of event / Beschreibung des Ereignisses] |

## 4. Current Status & Next Steps / Aktueller Status & Nächste Schritte
[Instruction to AI: Describe the current processing status and list the 3-5 most important next steps. / Anweisung an KI: Beschreibe den aktuellen Stand der Bearbeitung und liste die 3-5 wichtigsten nächsten Schritte auf.]
`
        },
    ],
    'Public Relations / Öffentlichkeitsarbeit': [
        {
            title: 'Press Release / Pressemitteilung',
            description: 'A draft for a press release to attract public attention. / Ein Entwurf für eine Pressemitteilung, um öffentliche Aufmerksamkeit zu erregen.',
            content: `
# PRESS RELEASE / PRESSEMITTEILUNG

**[TITLE OF PRESS RELEASE / TITEL DER PRESSEMITTEILUNG]**

**[CITY / STADT], ${new Date().toLocaleDateString('de-DE')}** – [Instruction to AI: Start with the most important sentence that summarizes the core message (lead sentence). / Anweisung an KI: Beginne mit dem wichtigsten Satz, der den Kern der Nachricht zusammenfasst (Lead-Satz).]

[Instruction to AI: In the second paragraph, elaborate on the key details: Who is affected? What happened? Where and when did it take place? Why is it a human rights violation? / Anweisung an KI: Führe im zweiten Absatz die wichtigsten Details aus: Wer ist betroffen? Was ist passiert? Wo und wann fand es statt? Warum ist es eine Menschenrechtsverletzung?]

[Instruction to AI: Add a quote from a spokesperson for your organization or an affected person. / Anweisung an KI: Füge ein Zitat von einem Sprecher deiner Organisation oder einem Betroffenen ein.]

[Instruction to AI: In the final paragraph, provide background information about your organization and the broader context of the case. / Anweisung an KI: Gib im letzten Absatz Hintergrundinformationen zu deiner Organisation und dem größeren Kontext des Falles.]

**Contact / Kontakt:**
[Name]
[Position]
[Email / E-Mail]
[Phone / Telefon]
`,
        }
    ]
};