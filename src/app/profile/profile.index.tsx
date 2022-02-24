import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';

import { ProfileTab } from '../profile/profile.tab';
import { ProfileConfigDialog } from './profile.dialog';
import { useImmer } from 'use-immer';

export interface Profile {
  name: string;
}

const defaultProfile: Profile = { name: 'Default' };
const emptyProfile: Profile = { name: '' };

export const Profiles: React.FC = () => {
  const [profiles, setProfiles] = useImmer<Map<string, Profile>>(
    new Map([[defaultProfile.name, defaultProfile]]),
  );
  const [activeProfile, setActiveProfile] = React.useState<string>(
    defaultProfile.name,
  );

  const [editedProfile, setEditedProfile] = React.useState<string | null>(null);

  const [isDialogVisible, setIsDialogVisible] = React.useState<boolean>(false);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeProfile}
          onChange={(_, newValue) => setActiveProfile(newValue)}
          aria-label="Profile Tabs"
        >
          {Array.from(profiles).map(([name]) => (
            <Tab label={name} value={name} key={name} />
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

            setProfiles((draft) =>
              draft.set(editedProfile ?? profile.name, profile),
            );
          }}
          open={isDialogVisible}
          profile={emptyProfile}
        />
      )}
      {Array.from(profiles).map(([name]) => (
        <ProfileTab key={name} profile={name} activeProfile={activeProfile} />
      ))}
    </Box>
  );
};
