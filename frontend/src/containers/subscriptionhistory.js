import API_BASE_URL from '../config';
import React, {useState, useEffect,useContext}from 'react';
import { Header, Profiles,Header2 } from '../components';
import * as ROUTES from '../constants/routes';
import logo from '../logo.svg';
import {AuthContext} from './../context/auth-context';
export function SubscriptionHistoryContainer({ email}) {
    const auth = useContext(AuthContext);
    const [subs, setSubs] = useState([]);
    //console.log(email);
    async function fetchFromAPI (){
        
        const url = `${API_BASE_URL}/api/subscription/history/${email}`;
        const response = await fetch(url);
        var data = await response.json();
        var temp;
        console.log(data.history);
        temp =data.history;
        console.log(temp);
        setSubs(data.history);
        console.log(subs);
        console.log(typeof subs);
    }
    
    
    
    useEffect ( () => {
        fetchFromAPI();
    }, []);

  
    return (
    <>
      <Header bg={false}>
        <Header.Frame>
          <Header.Logo to={ROUTES.BROWSE} src={logo} alt="Netflix" />
          <Header.ButtonLink onClick = {() => auth.logout()}>
                Sign Out
        </Header.ButtonLink>
        </Header.Frame>
      </Header>
      
      <Profiles.Title>Payment History</Profiles.Title>
      
      <Header.Frame >
            <Header.Frame className="container">
                <Header.Frame className="col-12" >
                <Header2.Text  >Start Date</Header2.Text>
                </Header.Frame>
                <Header.Frame className="col-12">
                    <Header2.Text>End Date</Header2.Text>
                </Header.Frame>
                <Header.Frame className="col-12 ">
                    <Header2.Text>Plan Type</Header2.Text>
                </Header.Frame>
                <Header.Frame className="col-12">
                    <Header2.Text>Total Bill</Header2.Text>
                </Header.Frame>
              </Header.Frame>
        </Header.Frame>
        
      
      
        
        
            {subs.map((name,index)=>{
            return (
                <>
                  <Header.Frame>
                  <Header.Frame className="container">
                      <Header.Frame className="col-12" >
                          <Header.Text  >{name.S_DATE}</Header.Text>
                      </Header.Frame>
                      <Header.Frame className="col-12 ">
                          <Header.Text>{name.T_DATE}</Header.Text>
                      </Header.Frame>
                      <Header.Frame className="col-12">
                          <Header.Text>{name.SUB_TYPE}</Header.Text>
                      </Header.Frame>
                      <Header.Frame className="col-12">
                          <Header.Text>{name.TOTAL_BILL+" Dollars"}</Header.Text>
                      </Header.Frame>
                  </Header.Frame>
                  </Header.Frame>

                </>
            )
            })}
        
      
      
    </>
  );
}