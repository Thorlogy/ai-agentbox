# 🤖 AgentBox: Interactive AI Agent Security & Procurement Sandbox

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/Thorlogy/ai-agentbox)

Ein interaktives High-Density-Simulationslabor für **Agentic AI, Prompt Injection, Routing & Human-in-the-Loop (HITL)**. 

Dieses Tool wurde entwickelt, um Entwicklern, Systemarchitekten und Workshop-Teilnehmern spielerisch zu vermitteln, wie man autonome KI-Agenten steuert, absichert und mit intelligenten Leitplanken (Guardrails) versieht.

---

## 🌟 Features

* **6 Interaktive Szenarien**:
  1. ✉️ **MAIL (Phishing-Mail)**: Abfangen gefährlicher Social-Engineering-Mails.
  2. 📄 **DOC (Dokumenten-Leak)**: Schutz sensibler Daten vor unbefugtem Abfluss.
  3. 🎫 **TKT (Ticket-Escalation)**: Automatische Erkennung kritischer System-Eskalationen.
  4. 💰 **BGT (Budget-Guardrails)**: Verhindern von unautorisierten Budgetüberschreitungen.
  5. 📅 **MTG (Meeting-Konflikt)**: Intelligente Lösung von Terminkollisionen.
  6. 🛒 **BUY (KI-Einkaufsagent)**: Autonomes Verhandeln, Angebote vergleichen und automatisiertes Bestellen bei 5 verschiedenen Mock-Lieferanten unter Einhaltung von Budgetgrenzen.
* **Dual-Simulations-Modus**:
  * **Ohne Leitplanke (Unsafe/Crash)**: Zeigt, wie ein ungeschützter Agent durch manipulierten Input (Prompt Injection) kompromittiert wird oder eigenmächtig Limits überschreitet (z. B. eine 120.000 € Bestellung ohne Budgetlimit auslöst).
  * **Mit Leitplanke (Safe/HITL)**: Zeigt, wie ein vorgeschalteter **Neural Orchestrator** den Input bewertet und bei Regelverletzungen sicher an einen Menschen (Human-in-the-Loop) übergibt.
* **Neural Orchestrator (LLM Evaluation)**:
  * Bewertet Sensordaten anhand benutzerdefinierter Systemprompts.
  * Liefert einen Safety-Score (0–100), eine klare Entscheidung (`ROUTER` vs. `HITL`) sowie eine detaillierte Begründung und Kriterienliste zurück.
  * Unterstützt **Google Gemini**, **OpenAI**, **Anthropic** und **DeepSeek**.
* **Live Tool Calling Loop**:
  * Führt echte Funktionsaufrufe (Function Calling) auf lokalen Mock-Datenbanken aus (`search_customer_db`, `search_supplier_db`).
  * Demonstriert visuell die Abfragekette und die Auswertung des Agenten.
* **📦 Integrierter Datenbank-Visualisierer**:
  * Ermöglicht es Workshop-Teilnehmern, die zugrundeliegenden Mock-Datenbanken (`customers.json` und `suppliers.json`) direkt in der UI einzusehen und live zu vergleichen, um Datenlecks oder Fehlbestellungen besser nachzuvollziehen.

---

## 🛠️ Tech-Stack

* **Backend**: Node.js (ES-Module), Express, Cors, Dotenv.
* **LLM-Integration**: `@google/genai`, `openai`, `@anthropic-ai/sdk`.
* **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (via CDN) für das High-Density-Design im Cyberpunk-Stil (Fraunhofer-Farben, JetBrains Mono, dunkle Panels, leuchtende Zustandslinien).

---

## 🚀 Schnellstart

### 1. Repository klonen
```bash
git clone <dein-github-repo-link>
cd agentbox-fullstack
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren
Kopiere die `.env.example` und erstelle deine eigene `.env`-Datei:
```bash
cp .env.example .env
```
Öffne die `.env` und trage deinen gewünschten API-Key ein (z. B. `GEMINI_API_KEY` oder `OPENAI_API_KEY`). Du kannst den aktiven Provider über `LLM_PROVIDER` steuern.

*Tipp: Du kannst API-Keys auch direkt im UI eintragen und testen. Sie werden dann lokal im Browser-LocalStorage gespeichert.*

### 4. Anwendung starten
Starte den Server mit:
```bash
npm start
```
Die Anwendung läuft nun unter [http://localhost:3000](http://localhost:3000).

---

## 📂 Ordnerstruktur

```text
├── agentbox-fullstack/
│   ├── mock_data/          # Fake-Datenbanken für Tool Calling
│   │   ├── customers.json  # Kundendaten (Kreditkarten, Notizen)
│   │   └── suppliers.json  # Lieferantendaten (Preise, Lieferzeiten, Bewertungen)
│   ├── public/             # Frontend-Assets
│   │   └── index.html      # Hauptoberfläche mit Simulationslogik
│   ├── .env.example        # Vorlage für Umgebungsvariablen
│   ├── package.json        # Node-Paketkonfiguration
│   └── server.js           # Express-Server mit LLM-Routing & Execution
├── DESIGN.md               # Details zum High-Density-Designsystem
└── README.md               # Diese Dokumentation
```

---

## 🧪 Simulationen im Unterricht / Workshop

Wenn du dieses Projekt für Schulungen oder Präsentationen verwendest, empfehlen wir folgende Schritte für das **BUY (KI-Einkaufsagent)** Szenario:

1. **Wähle das BUY-Szenario** oben in der Leiste aus.
2. **Schritt 1 (Szenario ohne Leitplanken)**:
   * Gib dem Agenten einen unregulierten Auftrag (z. B. *"Bestelle 15 Tonnen Aluminium-Rohre, egal was es kostet!"*).
   * Klicke auf **Ausführen**.
   * **Ergebnis**: Der Agent kontaktiert die Lieferanten, findet ein Angebot über **120.000 €** und bucht es selbstständig, da keine Budgetbeschränkungen definiert wurden.
3. **Schritt 2 (Szenario mit Leitplanken)**:
   * Klicke auf **Beispiel laden** im System-Prompt-Bereich. Es wird eine Regel geladen: *"Du darfst Bestellungen bis maximal 50.000 € eigenständig durchführen. Alles darüber erfordert menschliche Freigabe."*
   * Klicke auf **Ausführen**.
   * **Ergebnis**: Der Orchestrator bewertet die Sensor-Eingabe (Score sinkt unter 80), erkennt die Überschreitung des 50.000 € Limits und leitet die Buchung sicher an die **Menschliche Freigabe (HITL)** weiter. Die Fehlbuchung wurde verhindert!

---

## 📄 Lizenz

Dieses Projekt ist unter der ISC-Lizenz lizenziert. Siehe `package.json` für Details.
