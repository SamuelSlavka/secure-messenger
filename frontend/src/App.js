import React from 'react';

class App extends React.Component {
  state = { result: []}

  componentDidMount() {
    const apiUrl = 'https://localhost/api/get';
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => this.setState({result:  data}));
  }

  render() {
    return (
      <div class="card">
          <h1>Hello {this.state.result}</h1>
      </div>
    );
  }
}

export default App;