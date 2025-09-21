# Dokumentation des Datenbankschemas für Agenten-Flows

## 1. Einleitung

Dieses Dokument beschreibt die Struktur der Firebase Firestore-Datenbank, die von diesem "Complex Context Tool" verwendet wird, insbesondere im Hinblick auf die automatisierten, von KI-Agenten gesteuerten Prozesse ("Agenten-Flows"). Das Verständnis dieser Struktur ist entscheidend für die Wartung und Weiterentwicklung der Anwendung.

Alle hier beschriebenen Daten werden pro Benutzer gespeichert und sind durch die `uid` des jeweiligen Firebase-Benutzers isoliert. Die Datentypen werden in `types.ts` definiert.

## 2. Kern-Collections der Agenten-Flows

Die folgenden Collections sind zentral für die Funktionsweise der KI-Agenten, insbesondere für den Prozess des Hochladens und der automatischen Klassifizierung von Dokumenten.

### 2.1. `documents`

Diese Collection speichert alle von Benutzern hochgeladenen Dokumente und deren Metadaten.

**Zweck:** Dient als primärer Speicher für alle Beweismittel, Korrespondenz und andere fallrelevante Dokumente.

**Schema (`Document`):**

| Feldname | Typ | Beschreibung |
|---|---|---|
| `id` | `string` | Eindeutige ID des Dokuments (von Firestore generiert). |
| `name` | `string` | Der ursprüngliche Dateiname des Dokuments. |
| `type` | `string` | Der MIME-Typ der Datei (z.B. `application/pdf`). |
| `content` | `string` | Der aus der Datei extrahierte Textinhalt (bei Bildern/PDFs per OCR). |
| `size` | `number` | Die Dateigröße in Bytes. |
| `uploadDate` | `string` | ISO 8601-Zeitstempel des Upload-Zeitpunkts. |
| `classificationStatus` | `string` | Der Status des Klassifizierungsprozesses. Mögliche Werte: `'unclassified'`, `'classifying'`, `'classified'`, `'failed'`. |
| `tags` | `string[]` | Ein Array von Tag-Namen, die diesem Dokument zugeordnet sind. |
| `workCategory` | `string` | Die vom KI-Agenten zugewiesene Arbeitskategorie (z.B. "Beweismittel"). |
| `chainOfCustody` | `ChainOfCustodyEvent[]` | Ein Protokoll zur Sicherstellung der Integrität des Dokuments. |

### 2.2. `tags`

Diese Collection verwaltet die global verfügbaren Tags, die zur Klassifizierung von Dokumenten und anderen Objekten verwendet werden können.

**Zweck:** Stellt eine konsistente und zentrale Liste von Tags für die gesamte Anwendung bereit.

**Schema (`Tag`):**

| Feldname | Typ | Beschreibung |
|---|---|---|
| `id` | `string` | Eindeutige ID des Tags (von Firestore generiert). |
| `name` | `string` | Der Name des Tags (z.B. "Finanzbericht"). |

### 2.3. `agentActivityLog`

Diese Collection protokolliert alle Aktionen, die von den internen KI-Agenten ausgeführt werden.

**Zweck:** Bietet Transparenz und Nachvollziehbarkeit über die Aktivitäten der KI-Systeme.

**Schema (`AgentActivity`):**

| Feldname | Typ | Beschreibung |
|---|---|---|
| `id` | `string` | Eindeutige ID des Log-Eintrags. |
| `timestamp` | `string` | ISO 8601-Zeitstempel der Aktion. |
| `agentName` | `string` | Der Name des Agenten, der die Aktion ausgeführt hat (z.B. `documentAnalyst`). |
| `action` | `string` | Eine Beschreibung der durchgeführten Aktion (z.B. `Triage für "Rechnung.pdf"`). |
| `result` | `'erfolg' \| 'fehler'` | Das Ergebnis der Aktion. |

