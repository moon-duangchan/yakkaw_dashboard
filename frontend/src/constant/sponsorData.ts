export type Sponsor = {
    id: string | null;
    name: string;
    description: string;
    logo: string;
  }

export type SponsorFormDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    Sponsors: {
      id: string | null;
      name: string;
      description: string;
      logo: string;
    };
    setSponsors: (Sponsors: {
      id: string | null;
      name: string;
      description: string;
      logo: string;
    }) => void;
    name: string;
    submitButtonText: string;
  }

export type SponsorsCardProps = {
    Sponsors: {
      id: string | null;
      name: string;
      description: string;
      logo: string;
    };
    onEdit: () => void;
    onDelete: () => void;
  }