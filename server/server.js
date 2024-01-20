'use strict'

const express = require('express');
const morgan = require('morgan');// logging middleware
const moment = require('moment')


const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { check, validationResult, body } = require('express-validator'); // validation library
const dao = require('./dao')

// DB error
const dbErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Database error' }] };
// Authorization error
const authErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Authorization error' }] };

const jwtSecretContent = require('./secret.js');
const e = require('express');
const jwtSecret = jwtSecretContent.jwtSecret;

const app = express();
// Set-up logging
app.use(morgan("tiny"))
// Process body content
app.use(express.json());

// GET /api/vehicels
// - Request params: brands and categories
// - Response body: vehicles
// - Error: 500(db)
app.get('/api/vehicles',function(req,res,next){
        dao.getVehicles(req.query.brands,req.query.categories).then(vehicle => res.json(vehicle))
        .catch(next);
})

// GET /api/brands
// - Request body: empty
// - Response body: object that have as properties brand: value
// - Error: 401 Error,500(db)
app.route('/api/brands').
  get(function (req, res, next) {
    dao.getBrands().then(b => res.json(b))
      .catch(next);
  })
// GET /api/categories
// - Request body: empty
// - Response body: object that have as properties category: value
// - Error: 500(db)
app.route('/api/categories').
  get(function (req, res, next) {
    dao.getCategories().then(c => res.json(c))
      .catch(next);
  })
//middlware for errors of db
app.use(function (err, req, res, next) {
  res.status(500).json({ dbErrorObj })
  console.log(err);
})
const expireTime = 600; //seconds

// Authentication endpoint
// POST /api/login
// -Request body: object containing user's credentials
// - Response body: {userID: userObj.userID, email: userObj.email}
// -Errors: authErrorObj

app.post('/api/login', (req, res) => {
  const password = req.body.password;
  const username = req.body.username;
  dao.checkUserPass(username, password)
    .then((userObj) => {
      const token = jsonwebtoken.sign({ userID: userObj.userID }, jwtSecret, { expiresIn: expireTime });
      res.cookie('token', token, { httpOnly: true, sameSite: true, maxAge: 1000 * expireTime });
      res.json({userID: userObj.userID, email: userObj.email});
    }).catch(
      // Delay response when wrong user/pass is sent to avoid fast guessing attempts
      (err) => new Promise((resolve) => {
        setTimeout(() => resolve(err), 1000)
      }).then(
        (err) => {
          console.log(err)
          res.status(401).json(authErrorObj);
        }
      )
    );
});

//use cokieparser middleware
app.use(cookieParser());

// Log out
// POST /api/logout
// -Request body: empty
// - Response body: empty
app.post('/api/logout', (req, res) => {
  res.clearCookie('token').end();
});


// For the rest of the code, all APIs require authentication
app.use(
  jwt({
    secret: jwtSecret,
    getToken: req => req.cookies.token
  })
);

// AUTHENTICATED REST API endpoints

// GET /api/user
// - Request body: userID
// - Response body: { id: user.userID, email: user.email }
// - Error: 401 Error
app.get('/api/user', (req, res) => {
  const user = req.user && req.user.userID
  dao.getUserById(user)
    .then((user) => {
      res.json({ id: user.userID, email: user.email });
    }).catch(
      (err) => {
        res.status(401).json(authErrorObj);
      }
    );
})

// To return a better object in case of errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json(authErrorObj);
  }
})

