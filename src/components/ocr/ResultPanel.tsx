import { useState } from "react";
import { Edit3, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine } from "lucide-react";
import { OcrResult, OCR_FIELDS } from "./types";

interface ResultPanelProps {
  result: OcrResult | null;
  fileName: string | null;
  onSave: (updated: OcrResult) => void;
}

const ResultPanel = ({ result, fileName, onSave }: ResultPanelProps) => {
  const [editMode, setEditMode] = useState(false);
  const [edited, setEdited] = useState<OcrResult | null>(null);

  const startEdit = () => { setEdited(result); setEditMode(true); };
  const cancelEdit = () => { setEditMode(false); setEdited(null); };
  const saveEdit = () => { if (edited) { onSave(edited); setEditMode(false); } };

  if (!result) {
    return (
      <Card className="glass border-glass-border">
        <CardContent className="py-16 text-center">
          <ScanLine className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold font-display text-muted-foreground mb-1">No Results Yet</h3>
          <p className="text-sm text-muted-foreground">Upload documents and click "Scan All" to extract data</p>
        </CardContent>
      </Card>
    );
  }

  const data = editMode ? edited! : result;

  return (
    <div className="space-y-4">
      {fileName && (
        <p className="text-xs text-muted-foreground">Results for: <span className="text-foreground font-medium">{fileName}</span></p>
      )}
      <Card className="glass border-glass-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-display">Extracted Data</CardTitle>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
                <Button size="sm" onClick={saveEdit} className="bg-primary text-primary-foreground">
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={startEdit}>
                <Edit3 className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {OCR_FIELDS.map(({ key, label, icon }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-lg">{icon}</span>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</label>
                {editMode ? (
                  <Input
                    value={data[key] || ""}
                    onChange={(e) => setEdited((prev) => prev ? { ...prev, [key]: e.target.value || null } : prev)}
                    className="mt-1 bg-secondary/50 border-glass-border"
                  />
                ) : (
                  <p className="text-sm font-medium">{data[key] || <span className="text-muted-foreground italic">Not found</span>}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass border-glass-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">Raw OCR Text</CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <Textarea
              value={data.raw_text || ""}
              onChange={(e) => setEdited((prev) => prev ? { ...prev, raw_text: e.target.value } : prev)}
              className="min-h-[200px] bg-secondary/50 border-glass-border font-mono text-xs"
            />
          ) : (
            <div className="bg-secondary/50 rounded-xl p-4 max-h-[300px] overflow-y-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                {data.raw_text || "No text extracted"}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultPanel;
