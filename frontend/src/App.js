import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown'

const initialState = { results: '', value: '', qtype: 'article', dbval: [] }

export default class App extends Component {
  state = initialState
  timeout = null
  search_url = "https://slavka.one/api/"
  db_url = "https://slavka.one/db/"
  timeout_duration = 150;

  // handles input into search bar
  handleSearch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let value = this.state.value;
    let url = '';
    // while typing wait a bit for next letter
    if (value.length > 0) {

      if(this.state.qtype === 'article'){
        url=`${this.search_url}${value}`
        fetch(url, { mode: 'no-cors' })
          .then(res => res.json())
          .then(data => this.setState({ results: data.body }))
          .catch(() => this.setState({ results: "error" }))
      }
      else {
        url=`${this.search_url}${value}/${this.state.qtype}`
        fetch(url, { mode: 'no-cors' })
          .then(res => res.json())
          .then(data => this.setState({ results: <pre>{JSON.stringify(data, null, 2) }</pre> }))
          .catch(() => this.setState({ results: "error" }))
      }
    }
    else this.setState({ results: '' });
  }
  handleSelect = (e) => {
    this.setState({ qtype: e });
  }
  handleInputChange = (e) => {
    this.setState({ value: e.target.value });
  }

  // db manipulation
  getDB() {
    const headers = { 'Content-Type': 'application/json' }
    this.setState({ dbval: [] });
    fetch(this.db_url, { headers })
      .then(response => response.json())
      .then(data => this.setState({ dbval: this.state.dbval.concat(data.body) }))
      .catch(error => this.setState({ dbval: "error" }));
  }

  postDB() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John Doe' })
    };
    fetch(this.db_url, requestOptions)
      .then(response => response.json())
      .then(data => this.setState({ dbval: this.state.dbval.concat(data.status) }))
      .catch(error => this.setState({ dbval: "error" }));
  }


  //dynamic part of website
  render() {
    return [

      <div key='0' className='content'>

        <form id="input-form" onSubmit={this.handleSearch}>
          <input id="input-field" type="text" name="query" ref="wikiQuery" value={this.state.value} onChange={this.handleInputChange} /> 
          <DropdownButton
            title={this.state.qtype}
            id="dropdown-basic-button"
            onSelect={this.handleSelect}>
            <Dropdown.Item eventKey="article">article</Dropdown.Item>
            <Dropdown.Item eventKey="contents">contents</Dropdown.Item>
            <Dropdown.Item eventKey="images">images</Dropdown.Item>
          </DropdownButton>
          <button id="submit-button" type="submit">Submit</button>
          <br />

        </form>
        <div className='results'>
          {this.state.results}
        </div>
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

