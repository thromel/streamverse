import API_BASE_URL from '../config';
import React, {useContext, useState} from 'react';
import logo from '../logo.svg';
import {FooterContainer} from '../containers/footer';
import {Form,Header} from '../components';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from './../context/auth-context';

export default function UpdatePassword() {
    const history = useHistory();
    const [emailAddress, setEmailAddress] = useState('');
    const [oldpassword, setOldPassword] = useState('');
    const [newpassword, setNewPassword] = useState('');
    const [newpasswordcon, setNewPasswordCon] = useState('');
    const [error, setError] = useState('');
    const auth = useContext(AuthContext); //auth context

    const isInvalid = oldpassword === '' || newpassword === '' || newpasswordcon === '';
  
    const handleUpdatePassword = async event => {
        event.preventDefault();
        
        //send data to backend
        try{
            console.log(oldpassword,newpassword,newpasswordcon);
            const response = await fetch(`${API_BASE_URL}/api/users/updatepassword`, {
            method: 'PATCH',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                  EMAIL: auth.email,
                  OLD_PASS : oldpassword,
                  NEW_PASS : newpassword ,
                  NEW_PASS_CON : newpasswordcon
            })
            });

            const responseData = await response.json();
            
            console.log(responseData);

            if (response.status === 201){
                history.push( ROUTES.BROWSE);
                  
            } else if (response.status === 422){
                setError('Incorrect password');
            } else if (response.status === 423){
                setError('New Password Don\'t Match!');
            }

        } catch(err) {
            console.log(err)
            console.log('Sending data to the backend failed');
            setError(err.message);
        }
        

        
    };
  
    return (
      <>
        <Header >
         <Header.Frame  >
            <Header.Logo  to={ROUTES.BROWSE} src={logo} alt="Netflix" />
            <Header.ButtonLink onClick = {() => auth.logout()}>
                Sign Out
            </Header.ButtonLink>
        </Header.Frame>
      </Header>
          <Form>
            <Form.Title>Update Password</Form.Title>
            {error && <Form.Error data-testid="error">{error}</Form.Error>}
  
            <Form.Base onSubmit={handleUpdatePassword} method="PATCH">
              
              <Form.Input
                type="password"
                value={oldpassword}
                placeholder="Old Password"
                onChange={({ target }) => setOldPassword(target.value)}
              />

                <Form.Input
                type="password"
                value={newpassword}
                placeholder="New Password"
                onChange={({ target }) => setNewPassword(target.value)}
              />

                <Form.Input
                type="password"
                value={newpasswordcon}
                placeholder="Confirm New Password"
                onChange={({ target }) => setNewPasswordCon(target.value)}
              />

              <Form.Submit disabled={isInvalid} type="submit" data-testid="update-pw">
                Update
              </Form.Submit>
            </Form.Base>
  
          </Form>
        
        <FooterContainer />
      </>
    );
  }

