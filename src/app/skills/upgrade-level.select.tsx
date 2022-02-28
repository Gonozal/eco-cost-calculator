import { MenuItem, TextField } from '@mui/material';
import {
  Action,
  ActionType,
  CraftingStation,
  UpgradeLevel,
} from '../common/state/state';

interface UpgradeLevelSelectProps {
  dispatch: React.Dispatch<Action>;
  craftingStation: CraftingStation;
}
export const UpgradeLevelSelect: React.FC<UpgradeLevelSelectProps> = ({
  dispatch,
  craftingStation,
}) => {
  return (
    <TextField
      id="outlined-select-currency"
      size="small"
      margin="dense"
      select
      sx={{ float: 'right', width: 210 }}
      value={craftingStation.upgradeLevel}
      onChange={(event) => {
        const parsed = parseInt(event.target.value, 10) || 0;
        const upgradeLevel = Math.max(Math.min(parsed, 5), 0) as UpgradeLevel;
        console.log(upgradeLevel);
        dispatch({
          type: ActionType.UPDATE_CRAFTING_STATION_UPGRADE,
          updatedCraftingStation: {
            ...craftingStation,
            upgradeLevel,
          },
        });
      }}
    >
      <MenuItem value={0}>No Upgrade</MenuItem>
      {[1, 2, 3, 4].map((option) => (
        <MenuItem key={option} value={option}>
          Upgrade Level {option}
        </MenuItem>
      ))}
      <MenuItem value={5}>Specialized Upgrade</MenuItem>
    </TextField>
  );
};
