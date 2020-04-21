const express = require("express");
const cors = require("cors");
//lsof -i tcp:3333 //verifica servico na porta 3333 

//Imported isUuid to validate uuid on route 
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

//Function validate UUID
function validateRepoId(request, response, next){
  //Recovery id from params
  const { id } = request.params;
  //If ID is not in uuid format then response status 400 and error in JSON
  if (!isUuid(id)) {  
    return response.status(400).json({ error: 'Invalid ID Format'});
  }
  //go to next middleware
  return next();
}
//Using validate ID function on repositories/:id  routes
app.use('/repositories/:id', validateRepoId);

//repositories database
const repositories = []; 

//List repositories
app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

//Create repositories
app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = {
    id: uuid(),         //Id receive uuid data
    title,url,techs,
    likes:0             //start likes with 0
  }
  //insert repository in repositories array(database)
  repositories.push(repository);

  //return created repository
  return response.json(repository);
});

//Update repository info by ID
app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;

  //request new info
  const { title, url, techs } = request.body;  

  //search for repository on DB
  const repoIndex = repositories.findIndex(repository => repository.id === id);
  if (repoIndex < 0){
    return response.status(400).json({ error: 'Repo ID doenst exist'});
  }
  //recovery likes from older repo registry to dont overwrite
  const likes = repositories[repoIndex].likes;

  //repository new data
  repository = {
    id, 
    title, 
    url, 
    techs,
    likes   //likes dont updated
  }

  //update repositories array on position with repository new data
  repositories[repoIndex] = repository;

  return response.json(repository);
});

//Delete route
app.delete("/repositories/:id", (request, response) => {
  //request ID param
  const { id } = request.params;

  //searh by repository Index on repositories ARARY by the ID
  repoIndex = repositories.findIndex(repository => repository.id === id);
  if (repoIndex < 0){ //if dont find show an error and 400 http code
    return response.status(400).json({ error: 'Cannot Delete, Repo ID not found '});
  }

  //if find then splice the array on repository index (delete the object in array)
  repositories.splice(repoIndex, 1);

  //send a 204 no content response to browser
  return response.status(204).send();
});

//ADD Like route
app.post("/repositories/:id/like", (request, response) => {
  //recovery the id from param
  const { id } = request.params;

  //find the repository by ID
  repoIndex = repositories.findIndex(repository => repository.id === id);
  if (repoIndex < 0){  //show an error if couldnt find the repository by ID
    return response.status(400).json({ error: 'Repo ID doenst exist'});
  }
  
  //Add like to repository section
  //recovery the repository data
  const { title, url, techs } = repositories[repoIndex];

  //recovery the likes data and add 1
  const likes = repositories[repoIndex].likes+1;

  //create repository with new data
  repository = {
    id, title, url, techs, likes
  }

  //insert repository object in repositories array
  repositories[repoIndex] = repository;
  return response.json(repository);
});

module.exports = app;
