import { Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import React from 'react';
import { FlexItem } from '../common/flex-grid-item';
import {
  Action,
  ActionType,
  CraftingStationMap,
  ProfessionMap,
} from '../common/state/state';
import { SkillLevelSelect } from './skill-level.select';
import { UpgradeLevelSelect } from './upgrade-level.select';

interface SkillSegmentProps {
  dispatch: React.Dispatch<Action>;
  professions: ProfessionMap;
  craftingStations: CraftingStationMap;
}
export const SkillSegment: React.FC<SkillSegmentProps> = ({
  dispatch,
  professions,
  craftingStations,
}) => {
  return (
    <Stack sx={{ paddingTop: 2 }}>
      {Array.from(professions.values()).map((profession) => (
        <React.Fragment key={profession.name}>
          <FlexItem>
            <Typography variant="h6" component="div">
              {profession.displayName}
              {profession.level >= 6 && (
                <div>
                  <FormControlLabel
                    label="Lavish Workspace Bonus?"
                    sx={{ marginLeft: 0 }}
                    labelPlacement="start"
                    control={
                      <Checkbox
                        size="small"
                        sx={{ margin: 0 }}
                        checked={Boolean(profession.hasLavishWorkspace)}
                        onChange={(event) =>
                          dispatch({
                            type: ActionType.UPDATE_PROFESSION,
                            updatedProfession: {
                              ...profession,
                              hasLavishWorkspace: event.target.checked,
                            },
                          })
                        }
                      />
                    }
                  />
                </div>
              )}
            </Typography>
            <SkillLevelSelect dispatch={dispatch} profession={profession} />
          </FlexItem>
          <Stack sx={{ paddingLeft: 3 }}>
            {Array.from(craftingStations.values())
              .filter((station) => station.profession.name === profession.name)
              .map((craftingStation) => (
                <FlexItem key={craftingStation.name}>
                  <Typography variant="subtitle2">
                    {craftingStation.name}
                  </Typography>
                  <UpgradeLevelSelect
                    dispatch={dispatch}
                    craftingStation={craftingStation}
                  />
                </FlexItem>
              ))}
          </Stack>
        </React.Fragment>
      ))}
    </Stack>
  );
};
