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
      <DialogContent className="border-blue-100">
        <DialogHeader>
          <DialogTitle className="text-blue-800">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={notification.title}
            onChange={(e) => setNotification({ ...notification, title: e.target.value })}
            required
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
          <Textarea
            placeholder="Description"
            value={notification.message}
            onChange={(e) => setNotification({ ...notification, message: e.target.value })}
            required
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
          <Input
            placeholder="Image URL"
            value={notification.icon}
            onChange={(e) => setNotification({ ...notification, icon: e.target.value })}
            required
            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
          <DialogFooter>
            {/* <Button type="submit" onClick={() => onOpenChange(false)}>Cancel</Button> */}
            <Button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white">
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};