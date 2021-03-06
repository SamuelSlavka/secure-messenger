import React, { Component } from 'react'

const initialState = { results: '', value: '' }

export default class App extends Component {
  state = initialState
  timeout = null
  search_url = "https://slavka.one/api/"
  timeout_duration = 100

  handleSearchChange = (e) => {
    let value = e.target.value
    clearTimeout(this.timeout);
    if (value.length>0) {
      this.setState({ value })
      this.timeout = setTimeout(this.search, this.timeout_duration);
    }
    else this.setState({results: '' });
  }

  search = () => {
    // assuming your results are returned as JSON
    fetch(`${this.search_url}${this.state.value}`, {mode:'no-cors'})
    .then(res => res.json())
    .then(data => this.setState({ results: data }))
    .catch(error => this.setState({results: "error" }))
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