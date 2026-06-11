import API_BASE_URL from '../../config';
import React, { useState, useContext, createContext, useEffect } from 'react';
import {AuthContext} from '../../context/auth-context';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Player from './../player/index';

import {
  Container,
  Group,
  Title,
  SubTitle,
  Text,
  Feature,
  FeatureTitle,
  FeatureText,
  FeatureClose,
  Maturity,
  Content,
  Meta,
  Entities,
  Item,
  Image,
  WatchList,
  Rating,
  Episodes
} from './styles/card';

export const FeatureContext = createContext();

export default function Card({ children, ...restProps }) {
  const [showFeature, setShowFeature] = useState(false);
  const [itemFeature, setItemFeature] = useState({});

  return (
    <FeatureContext.Provider value={{ showFeature, setShowFeature, itemFeature, setItemFeature }}>
      <Container {...restProps}>{children}</Container>
    </FeatureContext.Provider>
  );
}

Card.Group = function CardGroup({ children, ...restProps }) {
  return <Group {...restProps}>{children}</Group>;
};

Card.Title = function CardTitle({ children, ...restProps }) {
  return <Title {...restProps}>{children}</Title>;
};

Card.SubTitle = function CardSubTitle({ children, ...restProps }) {
  return <SubTitle {...restProps}>{children}</SubTitle>;
};

Card.Text = function CardText({ children, ...restProps }) {
  return <Text {...restProps}>{children}</Text>;
};

Card.Entities = function CardEntities({ children, ...restProps }) {
  return <Entities {...restProps}>{children}</Entities>;
};

Card.Meta = function CardMeta({ children, ...restProps }) {
  return <Meta {...restProps}>{children}</Meta>;
};

Card.Item = function CardItem({ item, children, ...restProps }) {
  const { setShowFeature, setItemFeature } = useContext(FeatureContext);

  return (
    <Item
      onClick={() => {
        setItemFeature(item);
        setShowFeature(true);
      }}
      {...restProps}
    >
      {children}
    </Item>
  );
};

Card.Image = function CardImage({ ...restProps }) {
  return <Image {...restProps} />;
};

Card.WatchList = function CardWatchList ({children, ...restProps}){
  return <WatchList {...restProps}> {children} </WatchList>
}

Card.Rating = function CardRating ({children, ...restProps}){
  return <Rating {...restProps}> {children} </Rating>
}

Card.Episodes = function CardEpisodes ({children, ...restProps}){
  return <Episodes {...restProps}> {children} </Episodes>
}


