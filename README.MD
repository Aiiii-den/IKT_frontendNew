# IKT_frontendNew

This project is the frontend for my final progressive web application assigment. It enables the user to take a picture and save it by adding a title, mood, date and location. Furthermore, the user can request a random prompt for their daily writing practice and save said writing to the database.

### Functionality

The application calls these three APIs:
__1. Images API :__ 
```
POST: https://ikt-imagesapi-new.onrender.com/image
GET all: https://ikt-imagesapi-new.onrender.com/image
```
__2. Prompt API:__ 
```
GET all: https://ikt-promptapi.onrender.com/prompt
GET random: https://ikt-promptapi.onrender.com/random
```
__3. Writings API:__
```
POST: https://ikt-writingsapi.onrender.com/writing
```


And enables the following functionality:
- installation 
- offline usage 
- geolocation 
- camera usage 
- push notifications 
- background synchronisation

### How to install:
1. Clone repository locally
2. Run `npm i`
3. Run with `npm start`  
4. Stop with `Ctrl-C`
Or find the deployed project at: https://ikt-frontend-new.vercel.app

### Screenshots of the app in use:



 