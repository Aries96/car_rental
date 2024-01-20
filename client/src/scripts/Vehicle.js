
class Vehicle {
    constructor(vehicleID, brand, model, category) {
        if (vehicleID) {
            this.vehicleID = vehicleID;
        }
        this.brand = brand;
        this.model = model;
        this.category = category;
    }

    /**
    * Construct a Vehicle from a plain object
    * @param {{}} json 
    * @return {Vehicle} the newly created Task object
    */
    static from(json) {
        const v = Object.assign(new Vehicle(), json);
        return v;
    }

}

export default Vehicle;