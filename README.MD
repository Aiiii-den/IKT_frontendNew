# IKT_frontendNew

This project is the frontend for my final progressive web application assigment. It enables the user to take a picture and save it by adding a title, mood, date and location. Furthermore, the user can request a random prompt for their daily writing practice and save said writing to the database.

### Screenshots of the app in use:  
**Upload an image**
![Homepage.png](documentationImages%2FHomepage.png)
![TakePhoto.png](documentationImages%2FTakePhoto.png)  

**Get a random prompt and save your writing**
![PromptAndWriting.png](documentationImages%2FPromptAndWriting.png)  

### Functionality

The application calls three APIs:  
__1. Images API :__ 
```
POST: http://localhost:8080/image
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
4. Stop with `ctrl-c`

Or find the deployed project at: https://ikt-frontend-new.vercel.app
