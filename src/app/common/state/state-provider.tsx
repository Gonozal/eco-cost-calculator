import React from 'react';
import { useImmerReducer } from 'use-immer';
import { Profiles, reducer, standardProfiles } from './state';

const ProfilesContext = React.createContext(standardProfiles);

export const useProfiles = () => React.useContext(ProfilesContext);
export const useActiveProfile = () => {
  const state = React.useContext(ProfilesContext);
  return state.profiles.get(state.activeProfile);
};

interface ProfilesProviderProps {
  initialState: Profiles;
}
export const ProfilesProvider: React.FC<ProfilesProviderProps> = ({
  children,
  initialState,
}) => {
  const [globalState, dispatch] = useImmerReducer(reducer, initialState);

  return (
    <ProfilesContext.Provider value={{ ...globalState, dispatch }}>
      {children}
    </ProfilesContext.Provider>
  );
};
