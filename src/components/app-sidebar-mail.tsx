import { Badge } from "@/components/ui/badge";
import type { Mail } from "@/data";

function AppSidebarMail({
  mail,
  handleClick,
}: {
  mail: Mail;
  handleClick: () => void;
}) {
  return (
    <div
      key={mail.id}
      className="flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
      role="button"
      onClick={handleClick}
    >
      {mail.labels !== undefined || mail.priority !== undefined ? (
        <div className="flex gap-1">
          {mail.labels !== undefined
            ? mail.labels.map((label, labelIndex) => {
                return (
                  <Badge
                    key={`${mail.id}-label-${labelIndex}`}
                    style={{ backgroundColor: label.color }}
                  >
                    {label.text}
                  </Badge>
                );
              })
            : null}
          {mail.priority !== undefined ? (
            <Badge>Priority {mail.priority}</Badge>
          ) : null}
          {mail.draftReply !== undefined ? (
            <Badge variant="outline">Draft</Badge>
          ) : null}
        </div>
      ) : null}
      <div className="flex w-full items-center gap-2">
        <span>{mail.sender}</span>
      </div>
      <span className="font-medium">{mail.subject}</span>
      <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
        {mail.body}
      </span>
    </div>
  );
}

export { AppSidebarMail };
