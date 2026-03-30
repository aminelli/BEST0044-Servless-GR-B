# Appunti per progetto

## Dipendenze di sviluppo

| Dipendenza                       | Ver | Desc                                        |
| -------------------------------- | --- | ------------------------------------------- |
| @types/compression               |     | Tipi TS utilizzabili per la lib compression |
| @types/cors                      |     | Tipi TS utilizzabili per la lib cors        |
| @types/express                   |     | Tipi TS utilizzabili per la lib express     |
| @types/node                      |     | Tipi TS per node.js                         |
| @typescript-eslint/eslint-plugin |     | Regole TS per ESLint                        |
| @typescript-eslint/parser        |     | Parser RS per ESLint                        |
| eslint                           |     | Linting codice                              |
| nodemon                          |     | Riavvio automatico del server in  Debug     |
| ts-node                          |     | Esecuzione diretta ddi file TS              |
| typescript                       |     | Compilatore Typescript (TS)                 |


```json
"devDependencies": {
    "@types/compression": "^1.8.1",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^25.5.0",
    "@typescript-eslint/eslint-plugin": "^8.57.2",
    "@typescript-eslint/parser": "^8.57.2",
    "eslint": "^10.1.0",
    "nodemon": "^3.1.14",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
```

## Dipendenze di produzione

| Dipendenza         | Ver | Desc                                                         |
| ------------------ | --- | ------------------------------------------------------------ |
| compression        |     | Compressione delle risposte HTTP                             |
| cors               |     | Abilitiazione/disabilitazione richieste cross-domain         |
| dotenv             |     | Lib utile per la gestione delle variabili di ambiente (.env) |
| express            |     | Framework per Web Apui, Web App (+ Server Http)              |
| express-rate-limit |     | Protezione da abusi su chiamate / DDOS                       |
| express-validator  |     | Validazione degli input API                                  |
| helmet             |     | Sicurezza HTTP (Protezione degli Headers)                    |
| mysql2             |     | Driver Mysql                                                 |

```json
"dependencies": {
    "compression": "^1.8.1",
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "express-rate-limit": "^8.3.1",
    "express-validator": "^7.3.1",
    "helmet": "^8.1.0",
    "mysql2": "^3.20.0"
  }
```

