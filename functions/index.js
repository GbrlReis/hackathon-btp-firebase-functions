/* let request = {
  query : {
    berth_window : 1556920800,
    ata : 1556906400,
    atb : 1556913600,
    ats : 1557000000,
    name : 'CMA CGM LITANI',
    service : 'NEO BOSSA',
    liner : 'CMA',
    berth : 'CMA'
  }
} */

//?berth_window=1556920800&ata=1556906400&atb=1556913600&ats=1557000000&name=CMA CGM LITANI&service=NEO BOSSA&liner=CMA&berth=CMA

const functions = require('firebase-functions');
const cors = require('cors')({
  origin: true,
})

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const btoa = require("btoa");
const wml_credentials = new Map();

wml_credentials.set("url", 'https://us-south.ml.cloud.ibm.com');
wml_credentials.set("username", 'ddacc44c-89aa-4cdb-b134-ecabcd9b1fb4');
wml_credentials.set("password", '295caf80-eed1-4751-a0c5-d31d11bcf47e');

function apiGet(url, username, password, loadCallback, errorCallback){
	const oReq = new XMLHttpRequest();
	const tokenHeader = "Basic " + btoa((username + ":" + password));
	const tokenUrl = url + "/v3/identity/token";

	oReq.addEventListener("load", loadCallback);
	oReq.addEventListener("error", errorCallback);
	oReq.open("GET", tokenUrl);
	oReq.setRequestHeader("Authorization", tokenHeader);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.send();
}

function apiPost(scoring_url, token, payload, loadCallback, errorCallback){
	const oReq = new XMLHttpRequest();
	oReq.addEventListener("load", loadCallback);
	oReq.addEventListener("error", errorCallback);
	oReq.open("POST", scoring_url);
	oReq.setRequestHeader("Accept", "application/json");
	oReq.setRequestHeader("Authorization", token);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.send(payload);
}

function invokeWatson(array_of_values_to_be_scored, callback){ //most of the code is from IBM
  apiGet(wml_credentials.get("url"),
    wml_credentials.get("username"),
    wml_credentials.get("password"),
    function (res) {
          let parsedGetResponse;
          try {
              parsedGetResponse = JSON.parse(this.responseText);
          } catch(ex) {
              // TODO: handle parsing exception
          }
          console.log(this.responseText)
          if (parsedGetResponse && parsedGetResponse.token) {
              const token = parsedGetResponse.token
              const wmlToken = "Bearer " + token;

              // NOTE: manually define and pass the array(s) of values to be scored in the next line
        /* let array_of_values_to_be_scored = [
          1556920800,
          1556906400,
          1556913600,
          1557000000,
          'CMA CGM LITANI',
          'NEO BOSSA',
          'CMA',
          'BTP 1'
        ]; */

        console.log("hmm", array_of_values_to_be_scored)

        const payload = {"fields": ["BERTH_WINDOW", "CHEGADA_BARRA", "ESCA_DTHR_ATRACACAO", "DESATRACACAO", "NAVI_NOME", "SERVICO", "LINER", "BERCO_ATRACACAO"], "values": [array_of_values_to_be_scored]};
        
        const scoring_url = "https://us-south.ml.cloud.ibm.com/v3/wml_instances/2469ada3-fa0f-4456-8d25-3c201a264526/deployments/d2357c4e-b665-4d25-93a3-a0b8e1c16ef2/online";

          apiPost(scoring_url, wmlToken, JSON.stringify(payload), function (resp) {
              let parsedPostResponse;
              try {
                  parsedPostResponse = JSON.parse(this.responseText);
              } catch (ex) {
                  // TODO: handle parsing exception
              }
              console.log("oxi", parsedPostResponse)
              let probabilityIndex = parsedPostResponse.fields.findIndex(f => f == 'probability');
              let nodeClassesIndex = parsedPostResponse.fields.findIndex(f => f == 'nodeADP_classes');

              let result = {};
              parsedPostResponse.values[0][nodeClassesIndex].forEach((node, index) => {
                result[node] = parsedPostResponse.values[0][probabilityIndex][index];
              })
              console.log(result)
              callback(result)

          }, function (error) {
              console.log(error);
          });
      } else {
          console.log("Failed to retrieve Bearer token");
      }
    }, function (err) {
      console.log(err);
    });
  }




exports.probability = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    invokeWatson([
      +request.query.berth_window,
      +request.query.ata,
      +request.query.atb,
      +request.query.ats,
      request.query.name,
      request.query.service,
      request.query.liner,
      request.query.berth
    ], (result) => {
      response.send(result);
    })
  })
  
});