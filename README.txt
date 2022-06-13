MK-098-Tuned-Global

Team

This team was composed of the following people

- Naufal Raihan
- Carl Karama
- Juan Tate
- Seyal Velmurukan

Installation

In order to run the project locally: `Note: You must actively have an account with [POEditor](https://poeditor.com) as the API was written to handle requests from to run project. Also add at least one new term.`

Head to `home>account>integration>callbacks` POEditor.

Email: `mk098poeditor@mail.com`
Password: `tunedglobal123!`

1. Make sure to install node on your machine
2. Run the commented out curl located in app.js line 346. `NB: This is an example request, you can use your own project details.`
   `curl -X POST http://localhost:3000 -H 'Content-Type: application/json' -d '{ "payload": {"event": { "name": "new_terms.added" }, "project": { "id": 532583, "name": "Project Root", "public": 0, "open": 0, "created": "2022-05-13T00:24:37+0000" } } }`

Configurations

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