Card.Feature = function CardFeature({ children, category, setCategory, setSlideRows, setSearchTerm,  ...restProps }) {
  const { showFeature, itemFeature, setShowFeature } = useContext(FeatureContext);
  const auth = useContext(AuthContext);
  const [inWatchList, setInWatchList] = useState(false);
  const [isRated, setIsRated] = useState(false);
  const [rating, setRating] = useState(-1);
  const [genres, setGenres] = useState([]);
  const [celebs, setCelebs] = useState([]);
  const [views, setViews] = useState(0);
  const [votes, setVotes] = useState(0);
  async function fetchWatchInfo(event){
    const body = JSON.stringify({
      EMAIL: auth.email,
      PROFILE_ID : auth.profile,
      MOVIE_ID: itemFeature.MOVIE_ID,
      SHOW_ID : itemFeature.SHOW_ID
    });

    // console.log(body);
      try {
        const response = await fetch(`${API_BASE_URL}/api/profiles/watchlist/find`, {
          method: 'POST',
          headers: {
                'Content-Type' : 'application/json',
          },
          body: body
      });
      const responseData = await response.json();
      console.log(responseData);

      if(responseData.message === 'YES') setInWatchList(true);
      else if (responseData.message === 'NO') setInWatchList(false);

      } catch (err){
        console.log(err);
      }

  }

  useEffect(() => {
    getGenre();
    fetchWatchInfo();
    getRating();
    getCeleb();
  }, [itemFeature, showFeature])

  

  async function postWatchInfo(event){
    const response = await fetch(`${API_BASE_URL}/api/profiles/watchlist/add`, {
        method: 'POST',
        headers: {
              'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          EMAIL: auth.email,
          PROFILE_ID : auth.profile,
          MOVIE_ID: itemFeature.MOVIE_ID,
          SHOW_ID : itemFeature.SHOW_ID
        })
    });
    console.log(response);
    setInWatchList(true);
  }

  async function ratingHandler (event, rating){
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/rating/add`, {
        method: 'POST',
        headers: {
              'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          EMAIL: auth.email,
          PROFILE_ID : auth.profile,
          MOVIE_ID: itemFeature.MOVIE_ID,
          SHOW_ID : itemFeature.SHOW_ID,
          RATING : rating
        })
    });
    setIsRated(true);
    setRating(rating);
    } catch(err){
      console.log(err);
    }
    
  }

  async function getRating(){
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/rating/find`, {
        method: 'POST',
        headers: {
              'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          EMAIL: auth.email,
          PROFILE_ID : auth.profile,
          MOVIE_ID: itemFeature.MOVIE_ID,
          SHOW_ID : itemFeature.SHOW_ID
        })
    });

    const responseData = await response.json();

    console.log(responseData);

    setRating(responseData.rating);
    if (rating === -1) setIsRated(false);
    else setIsRated(true);
    
    } catch (err){
      console.log(err);
    }
  }



  async function deleteFromWatchList (){
    const response = await fetch(`${API_BASE_URL}/api/profiles/watchlist/delete`, {
        method: 'DELETE',
        headers: {
              'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          EMAIL: auth.email,
          PROFILE_ID : auth.profile,
          MOVIE_ID: itemFeature.MOVIE_ID,
          SHOW_ID : itemFeature.SHOW_ID
        })
    });
    console.log(response.json());
    setInWatchList(false);
  }

  async function getEpisodes(){
    try{
      const response = await fetch(`${API_BASE_URL}/api/browse/show/episodes/?show_id=${itemFeature.SHOW_ID}&profile_id=${auth.profile}&email=${auth.email}`);
      const responseData = await response.json();
      setSlideRows(responseData);
    } catch(err){
      console.log(err);
    }
    
    
  }

  async function getGenre(){
    try {
      let response;
      if (itemFeature.MOVIE_ID ) response = await fetch(`${API_BASE_URL}/api/browse/genre/?movie_id=${itemFeature.MOVIE_ID}`);
      else if (itemFeature.SHOW_ID) response = await fetch(`${API_BASE_URL}/api/browse/genre/?show_id=${itemFeature.SHOW_ID}`);
      const responseData = await response.json();
     if (response.status === 200) {
       setGenres(responseData);
       setViews(responseData[0].TOTAL_VIEWS);
       setVotes(responseData[0].TOTAL_VOTES);
      }
    } catch(err){
      console.log(err);
    }
  }

  async function getCeleb (){
    try {
      let response;
      if (itemFeature.MOVIE_ID ) response = await fetch(`${API_BASE_URL}/api/browse/celeb/?movie_id=${itemFeature.MOVIE_ID}`);
      else if (itemFeature.SHOW_ID) response = await fetch(`${API_BASE_URL}/api/browse/celeb/?show_id=${itemFeature.SHOW_ID}`);
      const responseData = await response.json();
     if (response.status === 200) {
       setCelebs(responseData);
       
      }
     console.log(celebs)
    } catch(err){
      console.log(err);
    }
  }

  async function getSimilar(){
    try {
      let response;
      if (itemFeature.MOVIE_ID ) response = await fetch(`${API_BASE_URL}/api/browse/similar/?movie_id=${itemFeature.MOVIE_ID}`);
      else if (itemFeature.SHOW_ID) response = await fetch(`${API_BASE_URL}/api/browse/similar/?show_id=${itemFeature.SHOW_ID}`);
      const responseData = await response.json();
     if (response.status === 200) setSlideRows(responseData);
    } catch(err){
      console.log(err);
    }
  }

  function roundToTwo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
}

  


  return showFeature ? (
    <Feature {...restProps} src={`https://image.tmdb.org/t/p/w1280${itemFeature.IMAGE_URL}`}>
      <Content>
      
      {itemFeature.SHOW_ID && itemFeature.SEASON_NO && <Card.SubTitle> 
                      {'Season ' + itemFeature.SEASON_NO + ' Episode ' + itemFeature.EPISODE_NO}
                      </Card.SubTitle>}
       
        <FeatureTitle>{itemFeature.TITLE}</FeatureTitle>
       
       {itemFeature.RELEASE_DATE && <FeatureTitle> {itemFeature.RELEASE_DATE} </FeatureTitle>}
        
        <FeatureText>{itemFeature.DESCRIPTION}</FeatureText>
        
        
        {itemFeature.RATING && <FeatureText style = {{color: 'green', marginTop : '10px'}}> {'Rating: ' + roundToTwo(10*itemFeature.RATING) + '%'}</FeatureText>}
        {itemFeature.RATING && <FeatureText style = {{color: 'green', marginTop : '10px'}}> {'Total Votes: ' + votes}</FeatureText>}
        {itemFeature.RATING && <FeatureText style = {{color: 'green', marginTop : '10px'}}> {'Total Views: ' + views}</FeatureText>}

        <FeatureClose onClick={() => {setShowFeature(false); setIsRated(false); setRating(-1)}}>
          <img src="/images/icons/close.png" alt="Close" />
        </FeatureClose>
        
        <FeatureText style= {{color : 'blue', marginTop : '15px'}}> {'Genre: '}</FeatureText>
        {genres && <Group flexDirection = "row"> 
          {genres.map((item) => (
            <FeatureText style = {{marginRight : '20px'}} onClick = {event => {setSearchTerm(`all:genre:${item.NAME}`)}} >
              {item.NAME}
            </FeatureText>
          ))}
        </Group>}

        {celebs && celebs.length > 0 && <FeatureText style= {{color : 'blue', marginTop : '15px'}} > {'Cast: '}</FeatureText>}
        
        {celebs && <Group flexDirection = "row"> 
            {
              celebs.map((item) => (
                <FeatureText style = {{marginRight : '10px'}} onClick = {event => {setSearchTerm(`all:celeb:${item.NAME}`)}} >
              {item.NAME}
            </FeatureText>
              ))
            }
        </Group>
        }

        <Group margin="30px 0" flexDirection="row" alignItems="center">
        <Maturity rating={itemFeature.MATURITY_RATING}>{itemFeature.MATURITY_RATING}</Maturity>
          {!inWatchList && (!itemFeature.SEASON_NO) && <WatchList onClick = {e => postWatchInfo(e)}> 
              <AddIcon/>
          </WatchList>}
          {inWatchList && (!itemFeature.SEASON_NO) && <WatchList onClick = {deleteFromWatchList} >
            <ClearIcon/>
          </WatchList>}
          
          { (!isRated || rating === 0) && (!itemFeature.SEASON_NO) && 
            <Rating style = {{
            background : '#32a84c'
            }} onClick = {e => ratingHandler(e, 10)}>
            <ThumbUpIcon/>
          </Rating>
          }


          {(!isRated || rating === 10) && (!itemFeature.SEASON_NO) && <Rating style= {{
            right : '500px',
            background : '#c41212'
          }} onClick = {e => ratingHandler(e, 0)}>
            <ThumbDownIcon/>
          </Rating>
          }

          <WatchList style = {{right: '700px', width: '200px'}} onClick = 
          {event => setSearchTerm(itemFeature.MOVIE_ID ? `movie:sim:${itemFeature.TITLE}` : `show:sim:${itemFeature.TITLE}`)}>
             More Like This
              </WatchList>


        </Group>
        
        {itemFeature.SHOW_ID && !itemFeature.SEASON_NO && <Card.Episodes onClick = { (event) => {
                setCategory('episodes');
                getEpisodes();
                }}>
                  Episodes
            </Card.Episodes>}
            <Player>  
                  {(itemFeature.MOVIE_ID || (itemFeature.SHOW_ID && itemFeature.EPISODE_NO)) && <Player.Button/>}
                  <Player.Video src = "../../public/videos/bunny.mp4" itemFeature = {itemFeature}/>
            </Player>
        {children}
      </Content>
    </Feature>
  ) : null;
};