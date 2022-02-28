import { TextField } from '@mui/material';
import { Profession } from '../../data/recipes';
import { Action, ActionType } from '../common/state/state';

interface SkillLevelSelectProps {
  dispatch: React.Dispatch<Action>;
  profession: Profession;
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
          type: ActionType.UPDATE_PROFESSION_LEVEL,
          updatedProfession: {
            ...profession,
            level: Math.min(Math.max(parseInt(event.target.value, 10), 0), 7),
          },
        })
      }
    />
  );
};
