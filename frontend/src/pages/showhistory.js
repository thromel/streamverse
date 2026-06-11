import API_BASE_URL from '../config';
import React, {useState, useEffect,useContext}from 'react';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from '../context/auth-context';
import { Header, Profiles,Header2 } from '../components';
import logo from '../logo.svg';
import {FooterContainer} from '../containers/footer';

export default function ShowHistory() {
    const history = useHistory();
    const auth = useContext(AuthContext);
    const [movies,setMovies] = useState([]);
    const [error,setError] = useState('');
    const email = auth.email;
    const prof_id = auth.profile;
    
    async function fetchFromAPI (){
        
        const url = `${API_BASE_URL}/api/users/getshowhistory/${email}`;
        const response = await fetch(url);
        const data = await response.json();
        //console.log(data.history);
        setMovies(data.history);
     }
    
    useEffect ( () => {
        fetchFromAPI();
    }, []);



    
  
    return ( 
      <>
   
         <Header.Frame  >
            <Header.Logo  to={ROUTES.HOME} src={logo} alt="Netflix" />
            <Header.ButtonLink onClick = {() => auth.logout()}>
                Sign Out
            </Header.ButtonLink>
        </Header.Frame>
        <Profiles.Title>Show Watch History</Profiles.Title>
        
        

                {movies.map((name,index)=>{
                return (
                    <>
                    <Header2.Text >{name.TITLE}</Header2.Text>
                    <Header.Frame2>
                            <Header.Text>Watched By</Header.Text>
                            <Header2.Text>{name.PID}</Header2.Text>        
                    </Header.Frame2>
                    <Header.Frame2>
                            <Header.Text>Season</Header.Text>
                            <Header2.Text>{name.SEASON_NO}</Header2.Text>        
                    </Header.Frame2>
                    <Header.Frame2>
                            <Header.Text>Episode</Header.Text>
                            <Header2.Text>{name.EPISODE_NO} </Header2.Text>
                           
                    </Header.Frame2>
                    <Header.Frame2>
                            <Header.Text>Rating</Header.Text>
                            <Header2.Text>{name.RATING} </Header2.Text>
                           
                    </Header.Frame2>
                    <Header.Frame2>
                            <Header.Text>Watched Upto</Header.Text>
                            <Header2.Text>{name.WATCHED_UPTO} </Header2.Text>
                           
                    </Header.Frame2>
                    <Header.Frame2>
                            <Header.Text>Date-Time</Header.Text>
                            <Header2.Text>{name.TIME}</Header2.Text>
                            
                    </Header.Frame2><hr></hr>
                    </>
                )
                })}

        <FooterContainer/>
    </>
  );
}
