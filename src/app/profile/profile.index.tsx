import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';

import { ProfileTab } from '../profile/profile.tab';
import { ProfileConfigDialog } from './profile.dialog';
import { ProfileMap } from '../layout/content';
import { Updater } from 'use-immer';
import { current } from 'immer';

interface ProfilesProps {
  profiles: ProfileMap;
  setProfiles: Updater<ProfileMap | null>;
}
export const Profiles: React.FC<ProfilesProps> = ({
  profiles,
  setProfiles,
}) => {
  const [activeProfile, setActiveProfile] = React.useState<number>(
    Array.from(profiles.values())[0].id,
  );

  const [isDialogVisible, setIsDialogVisible] = React.useState<boolean>(false);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeProfile}
          onChange={(_, newValue) => setActiveProfile(newValue)}
          aria-label="Profile Tabs"
        >
          {Array.from(profiles).map(([_, profile]) => (
            <Tab label={profile.name} value={profile.id} key={profile.id} />
          ))}
          <IconButton onClick={() => setIsDialogVisible(true)}>
            <AddIcon />
          </IconButton>
        </Tabs>
      </Box>
      {isDialogVisible && (
        <ProfileConfigDialog
          onClose={(profile) => {
            setIsDialogVisible(false);
            if (!profile) return;

            setProfiles((draft) => {
              if (!draft) {
                localStorage.setItem(
                  'profiles',
                  JSON.stringify([[profile.id, profile]]),
                );
                return new Map([[profile.id, profile]]);
              }

              draft.set(profile.id, profile);
              localStorage.setItem(
                'profiles',
                JSON.stringify(Array.from(current(draft).entries())),
              );
            });
          }}
          open={isDialogVisible}
          profile={{ id: Math.random(), name: '' }}
        />
      )}
      {Array.from(profiles.values()).map((profile) => (
        <ProfileTab
          key={profile.id}
          profileId={profile.id}
          selectedProfileId={activeProfile}
          profileName={profile.name}
          profiles={profiles}
          setProfiles={setProfiles}
        />
      ))}
    </Box>
  );
};
