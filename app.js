//Server which runs on pc
const express = require("express");
//Get webhook body content
const bodyParser = require("body-parser");
//For writing requests to api to update and get projects
const https = require("https");
//For optimization
const { time, timeEnd } = require("console");
const fs = require("fs");
const FormData = require("form-data");
const { request } = require("http");
const { resolve } = require("path");
const { setTimeout } = require("timers/promises");

const app = express();

//Environment Variables, plug these in lambda env
const PORT = 3000;
const API_TOKEN = "88b1bd0364acb617626ef991ed7a83c2";
const ROOT_ID = "533735";

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
  } catch (err) {
    console.log("Object not a payload or not JSON:\t" + err);
    return;
  }
  var projects;
  try {
    if (payload.event.name == "new_terms.added") {
      console.log("Event new_terms.added true, comencing update process:");
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
    if (!masterJsonUrl) throw "Didn't find file URL";
  } catch (err) {
    console.log("Couldn't download file: " + err);
    return;
  }
  var exportedFile = false;
  try {
    exportedFile = await downloadJsonExport(masterJsonUrl);
    if (!exportedFile) throw "Didn't Download";
  } catch (err) {
    console.error("Couldn't download the Master Json File: " + err);
    return;
  }
  try {
    await uploadToProjectsHandler(projects);
  } catch (err) {
    console.error("Failed updating All Projects: " + err);
    return;
  }
  try {
    projects = await getProjectsJsonExportUrl(projects);
  } catch (err) {
    console.error("Failure Getting All Projects Export URL");
    return;
  }
  try {
    await downloadProjects(projects);
  } catch (err) {
    console.error("Couldn't download the Projects Exports: " + err);
    return;
  }
  console.log("Finished program");
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
      projectsToSync.push(element);
    }
  });
  if (projectsToSync.length == 0) throw "Projects to sync is empty";
  return projectsToSync;
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
async function uploadToProjectsHandler(projects) {
  const length = projects.length;
  var i = 0;
  for (project of projects) {
    console.log("Updating project: " + project.name + "\n ID: " + project.id);
    payload = "";
    //FormData is needed since POEditor upload API needs multipart/form-data
    var form = new FormData();
    form.append("api_token", API_TOKEN);
    form.append("id", project.id);
    form.append("updating", "terms_translations");
    form.append("language", "en");
    form.append("overwrite", "1");
    form.append("file", fs.createReadStream("exports/export.json"));
    var payload = "";
    promiseRequest = new Promise(function (resolve, reject) {
      var request = https.request(
        {
          method: "post",
          host: "api.poeditor.com",
          path: "/v2/projects/upload",
          headers: form.getHeaders(),
        },
        (res) => {
          res
            .on("data", function (res) {
              payload += res;
            })
            .on("end", function (res) {
              try {
                payload = JSON.parse(payload);
                if (payload.response.status == "success") {
                  resolve(true);
                } else {
                  throw (
                    "Failed Updating: " +
                    project.name +
                    "\n ID: " +
                    project.id +
                    "\n  Because: " +
                    payload.response.message
                  );
                }
              } catch (error) {
                reject(error);
              }
            })
            .on("error", (e) => {
              console.error(e);
            });
          request.end();
        }
      );
      form.pipe(request);
    }).catch((err) => {
      console.log("Error in updating promise: " + err);
    });
    await promiseRequest;
    i++;
    if (i != length) await setTimeout(30000);
  }
  return;
}
async function getProjectsJsonExportUrl(projects) {
  for (project of projects) {
    var payload = "";
    const postData =
      "api_token=" + API_TOKEN + "&id=" + project.id + "&language=en&type=json";
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
                project["download_url"] = payload.result.url;

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
    await promiseRequest;
  }
  return projects;
}
async function downloadProjects(projects) {
  for (project of projects) {
    promiseRequest = new Promise(function (resolve, reject) {
      const file = fs.createWriteStream(`projects/${project.id}.json`);
      const request = https.get(project.download_url, function (response) {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
          file.close();
          console.log(`Downloaded ${project.id} Json successfully`);
          resolve(true);
          return;
        });
      });
    });
    await promiseRequest;
  }
  return;
}
async function downloadJsonExport(url) {
  promiseRequest = new Promise(function (resolve, reject) {
    const file = fs.createWriteStream("exports/export.json");
    const request = https.get(url, function (response) {
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        console.log(`Downloaded Master Json successfully`);
        resolve(true);
        return;
      });
    });
  });
  return promiseRequest;
}
//TEST CURL REQUEST
// curl -X POST http://localhost:3000 -H 'Content-Type: application/json' -d '{ "payload": {"event": { "name": "new_terms.added" }, "project": { "id": 532583, "name": "Project Root", "public": 0, "open": 0, "created": "2022-05-13T00:24:37+0000" } } }'
