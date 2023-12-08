const http = require('http');
const { parse } = require('url');
const controller = require('./controller'); 
const fs = require('fs/promises'); 
const path = require('path');
const { createReadStream }= require ("fs")

const DEFAULT_HEADER = {'Content-Type': 'text/html'}; 

const allRoutes = {
  "/:get": controller.getHomePage,
  "/images:get": controller.uploadImages,
  "/feed:get": controller.getFeed,
  "default": defaultHandler, 
  "/profile-pic:post": controller.uploadProfilePic,

};


function defaultHandler(request, response) {
  response.writeHead(404, DEFAULT_HEADER);
  const stream = createReadStream(path.join(__dirname, "views", "404.html"), "utf8");
  stream.pipe(response);
} 

function handler(request, response) {
  const { url, method } = request;
  const { pathname } = parse(url, true);
  const key = `${pathname}:${method.toLowerCase()}`;
  const chosen = allRoutes[key] || allRoutes.default;

  return Promise.resolve(chosen(request, response)).catch(handlerError(response));
}

function handlerError(response) {
  return (error) => {
    console.log("Something bad has happened:", error.stack);
    response.writeHead(500, DEFAULT_HEADER);
    response.write(JSON.stringify({ error: "Internal server error" }));
    return response.end();
  };
}

module.exports = handler;

