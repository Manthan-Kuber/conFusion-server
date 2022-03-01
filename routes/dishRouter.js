const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Dishes = require("../models/dishes");

//If we make a typo and do /dish instead of /dishes on a endpoint for PUT requests for example. Then the PUT request will be supported on /dish instead of /dishes. To avoid this problem , express router supports route endpoint and we specify the endpoint on which the router is going to work

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
  .route("/")
  // //Arguments passed => 1st:endpoint , 2nd:callback function
  // //The below code will be executed first for all methods(GET,PUT,POST,DELETE...) by default
  // //We dont need to pass 1st argument of endpoint as Express Router chains the methods
  // .all((req, res, next) => {
  //   //set status code of response
  //   res.statusCode = 200;
  //   res.setHeader("Content-Type", "text/plain");
  //   next();
  //   //When we call next(), Node doesn't stop looking for more route specifications for '/dishes'
  // }) //Remove semicolon here to chain the methods
  // //We handle all types of requests separately as we have to do database queries

  //Only for get requests. req and res from above are passed as parameters to this below function.If the server gets a GET request, it'll first execute the above(app.all) code and then because next is called it will drop to the function below
  //Handling of GET Requests ends with the below function
  .get((req, res, next) => {
    // res.end("Will send all the dishes to you!");
    Dishes.find({})
      .then(
        (dishes) => {
          res.StatusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes); //It'll take as input a json string and send back to client
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  // If the server gets a POST request, it'll first execute the above(app.all) code and then because next is called it will drop to the function below
  .post((req, res, next) => {
    // //POST request carries some information with it
    // res.end(
    //   //We are able to parse the incoming (POST) requests
    //   "Will add the dish " +
    //     req.body.name +
    //     " with details: " +
    //     req.body.description
    // );
    Dishes.create(req.body)
      .then(
        (dish) => {
          console.log("Dish Created", dish);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  //We leave it as it is as PUT request is not allowed
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })

  .delete((req, res, next) => {
    // res.end("Deleting all the dishes!");
    Dishes.remove({})
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

dishRouter
  .route("/:dishId")
  // .all((req, res, next) => {
  //   res.statusCode = 200;
  //   res.setHeader("Content-Type", "text/plain");
  //   next();
  // })
  .get((req, res, next) => {
    // res.end("Will send details of the dish: " + req.params.dishId + " to you!");
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          res.StatusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post((req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on /dishes/" + req.params.dishId);
    
  })

  //Same as we did above, as put request is not allowed,we leave it as it is
  .put((req, res, next) => {
    // //Params used to access the parameters in the url
    // res.write("Updating the dish: " + req.params.dishId);
    // //Body Parser used to parse the body of the request into JSON and therfore allows us to access it
    // res.end(
    //   " Will update the dish: " +
    //     req.body.name +
    //     " with details: " +
    //     req.body.description
    // );
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then(
        (dish) => {
          res.StatusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .delete((req, res, next) => {
    // res.end("Deleting dish: " + req.params.dishId);
    Dishes.findByIdAndRemove(req.params.dishId)
      .then(
        (dish) => {
          res.StatusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

//The last one will have semicolon ofcourse
//Similar to export default. Older syntax and not ES6 thats why
module.exports = dishRouter;
