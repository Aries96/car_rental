import React from 'react';
import Toggle from './Toggle';



function Filters(props) {
    return (
        <aside className="d-md-block collapse  col-md-2 col-sm-12 pl-3" id="filters">
            <nav >
                <h5 className="card-title">Categorie</h5>
                {Object.keys(props.categories).map(c=> <Toggle  handleChange={props.handleCategories} key={c} name={c} value={props.categories[c]}/>)}
                <h5 className="card-title">Brands</h5>
                {Object.keys(props.brands).map(b=> <Toggle handleChange={props.handleBrands} key={b} name={b} value={props.brands[b]}/>)}
            </nav>
        </aside>
    );
}

export default Filters;