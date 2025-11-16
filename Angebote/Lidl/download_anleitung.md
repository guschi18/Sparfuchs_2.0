# Anleitung: Lidl PDF-Prospekt Download

## Übersicht
Dieses Dokument beschreibt, wie das PDF-Dokument des Lidl Aktionsprospekts aus dem DOM heruntergeladen wurde.

## Ausgangssituation
- **URL**: https://www.lidl.de/l/prospekte/aktionsprospekt-10-11-2025-15-11-2025-40a5a1/view/flyer/page/1?lf=HHZ
- **Ziel**: Download des vollständigen PDF-Prospekts
- **Zeitraum**: 10.11.2025 – 15.11.2025

## Vorgehensweise

### 1. Seite mit Chrome DevTools öffnen
Die Lidl-Prospektseite wurde mit Chrome DevTools geöffnet, um die Netzwerk-Requests zu analysieren.

```bash
# Seite navigiert zu:
https://www.lidl.de/l/prospekte/aktionsprospekt-10-11-2025-15-11-2025-40a5a1/view/flyer/page/1?lf=HHZ
```

### 2. Netzwerk-Traffic analysieren
Nach dem Laden der Seite wurden die Netzwerk-Requests untersucht. Dabei wurde ein wichtiger API-Request identifiziert:

**API-Endpoint**:
```
https://endpoints.leaflets.schwarz/v4/flyer?flyer_identifier=aktionsprospekt-10-11-2025-15-11-2025-40a5a1
```

### 3. API-Response auswerten
Die API liefert eine JSON-Response mit allen Informationen zum Prospekt, einschließlich der PDF-URL.

**Relevante JSON-Felder**:
- `flyer.pdfUrl`: Enthält die URL zum Standard-PDF
- `flyer.hiResPdfUrl`: Enthält die URL zum hochauflösenden PDF
- `flyer.fileSize`: 67898106 Bytes (~65 MB)

**Gefundene PDF-URL**:
```
https://object.storage.eu01.onstackit.cloud/leaflets/pdfs/019a39c9-8b33-7880-a396-c665abbcd4eb/Aktionsprospekt-10-11-2025-15-11-2025-02.pdf
```

### 4. PDF herunterladen
Das PDF wurde direkt von der Storage-URL heruntergeladen:

```bash
Invoke-WebRequest -Uri "https://object.storage.eu01.onstackit.cloud/leaflets/pdfs/019a39c9-8b33-7880-a396-c665abbcd4eb/Aktionsprospekt-10-11-2025-15-11-2025-02.pdf" -OutFile "Angebote/Lidl/Aktionsprospekt-10-11-2025-15-11-2025.pdf"
```

## Ergebnis

**Heruntergeladene Datei**:
- Pfad: `D:\Sparfuchs 2.0\sparfuchs-nextjs\Angebote\Lidl\Aktionsprospekt-10-11-2025-15-11-2025.pdf`
- Größe: 64.75 MB
- Format: PDF

## Zusammenfassung der Methode

Die Lidl-Webseite lädt die Prospekt-Informationen über eine API (`endpoints.leaflets.schwarz`), die in der JSON-Response direkte Links zu den PDF-Dateien bereitstellt. Anstatt das PDF aus dem gerenderten DOM zu extrahieren, wurde die effizientere Methode verwendet:

1. API-Request identifizieren
2. JSON-Response analysieren
3. Direkte PDF-URL extrahieren
4. PDF mit curl herunterladen

## Technische Details

**API-Informationen**:
- Server: myracloud
- Cache-Control: no-cache, no-store, max-age=0
- Content-Type: application/json
- Access-Control-Allow-Origin: *

**Flyer-Informationen**:
- ID: 019a39c9-8b33-7880-a396-c665abbcd4eb
- Name: Aktionsprospekt
- Titel: 10.11.2025 – 15.11.2025
- Kategorie: Filial-Angebote
- Locale: de-DE (lidl/de-DE)
- Status: current (aktiv)

## Alternative Methoden

Falls diese Methode in Zukunft nicht mehr funktioniert, könnten folgende Alternativen verwendet werden:

1. **Screenshot-basiert**: Alle Seiten als Screenshots speichern und zu einem PDF zusammenfügen
2. **Browser-Automatisierung**: JavaScript auf der Seite ausführen, um versteckte Download-Buttons zu triggern
3. **PDF-Extrahierung aus Canvas**: Falls das PDF in Canvas-Elementen gerendert wird, diese extrahieren
