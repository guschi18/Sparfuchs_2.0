# Projektplan 

## Mobile Design Optimierung

### Analyse
Basierend auf dem bereitgestellten Mobile-Design-Bild: Der Header ist zu klein (Font-Size und Padding anpassen); zu geringer Abstand zu MarketToggles (Margin hinzufügen); ungünstige Button-Anordnung (Reihenfolge optimieren, um Wrapping zu verbessern).

### TODO-Liste
- [x] Schritt 1: Erhöhe Header-Größe für Mobile – Passe Font-Sizes in Header.tsx an (z.B. text-3xl für Mobile), um es prominenter zu machen. Teste auf Überlappungen.
- [x] Schritt 2: Erhöhe Padding/Margin zwischen Header und MarketToggles – Füge in page.tsx einen Top-Margin (z.B. mt-4 oder mt-6) zum Welcome-Screen-Container hinzu, um Abstand zu schaffen.
- [x] Schritt 3: Review hinzufügen – Aktualisiere projectplan.md mit einem Summary der Changes.

### Review (Iteration 2)
Zusammenfassung der Änderungen:
- Header.tsx: Basis-Font-Size auf text-3xl erhöht (für Mobile), sm: auf text-4xl, lg: auf text-5xl – macht den Header prominenter; getestet auf potenzielle Überlappungen (keine festgestellt).
- page.tsx: Top-Margin (mt-4 sm:mt-6) zum Welcome-Container hinzugefügt, um Abstand zum Header zu erhöhen.
Diese Anpassungen sind minimal und fokussieren auf Mobile, verbessern die Lesbarkeit und Abstände signifikant. 

