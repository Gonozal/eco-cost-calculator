import { TextField } from '@mui/material';
import { Action, ActionType, ProfessionState } from '../common/state/state';

interface SkillLevelSelectProps {
  dispatch: React.Dispatch<Action>;
  profession: ProfessionState;
}
export const SkillLevelSelect: React.FC<SkillLevelSelectProps> = ({
  dispatch,
  profession,
}) => {
  return (
    <TextField
      id="outlined-select-currency"
      size="small"
      margin="dense"
      sx={{ float: 'right', width: 45 }}
      value={profession.level}
      onChange={(event) =>
        dispatch({
          type: ActionType.UPDATE_PROFESSION,
          updatedProfession: {
            ...profession,
            level: Math.min(Math.max(parseInt(event.target.value, 10), 0), 7),
          },
        })
      }
    />
  );
};
