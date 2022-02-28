import React from 'react';
import { useImmer } from 'use-immer';
import { useDebounce } from '../common/use-debounce.hook';
import { Profiles } from '../profile/profile.index';

export type ProfileMap = Map<number, Profile>;
export interface Profile {
  name: string;
  id: number;
}

const defaultProfile: Profile = { name: 'Default', id: Math.random() };

export const Content: React.FC = () => {
  const [profiles, setProfiles] = useImmer<ProfileMap | null>(null);

  const debouncedProfiles = useDebounce(profiles, 500);

  React.useEffect(() => {
    const loaded = localStorage.getItem('profiles');
    if (loaded) {
      const parsed = JSON.parse(loaded);
      if (parsed instanceof Array) {
        setProfiles(new Map(parsed as [number, Profile][]));
        return;
      }
    }

    setProfiles(new Map([[defaultProfile.id, defaultProfile]]));
  }, [setProfiles]);

  React.useEffect(() => {
    if (!debouncedProfiles || debouncedProfiles.size === 0) return;
    console.log('saving profile');
    localStorage.setItem('profiles', JSON.stringify([...debouncedProfiles]));
  }, [debouncedProfiles, setProfiles]);

  if (!profiles) return null;
  return <Profiles profiles={profiles} setProfiles={setProfiles} />;
};
