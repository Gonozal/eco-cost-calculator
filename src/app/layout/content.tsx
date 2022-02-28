import React from 'react';
import { useImmer } from 'use-immer';
import { Profiles } from '../profile/profile.index';

export type ProfileMap = Map<number, Profile>;
export interface Profile {
  name: string;
  id: number;
}

const defaultProfile: Profile = { name: 'Default', id: Math.random() };

export const Content: React.FC = () => {
  const [profiles, setProfiles] = useImmer<ProfileMap | null>(null);
  React.useEffect(() => {
    const loaded = localStorage.getItem('profiles');
    if (loaded) {
      const parsed = JSON.parse(loaded);
      if (parsed instanceof Array) {
        setProfiles(new Map(JSON.parse(loaded) as [number, Profile][]));
        return;
      }
    }

    setProfiles(new Map([[defaultProfile.id, defaultProfile]]));
  }, [setProfiles]);

  if (!profiles) return null;
  return <Profiles profiles={profiles} setProfiles={setProfiles} />;
};
