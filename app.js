const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`)
    process.exit(1)
  }
}
intializeDBAndServer()

//Returns a list of all movie names in the movie table

ConvertObjectToResponseObject = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getPlayerQuery = `
  SELECT 
  *
  FROM 
  movie
  `
  const movieArray = await db.all(getPlayerQuery)

  response.send(
    movieArray.map(eachmoviename =>
      ConvertObjectToResponseObject(eachmoviename),
    ),
  )
})

app.post('/movies/', (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const postUpdateData = `
  
  INSERT INTO 
  
  movie (director_id, movie_name , lead_actor) 

  VALUES ("${directorId}", "${movieName}" , "${leadActor}");

  `
  const dbResponse = db.run(postUpdateData)
  //console.log(dbResponse);
  response.send('Movie Successfully Added')
})

const MovieNameById = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const getMovieById = `
  SELECT 
  * 
  FROM 
  movie 

  WHERE 
  movie_id = ${movieId};
  `
  const movieDetails = await db.get(getMovieById)

  response.send(MovieNameById(movieDetails))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  const getUpdateQuery = ` 
  UPDATE

  movie 

  SET 
  
  director_id = '${directorId}',
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'

  WHERE movie_id = ${movieId};
  `
  await db.run(getUpdateQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteDataQuery = `
  DELETE FROM 
  movie 
  WHERE movie_id = ${movieId};
  `
  await db.run(deleteDataQuery)
  response.send('Movie Removed')
})

const directorTableData = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
  SELECT 
  * 
  FROM
  director
  `
  const directorDetails = await db.all(getDirectorQuery)
  response.send(
    directorDetails.map(eachdirector => directorTableData(eachdirector)),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMovieName = `
  SELECT 
  * 
  FROM 
  director INNER JOIN movie ON director.director_id = movie.director_id 

  WHERE
   director.director_id = '${directorId}';
  `
  const directorData = await db.all(getMovieName)
  response.send(
    directorData.map(eachdata => ConvertObjectToResponseObject(eachdata)),
  )
})

module.exports = app
