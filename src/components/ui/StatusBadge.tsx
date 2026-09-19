type Status = "OPEN" | "CLOSED" | "EXPIRED";

const styles: Record<Status, string> = {
  OPEN: "bg-green-100 text-green-800",
  CLOSED: "bg-slate-200 text-slate-700",
  EXPIRED: "bg-amber-100 text-amber-800",
};

const labels: Record<Status, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  EXPIRED: "Expired",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
