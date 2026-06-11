import API_BASE_URL from '../config';
import React, {useState, useContext} from 'react';
import {HeaderContainer} from '../containers/header';
import {FooterContainer} from '../containers/footer';
import {Form} from '../components';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import { CountryDropdown, CountryRegionData} from 'react-country-region-selector';
import {AuthContext} from './../context/auth-context';

export default function Signup(){
    const history = useHistory();
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [dob,setDOB] = useState('');
    const [country_id,setCountryId] = useState('');
    const [creditcard,setCreditCard] = useState('');
    const [password,setPassword] = useState('');
    const [phone,setPhone] = useState('');
    const [error,setError] = useState('');
    const auth = useContext(AuthContext);
    
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    const isInvalid = name ==='' || email ==='' || dob==="" || password===''|| creditcard==='' || phone==='';   
    const handleSignup = async event =>{
        if(password.length<8){
            setError('Password should be at least 8 characters long');
        }
        event.preventDefault();
        //send data to the backend
        try{
            const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
            method: 'POST',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                    NAME : name,
                    EMAIL : email,
                    DOB : dob ,
                    COUNTRY : country_id,
                    CREDIT_CARD : creditcard,
                    PASSWORD : password,
                    PHONE : phone
                })
            });
            
            const responseData = await response.json();
            
            console.log(responseData);

            if (response.status === 201){
                auth.login(email, responseData.token);
                history.push(ROUTES.ADD_SUBSCRIPTION); //Successful signup, moves to netflix subscripption page

                //TODO: add GET request to get user's profiles + auth token
            } else if (response.status === 422){
                setError('Invalid user info');
            } else if (response.status === 423){
                setError('User already exists');
            }

        }catch(err){
            console.log(err);
            console.log("Sending data to backend failed while signing up");
            // setName('');
            // setEmail('');
            // setPassword('');
            // setPhone('');
            // setCreditCard('');
            // setDOB('');
            // setCountryId('');
            setError(err.message);
        }
    }
    


    return (
        <>
        <HeaderContainer>
            <Form>
                <Form.Title>Sign Up</Form.Title>
                {error && <Form.Error data-testid="error">{error}</Form.Error>}
                <Form.Base onSubmit={handleSignup} method="POST">

                    <Form.Input placeholder="Name" value={name} onChange={({target})=> setName(target.value) } />

                    <Form.Input placeholder="Email" value={email} onChange={({target})=> setEmail(target.value) } />

                    <Form.Input type="password" min="8" autoComplete="off" placeholder="Password" value={password} onChange={({target})=> setPassword(target.value) } />
                    
                    <form onSelect={({target})=> {
                    var date = new Date(target.value);
                    var day = date.getDate();
                    var month = date.getMonth();
                    month = months[month];
                    var year=date.getFullYear();
                    var s=[day,month,year].join('-');
                    console.log('Final date=',s);
                    setDOB(s);
                    } }>

                        
                    <label htmlFor="date"  style={{color: "white"}}>Date of Birth  </label>
                    
                    <input type="date" id="date" style = {{background: '#333333', color: 'white', height: '50px', bottom: '10px'}}></input>
                    </form>
                    
                    <Form.Input onfocus="(this.type='date')" placeholder="Date Of Birth (DD-MON-YYYY)" value={dob} onChange={({target})=> setDOB(target.value) } />
                    
                    <Form.Input  placeholder="Credit Card No." value={creditcard} onChange={({target})=> setCreditCard(target.value) } />
                    
                    <Form.Input  placeholder="Phone Number." value={phone} onChange={({target})=> setPhone(target.value) } />
    
                    <CountryDropdown value="country" style = {{
                            background: '#333333',
                            color : 'white',
                            height : '60px',
                            bottom: '10px',
                            padding: ''
                            }
                        }
                    onChange={(val) => setCountryId(val) } />
                                    
                    <Form.Input   placeholder="Country" value={country_id} onChange={({target})=> setCountryId(target.value) } />

                    <Form.Submit disabled={isInvalid} type="submit" data-testid="sign-up">
                        Sign Up
                    </Form.Submit>
                </Form.Base>

                <Form.Text>
                    Already a user? <Form.Link to ="/signin">Sign in now</Form.Link>
                </Form.Text>
            </Form>
        </HeaderContainer>  
        <FooterContainer/>
        </>
    );
}

/*
<Form.Input onfocus="(this.type='date')" placeholder="Date Of Birth (DD-MON-YYYY)" value={dob} onChange={({target})=> setDOB(target.value) } />
                    */