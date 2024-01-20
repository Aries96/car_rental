import React from 'react';

function Toggle(props) {
    return (
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={props.name} 
                 name={props.name} checked={props.value} onChange={(event)=> props.handleChange(event.target.name)}/>
            <label className="custom-control-label" htmlFor={props.name}>{props.name}</label>
        </div>
    );
}

export default Toggle;