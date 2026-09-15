import { RSVPStatus } from "@/types";

const labels: Record<RSVPStatus, string> = {
  attending: "ចូលរួម",
  declined: "មិនចូលរួម",
  pending: "រង់ចាំ"
};

export function StatusBadge({ status }: { status: RSVPStatus }) {
  return <span className={`status ${status}`}>{labels[status]}</span>;
}
