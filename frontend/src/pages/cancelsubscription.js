import API_BASE_URL from '../config';
import React, {useState, useContext} from 'react';
import {FooterContainer} from '../containers/footer';
import {Form,Header} from '../components';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from './../context/auth-context';
import logo from '../logo.svg';

export default function CancelSubscription(){
    const history = useHistory();
    const [error,setError] = useState('');
    const auth = useContext(AuthContext);
    const sub_id  = auth.sub_id;
    const email = auth.email;
    
    const handleCancelSubscription = async event =>{
        event.preventDefault();

        //send data to the backend
        try{
            const response = await fetch(`${API_BASE_URL}/api/subscription/delete`, {
            method: 'PATCH',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                    EMAIL : email
                })
            });
            
            const responseData = await response.json();
            
            console.log(responseData);

            if (response.status === 201){
                history.push(ROUTES.ADD_SUBSCRIPTION); //subscription deleted, move to add subscription page

                //TODO: add GET request to get user's profiles + auth token
            } else if (response.status === 422){
                setError('Invalid user info');
            } else if (response.status === 423){
                setError('User already exists');
            }

        }catch(err){
            console.log(err);
            console.log("Sending data to backend failed while deleting subscription");
            setError(err.message);
        }
    }
    


    return (
        <>
        <Header >
         <Header.Frame  >
            <Header.Logo  to={ROUTES.HOME} src={logo} alt="Netflix" />
            <Header.ButtonLink onClick = {() => auth.logout()}>
                Sign Out
            </Header.ButtonLink>
        </Header.Frame>
      </Header>
            <Form>
                <Form.Title>Cancel Membership?</Form.Title>
                {error && <Form.Error data-testid="error">{error}</Form.Error>}
                <Form.Base onSubmit={handleCancelSubscription} method="DELETE">

                    <Form.Submit type="submit" data-testid="cancel">
                        Yes
                    </Form.Submit>
                </Form.Base>
                <Form.Link to="/accountsettings">Go back</Form.Link>

            </Form>
        
        <FooterContainer/>
        </>
    );
}