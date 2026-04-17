import { ArrowUpIcon, ChevronDownIcon, PlusIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function App() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(50px + 25rem)",
        } as React.CSSProperties
      }
    >
      <Sidebar variant="inset">
        <SidebarContent className="p-2">
          {/* <FieldGroup>
            <Field>
              <FieldLabel htmlFor="input-field-username">
                System Prompt
              </FieldLabel>

              <FieldDescription>
                Choose a unique username for your account.
              </FieldDescription>
            </Field>
          </FieldGroup> */}

          <InputGroup>
            <InputGroupTextarea placeholder="Ask, Search or Chat..." />
            <InputGroupAddon align="block-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <InputGroupButton className="ml-auto" variant="ghost">
                      Qwen 3.5
                    </InputGroupButton>
                  }
                />
                <DropdownMenuContent side="top" align="start">
                  <DropdownMenuItem>Auto</DropdownMenuItem>
                  <DropdownMenuItem>Agent</DropdownMenuItem>
                  <DropdownMenuItem>Manual</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <InputGroupButton
                variant="default"
                // className="rounded-full"
                size="icon-xs"
              >
                <ArrowUpIcon />
                <span className="sr-only">Send</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="overflow-hidden">
        <SidebarProvider
          className="h-full min-h-auto"
          style={
            {
              "--sidebar-width": "calc(50px + 25rem)",
            } as React.CSSProperties
          }
        >
          <AppSidebar />

          <SidebarInset>
            <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4 data-vertical:self-auto"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Inbox</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4"></div>
          </SidebarInset>
        </SidebarProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
