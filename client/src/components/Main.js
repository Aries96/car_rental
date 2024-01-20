import React from 'react';

function Main(props) {
    return (
        <main className="col-md-10 col-sm-12"  >
            <div className="col-12">
                <h1 className="card-title" id="titleFilter">Veicoli disponibili</h1>
            </div>

            <table className="table table-striped table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th className="text-center" scope="col ">Marca</th>
                        <th className="text-center" scope="col">Modello</th>
                        <th className="text-center" scope="col">Categoria</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    {props.vehicles.map(v =>
                        <tr key={v.vehicleID}>
                            <td className="text-center">{v.brand}</td>
                            <td className="text-center">{v.model}</td>
                            <td className="text-center">{v.category}</td>
                        </tr>)}
                </tbody>
            </table>
        </main>
    );
}

export default Main;