# MK-098-Tuned-Global

# Table of Content

- Team
- About
- Installation
- Configuration
- Credentials
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
the adding of new translations. This would enable tuned global to abstract the addition of terms

Our client needed a multi-tiered project management setup which is a project that could support multiple clients that each individually
had translations. The task at hand would be to write a HTTP endpoint that could recieve new translations from the master project (multi-tiered project)
and synchronise that with the clients by adding the new terms onto the client projects

## Installation

In order to run the project locally: `Note: You must actively have an account with [POEditor](https://poeditor.com) as the API was written to handle requests from to run project. Also add at least one new term.`

Head to `home>account>integration>callbacks` POEditor.

Email: `mk098poeditor@mail.com`
Password: `tunedglobal123!`

1. Make sure to install node on your machine
2. Run the commented out curl located in app.js line 346. `NB: This is an example request, you can use your own project details.`
   `curl -X POST http://localhost:3000 -H 'Content-Type: application/json' -d '{ "payload": {"event": { "name": "new_terms.added" }, "project": { "id": 532583, "name": "Project Root", "public": 0, "open": 0, "created": "2022-05-13T00:24:37+0000" } } }`

## Configurations

We have created a default account for you below

| Project | TunedTranslationMasters              |
| ------- | ------------------------------------ |
| Event   | New Terms                            |
| URL     | (url-where-terms-should-be-added-to) |

TunedTranslationMaster (Multi-tiered Master Project) is the main project terms are added to. Once terms are added, they are synchronised to other projects. To test it first, you can use the URL (i.e. localhost:8000) to test on a local development before integrating it with a commercial website.

Whenever an `event` is triggered by a `New Term` added:

1. The `getProjectsToSync` sends a request to the list `/v2/projects/list` that returns all the projects that the admin has access to.
2. Then you want to retrieve the JSON from the master project using `getMasterJsonExportUrl` to cross-reference projects that need new terms added. If terms don't exist in child project, they are added
3. You can find the exported lists in `MK-098-TunedGlobal/projects/` which can be exported to devices like Android.

## Credentials

email: mk098poeditor@mail.com
password: tunedglobal123!

# Contributions

In order to commit to this repository, please contact Naufal (s3698114@student.rmit.edu.au) to be added as a collaborator and clone changes

# Standards

When working on features, please follow the below branching standards

| initials | project                                   | description                            |
| -------- | ----------------------------------------- | -------------------------------------- |
| ck       | mk-100 (100 is the ticket number on Jira) | purpose of branch. Try keep it concise |

Example: `ck-mk-100-add-feature`
