import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormDialogProps } from "@/constant/notificationData";

export const FormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  notification,
  setNotification,
  title,
  submitButtonText,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={notification.title}
            onChange={(e) => setNotification({ ...notification, title: e.target.value })}
            required
          />
          <Textarea
            placeholder="Description"
            value={notification.message}
            onChange={(e) => setNotification({ ...notification, message: e.target.value })}
            required
          />
          <Input
            placeholder="Image URL"
            value={notification.icon}
            onChange={(e) => setNotification({ ...notification, icon: e.target.value })}
            required
          />
          <DialogFooter>
            {/* <Button type="submit" onClick={() => onOpenChange(false)}>Cancel</Button> */}
            <Button type="submit" className="bg-indigo-500 hover:bg-indigo-700">{submitButtonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};