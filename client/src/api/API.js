import Vehicle from '../scripts/Vehicle';
const baseURL = "/api";

//check if the user is authenticated
async function isAuthenticated(){
    let url = "/user";
    const response = await fetch(baseURL + url);
    const userJson = await response.json();
    if(response.ok){
        return userJson;
    } else {
        let err = {status: response.status, errObj:userJson};
        throw err;  // An object with the error coming from the server
    }
}
//GET the vihicles form the server
async function getVehicles(categories, brands) {
    let url = "/vehicles";
    //if the object either categories or brands contains some properties that have values = true then build
    //a custom url for the request of vehicles that satisfy the constraints else request all vehicles
    if (Object.values(categories).some(e => e === true) || Object.values(brands).some(e => e === true)) {
        //all brands selected
        let brandsArray = Object.keys(brands).filter(c => brands[c])
        //all categories selected
        let categoriesArray = Object.keys(categories).filter(c => categories[c])
        //custom url
        url += `${categoriesArray.length > 0 ? "?categories=" + categoriesArray.toString() : ""}` +
            `${brandsArray.length > 0 && categoriesArray.length > 0 ? "&&brands=" + brandsArray.toString()
                : brandsArray.length > 0 ? "?brands=" + brandsArray.toString() : ""} `
    }
    const response = await fetch(baseURL + url);
    if (response.ok) {
        const vehicleJson = await response.json();
        return vehicleJson.map((t) => Vehicle.from(t));
    } else {
        let err = { status: response.status, errObj: "vehicles" };
        throw err;  // An object with the error coming from the server
    }
}
//GET all brands
async function getBrands() {
    let url = "/brands"
    const response = await fetch(baseURL + url);
    const brands = await response.json();
    if (response.ok) {
        return brands
    } else {
        let err = { status: response.status, errObj: brands };
        throw err;  // An object with the error coming from the server
    }
}
//GET all categories
async function getCategories() {
    let url = "/categories"
    const response = await fetch(baseURL + url);
    const categories = await response.json();
    if (response.ok) {
        return categories
    } else {
        let err = { status: response.status, errObj: categories };
        throw err;  // An object with the error coming from the server
    }
}
//POST send users credentials
async function userLogin(username, password) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username, password: password }),
        }).then((response) => {
            //if the response is ok <400
            if (response.ok) {
                response.json() //extract the response information in json
                    .then((obj) => { resolve(obj); })
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            //if the response status >=400     
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}
//Post : log out
async function userLogout() {
    return new Promise((resolve, reject) => {
        fetch(baseURL + '/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                reject(null);
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}
//POST:  to generate a configuration(Solution)
async function configurator(startDate, endDate, category, age, drivers, km, extraInsurance) {
    let url = "/configuration";
    /*For get Implementation
    url += `${startDate ? "/?startDate=" + startDate : ""}` +
        `${startDate && endDate ? "&&endDate=" + endDate :
            endDate ? "/?endDate=" + endDate : ""}` +
        `${(startDate || endDate) && category ? "&&category=" + category :
            category ? "/?category=" + category : ""}` +
        `${age ? "&&age=" + age : ""}` +
        `${drivers ? "&&drivers=" + drivers : ""}` +
        `${km ? "&&km=" + km : ""}` +
        `${"&&insurance=" + extraInsurance}`
    */
   //Create object Configuration with all params
    let configuration={startDate: startDate, endDate: endDate, category: category, age: age, drivers:drivers,km:km, insurance: extraInsurance}
    const response = await fetch(baseURL + url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(configuration)
        })
    const vehicles = await response.json();
    if (response.ok) {
        //return the list of vehicles
        return vehicles
    } else {
        //if there is a error for the configuration throw a custom err
        console.log(vehicles)
        let err = { status: response.status, errObj: vehicles};
        throw err;  // An object with the error coming from the server
    }
}
//POST: for create a rental on db afeter the payment
function createRantal(startDate, endDate, category, age, drivers, km, extraInsurance, price) {
    return new Promise((resolve, reject) => {
        let rental = { startDate: startDate, endDate: endDate, category: category, age: age, drivers: drivers, km: km, extraInsurance: extraInsurance, price }
         fetch(baseURL + '/rentals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rental),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                let err = { status: response.status};
                reject(err);  // An object with the error coming from the server
            }
        }).catch((err) => {
            console.log(err)
            let myErr = { status: 503, param: "Server", msg: "Cannot communicate", errObj: err }
            throw myErr
        })
    })
}
//POST: fake API to simulate a payment
async function createPayment(name,cardNumber, cvv,price) {
        let payment= {name: name, cardNumber: cardNumber, cvv: cvv, price: price}
        let url="/payment"
        const response = await fetch(baseURL+url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payment),
        }).catch(err => {
            throw err
        })
        if (response.ok) {
            return null
        } else {
            let myErr = { status: response.status, param: "Server", msg: "Campi non validi", errObj: "rentals" }
            throw myErr
        }

}
//GET all rental  of a user
async function getRentals() {
    let url = "/rentals";
    const response = await fetch(baseURL + url);
    if (response.ok) {
        const rentals = await response.json();
        return (rentals)
    } else {
        let myErr = { status: response.status, param: "Server", msg: "Rentals not fouded", errObj: "rentals" }
        throw myErr
    }
}
//Delete a Rental of a user
async function deleteRental(rentalID) {
    let url = "/rentals/bookings/"+rentalID
    const response = await fetch(baseURL+url, {
        method: 'DELETE', // or 'PUT'
    }).catch(err => {
        throw err
    })
    if (response.ok) {
        return null
    } else {
        let myErr = { status: response.status, param: "Server", msg: "Rental not fouded", errObj: "rentals" }
        throw myErr
    }
}

const API = { isAuthenticated,getVehicles, getBrands, getCategories, userLogin, userLogout, configurator, createRantal, createPayment, getRentals,deleteRental };
export default API;