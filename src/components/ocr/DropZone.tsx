import { useCallback, useState } from "react";
import { ScanLine } from "lucide-react";
import { toast } from "sonner";
import { VALID_FILE_TYPES, MAX_FILE_SIZE, MAX_BATCH_FILES } from "./types";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  currentCount: number;
}

const DropZone = ({ onFiles, currentCount }: DropZoneProps) => {
  const [dragging, setDragging] = useState(false);

  const validateAndAdd = useCallback((fileList: FileList) => {
    const valid: File[] = [];
    const remaining = MAX_BATCH_FILES - currentCount;
    
    for (let i = 0; i < Math.min(fileList.length, remaining); i++) {
      const f = fileList[i];
      if (!VALID_FILE_TYPES.includes(f.type)) {
        toast.error(`${f.name}: Invalid file type`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: File too large (max 20MB)`);
        continue;
      }
      valid.push(f);
    }

    if (fileList.length > remaining) {
      toast.warning(`Only ${remaining} more files allowed (max ${MAX_BATCH_FILES})`);
    }

    if (valid.length > 0) onFiles(valid);
  }, [onFiles, currentCount]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) validateAndAdd(e.dataTransfer.files);
  }, [validateAndAdd]);

  return (
    <div
      className={`glass border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
        dragging ? "border-primary bg-primary/5" : "border-glass-border hover:border-primary/50"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById("ocr-batch-input")?.click()}
    >
      <input
        id="ocr-batch-input"
        type="file"
        accept="image/*,.pdf"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && validateAndAdd(e.target.files)}
      />
      <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-3">
        <ScanLine className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold font-display mb-1">Drop documents here</h3>
      <p className="text-sm text-muted-foreground">
        Upload up to {MAX_BATCH_FILES} files • JPG, PNG, WebP, GIF, PDF • Max 20MB each
      </p>
    </div>
  );
};

export default DropZone;
