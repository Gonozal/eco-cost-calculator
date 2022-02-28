import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
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
import styled from 'styled-components';

const Input = styled('input')({
  display: 'none',
});
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

  const [showDangerousActions, setShowDangerousActions] = React.useState(false);

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
            <FlexItem>
              <FormControlLabel
                label="Show Dangerous Actions"
                control={
                  <Checkbox
                    checked={showDangerousActions}
                    color="error"
                    onChange={() =>
                      setShowDangerousActions(!showDangerousActions)
                    }
                  />
                }
              />
            </FlexItem>
            {showDangerousActions && (
              <>
                Upload new JSON-data. This resets all skills, inputs and
                products
                <label htmlFor="contained-button-file">
                  <Input
                    accept="application/json"
                    id="contained-button-file"
                    type="file"
                    onChange={(event) => {
                      const reader = new FileReader();
                      const file = event.target.files?.[0];
                      if (!file) return;
                      reader.readAsText(file);

                      reader.onload = (evt) => {
                        dispatch({
                          type: ActionType.UPLOAD_DATA_JSON,
                          data: evt.target?.result as string,
                        });
                      };
                      console.log(event.target.files);
                    }}
                  />
                  <Button component="span" color="warning" fullWidth>
                    Upload data-json
                  </Button>
                </label>
                <Divider />
                Delete the current profile. This action cannot be undone
                <Button
                  color="error"
                  onClick={() => {
                    if (profiles.size === 1) return;
                    setProfiles((profile) => {
                      profile?.delete(state.id);
                    });
                  }}
                >
                  Delete Profile
                </Button>
              </>
            )}
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
