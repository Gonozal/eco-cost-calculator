import {
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { FlexItem } from '../common/flex-grid-item';
import { ProfileMap } from '../layout/content';
import { Action, ActionType, AppState } from '../common/state/state';
import { Updater } from 'use-immer';
import { NumberInput } from '../common/number-input';

interface SettingsProps {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  profiles: ProfileMap;
  setProfiles: Updater<ProfileMap | null>;
  state: AppState;
  dispatch: React.Dispatch<Action>;
}
export const Settings: React.FC<SettingsProps> = ({
  setIsVisible,
  isVisible,
  profiles,
  setProfiles,
  state,
  dispatch,
}) => {
  const activeProfile = profiles.get(state.id);

  if (!activeProfile) return null;
  return (
    <Paper sx={{ height: '100%', padding: 2 }}>
      <Stack>
        <div style={{ display: 'flex' }}>
          <IconButton
            onClick={() => setIsVisible((visible) => !visible)}
            color={isVisible ? 'info' : 'inherit'}
          >
            <SettingsIcon />
          </IconButton>
          {isVisible && (
            <>
              <Typography
                variant="h4"
                component="span"
                sx={{ marginLeft: 'auto', marginRight: 'auto' }}
              >
                Settings
              </Typography>
            </>
          )}
        </div>
        {isVisible ? (
          <>
            <FlexItem>
              <Typography component="span">Profile Name</Typography>
              <TextField
                variant="outlined"
                margin="dense"
                size="small"
                inputProps={{ style: { textAlign: 'right' } }}
                value={activeProfile.name}
                sx={{ width: 160 }}
              />
            </FlexItem>
            <FlexItem>
              <Typography component="span">Profit Margin</Typography>
              <NumberInput
                value={state.margin * 100}
                onChange={(event) => {
                  const parsed = parseFloat(event.target.value);
                  dispatch({
                    type: ActionType.UPDATE_MARGIN,
                    newMargin: (parsed || 0) / 100,
                  });
                }}
                sx={{ width: 160 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </FlexItem>
            <FlexItem>
              <Typography component="span">Cost per kcal</Typography>
              <NumberInput
                value={state.calorieCost}
                sx={{ width: 160 }}
                onChange={(event) => {
                  const parsed = parseFloat(event.target.value);
                  dispatch({
                    type: ActionType.UPDATE_CALORIE_COST,
                    newCost: parsed || 0,
                  });
                }}
              />
            </FlexItem>
          </>
        ) : (
          <>
            <Typography>{state.margin * 100}%</Typography>
            <Typography>{state.calorieCost}/kcal</Typography>
          </>
        )}
      </Stack>
    </Paper>
  );
};
