import React from 'react';
import Api from '../api/API'
import { Link,NavLink } from 'react-router-dom';
import '../css/project.css'
import { useLocation } from 'react-router-dom'

function NavBar(props) {
    
    let location = useLocation();
    const checkLocation=()=>{
        if(location.pathname !== "/rentals")
        return <div className="d-md-none d-sm-block col-2 col-sm-2 float-sm-left ">
                <a className="btn btn-danger " data-toggle="collapse" href={location.pathname !== "/vehicles"? '#configurator':"#filters"} role="button" aria-expanded="false" aria-controls={props.user? 'configurator':"filters"}>
                    <i className="fa fa-bars"></i>
                </a>
            </div>
    }
    return (
        <nav className="navbar navbar-expand-lg bg-light pd-0 sticky-top">
            <div className="col-12 col-sm-12 col-md-4 p-0">
                <Link to="/vehicles" className="navbar-brand" >
                    <img src="carRental2.svg" alt=""></img>
                </Link>
            </div>
            {checkLocation()}
            <div className="col-10 col-sm-10 col-md-8 pl-0 ">
                <Link to={props.user ? '/' : `/login`} className="nav-item nav-link d-inline float-right"
                    onClick={() => {
                        if (props.user) {
                            props.setUser("")
                            Api.userLogout();
                        }
                    }}>
                    <i className={`fa ${props.user ? "fa-sign-out" : "fa-user-circle fa-2x"}  `} /></Link>
                {props.user ? <>
                    <NavLink to={`/rentals`} activeClassName='active' className="nav-item nav-link d-inline float-right">Storico</NavLink>
                    <NavLink exact to={`/configuration`} activeClassName='active' className="nav-item nav-link d-inline float-right">Noleggia</NavLink>
                </> : ""}

            </div>
        </nav>
    );
}

export default NavBar;