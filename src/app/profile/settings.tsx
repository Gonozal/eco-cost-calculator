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
import { ActionType, replacer } from '../common/state/state';
import { NumberInput } from '../common/number-input';
import styled from 'styled-components';
import { useActiveProfile, useProfiles } from '../common/state/state-provider';

const Input = styled('input')({
  display: 'none',
});
interface SettingsProps {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
export const Settings: React.FC<SettingsProps> = ({
  setIsVisible,
  isVisible,
}) => {
  const activeProfile = useActiveProfile();
  const { dispatch, profiles } = useProfiles();
  const [profileName, setProfileName] = React.useState(activeProfile?.name);

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
              <Button
                component="a"
                href={window.URL.createObjectURL(
                  new Blob([JSON.stringify(activeProfile, replacer)]),
                )}
                download="cost-calc-profile.json"
              >
                Export Profile
              </Button>
              <label htmlFor="import-profile-button">
                <Input
                  accept="application/json"
                  type="file"
                  multiple
                  id="import-profile-button"
                  onChange={(event) => {
                    const reader = new FileReader();
                    const file = event.target.files?.[0];
                    console.log(event.target.files);
                    if (!file) return;
                    reader.readAsText(file);

                    reader.onload = (evt) => {
                      dispatch({
                        type: ActionType.IMPORT_PROFILE,
                        profileString: evt.target?.result as string,
                      });
                    };
                    event.target.value = '';
                    event.target.files = null;
                  }}
                />
                <Button component="span" color="warning" fullWidth>
                  Import Profile
                </Button>
              </label>
            </FlexItem>
            <FlexItem>
              <Typography component="span">Profile Name</Typography>
              <TextField
                variant="outlined"
                margin="dense"
                size="small"
                inputProps={{ style: { textAlign: 'right' } }}
                onChange={(event) => setProfileName(event.target.value)}
                onBlur={() =>
                  dispatch({
                    type: ActionType.UPDATE_PROFILE_NAME,
                    newName: profileName || '',
                  })
                }
                value={profileName}
                sx={{ width: 160 }}
              />
            </FlexItem>
            <FlexItem>
              <Typography component="span">Profit Margin</Typography>
              <NumberInput
                value={activeProfile.margin * 100}
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
                value={activeProfile.calorieCost}
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
                      event.target.value = '';
                      event.target.files = null;
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
                    dispatch({ type: ActionType.DELETE_ACTIVE_PROFILE });
                  }}
                >
                  Delete Profile
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <Typography>{activeProfile.margin * 100}%</Typography>
            <Typography>{activeProfile.calorieCost}/kcal</Typography>
          </>
        )}
      </Stack>
    </Paper>
  );
};
