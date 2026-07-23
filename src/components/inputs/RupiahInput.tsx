import { Input } from '@/components/ui/input';

interface RupiahInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function RupiahInput({ value, onChange }: RupiahInputProps) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      value={value ? new Intl.NumberFormat('id-ID').format(value) : ''}
      onChange={(e) => {
        const numericValue = Number(e.target.value.replace(/\D/g, ''));
        onChange(numericValue);
      }}
    />
  );
}
