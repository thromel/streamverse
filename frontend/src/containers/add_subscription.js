import API_BASE_URL from '../config';
import React, {useState, useEffect,useContext}from 'react';
import {Form,Header } from '../components';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {FooterContainer} from './footer';
import {AuthContext} from './../context/auth-context';
import logo from '../logo.svg';

export function AddSubscriptionContainer({ Email }) {
    const history = useHistory();
    const auth = useContext(AuthContext);
    const [expire_date,set_expire_date] = useState('');
    const[sub_type,set_sub_type] = useState('');
    const [error,setError] = useState('');
    const email = auth.email;
    const [Plans,setPlans] = useState([]);
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    const isInvalid =   expire_date==="" || sub_type==="" ;
    
    var mp;
    async function fetchFromAPI (){
        console.log('Hello!');
        
        const url = `${API_BASE_URL}/api/subscription/plans`;
        const response = await fetch(url);
        const data = await response.json();
    
        console.log(data);
        setPlans(data.plans);
        console.log(Plans);
    }
    
    useEffect ( () => {
        fetchFromAPI();
    }, []);

    const SetType = (value)=>{
        if(value==="BASIC"){
            set_sub_type("BAS");
        }
        else if(value==="STANDARD"){
            set_sub_type("STA");
        }
        else{
            set_sub_type("PRE");
        }
    }

    const PlanList =  Plans.map((Plan)=>{
        return (
            <form onClick={ ({target})=> SetType(target.value)}>
                
                <input type="radio" name="sub_type" value={Plan.SUB_TYPE} id="basic"/><label htmlFor="basic" style={{color: "white"}}>   {Plan.SUB_TYPE+" , Maximum "+Plan.NUM_PROFILES+" Profiles , Monthly Bill "+Plan.BILL+"$"} </label>
                <br></br><br></br>
                
            </form>
        );
    })

    const handleSubscription = async event =>{
        event.preventDefault();

        //send data to the backend
        try{
            const response = await fetch(`${API_BASE_URL}/api/subscription/add`, {
            method: 'POST',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                    SUB_TYPE : sub_type, 
                    EMAIL : email,
                    END_DATE : expire_date
                })
            });

            console.log(sub_type);
            console.log(expire_date);
            if(sub_type=="BAS"){
                auth.set_max_profiles(2);
                auth.set_bill(5);mp=2;
            }else if(sub_type=="STA"){
                auth.set_max_profiles(4);
                auth.set_bill(8);mp=4;
            }else{
                auth.set_max_profiles(6);
                auth.set_bill(10);mp=6;
            }
            const responseData = await response.json();
            
            console.log("after submit data in subscribe",responseData);

            if (response.status === 201){
                const url = `${API_BASE_URL}/api/subscription/subid/${email}`;
                const response = await fetch(url);
                var data = await response.json();
                data = data["sub_id"]["SUB_ID"];
                //adding sub_id to auth context
                auth.set_sub_id(data);

                const np = auth.num_profiles; 
                if(np>mp){
                    auth.set_ptbd(np-mp);
                    history.push(ROUTES.DELETE_PROFILE);
                }else{
                    history.push(ROUTES.BROWSE); //Successful subscription, moves to netflix browse page
                }
            } else if (response.status === 422){
                setError('Invalid user info');
            } else if (response.status === 423){
                setError('User already exists');
            }

        }catch(err){
            console.log(err);
            console.log("Sending data to backend failed while subscribing");
            setError("Invalid Expire Date");
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
                <Form.Title>Add Subscription</Form.Title>
                {error && <Form.Error data-testid="error">{error}</Form.Error>}
                <Form.Base onSubmit={handleSubscription} method="POST">
                

                
                <form onSelect={({target})=> {
                    var date = new Date(target.value);
                    var day = date.getDate();
                    var month = date.getMonth();
                    month = months[month];
                    var year=date.getFullYear();
                    var s=[day,month,year].join('-');
                    console.log('Final date=',s);
                    set_expire_date(s);
                } }>

                    <label htmlFor="date"  style={{color: "white"}}>Expire Date </label>
                    
                    <input type="date" id="date" ></input>
                
                </form>

                <Form.Text>Choose your plane</Form.Text>
                
            
                
                {PlanList}

                <Form.Submit disabled={isInvalid} type="submit" data-testid="add-subscription">
                    Start Membership
                </Form.Submit>
                </Form.Base>
            </Form>

        <FooterContainer/>
    </>
  );
}