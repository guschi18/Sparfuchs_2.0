#!/usr/bin/env python3
"""
Script zum Aufteilen von PDF-Dateien in mehrere Teile mit maximal 8 Seiten pro Datei.
Verwendet pypdf für die PDF-Verarbeitung.
"""

import os
import sys
from pathlib import Path
from pypdf import PdfReader, PdfWriter


def split_pdf_by_pages(input_pdf_path: str, pages_per_file: int = 8, output_dir: str = None) -> None:
    """
    Teilt eine PDF-Datei in mehrere Dateien auf.
    
    Args:
        input_pdf_path: Pfad zur Eingabe-PDF
        pages_per_file: Anzahl der Seiten pro Output-Datei (Standard: 8)
        output_dir: Ausgabeverzeichnis (Standard: Gleicher Ordner wie Input-PDF)
    """
    
    # Pfade vorbereiten
    input_path = Path(input_pdf_path)
    
    if not input_path.exists():
        print(f"[ERROR] PDF-Datei nicht gefunden: {input_pdf_path}")
        sys.exit(1)
    
    if not input_path.suffix.lower() == '.pdf':
        print(f"[ERROR] Datei ist keine PDF: {input_pdf_path}")
        sys.exit(1)
    
    # Output-Verzeichnis erstellen, wenn nicht angegeben
    if output_dir is None:
        output_dir = input_path.parent
    else:
        output_dir = Path(output_dir)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # PDF einlesen
    print(f"[INFO] Lese PDF ein: {input_path.name}")
    reader = PdfReader(input_pdf_path)
    total_pages = len(reader.pages)
    print(f"[INFO] Gesamtseiten: {total_pages}")
    
    # Berechne Anzahl der Output-Dateien
    num_files = (total_pages + pages_per_file - 1) // pages_per_file
    print(f"[INFO] Wird aufgeteilt in: {num_files} Datei(en)")
    
    # PDF aufteilen
    base_name = input_path.stem
    
    for file_num in range(num_files):
        start_page = file_num * pages_per_file
        end_page = min(start_page + pages_per_file, total_pages)
        
        # Neue PDF erstellen
        writer = PdfWriter()
        
        # Seiten hinzufügen
        for page_num in range(start_page, end_page):
            writer.add_page(reader.pages[page_num])
        
        # Dateiname erstellen
        part_num = file_num + 1
        page_range = f"Seiten_{start_page + 1}-{end_page}"
        output_filename = f"{base_name}_Teil_{part_num}_{page_range}.pdf"
        output_path = output_dir / output_filename
        
        # Datei speichern
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)
        
        pages_count = end_page - start_page
        print(f"[OK] Teil {part_num}: {output_filename} ({pages_count} Seiten)")
    
    print(f"\n[SUCCESS] Fertig! Alle Dateien wurden in '{output_dir}' gespeichert.")


def main():
    """Hauptfunktion zum Verarbeiten von Kommandozeilen-Argumenten."""
    
    if len(sys.argv) < 2:
        print("Verwendung: python split_pdf.py <PDF_PFAD> [SEITEN_PRO_DATEI] [OUTPUT_DIR]")
        print("\nBeispiele:")
        print("  python split_pdf.py 'Angebote/Angebote 20.10.2025 - 26.10.2025/Penny/ORG/Angebote & Prospekt der Woche _ PENNY.de.pdf'")
        print("  python split_pdf.py 'meine.pdf' 10")
        print("  python split_pdf.py 'meine.pdf' 8 './output'")
        sys.exit(1)
    
    input_pdf = sys.argv[1]
    pages_per_file = int(sys.argv[2]) if len(sys.argv) > 2 else 8
    output_dir = sys.argv[3] if len(sys.argv) > 3 else None
    
    split_pdf_by_pages(input_pdf, pages_per_file, output_dir)


if __name__ == '__main__':
    main()
