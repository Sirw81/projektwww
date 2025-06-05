1. zainstalować node.js z pnpm, i json-server
2. uruchomić json-server w linii poleceń w folderze public: npx json-server posts.json
3. w visual studio code nacisnąć f1 i wpisać 'open user settings (json)'
4. dodać:
    - "liveServer.settings.file": "404.html",
    - "liveServer.settings.root": "/public",
    - do tabeli "liveServer.settings.ignoreFiles" dodać: "**/posts.json",
5. uruchomić live server

* Dev mode(ominięcie firebase): w pliku login.js ustawić isDevMode na true