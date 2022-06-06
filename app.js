//Server which runs on pc
const express = require("express");
//Get webhook body content
const bodyParser = require("body-parser");
//For writing requests to api to update and get projects
const https = require("https");
//For optimization
const { time, timeEnd } = require("console");
const fs = require("fs");

const app = express();

//Environment Variables, plug these in lambda env
const PORT = 3000;
const API_TOKEN = "7bbf8deb3c0335fcd7666d51dd951463";
const ROOT_ID = "532583";

//The below enable express to receive json in request
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//Listens to Webhook from POEditor
app.post("/", async (req, res) => {
  res.status(200).send("OK");

  // the body of the data received, parses it to json
  try {
    // Might have to enable next line whenever taking actual requests from POEditor since their JSON formatting was wierd.
    // var payload = JSON.parse(req.body.payload)

    var payload = req.body.payload;
    console.log(payload);
  } catch (err) {
    console.log("Object not a payload or not JSON:\t" + err);
    return;
  }
  var projects;
  try {
    if (payload.event.name == "new_terms.added") {
      const projectPayload = await getProjectsToSync();
      projects = await updateProjectsFromMaster(projectPayload.projects);
    }
  } catch (err) {
    console.error("JSON Format Wrong:\t" + err);
    return;
  }
  var masterJsonUrl = false;
  try {
    masterJsonUrl = await getMasterJsonExportUrl();
    if (!masterJsonUrl) throw "Didn't download";
  } catch (err) {
    console.log("Couldn't download file: " + err);
    return;
  }
  try {
    downloadJsonExport = await downloadJsonExport(masterJsonUrl);
  } catch (err) {
    console.error("Couldn't download the Master Json File:" + err);
    return;
  }
});

app.listen(PORT, () => {
  console.log(
    `Listening for POEditor webhook event data on port ${PORT}. Started ${new Date().toString()}`
  );
});

async function getProjectsToSync() {
  var payload = "";
  const postData = "api_token= " + API_TOKEN;
  const options = {
    hostname: "api.poeditor.com",

    path: "/v2/projects/list",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postData.length,
    },
  };
  const promiseRequest = new Promise(function (resolve, reject) {
    const req = https.request(options, (res) => {
      // console.log("statusCode:", res.statusCode);
      // console.log("headers:", res.headers);

      res
        .on("data", (d) => {
          payload += d;
        })
        .on("end", () => {
          payload = JSON.parse(payload);
          //If payload is successful it returns resolves promise, if not, it rejects. If error, rejects.
          try {
            if (payload.response.status == "success") {
              resolve(payload.result);
            } else {
              reject();
            }
          } catch (err) {
            console.error("Failed Retrieving Projects:\t" + err);
            reject();
          }
        });
    });

    req.on("error", (e) => {
      console.error(e);
    });
    req.write(postData);
    req.end();
  });

  return promiseRequest;
}
async function updateProjectsFromMaster(projects) {
  var projectsToSync = [];
  projects.forEach((element) => {
    if (element.id != ROOT_ID) {
      projectsToSync.push(element.id);
    }
  });
  if (projectsToSync.length == 0) throw "Projects to sync is empty";
  return projectsToSync;
}
async function updateProjectFromMaster(project) {}
async function downloadJsonExport(url) {
  promiseRequest = new Promise(function (resolve, reject) {
    const file = fs.createWriteStream("exports/export.json");
    const request = https.get(url, function (response) {
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        console.log("Download Completed");
        resolve(true);
      });
    });
  });
  return promiseRequest;
}
async function getMasterJsonExportUrl() {
  var payload = "";
  const postData =
    "api_token=" + API_TOKEN + "&id=" + ROOT_ID + "&language=en&type=json";
  const options = {
    hostname: "api.poeditor.com",

    path: "/v2/projects/export",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postData.length,
    },
  };
  const promiseRequest = new Promise(function (resolve, reject) {
    const req = https.request(options, (res) => {
      // console.log("statusCode:", res.statusCode);
      // console.log("headers:", res.headers);

      res
        .on("data", (d) => {
          payload += d;
        })
        .on("end", () => {
          // payload = JSON.parse(payload[]);
          //If payload is successful it returns resolves promise, if not, it rejects. If error, rejects.
          try {
            payload = JSON.parse(payload);
            if (payload.response.status == "success") {
              resolve(payload.result.url);
            } else {
              reject();
            }
          } catch (err) {
            console.error("Failed Retrieving Projects:\t" + err);
            reject();
          }
        });
    });

    req.on("error", (e) => {
      console.error(e);
    });
    req.write(postData);
    req.end();
  }).catch((err) => console.log("Error inside promise: " + err));
  return promiseRequest;
}
async function updateProjects(projects) {}
//TEST CURL REQUEST
// curl -X POST http://localhost:3000 -H 'Content-Type: application/json' -d '{ "payload": {"event": { "name": "new_terms.added" }, "project": { "id": 532583, "name": "Project Root", "public": 0, "open": 0, "created": "2022-05-13T00:24:37+0000" } } }'
//
// curl -X POST https://api.poeditor.com/v2/projects/upload -F api_token="7bbf8deb3c0335fcd7666d51dd951463" -F id="7717" -F updating="terms"}"
