import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SponsorFormDialogProps } from "@/constant/sponsorData";

export const FormDialog: React.FC<SponsorFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  Sponsors,
  setSponsors,
  name,
  submitButtonText,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={Sponsors.name}
            onChange={(e) => setSponsors({ ...Sponsors, name: e.target.value })}
            required
          />
          <Textarea
            placeholder="Description"
            value={Sponsors.description}
            onChange={(e) => setSponsors({ ...Sponsors, description: e.target.value })}
            required
          />
          <Input
            placeholder="Image URL"
            value={Sponsors.logo}
            onChange={(e) => setSponsors({ ...Sponsors, logo: e.target.value })}
            required
          />
          <DialogFooter>
            {/* <Button type="submit" onClick={() => onOpenChange(false)}>Cancel</Button> */}
            <Button type="submit" className="bg-amber-500 hover:bg-amber-700">{submitButtonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};