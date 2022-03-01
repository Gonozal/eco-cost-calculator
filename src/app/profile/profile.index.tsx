import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';

import { ProfileTab } from '../profile/profile.tab';
import { ProfileConfigDialog } from './profile.dialog';
import { useProfiles } from '../common/state/state-provider';
import { ActionType } from '../common/state/state';

export const Profiles: React.FC = () => {
  const { profiles, activeProfile, dispatch } = useProfiles();

  const [isDialogVisible, setIsDialogVisible] = React.useState<boolean>(false);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeProfile}
          onChange={(_, newValue) =>
            dispatch({
              type: ActionType.SET_ACTIVE_PROFILE,
              activeProfileId: newValue,
            })
          }
          aria-label="Profile Tabs"
        >
          {Array.from(profiles.values()).map((profile) => (
            <Tab label={profile.name} value={profile.id} key={profile.id} />
          ))}
          <IconButton onClick={() => setIsDialogVisible(true)}>
            <AddIcon />
          </IconButton>
        </Tabs>
      </Box>
      {isDialogVisible && (
        <ProfileConfigDialog
          onClose={(newProfile) => {
            setIsDialogVisible(false);
            if (!newProfile) return;

            dispatch({
              type: ActionType.ADD_PROFILE,
              newProfile,
            });
          }}
          open={isDialogVisible}
          profile={{ id: Math.random(), name: '' }}
        />
      )}
      <ProfileTab />
    </Box>
  );
};
