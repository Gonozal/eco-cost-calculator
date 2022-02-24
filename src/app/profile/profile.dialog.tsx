import React from 'react';
import { Profile } from './profile.index';
import Button from '@mui/material/Button';

import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { SubmitHandler, useForm } from 'react-hook-form';

interface ProfileConfigProps {
  onClose: (profile?: Profile) => void;
  open: boolean;
  profile: Profile;
}

export const ProfileConfigDialog: React.FC<ProfileConfigProps> = ({
  onClose,
  profile,
  open,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: profile });

  const isNewProfile = profile.name === '';

  const onSubmit: SubmitHandler<Profile> = (data) => onClose(data);

  return (
    <Dialog open={open} onClose={() => onClose()} keepMounted={false}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {isNewProfile ? 'Create new Profile' : 'Edit Profile'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Profile Name"
            type="number"
            fullWidth
            variant="standard"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name')}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => onClose()}>Cancel</Button>
          <Button type="submit">
            {isNewProfile ? 'Create Profile' : 'Update Profile'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
