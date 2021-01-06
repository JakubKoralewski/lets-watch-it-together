import React from 'react';
import ReactDOM from 'react-dom';

class OwnInfo extends React.Component {
      render(){
        return(
          <div id="OwnInfoContainer">
				<img src={this.props.imageurl} id="userimage"/>
				<h3 id="userName">{this.props.username} </h3>
				<h4 id="userAge">{this.props.userage}</h4>
				<h5 id="userDescription">{this.props.userDescription}</h5>	
				<button id="editInfoButton" onClick={this.handleEditInfo}>EDIT INFO </button>
          </div>
        );
      }
	  
	  editInfoButton(){
		()=>this.props.onClickEdit();
	  }
	  
}



export default OwnInfo;
