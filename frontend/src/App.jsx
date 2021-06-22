import React, { Component } from 'react';
import {
  BrowserRouter as Router, Switch, Route, Link,
} from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import Home from './Home';
import Login from './auth/Login';
import Protected from './auth/Protected';
import Logout from './auth/Logout';
import Register from './auth/Register';

export default class App extends Component {
  render() {
    return [
      <div key="ct" className="content">
        <Router>
          <Navbar expand="sm" bg="light" variant="light">
            <Navbar.Brand href="/">Slavka.one</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <Link className="nav-link" to="/">Home</Link>
                <Link className="nav-link" to="/protected">Messages</Link>
              </Nav>
              <Nav>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="nav-link" to="/register">Register</Link>
                <Link className="nav-link" to="/logout">Logout</Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          <ul className="results">
            <Switch>
              <Route path="/login">
                <Login />
              </Route>

              <Route path="/protected" component={Protected} />

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
      <footer key="ft" className="footer">
        <p>Welcome to slavka.one</p>
        <a id="git-link" href="https://github.com/SamuelSlavka/slavkaone">
          github.com/slavkaone
        </a>
      </footer>,
    ];
  }
}
