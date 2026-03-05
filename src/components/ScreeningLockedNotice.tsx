import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

type ScreeningLockedNoticeProps = {
  message?: string;
};

const ScreeningLockedNotice = ({
  message = "Screening is temporarily unavailable until your cold or cough is resolved.",
}: ScreeningLockedNoticeProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-warning" />
        </div>
        <p className="text-foreground font-semibold">Screening Locked</p>
        <p className="text-sm text-muted-foreground">{message}</p>
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default ScreeningLockedNotice;
