import React, { useState, useEffect } from 'react';
import moment from 'moment'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import API from '../api/API';
import Alert from 'react-bootstrap/Alert';


function History(props) {
    const [rentals, setRentals] = useState([])
    const { handleAuthErr } = props
    const [show, setShow] = useState(false);
    const [err,setErr]= useState("")

    const [rentalDelete, setDelete] = useState({})

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    const deleteRenatal = (id) => {
        API.deleteRental(rentalDelete.rentalID)
            .then(() => {
                API.getRentals()
                    .then(rentals => setRentals(rentals))
                    .catch(err => {
                        handleAuthErr(err)
                        if(err.status===404){
                            setErr("Non sono stati trovati noleggi")
                            setRentals("")
                        }
                    })
                handleClose()
            })
            .catch(err => {
                handleAuthErr(err)
                
            })
    }
    useEffect(() => {
        API.getRentals()
            .then(rentals => setRentals(rentals))
            .catch(err => {
                handleAuthErr(err)
                if(err.status===404){
                     setErr("Non sono stati trovati noleggi")
                     setRentals("")
                }
            })
    }, [handleAuthErr])

    const addTrash = (e) => {
        if (e.validity){
            const start= moment(e.startDate,"YYYY-MM-DD")
            const today= moment(new Date(),"YYYY-MM-DD")
            
            if(start.isAfter(today,'day')) return <td className="text-center"><span className="badge badge-primary"><i className="fa fa-trash" onClick={() => openModal(e)}></i></span></td>
            else return <td className="text-center"><span className="badge badge-danger">active</span></td>
        }
        else return <td className="text-center"><span className="badge badge-success">archivied</span></td>
    }
    const openModal = (e) => {
        handleShow()
        setDelete(e);
    }



    return (
        <>
        {!err ? 
            <main className="col-md-12 col-sm-12"  >
                <div className="col-12">
                    <h1 className="card-title" id="titleFilter">Storico noleggi</h1>
                </div>
                <table className="table table-striped table-hover">
                    <thead className="thead-dark">
                        <tr>
                            <th className="text-center" scope="col ">Brand</th>
                            <th className="text-center" scope="col">Modello</th>
                            <th className="text-center" scope="col">Categoria</th>
                            <th className="text-center" scope="col">Data Noleggio</th>
                            <th className="text-center" scope="col">Prezzo</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        {rentals.map(e =>
                            <tr key={e.rentalID}>
                                <td className="text-center">{e.brand}</td>
                                <td className="text-center">{e.model}</td>
                                <td className="text-center">{e.category}</td>
                                <td className="text-center">{`${moment(e.startDate).format("DD/MM/YY")} a ${moment(e.endDate).format("DD/MM/YY")}`}</td>
                                <td className="text-center">{`${e.price}€`}</td>
                                {addTrash(e)}
                            </tr>
                        )}
                    </tbody>
                </table>
            </main>
            :""}
            {err ? <Alert variant="danger">
                <Alert.Heading>Errore</Alert.Heading>
                <p>
                    {err}
                </p>
            </Alert> : ""}
            <Modal show={show} onHide={handleClose} animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Cancellazione</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Sei sicuro di voler cancellare la la prenotazione</p>
                    <table className="table table-striped table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th className="text-center" scope="col ">Brand</th>
                                <th className="text-center" scope="col">Modello</th>
                                <th className="text-center" scope="col">Categoria</th>
                                <th className="text-center" scope="col">Data Noleggio</th>
                                <th className="text-center" scope="col">Prezzo</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <tr key={rentalDelete.rentalID}>
                                <td className="text-center">{rentalDelete.brand}</td>
                                <td className="text-center">{rentalDelete.model}</td>
                                <td className="text-center">{rentalDelete.category}</td>
                                <td className="text-center">{`${moment(rentalDelete.startDate).format("DD/MM/YY")} a ${moment(rentalDelete.endDate).format("DD/MM/YY")}`}</td>
                                <td className="text-center">{`${rentalDelete.price}€`}</td>
                            </tr>
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => deleteRenatal()}>
                        Elimina
          </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default History;