// - POST /api/configuration
//   - Request body: object contais all params for a configuration
//   - Response body:  { vehicles: values[0].numV, price: price }(object with num vehicles and price for configuration)
//   - Errors: 400(emptyMessage)/ 404(No solutions have been found for the rental)/ 422(validation of req.body) /500(DB comunication)
app.post('/api/configuration',
  [check('start')
    .custom(start => {
      if (!moment(start).isValid()) throw new Error("La data di inizio non è valida")
      if (moment(start).isBefore(moment().format('YYYY-MM-DD'))) {
        throw new Error("Giorno d'Inizio' non può essere nel passato.");
      }
      return true;
    }),
  check('end')
    .custom(end => {
      if (!moment(end).isValid()) throw new Error("La data di inizio non è valida")
      if (moment(end).isBefore(moment().format('YYYY-MM-DD'))) {
        throw new Error("Giorno di fine non può essere nel passato.");
      }
      return true;
    }),
  check('category').isIn(["A", "B", "C", "D", "E"]).withMessage("La categoria inserita non esiste")
    , check('age').isInt({ min: 18, max: 86 }).withMessage("L'età non è compresa tra 18 e 86")
    , check('drivers').isInt({ min: 0, max: 5 }).withMessage("Il numero massimo di guidatori consetiti non può essere superiore a 5")
    , check('km').isInt({ min: 1, max: 3 }).withMessage("Il kilometraggio inserito non è corretto")
    , check('insurance').isBoolean().withMessage("Il valore dell'assicurazione non è corretto")
  ], function (req, res, next) {
    if (req.body) {
      const start = req.body.startDate
      const end = req.body.endDate
      const category = req.body.category

      const age = req.body.age
      const drivers = req.body.drivers
      const km = req.body.km
      const insurance = req.body.insurance
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
      } else {
        const startDate = moment(start, "YYYY-MM-DD");
        const endDate = moment(end, "YYYY-MM-DD");
        const days = endDate.diff(startDate, 'days') + 1;
        const toDay=moment().format("YYYY-MM-DD")

        const userID = req.user.userID
        let nV = dao.getRentalInfo(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"), category)
        let nR = dao.getNumRentals(userID,toDay)

      

        Promise.all([nV, nR]).then(values => {
          if (values[0].numV > 0) {
            let price = category === "A" ? 80 : category === "B" ? 70 : category === "C" ? 60 : category === "D" ? 50 : 40
            price = (price * days).toFixed(2)
            price = km === "1" ? (price * (0.95)).toFixed(2) : km === "2" ? price : km === "3" ? price * (1.05).toFixed(2) : price
            price = age < 25 ? (price * (1.05)).toFixed(2) : age > 65 ? (price * (1.1)).toFixed(2) : price
            if (drivers > 0) price = (price * (1.15)).toFixed(2);
            if (insurance) price = (price * 1.2).toFixed(2);
            //values[0].numV= numero veicoli disponibili
            //values[0].numC= numero dei vecoli per una determinata categoria
            if (((values[0].numV/values[0].numC )* 100) <10) price = (price * (1.1)).toFixed(2)
            //values[1].rentals= numero di rental completati
            if (values[1].rentals > 3) price = (price * (0.90)).toFixed(2)
            let obj = { vehicles: values[0].numV, price: price }
            res.json(obj)
          }
          else {
            res.status(404).json({ errors: [{ 'param': 'Server', 'msg': 'No solutions have been found for the rental' }] })
          }
        })
          .catch(err => {
            res.status(500).json({ dbErrorObj })
            console.log(err)
          })
      }
    } else res.status(400).json({ errors: [{ 'msg': "empty message" }] })
  })
// - POST /api/payment
//   - Request body: object contais all params for a fake payment
//   - Response body: empty
//   - Errors: 400(emptyMessage)/ 422(validation of req.body)
app.post('/api/payment', [
  check('cardNumber').isNumeric().isLength({ min: 16, max: 16 }),
  check('cvv').isNumeric().isLength({ min: 3, max: 5 }),
  check('price').isNumeric()
], (req, res) => {
  if (req.body) {
    const { name, cardNamber, cvv, price } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    } else res.status(200).send()
  } else res.status(400).json({ errors: [{ 'msg': "empty message" }] })

})
// - POST /api/rentals
//   - Request body: object contais all params for new Rental
//   - Response body: empty
//   - Errors: 400(emptyMessage)/ 409(price wrong)/500(Db comunication)
app.post('/api/rentals', function (req, res) {
  const userID = req.user.userID
  if (!req.body) res.status(400).json({ errors: [{ 'msg': "empty message" }] })
  else {
    const { startDate, endDate, category, price } = req.body
    if (price) {
      dao.addRental(userID, startDate, endDate, category, price)
        .then(() => res.send())
        .catch((err) => {
          res.status(500).json({ dbErrorObj })
          console.log(err)
        })
    } else res.status(409).json({ error: "Alterazione del prezzo noleggio" })
  }
})
// - GET /api/rentals
//   - Request body: empty
//   - Response body: a cumstom rental object
//   - Error: 404(rentals not founded for that user)500 Error
app.get('/api/rentals', function (req, res) {
  const userID = req.user.userID
  dao.getRentals(userID).then(r => {
    if (Object.values(r).length > 0) {
      let rentals = r.map(e => {
        let endDate = moment(e.endDate, "YYYY-MM-DD")
        let today = moment()
        let validity = (endDate.diff(today, 'days') + 1) > 0 ? true : false
        return { ...e, validity: validity }
      })
      res.json(rentals)
    } else res.status(404).json({ errors: [{ 'param': 'Server', 'msg': 'No rentals have been found for the user' }] })

  }).catch(err => {
    res.status(500).json({ dbErrorObj })
    console.log(err)
  })
})
// - DELETE /api/rentals/bookings/:id
//   - Request body: id of rental
//   - Response body: empty
//   - Error: 500 Error
app.route('/api/rentals/bookings/:id')
  .delete(function (req, res) {
    const rentalID = req.params.id;

    dao.deleteRental(rentalID)
      .then(() => res.status(200).send())
      .catch(() => {
        res.status(500).json({ dbErrorObj })
        console.log(err)
      })
  })
app.listen(3001, () => console.log('Server ready'));