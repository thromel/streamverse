import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { SelectProfileContainer } from '../containers/profiles';
import { AuthContext } from '../context/auth-context';
import * as ROUTES from '../constants/routes';

export default function Profiles({ email }) {
  const auth = useContext(AuthContext);
  const history = useHistory();
  const userEmail = email || auth.email;

  const setProfile = () => {
    history.push(ROUTES.BROWSE);
  };

  return (
    <SelectProfileContainer
      email={userEmail}
      setProfile={setProfile}
      setCategory={() => {}}
    />
  );
}
