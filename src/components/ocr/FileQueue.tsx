import { Image, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BatchFile } from "./types";

interface FileQueueProps {
  files: BatchFile[];
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const, icon: null },
  scanning: { label: "Scanning…", variant: "default" as const, icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  done: { label: "Done", variant: "default" as const, icon: <CheckCircle2 className="h-3 w-3" /> },
  error: { label: "Error", variant: "destructive" as const, icon: <AlertCircle className="h-3 w-3" /> },
};

const FileQueue = ({ files, onRemove, onSelect, selectedId }: FileQueueProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
        Files ({files.length})
      </p>
      {files.map((bf) => {
        const cfg = statusConfig[bf.status];
        const isSelected = bf.id === selectedId;
        return (
          <div
            key={bf.id}
            onClick={() => bf.status === "done" && onSelect(bf.id)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              isSelected ? "bg-primary/10 border border-primary/30" : "bg-secondary/30 hover:bg-secondary/50 border border-transparent"
            } ${bf.status === "done" ? "cursor-pointer" : ""}`}
          >
            {bf.file.type.startsWith("image/") ? (
              <Image className="h-4 w-4 text-accent shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-primary shrink-0" />
            )}
            <span className="text-sm truncate flex-1">{bf.file.name}</span>
            <Badge variant={cfg.variant} className="text-[10px] gap-1 shrink-0">
              {cfg.icon} {cfg.label}
            </Badge>
            {bf.status === "pending" && (
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={(e) => { e.stopPropagation(); onRemove(bf.id); }}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FileQueue;
