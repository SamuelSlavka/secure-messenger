import React from 'react';

class App extends React.Component {
	constructor(props){
  	super(props)
    this.state = {
    	results: []
    }
    
    this.search = this.search.bind(this)
  }
  search(results){
  	this.setState({results})
  }
	render(){
  	const { results } = this.state
  	return (
    	<div>
    	  <Search onSearch={this.search} />
        <Result {...this.state} />
    	</div>
    )
  }
}

class Search extends React.Component {
	constructor(props){
  	super(props);
    this.state = {
    	searchValue: ''
    }
    this.handleOnChange = this.handleOnChange.bind(this);
  }
  
  componentDidMount() {
    const apiUrl = 'https://localhost/api/'+this.state.results;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => this.setState({result:  data}));
  }

  handleOnChange(e){
  	this.setState({
    	[e.target.name]: e.target.value
    }, () => {
    	setTimeout(() => {
        // it can be the result from your API i just harcoded it
        const apiUrl = 'https://localhost/api/';

        fetch(apiUrl, {mode:'cors'})
          .then((response) => response.json())
          .then((data) => this.setState({results:data}))
          .catch((error) => this.setState({results: error}));
      
        this.props.onSearch(this.state.results)
      }, 1000)
    })	
  }
  
	render(){
  	return (
    	<div>
    	  <input name="searchValue" type="text" onChange={this.handleOnChange} />
        <p>{this.state.results}</p>
    	</div>
    )
  }
}

const Result = ({results}) => {
	return (
  <div>
  <p>{results}</p>
  </div>
  )
}

export default App;