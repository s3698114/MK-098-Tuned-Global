# MK-098-Tuned-Global

# Table of Content

- Team
- About
- Installation
- Configuration
- Contribution
- Standards

## Team

This team was composed of the following people

- Naufal Raihan
- Carl Karama
- Juan Tate
- Seyal Velmurukan

## About

Tuned Global is a music translation service that operates globally and our group was tasked with creating an api that could automate
the adding of new translations. This would enable tuned global abstract the configuration of terms

Our client needed a multi-tiered project management setup which is a project that could support multiple clients that each individually
had translations. The task at hand would be to write a HTTP endpoint that could recieve new translations from the master project (multi-tiered project)
and synchronise that with the clients by adding the new terms onto the client projects

## Installation

In order to run the project locally: `Note: You must actively have an account with POEditor to run project`

1. Make sure to install node on your machine
2. Run the commented out curl located in app.js line 346
   `// curl -X POST http://localhost:3000 -H 'Content-Type: application/json' -d '{ "payload": {"event": { "name": "new_terms.added" }, "project": { "id": 532583, "name": "Project Root", "public": 0, "open": 0, "created": "2022-05-13T00:24:37+0000" } } }' `

## Configurations

For this project we specifically advise the use of [POEditor](https://poeditor.com/projects/) as the API was written to handle requests from POEditor.

Begin
