export type Notification = {
    id: string | null;
    title: string;
    message: string;
    icon: string;
  }

export type FormDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    notification: {
      id: string | null;
      title: string;
      message: string;
      icon: string;
    };
    setNotification: (notification: {
      id: string | null;
      title: string;
      message: string;
      icon: string;
    }) => void;
    title: string;
    submitButtonText: string;
  }

export type NotificationCardProps = {
    notification: {
      id: string | null;
      title: string;
      message: string;
      icon: string;
    };
    onEdit: () => void;
    onDelete: () => void;
  }