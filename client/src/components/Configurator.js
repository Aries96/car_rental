import React, { useState, useEffect } from 'react';
import moment from 'moment'
import Api from '../api/API'
import Alert from 'react-bootstrap/Alert';
import ModalPayment from './ModalPayment';
import AddRental from './AddRental';


function Configurator(props) {
    //form configuration
    const [startDate, setStartDate] = useState("");         //start date for a rental
    const [endDate, setEndDate] = useState("") ;            //end date   for a rental
    const [category, setCategory] = useState("A");           //category of the rental
    const [age, setAge] = useState(18);                     //min age of the driver
    const [drivers, setDrivers] = useState("0");             //number of additional drivers
    const [km, setKm] = useState("1");                       //km for a rent
    const [extraInsurance, setInsurance] = useState(false); //extra insurance
    const [carAvaible, setCar] = useState(0)                //number of car avaible for a spefific configuration
    const [price, setPrice] = useState(0);                  //price of a specific configuration
    const [errSolution, seterrSolution] = useState(false)   //true: there is a an error for a configuration
    const [paymentOK, setPayment] = useState(false)         //true: the payment fulfilled
    const [errMessage, setErrMessage] = useState("")        //used for error message in configurator form
    const { handleAuthErr } = props                         //funcion for handle authentication error

    const [show, setShow] = useState(false);                //true:open the modal for payment
    const handleClose = () => setShow(false);               //close the modal for payment
    const handleShow = () => setShow(true);                 //function to open the modal

    //require a solution for a rental 
    const requireConfiguration=()=>{
        //get solution
        Api.configurator(startDate, endDate, category, age, drivers, km, extraInsurance).then(obj => {
            setCar(obj.vehicles)
            setPrice(obj.price)
            seterrSolution(false)
        }).catch((errs) => {
            handleAuthErr(errs)
            if (errs.status === 404) seterrSolution(true)
            if (errs.status === 422) setErrMessage((errs.errObj.errors[0].msg))
        })
    }
     //show the modal
     const openModal = () => {
        handleShow()
    }
    //values used by Addrental, ModalPayment components
    const value={show,handleClose,
                 startDate,endDate,category,age,drivers,km,extraInsurance,
                 price,setCar,setPayment,handleAuthErr,
                 paymentOK,requireConfiguration,carAvaible,openModal}
                 
   
    //to generete new configuration on change of this params 
    //[startDate, endDate, category, age, drivers, km, extraInsurance, handleAuthErr, errMessage]
    useEffect(() => {
        if (!errMessage && age>17) {
            if (startDate && endDate && category && age && drivers && km) {
                requireConfiguration()
                setPayment(false)
            }
        }
    }, [startDate, endDate, category, age, drivers, km, extraInsurance, handleAuthErr, errMessage]);

    //verify the number of car for a specific configuration
    useEffect(() => {
        if (carAvaible === 0 && price > 0) {
            seterrSolution(true)
        }
    }, [carAvaible, price])

    //for each event change on the configuration form check if the value of a field is correct
    const checkConfiguratorValidity = (event) => {
        switch (event.target.name) {
            case "startDate":
                if (moment(event.target.value).isValid()) {
                    const start = moment(event.target.value, "YYYY-MM-DD");
                    const end = moment(endDate, "YYYY-MM-DD");
                    const today = moment(new Date(), "YYYY-MM-DD")
                    if (start.diff(today, 'days') + 1 > 0) {
                        const days = start.diff(end, 'days') + 1;
                        if (days > 0) {
                            setEndDate(event.target.value)
                            setStartDate(event.target.value)
                            setErrMessage("")
                        }
                        else {
                            setStartDate(event.target.value)
                            setErrMessage("")
                        }
                    } else setErrMessage("La data di inizio non può essere precedente alla data odierna")

                } else setErrMessage("La data di inizio non è valida (YYYY-MM-DD)")

                break;

            case "endDate":
                if (moment(event.target.value).isValid()) {
                    const start = moment(startDate, "YYYY-MM-DD");
                    const end = moment(event.target.value, "YYYY-MM-DD");
                    const today = moment(new Date(), "YYYY-MM-DD")
                    if (end.diff(today, 'days') + 1 > 0) {
                        const days = start.diff(end, 'days') + 1;
                        if (days > 0) {
                            setEndDate(event.target.value)
                            setStartDate(event.target.value)
                            setErrMessage("")
                        } else {
                            setEndDate(event.target.value)
                            setErrMessage("")
                        }
                    } else setErrMessage("La data di fine non può essere precedente alla data odierna")
                } else setErrMessage("La data di fine non è valida (YYYY-MM-DD)")
                break;

            case "category":
                const categories = ["A", "B", "C", "D", "E"]
                if (Object.values(categories).some(e => e === event.target.value)) {
                    setCategory(event.target.value)
                    setErrMessage("")
                }
                else setErrMessage("La categoria non è valida")

                break;

            case "age":  
                if (!isNaN(event.target.value) && event.target.value >=18 && event.target.value <= 86) {
                    setAge(event.target.value)
                    setErrMessage("")
                } else setErrMessage("L'età del conducente deve essere maggiore di 17 e minore o uguale 86 ")
                break;

            case "km":
                if (!isNaN(event.target.value) && event.target.value > 0 && event.target.value < 4) {
                    setKm(event.target.value)
                    setErrMessage("")
                } else setErrMessage("L'opzione km non è valida")
                break;

            case "drivers":
                if (!isNaN(event.target.value) && event.target.value >= 0 && event.target.value < 6) {
                    setDrivers(event.target.value)
                    setErrMessage("")
                } else setErrMessage("il numero di guidatori non può essere superiore a 5")
                break;
            default:
                setErrMessage("")
                break;
        }
    }
    const createListAge=()=>{
        let array=[]
        for(let i=18; i<87;i++) array.push(i)
        return array
    }
    return (
        <>
            <aside className="d-md-block collapse col-md-12 col-sm-12 pl-3" id="configurator">
                <form>
                    <div className="form-row">
                        <div className="form-group col-md-4 col-sm-4">
                            <label htmlFor="startDate">Data inizio</label>
                            <input type="date" className="form-control" id="startDate" name="startDate"
                                min={moment().format("YYYY-MM-DD")} onChange={(e) => checkConfiguratorValidity(e)} value={startDate}></input>
                        </div>
                        <div className="form-group col-md-4 col-sm-4">
                            <label htmlFor="endDate">Data fine</label>
                            <input type="date" className="form-control" id="endDate" name="endDate"
                                min={moment(startDate || moment()).format("YYYY-MM-DD")} onChange={(e) => checkConfiguratorValidity(e)} value={endDate}></input>
                        </div>
                        <div className="form-group col-md-4 col-sm-4">
                            <label htmlFor="category">Categoria</label>
                            <select className="form-control" id="category" name="category" value={category} onChange={(e) => checkConfiguratorValidity(e)}>
                                {Object.keys(props.categories).map(c => <option key={c} value={c} >{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group col-md-4 col-sm-4">
                            <label htmlFor="age">Età guidatore più giovane</label>
                            <select  className="form-control" id="age" name="age" value={age}
                                 onChange={(e => checkConfiguratorValidity(e))}>
                                    {createListAge().map(e => <option key={e} value={e} >{e}</option>)}
                          </select>
                        </div>
                        <div className="form-group col-md-4 col-sm-4">
                            <label htmlFor="drivers">Guidatori addizionali</label>
                            <input type="number" className="form-control" id="drivers" name="drivers"
                                max={5} min={0} value={drivers} onChange={(e) => checkConfiguratorValidity(e)}></input>
                        </div>
                        <div className="form-group col-md-4 col-sm-4">
                            <label htmlFor="km">Km attesi</label>
                            <select className="form-control" id="km" name="km" value={km} onChange={(e) => checkConfiguratorValidity(e)}>
                                <option key={1} value={1} >Meno di 50 km/giorno</option>
                                <option key={2} value={2} >Meno di 150 km/giorno</option>
                                <option key={3} value={3} >Km illimitati</option>
                            </select>
                        </div>
                        <div className="form-group form-check-inline mb-2">
                            <input type="checkbox" className="form-check-input" id="important" name="important" value={extraInsurance} onChange={(e) => setInsurance(e.target.checked)}></input>
                            <label className="form-check-label" htmlFor="important">Assicurazione extra</label>
                        </div>
                    </div>
                </form>
            </aside>
            {errMessage ? <Alert variant="danger">
                <Alert.Heading>Errore</Alert.Heading>
                <p>
                    {errMessage}
                </p>
            </Alert> : ""}
            {price > 0 && (carAvaible > 0) && !errMessage && !errSolution ?
                <AddRental  value={value}/>
                : ""}
            {paymentOK ? <Alert  variant="success">
                <Alert.Heading>Payment status</Alert.Heading>
                <p>
                    Your transaction was successful
                        </p>
            </Alert> : ""}
            {errSolution ?
                <Alert variant="danger">
                    <p>
                        Non sono state trovate soluzioni disponibile per le date inserite
                        </p>
                </Alert>
                : ""}
                    <ModalPayment  value={value}/>
                
        </>
    );
}

export default Configurator;