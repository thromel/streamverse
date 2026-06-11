import API_BASE_URL from '../config';
import React, {useState, useContext} from 'react';
import {Form} from '../components';
import { JumbotronContainer } from '../containers/jumbotron';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from './../context/auth-context';

export default function CreateProfile() {
    const history = useHistory();
    const auth = useContext(AuthContext);

    const [name,setName] = useState('');
    const [dob,setDOB] = useState('');
    const [error,setError] = useState('');
    
    const isInvalid = name ==='' || dob==="" ;
    const email = auth.email;
    
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];


    const handleCreateProfile = async event =>{
        event.preventDefault();

        //send data to the backend
        try{

            const response = await fetch(`${API_BASE_URL}/api/profiles/add`, {
            method: 'POST',
            headers: {
                  'Content-Type' : 'application/json',
            },
            body: JSON.stringify({
                    EMAIL : email,
                    PROFILE_ID : name,
                    DOB : dob 
            })
            });
            
            const responseData = await response.json();
            
            console.log(responseData);

            if (response.status === 201){
                history.push(ROUTES.BROWSE); //Successful creation, moves to profiles page

                //TODO: add GET request to get user's profiles + auth token
            } else if (response.status === 400){
                setError('Invalid profile info');
            } else if (response.status === 423){
                setError('Profile already exists');
            }

        }catch(err){
            console.log(err);
            console.log("Sending data to backend failed while creating profile");
            setError(err.message);
        }
    }


    return (
            <Form>
                <Form.Title>Add Profile</Form.Title>
                    {error && <Form.Error data-testid="error">{error}</Form.Error>}
                <Form.Base onSubmit={handleCreateProfile} method="POST" >
                    
                    <Form.Input placeholder="Name" value={name} onChange={({target})=> setName(target.value) } />
                    
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
                    
                    <input type="date" id="date" ></input>
                    </form>
                    
                    <Form.Input onfocus="(this.type='date')" placeholder="Date Of Birth (DD-MON-YYYY)" value={dob} onChange={({target})=> setDOB(target.value) } />

                    <Form.Submit disabled={isInvalid} type="submit" data-testid="create-profile">
                        Add Profile
                    </Form.Submit>
                </Form.Base>
            </Form>
        
    );
}