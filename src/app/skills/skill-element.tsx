import { Stack, Typography } from '@mui/material';
import React from 'react';
import { FlexItem } from '../common/flex-grid-item';
import {
  Action,
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
