import { z } from 'zod';

export const proposalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  client_name: z.string().min(1, 'Client name is required').max(255, 'Client name must be less than 255 characters'),
  client_email: z.string().email('Please enter a valid email address'),
  amount: z.number().min(0, 'Amount must be positive').max(999999.99, 'Amount is too large'),
  description: z.string().optional(),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']).default('draft'),
});

export type ProposalInput = z.infer<typeof proposalSchema>;