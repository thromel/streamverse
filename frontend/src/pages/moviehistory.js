import API_BASE_URL from '../config';
import React, {useState, useEffect,useContext}from 'react';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from '../context/auth-context';
import { Header, Profiles,Header2} from '../components';
import logo from '../logo.svg';
import {FooterContainer} from '../containers/footer';

export default function MovieHistory() {
    const history = useHistory();
    const auth = useContext(AuthContext);
    const [movies,setMovies] = useState([]);
    const [error,setError] = useState('');
    const email = auth.email;
    const prof_id = auth.profile;
    
    async function fetchFromAPI (){
        
        const url = `${API_BASE_URL}/api/users/getmoviehistory/${email}`;
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
        <Profiles.Title>Movie Watch History</Profiles.Title>
        
        

                {movies.map((name,index)=>{
                return (
                    <>
                    <Header2.Text >{name.TITLE}</Header2.Text>
                    <Header.Frame2>
                            <Header.Text>Watched By</Header.Text>
                            <Header2.Text>{name.PID}</Header2.Text>
                            
                    </Header.Frame2>
                    <Header.Frame2>
                            <Header.Text>Rating</Header.Text>
                            <Header2.Text>{name.RATING}</Header2.Text>
                            
                    </Header.Frame2>
                    <Header.Frame2>
                            <Header.Text>Watched Upto</Header.Text>
                            <Header2.Text>{name.WATCHED_UPTO} </Header2.Text>
                           
                    </Header.Frame2>
                    <Header.Frame2>
                            <Header.Text>Date-Time</Header.Text>
                            <Header2.Text>{name.TIME}</Header2.Text>
                    </Header.Frame2>
                    <hr></hr>
                    </>
                )
                })}

        <FooterContainer/>
    </>
  );
}

/*

    {movies.map((name,index)=>{
            return (
                <>
                  <Header.Frame>
                  <Header.Frame className="container">
                      <Header.Frame className="col-12" >
                          <Header.Text  >{name}</Header.Text>
                      </Header.Frame>
                      <Header.Frame className="col-12 ">
                          <Header.Text>{name}</Header.Text>
                      </Header.Frame>
                      <Header.Frame className="col-12">
                          <Header.Text>{name}</Header.Text>
                      </Header.Frame>
                      <Header.Frame className="col-12">
                          <Header.Text>{name}</Header.Text>
                      </Header.Frame>
                  </Header.Frame>
                  </Header.Frame>

                </>
            )
            })}

            */

            /*
<Header.Frame2>
                <Header.Frame className="container">
                    <Header.Frame className="col-12" >
                    <Header2.Text  >Movie</Header2.Text>
                    </Header.Frame>
                    <Header.Frame className="col-12">
                        <Header2.Text>Rating</Header2.Text>
                    </Header.Frame>
                    <Header.Frame className="col-12 ">
                        <Header2.Text>Watched Upto</Header2.Text>
                    </Header.Frame>
                    <Header.Frame className="col-12">
                        <Header2.Text>Time</Header2.Text>
                    </Header.Frame>
                </Header.Frame>
            </Header.Frame2>
            */