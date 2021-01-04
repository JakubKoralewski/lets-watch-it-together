import React from 'react';
import ReactDOM from 'react-dom';

class SeriesDescription extends React.Component {
      render(){
        return(
          <div id="SeriesDescriptionDiv">
            <button id="backButton" onclick="history.back()">
            </button>
            <article id="SeriesInfo">
              <h2>{()=>this.props.movieTitle}</h2>
              <h4>{()=>this.props.movieDescription}</h4>
            </article>
          </div>
        );
      }
}



export default SeriesDescription;
