import API_BASE_URL from '../config';
import React, {useState, useEffect,useContext}from 'react';
import { Header, Profiles } from '../components';
import * as ROUTES from '../constants/routes';
import logo from '../logo.svg';
import {AuthContext} from './../context/auth-context';

export function SelectProfileContainer({ email, setProfile, setCategory }) {
    const [profiles, setProfiles] = useState([]);
    const auth = useContext(AuthContext);
    const mp=auth.max_profiles;

    async function fetchFromAPI (){
        console.log('Hello!');
        
        const url = `${API_BASE_URL}/api/profiles/${email}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        console.log(profiles);

        setProfiles(data.profile);
        console.log(profiles);

        auth.set_num_profiles(data.profile.length);
        
    }
    
    useEffect ( () => {
        fetchFromAPI();
    }, []);
  
    return ( 
      <>
        <Header bg={false}>
          <Header.Frame>
            <Header.Logo to={ROUTES.HOME} src={logo} alt="Netflix" />
            {profiles.length<auth.max_profiles?<Header.ButtonLink to={ROUTES.CREATE_PROFILE}>Create Profile</Header.ButtonLink>:<><Header.ButtonLink onClick = {() => auth.logout()}>
                Log Out
        </Header.ButtonLink></>}
         
          </Header.Frame>
        </Header>

        <Profiles>
          <Profiles.Title>Who's watching?</Profiles.Title>
          <Profiles.List>
              {profiles.map((name,index)=>{
              return (
                  <Profiles.User onClick = { (event) => {setProfile (name); setCategory('films'); }}>
                      <Profiles.Name >{name.PROFILE_ID}</Profiles.Name>
                      <Profiles.Picture src={index+1}/>
                  </Profiles.User>
              )
              })}
          </Profiles.List>
        </Profiles>
      </>
    
  );
}