import React, { Component } from 'react'

const initialState = { results: 'init', value: '' }

export default class App extends Component {
  state = initialState
  timeout = null
  search_url = "https://localhost/api/"
  timeout_duration = 300

  handleSearchChange = (e) => {
    let value = e.target.value
    clearTimeout(this.timeout);
    this.setState({ value })
    this.timeout = setTimeout(this.search, this.timeout_duration);
  }

  search = () => {
    // assuming your results are returned as JSON
    fetch(`${this.search_url}${this.state.value}`, {mode:'no-cors'})
    .then(res => res.json())
    .then(data => this.setState({ results: data }))
    .catch(error => this.setState({results: error }))
  }

  render() {
    return (
      <div>
          <input
            onChange={this.handleSearchChange}
          />
          <p> {this.state.results} </p>
      </div>
    )
  }
}