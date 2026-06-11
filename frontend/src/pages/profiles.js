import API_BASE_URL from '../config';
// import React, { Component } from 'react';
// import {Header,Profiles} from '../components';
// import * as ROUTES from '../constants/routes';
// import logo from '../logo.svg';
// import {Form} from '../components';


// export default class UserProfiles extends Component{

//     constructor(props){
//         super(props);
//         console.log(props);
//         this.state = {
//             email : props.email,
//             profiles : []
//         };
//     }
    
//     async componentDidMount(){
//         const url = `${API_BASE_URL}/api/profiles/${this.state.email}`;
//         const response = await fetch(url);
//         const data = await response.json();
//         console.log(data.profile);
//         this.setState( {profiles:data.profile});
//         console.log('eibar = ',this.state.profiles);
//     }


//     render(){

//         const names = this.state.profiles.map((name,index)=>{
//             return (
//                     <Profiles>
//                         <Form.Link to ="/browse">
//                             <Profiles.Name >{name.PROFILE_ID}</Profiles.Name>
//                             <Profiles.Picture src={index+1}/>
//                         </Form.Link>
//                     </Profiles>
//             )
//         });
        
//         return (
//             <>
//                 <Header bg={false}>
//                     <Header.Frame>
//                         <Header.Logo to={ROUTES.HOME} src={logo} alt="Netflix"/>
//                         <Header.ButtonLink to={ROUTES.CREATE_PROFILE}>Create Profile</Header.ButtonLink>
//                     </Header.Frame>
//                 </Header>

//                 <Profiles>
//                     <Profiles.Title>Who's watching?</Profiles.Title>
//                     {names}
//                 </Profiles>
//             </>
//         );
    
//     }
// }