import React, { Component } from 'react';
import './index.css';
import Game1 from './components/Game1';

class App extends Component {

    render() {

        return (
            <div className="App">
                <h1>Conway's Game of Life</h1>
                <Game1 />
            </div>
        );
    }
}

export default App;