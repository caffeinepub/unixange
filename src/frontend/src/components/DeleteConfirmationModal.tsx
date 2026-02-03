import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  itemTitle?: string;
}

export default function DeleteConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
  itemTitle,
}: DeleteConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-lg border border-border/50 bg-card backdrop-blur-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-light">Delete Item</AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-light text-muted-foreground">
            Are you sure you want to delete "{itemTitle}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isDeleting}
            className="rounded-full border-border/50 font-light transition-opacity-smooth hover:opacity-60"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-full bg-destructive font-light text-destructive-foreground transition-opacity-smooth hover:bg-destructive hover:opacity-80"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
