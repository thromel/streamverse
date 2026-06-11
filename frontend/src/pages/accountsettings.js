import API_BASE_URL from '../config';
import React, { useContext, useState,useEffect} from 'react';
import {Form, Form2,Header} from '../components';
import * as ROUTES from '../constants/routes';
import {AuthContext} from './../context/auth-context';
import { FooterContainer } from '../containers/footer';
import logo from '../logo.svg';


export default function AccountSettings() {

    const [endate,setenddate] = useState('');
    async function fetchFromAPI (){   
        const url = `${API_BASE_URL}/api/subscription/getenddate/${email}`;
        const response = await fetch(url);
        var data = await response.json();
        setenddate(data["ed"].ED);
    }
    useEffect ( () => {
        fetchFromAPI();
    }, []);


    const auth = useContext(AuthContext);
    const email = auth.email;
    var bill = auth.bill;
    var type="";
    if(bill===5){
        type = "Basic Plan.Enjoy upto 2 profiles";
    }else if(bill===8){
        type = "Standard Plan.Enjoy upto 4 profiles";
    }else if(bill===10){
        type = "Premium Plan.Enjoy upto 6 profiles";
    }else{
        type="Subscribe now"
    }
     bill="Monthly "+bill+"$";
    
    return(
        <>
        <Header >
         <Header.Frame  >
            <Header.Logo  to={ROUTES.HOME} src={logo} alt="Netflix" />
            <Header.ButtonLink onClick = {() => auth.logout()}>
                Sign Out
            </Header.ButtonLink>
        </Header.Frame>
      </Header>

        <Form2>
            <Form2.Title>Account Settings</Form2.Title>
        
            <Form2.Text>Membership and billing</Form2.Text>
            
            <Form2.TextSmall>{email}</Form2.TextSmall>
            <Form2.Link to="/cancelsubscription">Cancel membership</Form2.Link>
        

            <Form2.Text>Plan Details</Form2.Text>
            <Form2.TextSmall>{type+". Your account is subscribed till "+endate}</Form2.TextSmall>
            <Form2.TextSmall>{bill}</Form2.TextSmall>
            <Form2.Link to="/updatesubscription">Change Your Plan</Form2.Link>
            <Form2.Link to="/subscriptionhistory">Subscription History</Form2.Link>


            <Form2.Text>Settings</Form2.Text>
            <Form2.Link to="/moviehistory">Movie Watch History</Form2.Link>
            <Form2.Link to="/showhistory">Show Watch History</Form2.Link>
            <Form2.Link to="/deleteprofile">Delete Profile</Form2.Link>
            <Form2.Link to="/updatephone">Update Phone Number</Form2.Link>
            <Form2.Link to="/updatepassword">Update Password</Form2.Link>
           
        </Form2>
        <FooterContainer/>
      </>  
    );
}