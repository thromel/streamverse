import API_BASE_URL from '../config';
import React, {useContext, useState} from 'react';
import {HeaderContainer} from '../containers/header';
import {FooterContainer} from '../containers/footer';
import {Form} from '../components';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from './../context/auth-context';

export default function SignIn() {
    const history = useHistory();
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = useContext(AuthContext); //auth context

    var valid_sub,subid,Bill;

    const isInvalid = password === '' || emailAddress === '';
  
    const handleSignin = async event => {
        event.preventDefault();
        
        //send data to backend
        try{
            const response = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                  EMAIL: emailAddress,
                PASSWORD : password
            })
            });

            const responseData = await response.json();
            
            console.log(responseData);

            if (response.status === 201){
                  auth.login(emailAddress, responseData.token); //updates the auth context
                  console.log(auth.email);
                  
                  //getting max_num of profiles of the user
                  const u = `${API_BASE_URL}/api/users/maxprofiles/${emailAddress}`;
                  const r = await fetch(u);
                  var d = await r.json();
                  d= d["mp"]["MAX_PROFILES"];
                  console.log("Maximum profiles ",d);
                  auth.set_max_profiles(d);

                  const u2 = `${API_BASE_URL}/api/users/numprofiles/${emailAddress}`;
                  const r2 = await fetch(u2);
                  var d2 = await r2.json();
                  var np=d2["C"].C;
                  auth.set_num_profiles(np);
                  console.log("Number of profiles profiles ",auth.num_profiles);
                  

                  //getting the sub id of the user
                  const url = `${API_BASE_URL}/api/subscription/subid/${emailAddress}`;
                  const response = await fetch(url);
                  var data = await response.json();
                  console.log(data);
                  if(data["sub_id"]){
        
                    subid = data["sub_id"]["SUB_ID"];
                    console.log(subid);
                    if(subid){
                        auth.set_sub_id(subid);//adding sub id to auth context

                        const url3 = `${API_BASE_URL}/api/subscription/bill/${subid}`;
                        const response3 = await fetch(url3);         
                        Bill = await response3.json(); 
                        Bill = Bill["bill"]["BILL"];
                        auth.set_bill(Bill);
                        
                        history.push( ROUTES.BROWSE);
                      
                    }else{
                      history.push( ROUTES.ADD_SUBSCRIPTION );
                    }
                  }else{
                    history.push( ROUTES.ADD_SUBSCRIPTION );
                  }
                  
                //history.push( ROUTES.ADD_SUBSCRIPTION ); //Successful login, moves to netflix profiles page
            } else if (response.status === 422){
                setError('User does not exist. Please sign up instead');
            } else if (response.status === 423){
                setError('Incorrect Password');
            }

        } catch(err) {
            console.log(err)
            console.log('Sending data to the backend failed');
            setEmailAddress('');
            setPassword('');
            setError(err.message);
        }
        

        
    };
  
    return (
      <>
        <HeaderContainer>
          <Form>
            <Form.Title>Sign In</Form.Title>
            {error && <Form.Error data-testid="error">{error}</Form.Error>}
  
            <Form.Base onSubmit={handleSignin} method="POST">
              <Form.Input
                placeholder="Email address"
                value={emailAddress}
                onChange={({ target }) => setEmailAddress(target.value)}
              />
              <Form.Input
                type="password"
                value={password}
                placeholder="Password"
                onChange={({ target }) => setPassword(target.value)}
              />
              <Form.Submit disabled={isInvalid} type="submit" data-testid="sign-in">
                Sign In
              </Form.Submit>
            </Form.Base>
  
            <Form.Text>
              New to Netflix? <Form.Link to="/signup">Sign up now.</Form.Link>
            </Form.Text>
          </Form>
        </HeaderContainer>
        <FooterContainer />
      </>
    );
  }


/*  if(subid){
    //add sub id to auth context
    auth.set_sub_id(sudid);
    const url2= `${API_BASE_URL}/api/subscription/isvalid/${subid}`;
    const response2 = await fetch(url);
    valid_sub = await response.json();
    valid_sub =  valid_sub["VALID"];
    console.log(valid_sub);
    if(valid_sub===0){
      history.push( ROUTES.ADD_SUBSCRIPTION );
    }
    else{
      history.push(ROUTES.BROWSE);
    }
  }else{
    history.push( ROUTES.ADD_SUBSCRIPTION );    
  }

*/

/*
if(data["sub_id"]){
        
                    subid = data["sub_id"]["SUB_ID"];
                    console.log(subid);
                    if(subid){
                      auth.set_sub_id(subid);//adding sub id to auth context
                      const url2= `${API_BASE_URL}/api/subscription/isvalid/${subid}`;
                      const response2 = await fetch(url2);
                      valid_sub = await response2.json();
                      valid_sub= valid_sub["VALID"];
                      if(valid_sub){

                        const url3 = `${API_BASE_URL}/api/subscription/bill/${subid}`;
                        const response3 = await fetch(url3);         
                        Bill = await response3.json(); 
                        Bill = Bill["bill"]["BILL"];
                        auth.set_bill(Bill);
                        
                        history.push( ROUTES.BROWSE);
                      }else{
                        history.push( ROUTES.ADD_SUBSCRIPTION );      
                      }
                    }else{
                      history.push( ROUTES.ADD_SUBSCRIPTION );
                    }
                  }else{
                    history.push( ROUTES.ADD_SUBSCRIPTION );
                  }
                  
                //history.push( ROUTES.ADD_SUBSCRIPTION ); //Successful login, moves to netflix profiles page
            } else if (response.status === 422){
                setError('User does not exist. Please sign up instead');
            } else if (response.status === 423){
                setError('Incorrect Password');
            }

            */