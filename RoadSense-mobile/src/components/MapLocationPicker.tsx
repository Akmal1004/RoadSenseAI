import { Coordinate } from "../types/route";
import LocationPickerModal from "./LocationPickerModal";

type Props = {
  visible: boolean;
  title: string;
  initialLabel?: string;
  initialCoordinate?: Coordinate;
  onCancel: () => void;
  onConfirm: (value: { label: string; coordinate: Coordinate }) => void;
};

export default function MapLocationPicker({
  visible,
  title,
  initialLabel,
  initialCoordinate,
  onCancel,
  onConfirm
}: Props) {
  return (
    <LocationPickerModal
      visible={visible}
      title={title}
      initialLabel={initialLabel}
      initialCoordinate={initialCoordinate}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
