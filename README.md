European Wave Atlas (full-stack version) deployed on Heroku.

(europesurfmap.herokuapp.com)[https://europesurfmap.herokuapp.com/]

Interactive map of European surf spots using data scraped from (Magicseaweed) [https://magicseaweed.com/Jersey-Surf-Report/120/]. The map employs a voronoi tesselation to work out the nearest surf spot to any location hovered over in Europe.

Stack used:

Front-end: D3js, Leaflet and Mapbox.
Back-end: Node/Express.js
Database: ClearDB (MySQL) add-on for Heroku.

Notes from the deployment process:

- Initially, the front-end and backend were in different folders which was making deployment to the same Heroku dyno difficult as the package.json file was concealed within the server folder, instead of being at the root of the directory (as is required). 
     + To overcome this, the folder structure was modified to have the server files at the root and the client files remained in their own folder as a subdirectory. 
     + I then added code to app.js to serve client files from the node app.
     
- Whilst deploying I had issues with MySQL database connections closing after being idle for a few minutes. 
     + To overcome this, I added connection (pools)[https://github.com/mysqljs/mysql#pool-events] in the database connection code.
