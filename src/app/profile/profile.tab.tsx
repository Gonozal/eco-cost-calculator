import React from 'react';
import { Updater } from 'use-immer';
import {
  AppState,
  deserializeState,
  initialState,
} from '../common/state/state';
import { ProfileMap } from '../layout/content';
import { ProfileWrapper } from './profile.wrapper';

interface ProfileTabProps {
  selectedProfileId: number;
  profileName: string;
  profileId: number;
  profiles: ProfileMap;
  setProfiles: Updater<ProfileMap | null>;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profileName,
  profileId,
  selectedProfileId,
  profiles,
  setProfiles,
  children,
  ...other
}) => {
  const [loadedState, setLoadedState] = React.useState<AppState | null>(null);

  React.useEffect(() => {
    const loaded = localStorage.getItem(`state-${profileId}`);
    if (!loaded) {
      setLoadedState({ ...initialState, id: profileId });
      return;
    }
    const state = deserializeState(loaded);
    setLoadedState(state);
  }, [setLoadedState, profileId]);

  if (!loadedState) return null;
  return (
    <div
      role="tabpanel"
      hidden={selectedProfileId !== profileId}
      id={`profile-tabpanel-${profileId}`}
      aria-labelledby={`profile-tab-${profileId}`}
      style={{ height: '100%' }}
      {...other}
    >
      {selectedProfileId === profileId && (
        <ProfileWrapper
          loadedState={loadedState}
          profiles={profiles}
          setProfiles={setProfiles}
        />
      )}
    </div>
  );
};
