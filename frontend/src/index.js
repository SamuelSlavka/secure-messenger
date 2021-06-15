import ReactDOM from 'react-dom';
import React from 'react';
import App from './App';
import './App.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';


serviceWorkerRegistration.register('service-worker.js');

// main body
ReactDOM.render(<App />, document.getElementById('root'))



//reportWebVitals();
