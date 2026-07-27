const COLORS: Record<string, string> = {
  pending: "bg-ink/10 text-ink",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  packed: "bg-purple-100 text-purple-700",
  handed_to_courier: "bg-purple-100 text-purple-700",
  in_transit: "bg-amber-100 text-amber-700",
  delivered: "bg-green-100 text-green-700",
  returned: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${COLORS[status] ?? "bg-ink/10 text-ink"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