### 2.4. `auditLog`

Diese Collection protokolliert alle Aktionen, die direkt von einem Benutzer ausgeführt werden.

**Zweck:** Dient der allgemeinen Nachvollziehbarkeit und Sicherheit, indem Benutzerinteraktionen aufgezeichnet werden.

**Schema (`AuditLogEntry`):**

| Feldname | Typ | Beschreibung |
|---|---|---|
| `id` | `string` | Eindeutige ID des Log-Eintrags. |
| `timestamp` | `string` | ISO 8601-Zeitstempel der Aktion. |
| `action` | `string` | Die Art der Aktion (z.B. "Dateiupload gestartet"). |
| `details` | `string` | Zusätzliche Details zur Aktion (z.B. `Anzahl: 3`). |

## 3. Beispiel-Flow: Dokumenten-Upload & Auto-Klassifizierung

Der folgende Prozess beschreibt, wie die oben genannten Collections zusammenspielen, wenn ein Benutzer eine neue Datei hochlädt:

1.  **Benutzeraktion:** Der Benutzer lädt eine oder mehrere Dateien über das UI hoch. Die Funktion `handleFileUpload` in `App.tsx` wird aufgerufen.
    *   **`auditLog`:** Ein neuer Eintrag wird erstellt, um den Start des Uploads zu protokollieren (Aktion: `Dateiupload gestartet`).

2.  **Inhaltsextraktion:** Für jede Datei wird der Inhalt extrahiert.
    *   Wenn die Datei ein Bild oder PDF ist, wird ein KI-Agent (`information_extraction`) über die Gemini API aufgerufen, um eine OCR durchzuführen und den Text zu extrahieren.
    *   **`agentActivityLog`:** Der Erfolg oder Misserfolg der OCR-Aktion wird protokolliert.

3.  **Dokumenterstellung:** Ein neues Dokument wird in der `documents`-Collection in Firestore gespeichert.
    *   Der `classificationStatus` wird initial auf `'unclassified'` gesetzt.
    *   Eine `chainOfCustody` wird mit einem Hash des Inhalts erstellt.

4.  **Start der Auto-Klassifizierung:** Unmittelbar nach der Erstellung des Dokuments wird die Funktion `handleAutoClassify` aufgerufen.
    *   Das Dokument in der `documents`-Collection wird aktualisiert: `classificationStatus` wird auf `'classifying'` gesetzt.

5.  **KI-Analyse:**
    *   Ein KI-Agent (`documentAnalyst`) wird über die Gemini API aufgerufen.
    *   Der Agent erhält den Dokumenteninhalt und die Liste der bereits existierenden Tags aus der `tags`-Collection.
    *   Der Agent gibt eine `workCategory` und eine Liste von `suggestedTags` zurück.

6.  **Verarbeitung der KI-Antwort:**
    *   **Tag-Management:** Wenn die KI neue Tags vorschlägt, die noch nicht in der `tags`-Collection existieren, werden diese dort neu angelegt.
    *   **`auditLog`:** Die automatische Erstellung neuer Tags wird protokolliert.
    *   **Dokumenten-Update:** Das Dokument in der `documents`-Collection wird final aktualisiert:
        *   `classificationStatus` wird auf `'classified'` (oder `'failed'` bei einem Fehler) gesetzt.
        *   `workCategory` wird mit dem Ergebnis der KI gefüllt.
        *   Das `tags`-Array des Dokuments wird mit den vorgeschlagenen Tags aktualisiert.

7.  **Abschließendes Logging:**
    *   **`agentActivityLog`:** Der Erfolg oder Misserfolg des gesamten Klassifizierungsprozesses (`Triage`) wird protokolliert.

Dieser Flow zeigt, wie die Datenstrukturen ineinandergreifen, um einen automatisierten, nachvollziehbaren und robusten Prozess zur Verarbeitung von Informationen zu ermöglichen.
