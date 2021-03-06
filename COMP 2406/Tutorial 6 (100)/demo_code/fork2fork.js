/*
Interacting with external services

Simple example of node.js app serving contents based 
on an available internet service. 
In this case api.openweathermap.org

***IMPORTANT NOTE***
As of 2015 openweather requires that you provide an APPID
with your HTTP requests. You can get on by creating a
free account at: http://openweathermap.org/appid

To Test: Use browser to view http://localhost:3000/
*/

let http = require('http')
let url = require('url')
let qstring = require('querystring')

const PORT = process.env.PORT || 3000
//Please register for your own key replace this with your own.
const API_KEY = 'b4215796be2bc959d34290a9c1e3dc94'

function sendResponse(recipeData, res){
  var page = '<html><head><title>API Example</title></head>' +
    '<body>' +
    '<form method="post">' +
    'ingredient: <input name="ingredient"><br>' +
    '<input type="submit" value="Get Recipes">' +
    '</form>'
  if(recipeData){
    let variable = JSON.parse(recipeData);
    page += '<h1>Recipes for ' + variable.name + '</h1><p>' + recipeData +'</p>'
  }
  page += '</body></html>'    
  res.end(page);
}

function parseRecipe(weatherResponse, res) {
  let recipeData = ''
  weatherResponse.on('data', function (chunk) {
    recipeData += chunk
  })
  weatherResponse.on('end', function () {
    sendResponse(recipeData, res)
  })
}

function getRecipes(ingredient, res){

//You need to provide an appid with your request.
//Many API services now require that clients register for an app id.
 
  const options = {
     host: 'www.food2fork.com',
     path: `/api/search?q=${ingredient}&key=${API_KEY}`
  }
  http.request(options, function(apiResponse){
    parseRecipe(apiResponse, res)
  }).end()
} 

http.createServer(function (req, res) {
  let requestURL = req.url

  let query = url.parse(requestURL).query //GET method query parameters if any
  let method = req.method
  console.log(`${method}: ${requestURL}`)
  console.log(`query: ${query}`) //GET method query parameters if any
  
  if (req.method == "POST"){
    let reqData = ''
    req.on('data', function (chunk) {
      reqData += chunk
    })
    req.on('end', function() {
	  console.log(reqData);
      var queryParams = qstring.parse(reqData)
	  console.log(queryParams)
      getRecipes(queryParams.ingredient, res)
    })
  }

  if (req.method == "GET"){
    if(query == null){sendResponse(null, res)};
    let reqData = '';
    reqData += query;
    req.on('data', function (chunk) {
      reqData += chunk
    })
    req.on('end', function() {
    console.log(reqData);
      var queryParams = qstring.parse(reqData)
    console.log(queryParams)
      getRecipes(queryParams.ingredient, res)
    })
  }

}).listen(PORT, (error) => {
  if (error)
    return console.log(error)
  console.log(`Server is listening on PORT ${PORT} CNTL-C to quit`)
})
