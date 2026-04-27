"use client";

import * as React from "react";
import {
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleStopIcon,
} from "lucide-react";
import OpenAI from "openai";
import z from "zod";

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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { appStore, useSelector } from "@/store";
import { draftReplyToolSchema, labelEmailToolSchema, tools } from "@/data";
import { MailDisplay } from "./components/mail-display";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1/",
  apiKey: "ollama",
  dangerouslyAllowBrowser: true,
});

function AppModelsActiveModel() {
  const models = useSelector(appStore, (state) => state.models);
  const modelId = useSelector(appStore, (state) => state.modelId);
  const modelsMap = models.reduce(
    (output, model) => {
      output[model.id] = model;
      return output;
    },
    {} as Record<string, (typeof models)[0]>,
  );
  const selectedModel = modelsMap[modelId];

  return (
    <DropdownMenuItem>
      <div className="whitespace-nowrap">
        <div className="text-sm">{selectedModel.name}</div>
        <div className="text-neutral-500! text-xs pr-4 mt-1">
          {selectedModel.description}
        </div>
      </div>

      <CheckIcon />
    </DropdownMenuItem>
  );
}

function AppModelsOtherModels() {
  const models = useSelector(appStore, (state) => state.models);
  const modelId = useSelector(appStore, (state) => state.modelId);
  const filteredModels = models.filter((model) => model.id !== modelId);

  return (
    <DropdownMenuSubContent className="min-w-[12rem] max-w-[20rem]">
      {filteredModels.map((model) => {
        return (
          <DropdownMenuItem
            key={model.id}
            id={model.id}
            onSelect={() => {
              appStore.setState({ modelId: model.id });
            }}
          >
            {model.name}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuSubContent>
  );
}

function AppModels() {
  const models = useSelector(appStore, (state) => state.models);
  const modelId = useSelector(appStore, (state) => state.modelId);
  const modelsMap = models.reduce(
    (output, model) => {
      output[model.id] = model;
      return output;
    },
    {} as Record<string, (typeof models)[0]>,
  );
  const selectedModel = modelsMap[modelId];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <InputGroupButton className="ml-auto" variant="ghost" size="sm">
          {selectedModel.name}
          <ChevronDownIcon />
        </InputGroupButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[12rem] max-w-[20rem]"
        side="top"
        align="end"
      >
        <DropdownMenuGroup>
          <AppModelsActiveModel />

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More models</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <AppModelsOtherModels />
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppSystemPrompt() {
  const systemPrompt = useSelector(appStore, (state) => state.systemPrompt);

  return (
    <InputGroupTextarea
      className="resize-none"
      name="system-prompt"
      placeholder=""
      defaultValue={systemPrompt}
      onChange={(event) => {
        appStore.setState({ systemPrompt: event.target.value });
      }}
    />
  );
}

function AppSendButton() {
  const model = useSelector(appStore, (state) => state.modelId);
  const mails = useSelector(appStore, (state) => state.mails);
  const systemPrompt = useSelector(appStore, (state) => state.systemPrompt);
  const controllerRef = React.useRef<AbortController>(null);
  const [, dispatchAction, isPending] = React.useActionState(async () => {
    controllerRef.current = new AbortController();

    // Reset state
    appStore.setState({ ...appStore.getInitialState(), modelId: model });

    await Promise.all(
      Object.values(mails).map(async (mail) => {
        const response = await client.responses.create(
          {
            input: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `
                From: ${mail.sender} <${mail.senderEmail}>
                To: ${mail.receiver}
                Subject: ${mail.subject}
                
                ${mail.body}
                `,
              },
            ],
            model,
            tools,
          },
          { signal: controllerRef.current?.signal },
        );

        if (response.status === "completed") {
          appStore.setState((currentState) => {
            return {
              mails: currentState.mails.map((currentMail) => {
                if (currentMail.id === mail.id) {
                  const nextMail = structuredClone(currentMail);

                  nextMail.processed = true;
                  nextMail.labels = [];

                  response.output.forEach((item) => {
                    if (
                      item.type === "function_call" &&
                      item.name === "labelEmail"
                    ) {
                      const payload = JSON.parse(item.arguments) as z.infer<
                        typeof labelEmailToolSchema
                      >;
                      nextMail.labels!.push({
                        text: payload.label,
                        color: payload.color,
                      });
                      nextMail.priority = payload.priority;
                    } else if (
                      item.type === "function_call" &&
                      item.name === "draftReply"
                    ) {
                      const payload = JSON.parse(item.arguments) as z.infer<
                        typeof draftReplyToolSchema
                      >;
                      nextMail.draftReply = payload.body;
                    } else if (
                      item.type === "function_call" &&
                      item.name === "archiveEmail"
                    ) {
                      nextMail.archived = true;
                    }
                  });

                  return nextMail;
                }

                return currentMail;
              }),
            };
          });
        }
      }),
    ).catch(() => {});
  }, null);

  const handleClick = () => {
    if (isPending) {
      controllerRef.current?.abort();
      return;
    }

    React.startTransition(() => {
      dispatchAction();
    });
  };

  return (
    <InputGroupButton
      variant={isPending ? "outline" : "default"}
      size="icon-sm"
      color="red"
      onClick={handleClick}
    >
      {isPending ? (
        <>
          <CircleStopIcon />
          <span className="sr-only">Stop</span>
        </>
      ) : (
        <>
          <ArrowUpIcon />
          <span className="sr-only">Run</span>
        </>
      )}
    </InputGroupButton>
  );
}

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
          <FieldGroup className="h-full">
            <Field className="h-full">
              <FieldLabel htmlFor="input-field-username">
                System Prompt
              </FieldLabel>

              <InputGroup className="flex-1 min-h-0">
                <AppSystemPrompt />

                <InputGroupAddon align="block-end">
                  <AppModels />

                  <AppSendButton />
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>
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
            <div className="flex flex-1 flex-col">
              <MailDisplay />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
