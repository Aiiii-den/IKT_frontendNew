# Progressive Web Apps - Aktuelle Trends der IKT 2022

Dieses Projekt enthält das Grundgerüst einer Webanwendung. Auf diesem Grundgerüst bauen wir auf und fügen sukzessive *progressive* Funktionalitäten hinzu, so dass am Ende eine *Progressive Web Application* entsteht. 

## Installation

- Zum Ausführen des Projektes wird [Node.js](https://nodejs.org) verendet. Sie müssen es auf Ihren Rechner installieren. 

- In der Wahl Ihrer IDE sind Sie völlig frei. Empfehlungen finden Sie unter [https://freiheit.f4.htw-berlin.de/ikt/tools/#integrated-development-environment-ide](https://freiheit.f4.htw-berlin.de/ikt/tools/#integrated-development-environment-ide)

- Zum Starten des Projektes wechseln Sie im Terminal (Terminal Ihres Rechners oder das Terminal in der IDE) in den Projektordner (`cd IKT-PWA-01`) und führen dort 

	`npm install` 

	aus (es genügt auch `npm i`). Damit werden alle erforderlichen Abhängigkeiten installiert. Es entsteht der `node_modules`-Ordner. 

- Nach erfolgreicher Installation der Abhängigkeiten, geben Sie  

	`npm start` 

	ein, um Ihr Projekt auszuführen (Es wird der `http-server` mit der Option `-c-1` gestartet. Diese Option disabled Caching). Klicken Sie danach auf [localhost:8080](http://localhost:8080) oder geben Sie die URL direkt in Ihren Browser ein.

- Sollten Sie Änderungen an der IMplementierung vornehmen und diese ausprobieren wollen, müssen Sie den Server zunächst wieder stoppen:

	`Ctrl-C`

	und geben dann erneut 

	`npm start` 

	ein. 


 