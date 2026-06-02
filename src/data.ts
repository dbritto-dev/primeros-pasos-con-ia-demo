import z from "zod";
import type { FunctionTool } from "openai/resources/responses/responses";
import systemPrompt from "./system-prompt.txt?raw";

export interface MailLabel {
  text: string;
  color: string;
}

export interface Mail {
  id: number;
  sender: string;
  senderEmail: string;
  subject: string;
  receiver: string;
  body: string;
  labels?: Array<MailLabel>;
  archived?: boolean;
  draftReply?: string;
  processed?: boolean;
  priority?: number;
}

const mails: Array<Mail> = [];

for (let t = 0; t < 3; t++) {
  mails.push({
    id: mails.length,
    sender: ["TechCrunch Weekly", "HackerNews Digest", "The Verge Updates"][t],
    senderEmail: [
      "newsletter@techcrunch.com",
      "digest@hackernews.com",
      "updates@theverge.com",
    ][t],
    subject: [
      "This Week in Tech: AI Developments and Market Trends",
      "Top Stories: New Programming models on the Rise",
      "Latest Product Launches and Industry News",
    ][t],
    receiver: "pete@yc.com",
    body: [
      "In this week's roundup, we cover the latest AI research breakthroughs, funding rounds for tech startups, and upcoming developer conferences. Plus, our analysis of changing market trends in cloud computing.",
      "This digest features discussions on emerging programming models, open-source project highlights, and technical deep dives. Our featured story explores scalability challenges in distributed systems.",
      "Explore the newest gadgets hitting the market, in-depth product reviews, and exclusive interviews with industry leaders on the future of technology.",
    ][t],
  });
}

for (let t = 0; t < 4; t++) {
  mails.push({
    id: mails.length,
    sender: [
      "Sarah from SaaS Solutions",
      "Mark at Enterprise Tools",
      "DevOps Pro Team",
      "DataAnalytics Plus",
    ][t],
    senderEmail: [
      "sarah@saassolutions.com",
      "mark@enterprisetools.com",
      "team@devopspro.io",
      "sales@dataanalytics.com",
    ][t],
    subject: [
      "Exclusive Offer for New Customers",
      "Transform Your Workflow with Our Platform",
      "Security Solutions for Growing Companies",
      "Special Pricing on Data Analytics Tools",
    ][t],
    receiver: "pete@yc.com",
    body: [
      "Hope this email finds you well! I noticed your company has been growing rapidly, and I wanted to share how our platform can help streamline your operations. Our clients typically see a 40% increase in productivity within just 3 months. Would you be available for a quick demo next week?",
      "I'm reaching out because our solution specifically addresses the challenges companies like yours face. We've worked with similar organizations who have seen significant ROI after implementing our tools. I'd love to schedule a brief call to discuss how we can help.",
      "With increasing security threats targeting businesses, we've developed a comprehensive solution that provides real-time monitoring and threat detection. Based on your company profile, I believe our enterprise package would be a perfect fit. Can we connect for 15 minutes this Thursday?",
      "Our analytics platform has helped companies like yours extract meaningful insights from their data, leading to better decision-making and strategic planning. We're offering a limited-time discount for new clients. Let me know if you'd like to see a personalized demo!",
    ][t],
  });
}

mails.push({
  id: mails.length,
  sender: "Garry Tan",
  senderEmail: "garry@yc.com",
  subject: "reschedule",
  receiver: "pete@yc.com",
  body: "Pete, let's move our 1on1 to wednesday next week. Maybe we can use the time to go for a walk?",
});

mails.push({
  id: mails.length,
  sender: "Gustaf Alströmer",
  senderEmail: "gustaf@yc.com",
  subject: "founder intro?",
  receiver: "pete@yc.com",
  body: "Hey Pete, I'm working with a couple founders this batch that I think you'd enjoy meeting. Can I make an intro?",
});

mails.push({
  id: mails.length,
  sender: "Sumana",
  senderEmail: "sumana@gmail.com",
  subject: "dinner tonight",
  receiver: "pete@yc.com",
  body: "Hi love, just checking if we're still on for dinner at that new place tonight? Also, my parents confirmed they can visit next weekend. We should plan some activities - maybe that hiking trail we talked about? Let me know when you'll be home today. Love you!",
});

mails.push({
  id: mails.length,
  sender: "Alex Chen",
  senderEmail: "alex@neuralstack.ai",
  subject: "advice on fundraising",
  receiver: "pete@yc.com",
  body: "Hi Pete, Hope you're doing well! We're preparing for our Series A, and I wanted to get your thoughts on our fundraising strategy. Our AI platform for code generation has strong traction with 140% MoM growth, but we're debating whether to focus on scaling enterprise customers or expanding our developer tools first. Could we chat briefly this week? Thanks, Alex",
});

mails.push({
  id: mails.length,
  sender: "Maya Rodriguez",
  senderEmail: "maya@carbo.earth",
  subject: "Technical co-founder?",
  receiver: "pete@yc.com",
  body: "Hey Pete, I'm struggling to find the right technical co-founder for my climate tech startup. We're building carbon capture technology that's showing promising early results in our lab tests. Gustaf mentioned you might know some engineers with hardware experience who could be interested. Would you be open to making some introductions? I can share more details about what we're looking for. Thanks! Maya",
});

export const labelEmailToolSchema = z.object({
  label: z.string(),
  color: z.string(),
  priority: z.number(),
});

export const archiveEmailToolSchema = z.object({});

export const draftReplyToolSchema = z.object({
  body: z.string(),
});

const tools: Array<FunctionTool> = [
  {
    type: "function",
    name: "labelEmail",
    description:
      "Use this tool to label an email with a specific category, color, and priority level.",
    parameters: labelEmailToolSchema.toJSONSchema(),
    strict: true,
  },
  {
    type: "function",
    name: "archiveEmail",
    description:
      "Use this tool to archive an email that doesn't need to be labeled.",
    parameters: archiveEmailToolSchema.toJSONSchema(),
    strict: true,
  },
  {
    type: "function",
    name: "draftReply",
    description: "Use this tool to draft a reply to the email.",
    parameters: draftReplyToolSchema.toJSONSchema(),
    strict: true,
  },
];

const models = [
  {
    id: "qwen3.6:latest",
    name: "Qwen 3.6",
    description: "Alibaba's multilingual model",
  },
  {
    id: "qwen3.5:latest",
    name: "Qwen 3.5",
    description: "Alibaba's multilingual model",
  },
  {
    id: "qwen3.5:9b-nvfp4",
    name: "Qwen 3.5 (9B, NVFP4)",
    description: "Alibaba's multilingual model",
  },
  {
    id: "qwen3.5:4b-mlx-bf16",
    name: "Qwen 3.5 (4B, MLX, BF16)",
    description: "Alibaba's multilingual model",
  },
  {
    id: "qwen3:latest",
    name: "Qwen 3",
    description: "Alibaba's multilingual model",
  },
  {
    id: "qwen2.5:latest",
    name: "Qwen 2.5",
    description: "Alibaba's multilingual model",
  },
  {
    id: "gemma4:latest",
    name: "Gemma 4",
    description: "Google's efficient open model",
  },
];

export { mails, tools, models, systemPrompt };
