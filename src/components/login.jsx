import React from 'react';
import ReactDOM from 'react-dom';
import sitelogo from './sitelogo.jpeg'; 

class LoginMenu extends React.Component {
      render(){
        return(
          <div id="loginContainer">
				<article id="motto">Find yourself a partner for life... Or at least to watch something good together!</article>
				<img src={sitelogo} id="siteLogo"/>
				<article id="privacyInfo">By tapping Log In, you agree to our Terms and Privacy Policy</article>
				
				<button id=	"login_facebook" onClick={this.handleFacebookLogin}>LOG IN WITH FACEBOOK </button>
				<button id="login_phone" onClick={this.handlePhoneLogin}>LOG IN WITH PHONE NUMBER </button>
				<article id="facebook_notice"> We don't post anything to Facebook</article>
          </div>
        );
      }
	  
	  handleFacebookLogin(){
		()=>this.props.onClickFacebook()
	  }
	  
	  handlePhoneLogin(){
		  ()=>this.props.onClickPhone()
	  }
}



export default LoginMenu;
