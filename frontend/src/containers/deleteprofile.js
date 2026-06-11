import API_BASE_URL from '../config';
import React, {useState, useEffect,useContext}from 'react';
import { Form, Header } from '../components';
import * as ROUTES from '../constants/routes';
import logo from '../logo.svg';
import {AuthContext} from './../context/auth-context';
import {useHistory} from 'react-router-dom';
import { SimpleDialog,Checkbox } from '@material-ui/core';


export function DeleteProfileContainer({ email }) {
    const auth = useContext(AuthContext);
    const [profiles, setProfiles] = useState([]);
    const [error,setError] = useState('');
    const history = useHistory();
    const [val,setval] = useState(0);
    
    const Email =auth.email;
    const mp =auth.max_profiles;
    var msg,prof_name;
    const np=auth.num_profiles;
    const pt=auth.ptbd;
    const isInvalid = !(val<pt);
    var p = Math.abs(mp-np);
    var del =[];
    if(pt){
        msg = "Click to Delete "+p+" Profiles";
    }else{
        msg = "Click to Delete Profiles";
    }
    async function fetchFromAPI (){
        console.log('Hello!');
        
        const url = `${API_BASE_URL}/api/profiles/${Email}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        console.log(profiles);

        setProfiles(data.profile);
        console.log(profiles);
    }

    useEffect ( () => {
        fetchFromAPI();
    }, []);

    const handleDeleteProfile = async event =>{
        
        try{
            const response = await fetch(`${API_BASE_URL}/api/profiles/delete`, {
            method: 'DELETE',
            headers: {
                    'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                    PROFILE_ID :prof_name,
                    EMAIL : Email
                })
            });
            
            const responseData = await response.json();
            
            console.log(responseData);
            if (response.status === 422){
                setError('Invalid user info');
            } else if (response.status === 423){
                setError('User already exists');
            }

        }catch(err){
            console.log(err);
            console.log("Sending data to backend failed while deleting");
            setError(err.message);
        }
    
}
    const handleDelete = ()=>{
        console.log("del length = "+del.length+" pt= "+pt);
       if(del.length<pt && pt){
            
            history.push(ROUTES.PROFILE_INFO);
       }else{
            for(let i=0;i<del.length;i++)
            {
                prof_name = del[i];
                console.log("deleting profile",prof_name);
                handleDeleteProfile();
            }
            auth.set_ptbd(0);
            history.push(ROUTES.BROWSE);
        }
    }

    const ProfileList =  profiles.map((profile)=>{
        return (
            <Header.Frame  >
                <form onClick={ ({target})=> del.push(target.value) }>
                
                <input type="radio" name="sub_type" value={profile.PROFILE_ID} id="radio"/><label htmlFor="radio" style={{color: "white",fontSize: 40,fontStyle:"oblique"}}>   {profile.PROFILE_ID}</label>
                </form>
            </Header.Frame>
        );
    })

    return (
    <>
      <Header bg={false}>
      <Header.Frame  >
            <Header.Logo  to={ROUTES.HOME} src={logo} alt="Netflix" />
            <Header.ButtonLink onClick = {() => auth.logout()}>
                Sign Out
        </Header.ButtonLink>
        </Header.Frame>
      </Header>
        <Form>
            <Form.Title>{msg}</Form.Title>
            
        <Form.Base onSubmit={handleDelete} method="DELETE">
        
       
            {ProfileList}

            <Form.Submit  type="submit" data-testid="delete">
            Proceed
            </Form.Submit>
        </Form.Base>
      </Form>
      
    </>
  );
}
