# MK-098-Tuned-Global

# Table of Content

- Team
- About
- Installation
- Configuration
- Contribution
- Standards

## Team

## About

Tuned Global is a music translation service that operates globally and our group was tasked with creating an api that could automate
the adding of new translations. This would enable tuned global abstract the configuration of terms

## Installation

In order to run the project locally:

1. Make sure to install node on your machine
2. Run the commented out curl located in app.js line 346
   `// curl -X POST http://localhost:3000 -H 'Content-Type: application/json' -d '{ "payload": {"event": { "name": "new_terms.added" }, "project": { "id": 532583, "name": "Project Root", "public": 0, "open": 0, "created": "2022-05-13T00:24:37+0000" } } }' `
