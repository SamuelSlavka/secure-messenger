import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';

import { useAuth, logout, register } from "./auth"
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";

import { Login } from './auth/Login';
import { Protected } from './auth/Protected';
import { Home } from './Home';
import { Logout } from './auth/Logout';
import { Register } from './auth/Register';


const PrivateRoute = ({ component: Component, ...rest }) => {
  const [logged] = useAuth();

  return <Route {...rest} render={(props) => (
    logged
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
}

export default class App extends Component {
  timeout = null
  develop_search_url = "http://127.0.0.1:5000/api/"
  search_url = "https://slavka.one/api/"
  db_url = "https://slavka.one/db/"
  timeout_duration = 150;


  //dynamic part of website
  render() {
    return [
      <div key='0' className='content'>
        <Router>
          <Navbar expand="sm" bg="light" variant="light">
            <Navbar.Brand href="/">Slavka.one</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <Link className="nav-link" to="/">Home</Link>
                <Link className="nav-link" to="/protected">Account</Link>
              </Nav>
              <Nav>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="nav-link" to="/register">Register</Link>
                <Link className="nav-link" to="/logout">Logout</Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          <ul className='results'>
            <Switch>
              <Route path="/login">
                <Login />
              </Route>

              <PrivateRoute path="/protected" component={Protected} />

              <Route path="/register">
                <Register />
              </Route>
              <Route path="/logout">
                <Logout />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </ul>
        </Router>
      </div>,

      <footer key='1' className="footer">
        <p>Welcome to slavka.one</p>
        <a id="git-link" href="https://github.com/SamuelSlavka/slavkaone">
          github.com/slavkaone
        </a>
      </footer>
    ]
  }
}


