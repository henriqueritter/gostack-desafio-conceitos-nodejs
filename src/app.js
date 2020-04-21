const express = require("express");
const cors = require("cors");
//lsof -i tcp:3333 //verifica servico na porta 3333 

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

//Function validate UUID
function validateRepoId(request, response, next){
  const { id } = request.params;
  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid ID Format'});
  }
  return next();
}

app.use('/repositories/:id', validateRepoId);

const repositories = []; 

//List repositories
app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

//Create repositories
app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = {
    id: uuid(),
    title,url,techs,
    likes:0
  }
  repositories.push(repository);
  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repoIndex = repositories.findIndex(repository => repository.id === id);
  if (repoIndex < 0){
    return response.status(400).json({ error: 'Repo ID doenst exist'});
  }
  const likes = repositories[repoIndex].likes;
  repository = {
    id, 
    title, 
    url, 
    techs,
    likes
  }
  repositories[repoIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  repoIndex = repositories.findIndex(repository => repository.id === id);
  if (repoIndex < 0){
    return response.status(400).json({ error: 'Cannot Delete, Repo ID not found '});
  }

  repositories.splice(repoIndex, 1);
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  repoIndex = repositories.findIndex(repository => repository.id === id);
  if (repoIndex < 0){
    return response.status(400).json({ error: 'Repo ID doenst exist'});
  }
  
  //Add like to repository
  const { title, url, techs } = repositories[repoIndex];
  const likes = repositories[repoIndex].likes+1;

  repository = {
    id, title, url, techs, likes
  }

  repositories[repoIndex] = repository;
  return response.json(repository);
});

module.exports = app;
