'use strict'

const Vehicle = require('./vehicle');
const db = require('./db');
const bcrypt = require('bcrypt')

//convert a row to vehicle
function convertToVehicle(row) {
  return new Vehicle(row.vehicleID, row.brand, row.model, row.category)
}
//Select information of user
exports.getUserById = function (id) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM User WHERE userID = ?"
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else if (!row)
        resolve(undefined);
      else {
        const user = { id: row.userID, email: row.email };
        resolve(user);
      }
    });
  });
};

//Select ALL vehicles
exports.getVehicles = function (brands, categories) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Vehicle ORDER BY brand";
    db.all(sql, [], (err, rows) => {
      if (err) reject(err)
      else {
        let vehicles = rows.map(row => convertToVehicle(row));
        vehicles = brands ? vehicles.filter(v => brands.split(',').includes(v.brand)) : vehicles
        vehicles = categories ? vehicles.filter(v => categories.split(',').includes(v.category)) : vehicles
        resolve(vehicles)
      }
    })
  })
}
//Select all brands
exports.getBrands = function () {
  return new Promise((resolve, reject) => {
    const sql = "SELECT DISTINCT brand FROM Vehicle ORDER BY brand";
    db.all(sql, [], (err, rows) => {
      if (err) reject(err)
      else {
        let object = {}
        //Create a object with property brand: false
        rows.forEach(r => object[r.brand] = false)
        resolve(object)
      }
    })

  })
}
//set all categories
exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    const sql = "SELECT DISTINCT category FROM Vehicle ORDER BY category"
    db.all(sql, [], (err, rows) => {
      if (err) reject(err)
      else {
        let object = {}
        //Create a object with property category: false
        rows.forEach(r => object[r.category] = false)
        resolve(object)

      }
    })
  })
}
//check if the credentials are correct
exports.checkUserPass = function (user, pass) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM User WHERE email = ?';
    // execute query and get all results into `rows`
    db.all(sql, [user], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      if (rows.length === 0) {
        const err = { param: "DB", msg: "Email sbagliata" }
        reject(err);
        return;
      }
      //password with hash of the db
      const passwordHashDb = rows[0].password;

      // bcrypt.compare might be computationally heavy, thus it call a callback function when completed
      bcrypt.compare(pass, passwordHashDb, function (err, res) {
        if (err)
          reject({ param: "DB", msg: "Password sbagliata" });
        else {
          if (res) {
            let objt = { userID: rows[0].userID, email: rows[0].email, };
            resolve(objt);
            return;
          } else {
            reject({ param: "DB", msg: "Password sbagliata" });
            return;
          }
        }
      });
    });
  });
}
//select either the vehicle or numbers of All vehicles that satifsy the constraint of start date endate category
//Param: startDate , endDate, category, select(SELECT condition for query)
function getNumVehicles(startDate, endDate, category, select) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT ${select} ${select === "count(*)" ? "AS numV" : ""}
    FROM Vehicle 
    WHERE category=?
      AND vehicleID NOT IN (SELECT vehicleID
                            FROM Rental
                            WHERE (date(startDate) <= date(?)
                             AND
                            date(endDate) >= date(?)))`
    db.get(sql, [category, endDate, startDate], (err, row) => {
      if (err) reject(err)
      else {
        resolve(row)
      }
    })
  })

}

//Select all vehicles of a category
//Param: category of vehicle
function getVehicles4Category(category) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT count(*) AS numC
      FROM Vehicle 
      WHERE category=?`
    db.get(sql, [category], (err, row) => {
      if (err) reject(err)
      else resolve({numC: row.numC})
    })
  })
}
//get all vehicles avaible from a startDate to endDate for a specific category
// and the total number of vehicles fot the category
//Params: startDate,endDate,category
exports.getRentalInfo = function (startDate, endDate, category) {
  return new Promise((resolve, reject) => {
    const a = getNumVehicles(startDate, endDate, category, "count(*)")
    const b = getVehicles4Category(category)

    Promise.all([a, b])
      .then(values => {
        //create an object with numV= num vehicle avaible and numC= numbers of cars of a category
        let objt = { numV: values[0].numV, numC: values[1].numC }
        resolve(objt)
      })
      .catch(err => reject(err))
  })
}
//Select the number of rentals of a client that has been completed
//params userID(identify user), today (date of today)
exports.getNumRentals = function (userID,today) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT count(*) AS rentals 
                 FROM Rental WHERE userID=?
                 AND (date(endDate)< ? )`
    db.get(sql, [userID,today], (err, row) => {
      if (err) reject(err)
      else {
        resolve({rentals: row.rentals})
      }
    })
  })
}
//Add into db a new Rental
//params: userId (indetify user), startDate (begin of a rental) ,
//         endDate (end of rental), category (category of vehicle) price(price of rental)
exports.addRental = function (userID, startDate, endDate, category, price) {
  return new Promise((resolve, reject) => {
    getNumVehicles(startDate, endDate, category, "vehicleID").then((obj) => {
      const sql = "INSERT INTO Rental(userID, vehicleID, startDate,endDate,price) VALUES(?,?,?,?,?)";
      db.run(sql, [userID, obj.vehicleID, startDate, endDate, price], function (err) {
        if (err) {
          reject(err);
        }
        else {

          resolve(null);
        }
      });
    }).catch(err => reject(err))
  })
}
//select the rentals of a user
//param : userID indentify the user
exports.getRentals = function (userID) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT *
    FROM Rental R, Vehicle V 
    WHERE V.vehicleID= R.vehicleID AND userID=?
    ORDER BY endDate DESC`
    db.all(sql, [userID], (err, rows) => {
      if (err) reject(err)
      else resolve(rows.map(e => ({rentalID: e.rentalID, brand: e.brand, model: e.model, category: e.category, startDate: e.startDate, endDate: e.endDate, price: e.price })))
    })
  })
}
//Delete the rental of a user from db 
//parm : rentalID identify the rental to delete
exports.deleteRental = function (rentalID) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM Rental WHERE rentalID=?'
    db.run(sql, [rentalID], function (err) {
      if (err) reject(err)
      else resolve(null)
    })
  })
}
