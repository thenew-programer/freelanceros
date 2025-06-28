'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, Calendar, DollarSign, Users, FolderOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getCurrentUser } from '@/lib/auth';
import { getProjects } from '@/lib/projects';
import { getMilestoneStats } from '@/lib/milestones';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Project } from '@/lib/supabase';

const statusColors = {
	active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100',
	completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100',
	on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-100',
	cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100',
};

interface ProjectWithStats extends Project {
	proposal?: any;
	completionPercentage?: number;
}

export default function ProjectsPage() {
	const [projects, setProjects] = useState<ProjectWithStats[]>([]);
	const [filteredProjects, setFilteredProjects] = useState<ProjectWithStats[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');

	useEffect(() => {
		loadProjects();
	}, []);

	useEffect(() => {
		filterProjects();
	}, [projects, searchTerm, statusFilter]);

	const loadProjects = async () => {
		try {
			const { user } = await getCurrentUser();
			if (!user) return;

			const { data, error } = await getProjects(user.id);
			if (error) {
				toast.error('Failed to load projects');
				return;
			}

			// Load completion stats for each project
			const projectsWithStats = await Promise.all(
				(data || []).map(async (project) => {
					const { data: stats } = await getMilestoneStats(project.id);
					return {
						...project,
						completionPercentage: stats?.completionPercentage || 0,
					};
				})
			);

			setProjects(projectsWithStats);
		} catch (error) {
			toast.error('Failed to load projects');
		} finally {
			setLoading(false);
		}
	};

	const filterProjects = () => {
		let filtered = projects;

		// Filter by search term
		if (searchTerm) {
			filtered = filtered.filter(project =>
				project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(project.proposal?.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter(project => project.status === statusFilter);
		}

		setFilteredProjects(filtered);
	};

	if (loading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
						<p className="text-gray-700 dark:text-gray-300">Manage your active client projects and track progress.</p>
					</div>
					<Button
						asChild
						className="bg-primary text-primary-foreground  dark:hover:bg-gray-200"
					>
						<Link href="/proposals">
							<Plus className="mr-2 h-4 w-4" />
							Create Proposal
						</Link>
					</Button>
				</div>

				{/* Filters */}
				<div className="flex items-center gap-4">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search projects..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-48 border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
							<Filter className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
							<SelectItem value="on_hold">On Hold</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Projects Grid */}
				{filteredProjects.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredProjects.map((project) => (
							<Card key={project.id} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
											{project.title}
										</CardTitle>
										<Badge className={statusColors[project.status as keyof typeof statusColors]}>
											{project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Client Info */}
									{project.proposal && (
										<div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
											<Users className="h-4 w-4" />
											<span>{project.proposal.client_name}</span>
										</div>
									)}

									{/* Progress */}
									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span className="text-gray-700 dark:text-gray-300">Progress</span>
											<span className="font-medium text-gray-900 dark:text-gray-100">{project.completionPercentage}%</span>
										</div>
										<Progress
											value={project.completionPercentage}
											className="h-2 bg-gray-200 dark:bg-gray-700"
										/>
									</div>

									{/* Budget */}
									{project.proposal?.amount && (
										<div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
											<DollarSign className="h-4 w-4" />
											<span>${project.proposal.amount.toLocaleString()}</span>
										</div>
									)}

									{/* Created Date */}
									<div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
										<Calendar className="h-4 w-4" />
										<span>{format(new Date(project.created_at), 'MMM d, yyyy')}</span>
									</div>

									{/* Description */}
									{project.description && (
										<p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
											{project.description}
										</p>
									)}

									{/* Actions */}
									<div className="pt-2">
										<Button
											asChild
											variant="outline"
											size="sm"
											className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900"
										>
											<Link href={`/projects/${project.id}`}>
												<Eye className="mr-2 h-4 w-4" />
												View Details
											</Link>
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
							<FolderOpen className="h-12 w-12 text-gray-500 dark:text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects found</h3>
						<p className="text-gray-700 dark:text-gray-300 mb-4">
							{searchTerm || statusFilter !== 'all'
								? 'Try adjusting your search or filter criteria.'
								: 'Start by creating a proposal and converting it to a project.'
							}
						</p>
						<Button
							asChild
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<Link href="/proposals">
								<Plus className="mr-2 h-4 w-4" />
								Create Proposal
							</Link>
						</Button>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
