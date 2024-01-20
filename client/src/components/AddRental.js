import React  from 'react';
import moment from 'moment'


function AddRental(props) {

    const { startDate, endDate, category,price,carAvaible,openModal} = props.value
    return (
        <main className="col-md-12 col-sm-12"  >
                    <div className="col-12">
                        <h1 className="card-title" id="titleFilter">Soluzioni disponibili</h1>
                    </div>

                    <table className="table table-striped table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th className="text-center" scope="col ">Numero Auto disponibili</th>
                                <th className="text-center" scope="col">Data noleggio</th>
                                <th className="text-center" scope="col">Categoria</th>
                                <th className="text-center" scope="col">Prezzo</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <tr key={0}>
                                <td className="text-center">{carAvaible}</td>
                                <td className="text-center">{`${moment(startDate).format("DD/MM/YY")} a ${moment(endDate).format("DD/MM/YY")}`}</td>
                                <td className="text-center">{category}</td>
                                <td className="text-center">{`${price}€`}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="text-center"><button type="button" className="btn btn-dark" onClick={() => openModal()}>Conferma e paga</button></div>
                </main>
    );
}

export default AddRental;