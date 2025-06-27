'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { createProposal } from '@/lib/proposals';
import { createProject } from '@/lib/projects';
import { toast } from 'sonner';

const sampleProposals = [
  {
    title: 'E-commerce Website Development',
    client_name: 'TechCorp Solutions',
    client_email: 'contact@techcorp.com',
    amount: 15000,
    status: 'pending',
    description: 'Complete e-commerce website with payment integration, inventory management, and admin dashboard.',
  },
  {
    title: 'Mobile App UI/UX Design',
    client_name: 'StartupXYZ',
    client_email: 'hello@startupxyz.com',
    amount: 8500,
    status: 'approved',
    description: 'Modern mobile app design for iOS and Android with user-friendly interface and smooth user experience.',
  },
  {
    title: 'Brand Identity Package',
    client_name: 'Creative Agency',
    client_email: 'info@creativeagency.com',
    amount: 5000,
    status: 'draft',
    description: 'Complete brand identity including logo design, color palette, typography, and brand guidelines.',
  },
  {
    title: 'WordPress Website Redesign',
    client_name: 'Local Business',
    client_email: 'owner@localbusiness.com',
    amount: 3500,
    status: 'rejected',
    description: 'Redesign existing WordPress website with modern design, improved performance, and SEO optimization.',
  },
  {
    title: 'Marketing Campaign Strategy',
    client_name: 'Growth Marketing Co',
    client_email: 'team@growthmarketing.com',
    amount: 12000,
    status: 'pending',
    description: 'Comprehensive marketing strategy including social media, content marketing, and paid advertising campaigns.',
  },
];

const sampleProjects = [
  {
    title: 'E-commerce Platform Development',
    description: 'Building a scalable e-commerce platform with modern technologies',
    status: 'active',
  },
  {
    title: 'Mobile App Development',
    description: 'Cross-platform mobile application for iOS and Android',
    status: 'active',
  },
  {
    title: 'Website Redesign Project',
    description: 'Complete website overhaul with new design and functionality',
    status: 'completed',
  },
];

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResults, setSeedResults] = useState<{
    proposals: { success: number; failed: number };
    projects: { success: number; failed: number };
  } | null>(null);

  const seedDatabase = async () => {
    setIsSeeding(true);
    setSeedResults(null);

    try {
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error('You must be logged in to seed the database');
        return;
      }

      const results = {
        proposals: { success: 0, failed: 0 },
        projects: { success: 0, failed: 0 },
      };

      // Seed proposals
      for (const proposal of sampleProposals) {
        try {
          const { error } = await createProposal({
            ...proposal,
            user_id: user.id,
            client_id: null,
          });
          
          if (error) {
            results.proposals.failed++;
            console.error('Failed to create proposal:', error);
          } else {
            results.proposals.success++;
          }
        } catch (error) {
          results.proposals.failed++;
          console.error('Failed to create proposal:', error);
        }
      }

      // Seed projects
      for (const project of sampleProjects) {
        try {
          const { error } = await createProject({
            ...project,
            user_id: user.id,
            client_id: null,
            proposal_id: null,
          });
          
          if (error) {
            results.projects.failed++;
            console.error('Failed to create project:', error);
          } else {
            results.projects.success++;
          }
        } catch (error) {
          results.projects.failed++;
          console.error('Failed to create project:', error);
        }
      }

      setSeedResults(results);
      
      if (results.proposals.failed === 0 && results.projects.failed === 0) {
        toast.success('Database seeded successfully!');
      } else {
        toast.warning('Database seeded with some errors. Check the results below.');
      }
    } catch (error) {
      toast.error('Failed to seed database');
      console.error('Seeding error:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black">Database Seeding</h1>
          <p className="text-gray-600">Populate your database with sample data for testing and development.</p>
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Database className="h-5 w-5" />
              Seed Sample Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This will create sample proposals and projects in your account. This is useful for testing 
              the application with realistic data.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Warning</h4>
                  <p className="text-sm text-yellow-700">
                    This will add sample data to your account. Only use this in development or testing environments.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-black">Sample data includes:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• 5 sample proposals with different statuses</li>
                <li>• 3 sample projects with various states</li>
                <li>• Realistic client names and project descriptions</li>
              </ul>
            </div>

            <Button
              onClick={seedDatabase}
              disabled={isSeeding}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Database
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {seedResults && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Seeding Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-black">Proposals</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Successful:</span>
                      <span className="text-green-600 font-medium">{seedResults.proposals.success}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Failed:</span>
                      <span className="text-red-600 font-medium">{seedResults.proposals.failed}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-black">Projects</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Successful:</span>
                      <span className="text-green-600 font-medium">{seedResults.projects.success}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Failed:</span>
                      <span className="text-red-600 font-medium">{seedResults.projects.failed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}