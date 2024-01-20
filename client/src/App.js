import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar'
import Filters from './components/Filters';
import Main from './components/Main';
import Login from './components/Login'
import History from './components/History'
import Api from './api/API'

import { Switch, Redirect, BrowserRouter as Router, Route } from 'react-router-dom';

import './App.css';
import Configurator from './components/Configurator';


function App(props) {
  const [vehicles, setVehicles] = useState([])      //vehicles
  const [brands, setBrands] = useState({})          //brands
  const [categories, setCategories] = useState({})  //categories
  const [user, setUser] = useState("");             //user

  //on component mount set brands and categories
  useEffect(() => {
    //check if the user is authenticated
    Api.isAuthenticated().then(
      (user) => {
        setUser(user.email)
      }
    ).catch((err) => {
      handleAuthErr(err)
    });
    //load brand and categories
    Api.getBrands().then(brands => setBrands(brands))
    Api.getCategories().then(categories => setCategories(categories))
  }, [])
  //on change of brands and categories
  useEffect(() => {
    if (Object.keys(brands).length > 0 && Object.keys(categories).length > 0)
      //load vehicles
      Api.getVehicles(categories, brands).then(vehicles => setVehicles(vehicles))
  }, [brands, categories])

  //update brands
  const changeBrand = (brand) => {
    setBrands(prevBrands => ({ ...brands, [brand]: !prevBrands[brand] }))
  }
  //update categories
  const changeCategories = (category) => {
    setCategories(prevCategories => ({ ...categories, [category]: !prevCategories[category] }))
  }
  //function to check if user is authenticated
  const handleAuthErr = (err) => {
    if (err.status === 401) {
      setUser("")
      return <Redirect to="/" />
    }
  }

  return (
    <Router>
      <Switch>
        <Route exact path="/" render={(props) => {
          if (Object.keys(user).length > 0) return <Redirect to="/configuration"/>;
          else return <Redirect to="/vehicles" />
        }} />
        <Route exact path="/login" render={(props) => {
          if (!user)
            return <Login logUser={setUser} />
          else return <Redirect to='/' />;
        }} />
        <Route path="/" render={(props) => {
          return <div>
            <NavBar user={user} setUser={setUser} />
            <div className="container-fluid ml-0 mr-0">
              <div className="row vheight-100">
                <Route path="/vehicles" render={(props) => {
                  return <>
                    <Filters brands={brands} categories={categories} handleBrands={changeBrand} handleCategories={changeCategories} />
                    <Main vehicles={vehicles} />
                  </>
                }} />
                <Route exact path="/configuration" render={props => {
                  if(user)
                    return <Configurator categories={categories} handleAuthErr={handleAuthErr} />
                  else return <Redirect to="/"/>
                }} />
                <Route path="/rentals" render={match => {
                  if(user)
                  return <History handleAuthErr={handleAuthErr} />
                  else return <Redirect to="/"/>
                }} />
              </div>
            </div>
          </div>
        }}/>
      </Switch>
    </Router>

  );
}

export default App;
