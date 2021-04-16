import React, { Component } from 'react'

const initialState = { results: '', value: '', dbval: []}

export default class App extends Component {
  state = initialState
  timeout = null
  search_url = "https://slavka.one/api/"
  db_url = "https://slavka.one/db/"
  timeout_duration = 100
  // handles input into search bar
  handleSearchChange = (e) => {
    let value = e.target.value
    clearTimeout(this.timeout);
    if (value.length>0) {
      this.setState({ value })
      this.timeout = setTimeout(this.search, this.timeout_duration);
    }
    else this.setState({results: '' });
  }
  // sends query to API
  search = () => {
    // assuming your results are returned as JSON
    fetch(`${this.search_url}${this.state.value}`, {mode:'no-cors'})
    .then(res => res.json())
    .then(data => this.setState({ results: data.body }))
    .catch(error => this.setState({results: "error" }))
  }
  // db manipulation
  getDB(){
    const headers = { 'Content-Type': 'application/json' }
    this.setState({dbval: [] });
    fetch(this.db_url, { headers })
        .then(response => response.json())
        .then(data => this.setState({ dbval: this.state.dbval.concat(data.body) }))
        .catch(error => this.setState({dbval: "error" }));
  }

  postDB(){
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John Doe' })
    };
    fetch(this.db_url, requestOptions)
        .then(response => response.json())
        .then(data => this.setState({ dbval: this.state.dbval.concat(data.status) }))
        .catch(error => this.setState({dbval: "error" }));
  }
  //dynamic part of website
  render() {
    return (
      <div>
          <input
            onChange={this.handleSearchChange}
          />
          <div className='results'>
              <p> {this.state.results} </p>
          </div>
      </div>
    )
  }
}