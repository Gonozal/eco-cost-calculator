import React from 'react';
import { Profiles } from '../profile/profile.index';

export interface Profile {
  name: string;
  id: number;
}

export const Content: React.FC = () => {
  return <Profiles />;
};
