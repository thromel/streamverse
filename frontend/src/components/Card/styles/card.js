import styled from 'styled-components';

export const Title = styled.p`
  font-size: 24px;
  color: #e5e5e5;
  font-weight: bold;
  margin-left: 56px;
  margin-right: 56px;
  margin-top: 0;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 50px;
  box-sizing: border-box;
  > ${Title} {
    @media (max-width: 1000px) {
      margin-left: 30px;
    }
  }
  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const Group = styled.div`
  display: flex;
  flex-direction: ${({ flexDirection }) => (flexDirection === 'row' ? 'row' : 'column')};
  ${({ alignItems }) => alignItems && `align-items: ${alignItems}`};
  ${({ margin }) => margin && `margin: ${margin}`};
  > ${Container}:first-of-type {
    @media (min-width: 1100px) {
      margin-top: 0px;
    }
  }
`;

export const SubTitle = styled.p`
  font-size: 12px;
  color: #fff;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 0;
  user-select: none;
  display: none;
`;

export const Text = styled.p`
  margin-top: 5px;
  font-size: 10px;
  color: #fff;
  margin-bottom: 0;
  user-select: none;
  display: none;
  line-height: normal;
`;

export const Entities = styled.div`
  display: flex;
  flex-direction: row;
  overflow-x: scroll; //testing

//   ::-webkit-scrollbar {
//     width: 50px;
// }
 
// ::-webkit-scrollbar-track {
//     -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); 
//     border-radius: 10px;
// }
 
// ::-webkit-scrollbar-thumb {
//     border-radius: 10px;
//     -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5); 
// }

::-webkit-scrollbar {
  width: 0px;  /* Remove scrollbar space */
  background: transparent;  /* Optional: just make scrollbar invisible */
}
/* Optional: show position indicator in red */
::-webkit-scrollbar-thumb {
  background: #160501;
}
`;

export const Meta = styled.div`
  display: none;
  position: absolute;
  bottom: 0;
  padding: 10px;
  background-color: #0000008f;
`;

export const Image = styled.img`
  border: 0;
  width: 100%;
  max-width: 150px;
  min-width: 150px;
  cursor: pointer;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
`;

export const Item = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap : wrap;
  margin-right: 5px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  // overflow: scroll; //test
  // position: absolute;
  // left: 0;
  // overflow-x: scroll;
  // overflow-y: hidden;
  // padding-right: 150px;
  &:hover {
    transform: scale(1.3);
    z-index: 99;
  }
  @media (min-width: 1200px) {
    &:hover ${Meta}, &:hover ${Text}, &:hover ${SubTitle} {
      display: block;
      z-index: 100;
    }
  }
  &:first-of-type {
    margin-left: 56px;
    @media (max-width: 1000px) {
      margin-left: 30px;
    }
  }
  &:last-of-type {
    margin-right: 56px;
    @media (max-width: 1000px) {
      margin-right: 30px;
    }
  }

  ::-webkit-scrollbar {display:none;}
`;

export const FeatureText = styled.p`
  font-size: 18px;
  color: white;
  font-weight: ${({ fontWeight }) => (fontWeight === 'bold' ? 'bold' : 'normal')};
  margin: 0;
  @media (max-width: 600px) {
    line-height: 22px;
  }
  &:hover {
    font-weight: bold;
  }
`;

export const Feature = styled.div`
  display: flex;
  flex-direction: row;
  background: url(${({ src }) => src});
  background-size: contain;
  position: relative;
  height: 560px;
  max-height: 900px;
  background-position-x: right;
  background-repeat: no-repeat;
  background-color: black;
  @media (max-width: 1000px) {
    height: auto;
    background-size: auto;
    ${Title} {
      font-size: 20px;
      line-height: 20px;
      margin-bottom: 10px;
    }
    ${FeatureText} {
      font-size: 14px;
    }
  }
`;

export const FeatureTitle = styled(Title)`
  margin-left: 0;
`;

export const FeatureClose = styled.button`
  color: white;
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
  background-color: transparent;
  border: 0;
  img {
    filter: brightness(0) invert(1);
    width: 24px;
  }
`;

export const Content = styled.div`
  margin: 56px;
  max-width: 500px;
  line-height: normal;
  @media (max-width: 1000px) {
    margin: 30px;
    max-width: none;
  }
`;


export const Maturity = styled.div`
  background-color: ${({ rating }) => (rating >= 15 ? 'red' : 'green')};
  border-radius: 15px;
  width: 20px;
  padding: 5px;
  text-align: center;
  color: white;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin-right: 10px;
  font-size: 12px;
`;

export const WatchList = styled.button`
  background-color: #000000;
  border-color: #000000;
  position: absolute;
  right : 390px;
  top: 50px;
  width: 75px;
  height: 145px;
  text-transform: uppercase;
  font-weight: bold;
  color: white;
  font-size: 18px;
  height: 45px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 0;

  &:hover {
    transform: scale(1.05);
    background-color: #ff0a16;
  }
`;

export const Rating = styled.button`
  background-color: #000000;
  border-color: #000000;
  position: absolute;
  right : 575px;
  top: 50px;
  width: 75px;
  height: 145px;
  text-transform: uppercase;
  font-weight: bold;
  color: white;
  font-size: 18px;
  height: 45px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 0;

  &:hover {
    transform: scale(1.05);
    background-color: #ff0a16;
  }
`;

export const Episodes = styled.button`
background-color: #e50914;
border-color: #ff0a16;
width: 135px;
height: 45px;
text-transform: uppercase;
font-weight: bold;
color: white;
font-size: 18px;
height: 45px;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
padding-left: 0;

&:hover {
  transform: scale(1.05);
  background-color: #ff0a16;
}
`;


