// src/components/FreeHostingNotice.tsx

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function BackendNoticeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the modal
    const seen = localStorage.getItem("hosting_notice_seen");
    if (!seen) {
      setOpen(true);

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        setOpen(false);
        localStorage.setItem("hosting_notice_seen", "true");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("hosting_notice_seen", "true");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="  bg-white text-black h-[40vh] rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Please Note</DialogTitle>
        </DialogHeader>
        <p className="text-lg  ">The backend of this site is hosted on free hosting, which may cause a short delay before it becomes fully interactive.</p>
        <div className="flex justify-end gap-2 mt-auto">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
