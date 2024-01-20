import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal'
import Api from '../api/API'
import Alert from 'react-bootstrap/Alert'
function ModalPayment(props) {
    //values of Configurator Component
    const { show, handleClose,
        startDate, endDate, category, age, drivers, km, extraInsurance,
        price, handleAuthErr, setPayment,
        paymentOK, requireConfiguration } = props.value


    const [cvv, setCvv] = useState("")                                  //cvv credit card   
    const [cardNumber, setCardNUmber] = useState("")                    //credit card
    const [name, setName] = useState("")                                //name of the credit card owner
    const [errMessagePayment, setErrMessagePayment] = useState("")      //used for error message in payment form


    //check form payment fields
    const checkPaymentValidity = (event) => {
        let isFieldsOk = true
        event.preventDefault()
        //if the credit card number is wrong
        if (!(!isNaN(cardNumber) && cardNumber.length === 16)) {
            setErrMessagePayment("La carta di credito deve contenere 16 caratteri")
            isFieldsOk = false
        }
        //if the name contain numbers
        if (!(name && /^[a-zA-Z ]+$/.test(name))) {
            setErrMessagePayment("Il campo nome non può contenere numeri")
            isFieldsOk = false
        }
        //if the cvv is wrong
        if (!(!isNaN(cvv) && cvv.length === 3)) {
            setErrMessagePayment("il campo cvv deve essere di tre caratteri")
            isFieldsOk = false
        }
        //if all filds are correnct make the payment
        if (isFieldsOk) {
            setErrMessagePayment("")
            checkPayment()
        }
    }

    //make payment and add rental
    const checkPayment = () => {
        //make payment 
        Api.createPayment(name, cardNumber, cvv, price)
            //if payment successfull
            .then(() => {
                //request to server to add rental
                Api.createRantal(startDate, endDate, category, age, drivers, km, extraInsurance, price)
                    .then(e => {
                        requireConfiguration()
                        handleClose()
                        setPayment(true)
                    })
                    //if therer is a problem with rental show the error
                    .catch(err => {
                        handleAuthErr(err)
                        if (err.status === 409) setErrMessagePayment("Transazione bloccata prezzo alterato")
                    })
            //if there is a problem with payment show the error
            }).catch(errs => {
                handleAuthErr(errs)
                if (errs.status === 422) {
                    setPayment(false)
                    setErrMessagePayment(errs.msg)
                }
            })
    }

    return (
        <Modal show={show} onHide={handleClose} animation={false}>
            <Modal.Header closeButton>
                <Modal.Title>Pagamento</Modal.Title>
            </Modal.Header>
            <Modal.Body><p>Inserisci i dati per il pagmaneto</p>
                <form id="formPayment" onSubmit={(event) => checkPaymentValidity(event)}>
                    <div className="form-row">
                        <div className="form-group col-md-12 col-sm-12">
                            <label htmlFor="startDate">Intestatario della carta</label>
                            <input type="text" className="form-control" id="nameUser" name="nameUser" required value={name} onChange={event => setName(event.target.value)}></input>
                        </div>
                        <div className="form-group col-md-8 col-sm-4">
                            <label htmlFor="startDate">Numero Carta</label>
                            <input type="number" className="form-control" id="cardNumber" name="cardNumber" required value={cardNumber} onChange={event => setCardNUmber(event.target.value)}></input>
                        </div>
                        <div className="form-group col-md-4 col-sm-4">
                            <label htmlFor="startDate">CVV</label>
                            <input type="number" className="form-control" id="cvv" name="cvv" required value={cvv} onChange={event => setCvv(event.target.value)} />
                        </div>
                    </div>
                    {!paymentOK && (errMessagePayment) ?
                        <Alert variant="danger">
                            <p>
                                {errMessagePayment}
                            </p>
                        </Alert>
                        : ""}
                    <div className="text-center">
                        <button type="submit" className="btn btn-primary" >Paga</button>
                    </div>
                </form>

            </Modal.Body>
            <Modal.Footer>
                <div className="text-left">
                    <span className="badge badge-pill badge-primary">{`${price}€`}</span>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalPayment;