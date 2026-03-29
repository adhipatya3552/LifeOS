import { CalendarDays, FolderOpen, Mail } from "lucide-react";
import { GOOGLE_SERVICE_REGISTRY, type GoogleServiceId } from "@/lib/google-service-registry";

const iconMap = {
  gmail: Mail,
  calendar: CalendarDays,
  drive: FolderOpen,
} satisfies Record<GoogleServiceId, typeof Mail>;

export function GoogleServiceIcon({
  service,
  className = "h-6 w-6",
}: {
  service: GoogleServiceId;
  className?: string;
}) {
  const Icon = iconMap[service];
  const config = GOOGLE_SERVICE_REGISTRY[service];

  return <Icon className={className} style={{ color: config.color }} />;
}
