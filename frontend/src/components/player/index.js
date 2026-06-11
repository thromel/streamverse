import API_BASE_URL from 'config';
import React, { useState, useContext, createContext } from 'react';
import ReactDOM from 'react-dom';
import { Container, Button, Overlay, Inner, Close } from './styles/player';
import VideoPlayer from 'react-video-js-player';
import ReactPlayer from 'react-player';
import {AuthContext} from './../../context/auth-context';
export const PlayerContext = createContext();

export default function Player({ children, ...restProps }) {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <PlayerContext.Provider value={{ showPlayer, setShowPlayer }}>
      <Container {...restProps}>{children}</Container>
    </PlayerContext.Provider>
  );
}

Player.Video = function PlayerVideo({ src, itemFeature, ...restProps }) {
  const { showPlayer, setShowPlayer } = useContext(PlayerContext);
  const ref = React.createRef();
  const auth = useContext(AuthContext);

  async function saveTime (event){
    console.log('Paused');
    const time = ref.current.getCurrentTime();
    
    const response = await fetch(`${API_BASE_URL}/api/profiles/time/set`, {
        method: 'POST',
        headers: {
              'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          email: auth.email,
          profile_id : auth.profile,
          movie_id: itemFeature.MOVIE_ID,
          show_id : itemFeature.SHOW_ID,
          watched_upto : time,
          episode_no : itemFeature.EPISODE_NO,
          season_no : itemFeature.SEASON_NO
        })
    });


    const responseData = await response.json();
    console.log(responseData);
    
  }

  async function getTime (event){
    let response;
    try{
      if (itemFeature.MOVIE_ID) response = await fetch(`${API_BASE_URL}/api/profiles/time/get/?email=${auth.email}&profile_id=${auth.profile}&movie_id=${itemFeature.MOVIE_ID}`);
      else if (itemFeature.SHOW_ID) response = await fetch(`${API_BASE_URL}/api/profiles/time/get/?email=${auth.email}&profile_id=${auth.profile}&show_id=${itemFeature.SHOW_ID}&episode_no=${itemFeature.EPISODE_NO}&season_no=${itemFeature.SEASON_NO}`);
      const responseData = await response.json();
      if (response.status === 200) ref.current.seekTo(responseData.WATCHED_UPTO, 'seconds');
    } catch(err){
      console.log(err);
    }
    
    
    
  }

  return showPlayer
    ? ReactDOM.createPortal(
        <Overlay onClick={() => setShowPlayer(false)} data-testid="player">
          <Inner>
            <ReactPlayer
            ref = {ref} 
            controls
            url = {itemFeature.VIDEO_URL ? itemFeature.VIDEO_URL : 'http://srv2.cinehub24.com/07%2F27618-38899-IMDB-Top-250-%231-The-Shawshank-Redemption-%5B1994%5D-%5B9.3-rating%5D.MP4'}
            onPause = {event => saveTime(event)}
            onPlay = {event => getTime(event)}/>
            <Close />
          </Inner>
        </Overlay>,
        document.body
      )
    : null;
};

Player.Button = function PlayerButton({ ...restProps }) {
  const { showPlayer, setShowPlayer } = useContext(PlayerContext);

  return (
    <Button onClick={() => setShowPlayer((showPlayer) => !showPlayer)} {...restProps}>
      Play
    </Button>
  );
};
