import React, { useState } from 'react';
import Api from '../api/API'
import "../css/project.css"

function Login(props) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isOK, setOK] = useState(true)

    const submit = () => {
        
        Api.userLogin(email, password)
            .then(user => {
                props.logUser(user.email)
            })
            .catch(err => {
                if (err.errors[0]) setOK(false)
            });


    }
    //check login form fields
    const checkValiditaionLogin=(e)=>{
        e.preventDefault();
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
         if(re.test(String(email).toLowerCase()) && password) {
             setOK(true)
             submit()
         }else setOK(false)
    }

    return (
        <div className=" container-fluid ml-0 mr-0">
            <div className="row vheight-100">
                <aside className="d-md-block d-none col-md-4 side " >
                    <h2 className="name">Application<br /> Login Page</h2>
                    <p>Login from here to access.</p>
                </aside>
                <main className="col-8 col-md-8 col-sm-12 ">
                    <div className="d-flex justify-content-center align-items-center login" >
                        <form target="_self" onSubmit={(event) => checkValiditaionLogin(event)}>
                            <div className="form-group">
                                <label>User Name</label>
                                <input type="email" className="form-control" placeholder="User Name" id="userneme" name="username"
                                    value={email} onChange={(event) => setEmail(event.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" className="form-control" placeholder="Password" id="password" name="password"
                                    value={password} onChange={(event) => setPassword(event.target.value)} required />
                            </div>
                            {isOK ? "" : <p className="text-danger">Email o password errata</p>}
                            <div className="text-center">
                                <button type="submit" className="btn btn-secondary" >Login</button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>

    );
}

export default Login;