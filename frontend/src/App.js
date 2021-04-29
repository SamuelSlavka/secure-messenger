import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button'

import axios from 'axios';


const initialState = { results: '', value: '', qtype: 'article', dbval: [], lang: '' }

export default class App extends Component {
  state = initialState
  timeout = null
  develop_search_url = "http://192.168.1.11:8082/api/"
  search_url = "https://slavka.one/api/"
  db_url = "https://slavka.one/db/"
  timeout_duration = 150;

  // handles input into search bar
  handleSearch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let value = this.state.value;
    let url = '';
    let lang = '';
    if (this.state.lang !== '') {
      lang = `?lang=${this.state.lang}`
    }
    // while typing wait a bit for next letter
    if (value.length > 0) {
      //article
      if (this.state.qtype === 'article') {
        url = `${this.search_url}${value}${lang}`
        axios.get(url)
          .then(res =>
            this.setState({ results: res.data.body }))
          .catch(exception => {
            this.setState({ results: 'Wikipedia does not have an article with this exact name.' })
          })
      }
      else {
        //contents
        url = `${this.search_url}${value}/${this.state.qtype}${lang}`
        if (this.state.qtype === 'contents') {
          axios.get(url)
            .then(res =>
              this.setState({ results: this.recursiveContents(res.data.body, false) }))
            .catch((e) =>
              this.setState({ results: 'Wikipedia does not have an article with this exact name.' }))
        }
        //images
        else {
          axios.get(url)
            .then(res =>
              this.setState({ results: this.getImages(res.data.images) }))
            .catch(() => this.setState({ results: "Wikipedia does not have an article with this exact name." }))
        }
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
  handleInputLangChange = (e) => {
    this.setState({ lang: e.target.value });
  }

  getImages(images){  
    return <div>{images.map((image, i) => (
      <div key={i}>
        <a href={image} className="image" key={i}>{image}</a>
        <br />  
      </div>
      ))}</div>
      
    }; 

  recursiveContents(data, isSub, level = 1) {
    let children = [];
    if (isSub) { level++; }
    for (let i = 0, len = data.length - 1; i < len; i++) {
      if (typeof (data[i].subsections) === 'object') {
        children.push(
          <div key={i} className={"filter-group level-" + (level)}>
            <div key={i} className="filter-heading">{data[i].index} {data[i].name}</div>
            {this.recursiveContents(data[i].subsections, true, level)}
          </div>
        );
      } else { // No subcontents
        children.push(
          <span key={i}>
            {data[i].index, data[i].name}
          </span>)
      }
    }
    return children;
  }

  //dynamic part of website
  render() {
    return [

      <div key='0' className='content'>

        <form id="input-form" onSubmit={this.handleSearch}>
          <input id="input-field" type="text" name="query" ref="wikiQuery" value={this.state.value} onChange={this.handleInputChange} />
          <input id="input-field-lang" type="text" name="query" ref="lang" value={this.state.lang} onChange={this.handleInputLangChange} />
          <DropdownButton
            title={this.state.qtype}
            id="dropdown-basic-button"
            onSelect={this.handleSelect}>
            <Dropdown.Item eventKey="article">article</Dropdown.Item>
            <Dropdown.Item eventKey="contents">contents</Dropdown.Item>
            <Dropdown.Item eventKey="images">images</Dropdown.Item>
          </DropdownButton>
          <Button id="submit-button" type="submit">Submit</Button>
          <br />

        </form>
        <ul className='results'>
          {this.state.results}
        </ul>
      </div>,

      <footer key='1' className="footer">
        <p>Welcome to slavka.one</p>
        <a id="git-link" href="https://github.com/SamuelSlavka/slavkaone">
          github.com/slavkaone
        </a>
      </footer>


    ]
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


}

