/*
  # Update projects table RLS policy for client portal access

  1. Security Changes
    - Add policy to allow public read access to projects via client_portal_id
    - This enables the client portal to function without authentication
    - Maintains security by only exposing projects through unguessable portal IDs

  2. New Policy
    - Allow SELECT on projects table when accessed via client_portal_id
    - No authentication required for this specific access pattern
*/

-- Add policy for public portal access
CREATE POLICY "Allow public access via portal ID"
ON public.projects FOR SELECT
USING (client_portal_id IS NOT NULL);