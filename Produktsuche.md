**Produktsuche optimieren**

**Problem**
 - Die KI Suche von Produkten in unserer Angebote.csv ist oftmals nicht optimal bis falsch. Ich habe das Gefühl, das die Such KI mit der Chateingabe keinen richtigen Kontext versteht oder danach falsch sucht.


**Anforderungen und Beobachtungen/Vermutungen**
- Die KI soll logisch über die Anfrage nachdenken um Kontext herzustellen, sodass auch die richtigen Produkte dem User wiedergegeben werden.
  Die Korrektheit der Datenwiedergabe ist unser oberstest Ziel!
- Die KI muss in der Lage sein solche einfachen Anfragen zu beantworten. Das Ziel ist es unsere Benutzer mit 100% richtigen Antworten auf unsere Daten zu geben. 


**Beispiele**

- Hier haben wir Beispiele die mir die KI auf meine Anfragen zurückgibt:

[ Butter ]
- Wo gibt es Butter im Angebot? Er gibt nur Buttergebäck was nichts mit Butter in dem Kontext zu tun hat. 
  Und es sind Produkte in den Daten wie: 
  - Rama Streichfett
  - Kerrygold extra
  - Lätta Original
  - MEGGLE Kräuterbutter

[ Milch ]
- Welche Milch ist diese Woche günstig? Da kommt als Antwort Almighurt Ehrmann Joguhrt. 
  KI muss den Kontext verstehen, sodass sie weiss zum Trinken kann es sich nur um Produkte handeln wie Haltbare Milch, Vollmilch, Buttermilch, etc. 
  Und nicht Joghurt, Speisequark, Leckermäulchen Milch-Quark.


[ Fleisch-Angebote ]
- Aktuelle Fleisch-Angebote? Dort wird mir Geschirrspülmittel ausgegeben und Heringsfilet. 
  Diese Anfrage läuft völlig schief und die Suche nach Produkten hat nicht funktioniert. 
  In den Daten sind viele Fleisch Produkte wie z.B. TZGEREI Hähnchen-Geschnetzeltes, MEINE METZGEREI Rinderhackfleisch, MEINE METZGEREI Rindergulasch, etc..




**Chatausgabe optimieren**

  - Die folgenden Texte darf die KI nicht sagen :"Hier sind die relevanten Angebote, sortiert in der Reihenfolge: 
                                                  Lidl, Aldi, Edeka, Penny, Rewe. Beachte, dass es nur ein passendes Produkt gibt:"
                                                 "Hier sind die relevanten und günstigsten Optionen. Ich habe sie nach Markt gruppiert, damit es übersichtlicher ist. 
                                                  Jeder Eintrag enthält die Produkt-Details im PRODUCT_CARD-Format."