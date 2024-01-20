'use strict'

class Vehicle{
    constructor(vehicleID,brand,model,category){
        if(vehicleID){
            this.vehicleID=vehicleID;
        }
        this.brand=brand;
        this.model=model;
        this.category=category;
    }
}

module.exports= Vehicle