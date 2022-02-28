import { TextFieldProps, TextField } from '@mui/material';
import React from 'react';
import NumberFormat from 'react-number-format';

export const NumberInput: React.FC<TextFieldProps> = ({
  children,
  ...props
}) => {
  return (
    <TextField
      margin="dense"
      variant="outlined"
      fullWidth
      size="small"
      inputProps={{ style: { textAlign: 'right' } }}
      InputProps={{
        inputComponent: NumberFormatCustom as any,
      }}
      {...props}
    />
  );
};

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const NumberFormatCustom = React.forwardRef<
  NumberFormat<CustomProps>,
  CustomProps
>(function NumberFormatCustom(props, ref) {
  const { onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      decimalScale={3}
      thousandSeparator
      isNumericString
    />
  );
});
