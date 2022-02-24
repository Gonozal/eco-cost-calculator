import { Paper, Typography } from '@mui/material';

interface SectionProps {
  heading: string;
}
export const Section: React.FC<SectionProps> = ({ children, heading }) => {
  return (
    <Paper sx={{ height: '100%', padding: 2 }}>
      <Typography sx={{ margin: 'auto' }} textAlign="center" variant="h4">
        {heading}
      </Typography>
      {children}
    </Paper>
  );
};
