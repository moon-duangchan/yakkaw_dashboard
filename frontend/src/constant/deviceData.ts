export type Device = {
    id?: number; // corresponds to gorm.Model ID
    dvid: string;
    address: string;
    longitude: number;
    latitude: number;
    place: string;
    models: string;
    contact_name: string;
    contact_phone: string;
    deploy_date: string; // ISO string, since Go sends time.Time as string in JSON
};

export type DeviceFormDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    device: Device;
    setDevice: (device: Device) => void;
    title: string;
    submitButtonText: string;
};

export type DeviceCardProps = {
    device: Device;
    onEdit: () => void;
    onDelete: () => void;
};