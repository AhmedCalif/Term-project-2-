const fs = require("fs");
const ejs = require("ejs");
const path = require ("path");
const controller = {
  getHomePage: (request, response) => {
    fs.readFile('./database/data.json', 'utf8', (err, data) => {
      if (err) {
        console.error("Error reading data.json:", err);
        response.writeHead(500);
        return response.end('Error loading data');
      }
      const users = JSON.parse(data);
      const template = users.length > 0 ? './src/views/homePage.ejs' : './src/views/homePage.ejs';
      ejs.renderFile(template, users.length > 0 ? { users } : {}, (err, str) => {
        if (err) {
          console.error("Error rendering EJS template:", err);
          response.writeHead(500);
          return response.end('Error rendering page');
        }
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(str);
      });
    });
  },
  
  
  getFeed: (request, response) => {
    const username = new URL(request.url, `http://${request.headers.host}`).searchParams.get('username');
    const user = new URL(request.url, `http://${request.headers.host}`).searchParams.get('user.username');
    ejs.renderFile('./src/views/profile.ejs', { username }, (err, str) => {
      if (err) {
        console.error("Error rendering profile:", err);
        response.writeHead(500);
        return response.end('Error rendering feed');
      }
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(str);
    });
  }
};
uploadImages: (request, response) => {
  const form = new formidable.IncomingForm();
  form.parse(request, (err, fields, files) => {
    if (err) {
      response.writeHead(500);
      return response.end('Error parsing the files');
    }

    
    ejs.renderFile('./src/views/gallery.ejs', { gallery }, (err, html) => {
      if (err) {
        response.writeHead(500);
        return response.end('Error rendering EJS');
      }

      // Send the rendered HTML back as the response
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(html);
    });
  });
}



const ProfilePic = async (req, res) => {
  try {
    if (req.method.toLowerCase() === 'post') {
      // Assuming the directory path is provided in the request body
      const photosDir = req.body.photosDirectory;

      
      const exists = await fs.access(photosDir).then(() => true).catch(() => false);

      if (!exists) {
        return res.status(404).send('Directory not found');
      }

      // Read the directory and get the list of photo files
      const files = await fs.readdir(photosDir);

      // Filter out files to include only photos (e.g., by extension)
      const photoFiles = files.filter(file => ['.jpg', '.png'].includes(path.extname(file).toLowerCase()))

      return res.status(200).json(photoFiles);
    } else {
      return res.status(405).send('Method Not Allowed');
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Internal Server Error');

  }
}


module.exports = controller;