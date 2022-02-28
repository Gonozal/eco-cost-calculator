import NumberFormat from 'react-number-format';

export const PriceDisplay: React.FC<{ price: number }> = ({ price }) => {
  return (
    <NumberFormat
      value={price}
      displayType={'text'}
      thousandSeparator={true}
      decimalScale={2}
    />
  );
};
