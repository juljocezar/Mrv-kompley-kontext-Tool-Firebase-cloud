<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MRV Komplexes Kontext-Tool

## Über dieses Projekt

Dieses Projekt ist ein fortschrittliches "Complex Context Tool", das auf dem Google AI Studio und der Gemini-KI basiert. Es wurde entwickelt, um Benutzer bei der Analyse, Verwaltung und Bearbeitung von komplexen Fällen zu unterstützen, insbesondere in Bereichen, die eine detaillierte Untersuchung von Dokumenten, die Identifizierung von Zusammenhängen und die strategische Planung erfordern.

Die Anwendung bietet eine sichere, benutzerauthentifizierte Umgebung, in der alle Daten mit Firebase Firestore gespeichert und in Echtzeit synchronisiert werden. Die Kernfunktionen werden durch KI-Agenten unterstützt, die Aufgaben wie die automatische Dokumentenklassifizierung, die Textextraktion (OCR) und die Analyse durchführen.

## Hauptfunktionen

Die Anwendung ist in mehrere spezialisierte Bereiche (Tabs) unterteilt, die jeweils für eine bestimmte Aufgabe konzipiert sind:

*   **Dashboard:** Bietet eine allgemeine Übersicht über den Fall, die neuesten Dokumente und zentrale Analyseergebnisse.
*   **Documents:** Ermöglicht das Hochladen, Anzeigen und Verwalten aller fallbezogenen Dokumente. KI-Agenten klassifizieren Dokumente automatisch und weisen ihnen Tags zu.
*   **Analysis:** Dient der detaillierten Analyse von Dokumenteninhalten und der Aufdeckung von Mustern.
*   **Generation:** Werkzeuge zur Erstellung neuer Dokumente und Berichte auf Basis der analysierten Daten.
*   **Dispatch:** Vorbereitung und Versand von generierten Dokumenten.
*   **Chronology:** Erstellt und visualisiert eine chronologische Abfolge der Ereignisse des Falles.
*   **Entities:** Verwaltung von Entitäten (z.B. Personen, Orte, Organisationen) und deren Beziehungen zueinander.
*   **Graph:** Visualisiert das Netzwerk von Entitäten und deren Verbindungen.
*   **Knowledge:** Eine Wissensdatenbank zur Speicherung und Abfrage von wichtigen Fakten und Erkenntnissen.
*   **Contradictions:** Identifiziert Widersprüche zwischen verschiedenen Informationsquellen.
*   **Strategy:** Unterstützt bei der Risikoanalyse und der Entwicklung von Minderungsstrategien.
*   **KPIs:** Verfolgung von Key Performance Indicators zur Bewertung des Fallfortschritts.
*   **Legal Basis:** Verwaltung von rechtlichen Grundlagen und Referenzen.
*   **UN Submissions:** Werkzeuge zur Erstellung von Einreichungen bei den Vereinten Nationen.
*   **Ethics Analysis:** Führt eine ethische Analyse des Falles durch.
*   **Library:** Eine Bibliothek für relevante Referenzmaterialien.
*   **Audit:** Protokolliert alle Benutzer- und Agentenaktionen für eine vollständige Nachvollziehbarkeit.
*   **Agents:** Verwaltung und Überwachung der KI-Agenten.
*   **Settings:** Konfiguration der Anwendungseinstellungen und Verwaltung von Tags.

## Lokales Ausführen

**Voraussetzungen:** [Node.js](https://nodejs.org/)

1.  Abhängigkeiten installieren:
    ```sh
    npm install
    ```
2.  Den `GEMINI_API_KEY` in einer `.env.local`-Datei auf Ihren Gemini-API-Schlüssel setzen.
    ```
    GEMINI_API_KEY=IHR_API_SCHLUESSEL
    ```
3.  Die App starten:
    ```sh
    npm run dev
    ```
Die Anwendung ist dann unter `http://localhost:5173` (oder einem ähnlichen Port) verfügbar.
