import API_BASE_URL from '../config';
import React, {useState, useEffect,useContext}from 'react';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from './../context/auth-context';
import { Form,Header } from '../components';
import logo from '../logo.svg';

export function UpdatePhoneContainer({ Email }) {
    const history = useHistory();
    const auth = useContext(AuthContext);
    const [phone,set_phone] = useState('');
    const [oldphone,set_oldphone] = useState('');
    const [error,setError] = useState('');
    const email = auth.email;
    const isInvalid =   phone ===""  ;
    
    async function fetchFromAPI (){
        
        const url = `${API_BASE_URL}/api/users/getphone/${email}`;
        const response = await fetch(url);
        const data = await response.json();
        set_oldphone(data.phone["PHONE"]);
     }
    
    useEffect ( () => {
        fetchFromAPI();
    }, []);



    const handleUpdate = async event =>{
        event.preventDefault();

        //send data to the backend
        try{
            const response = await fetch(`${API_BASE_URL}/api/users/updatephone`, {
            method: 'PATCH',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                    EMAIL : email,
                    Phone : phone
                })
            });

            
            const responseData = await response.json();
            
            console.log("after submit data in subscribe",responseData);

            if (response.status === 201){
                history.push(ROUTES.ACCOUNT_SETTINGS); //Successful subscription, moves to netflix browse page

            } else if (response.status === 422){
                setError('Invalid user info');
            } else if (response.status === 423){
                setError('User already exists');
            }

        }catch(err){
            console.log(err);
            console.log("Sending data to backend failed while updating");
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
            <Form.Title>Update Phone</Form.Title>
            {error && <Form.Error data-testid="error">{error}</Form.Error>}
  
            <Form.Base onSubmit={handleUpdate} method="PATCH">
                <Form.Text>Current Number </Form.Text>
                <Form.CharField>{oldphone}</Form.CharField>
              <Form.Input  placeholder="New Phone Number." value={phone} onChange={({target})=> set_phone(target.value) } />
              <Form.Submit disabled={isInvalid} type="submit" data-testid="update">
                Update
              </Form.Submit>
            </Form.Base>
  
          </Form>
    </>
  );
}