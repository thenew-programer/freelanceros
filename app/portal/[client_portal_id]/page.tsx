'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Clock, CheckCircle, AlertCircle, DollarSign, User, Mail, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getProjectByPortalId } from '@/lib/portal';
import { getMilestones, getMilestoneStats } from '@/lib/milestones';
import { format, isAfter } from 'date-fns';
import type { Project, Milestone } from '@/lib/supabase';

const statusColors = {
	active: 'bg-green-100 text-green-800',
	completed: 'bg-blue-100 text-blue-800',
	on_hold: 'bg-yellow-100 text-yellow-800',
	cancelled: 'bg-red-100 text-red-800',
};

const milestoneStatusColors = {
	pending: 'bg-gray-100 text-gray-800',
	in_progress: 'bg-yellow-100 text-yellow-800',
	completed: 'bg-green-100 text-green-800',
};

const milestoneStatusIcons = {
	pending: Clock,
	in_progress: AlertCircle,
	completed: CheckCircle,
};

interface ProjectWithDetails extends Project {
	proposal?: any;
}

export default function ClientPortalPage() {
	const params = useParams();
	const [project, setProject] = useState<ProjectWithDetails | null>(null);
	const [milestones, setMilestones] = useState<Milestone[]>([]);
	const [stats, setStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (params.client_portal_id) {
			loadPortalData();
		}
	}, [params.client_portal_id]);

	const loadPortalData = async () => {
		try {
			const { data: projectData, error: projectError } = await getProjectByPortalId(params.client_portal_id as string);

			if (projectError || !projectData) {
				setError('Project not found or access denied');
				return;
			}

			setProject(projectData);

			// Load milestones (public access)
			const { data: milestonesData, error: milestonesError } = await getMilestones(projectData.id, projectData.user_id);
			if (!milestonesError && milestonesData) {
				setMilestones(milestonesData);
			}

			// Load stats
			const { data: statsData } = await getMilestoneStats(projectData.id);
			setStats(statsData);
		} catch (error) {
			setError('Failed to load project data');
		} finally {
			setLoading(false);
		}
	};

	const getUpcomingMilestones = () => {
		return milestones
			.filter(m => m.due_date && m.status !== 'completed' && isAfter(new Date(m.due_date), new Date()))
			.sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
			.slice(0, 3);
	};

	const getRecentUpdates = () => {
		return milestones
			.filter(m => m.status === 'completed')
			.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
			.slice(0, 5);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading project details...</p>
				</div>
			</div>
		);
	}

	if (error || !project) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center max-w-md mx-auto p-6">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<AlertCircle className="h-8 w-8 text-red-600" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
					<p className="text-gray-600 mb-4">
						{error || 'The project you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}
					</p>
					<p className="text-sm text-gray-500">
						Please check the URL or contact your project manager for assistance.
					</p>
				</div>
			</div>
		);
	}

	const upcomingMilestones = getUpcomingMilestones();
	const recentUpdates = getRecentUpdates();

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
								<FileText className="h-6 w-6 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
								<p className="text-gray-600">Project Dashboard</p>
							</div>
						</div>
						<Badge className={statusColors[project.status as keyof typeof statusColors]}>
							{project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
						</Badge>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Project Overview */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h2>
					{project.description && (
						<p className="text-lg text-gray-600 mb-4">{project.description}</p>
					)}

					{/* Key Metrics */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<Card className="border-gray-200">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">Progress</p>
										<p className="text-2xl font-bold text-gray-900">{stats?.completionPercentage || 0}%</p>
									</div>
									<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
										<CheckCircle className="h-6 w-6 text-blue-600" />
									</div>
								</div>
								<Progress value={stats?.completionPercentage || 0} className="mt-3 h-2" />
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">Milestones</p>
										<p className="text-2xl font-bold text-gray-900">{stats?.completed || 0}/{stats?.total || 0}</p>
									</div>
									<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
										<Calendar className="h-6 w-6 text-green-600" />
									</div>
								</div>
								<p className="text-sm text-gray-500 mt-1">Completed</p>
							</CardContent>
						</Card>

						{project.proposal?.amount && (
							<Card className="border-gray-200">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-gray-600">Budget</p>
											<p className="text-2xl font-bold text-gray-900">${project.proposal.amount.toLocaleString()}</p>
										</div>
										<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
											<DollarSign className="h-6 w-6 text-purple-600" />
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						<Card className="border-gray-200">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600">Started</p>
										<p className="text-lg font-bold text-gray-900">{format(new Date(project.created_at), 'MMM d, yyyy')}</p>
									</div>
									<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
										<Clock className="h-6 w-6 text-orange-600" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						{/* Project Timeline */}
						<Card className="border-gray-200">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-gray-900">
									<Calendar className="h-5 w-5" />
									Project Timeline
								</CardTitle>
							</CardHeader>
							<CardContent>
								{milestones.length > 0 ? (
									<div className="space-y-4">
										{milestones.map((milestone, index) => {
											const StatusIcon = milestoneStatusIcons[milestone.status as keyof typeof milestoneStatusIcons];
											const isLast = index === milestones.length - 1;

											return (
												<div key={milestone.id} className="relative">
													{!isLast && (
														<div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
													)}
													<div className="flex items-start gap-4">
														<div className={`w-12 h-12 rounded-full flex items-center justify-center ${milestone.status === 'completed' ? 'bg-green-100' :
															milestone.status === 'in_progress' ? 'bg-yellow-100' : 'bg-gray-100'
															}`}>
															<StatusIcon className={`h-6 w-6 ${milestone.status === 'completed' ? 'text-green-600' :
																milestone.status === 'in_progress' ? 'text-yellow-600' : 'text-gray-400'
																}`} />
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center justify-between">
																<h4 className="text-lg font-semibold text-gray-900">{milestone.title}</h4>
																<Badge className={milestoneStatusColors[milestone.status as keyof typeof milestoneStatusColors]}>
																	{milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.replace('_', ' ').slice(1)}
																</Badge>
															</div>
															{milestone.description && (
																<p className="text-gray-600 mt-1">{milestone.description}</p>
															)}
															<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
																{milestone.due_date && (
																	<span>Due: {format(new Date(milestone.due_date), 'MMM d, yyyy')}</span>
																)}
																{milestone.status === 'completed' && (
																	<span>Completed: {format(new Date(milestone.updated_at), 'MMM d, yyyy')}</span>
																)}
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<div className="text-center py-8">
										<Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
										<p className="text-gray-500">No milestones have been set up yet.</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Recent Updates */}
						<Card className="border-gray-200">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-gray-900">
									<CheckCircle className="h-5 w-5" />
									Recent Updates
								</CardTitle>
							</CardHeader>
							<CardContent>
								{recentUpdates.length > 0 ? (
									<div className="space-y-4">
										{recentUpdates.map((update) => (
											<div key={update.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
												<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
													<CheckCircle className="h-4 w-4 text-green-600" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-gray-900">{update.title} completed</p>
													{update.description && (
														<p className="text-sm text-gray-600 mt-1">{update.description}</p>
													)}
													<p className="text-xs text-gray-500 mt-2">
														{format(new Date(update.updated_at), 'MMM d, yyyy \'at\' h:mm a')}
													</p>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
										<p className="text-gray-500">No recent updates available.</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Contact Information */}
						{project.proposal && (
							<Card className="border-gray-200">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-gray-900">
										<User className="h-5 w-5" />
										Project Manager
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div>
										<p className="text-sm text-gray-600">Contact</p>
										<p className="font-medium text-gray-900">Project Team</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Email</p>
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 text-gray-400" />
											<a
												href={`mailto:${project.proposal.client_email}`}
												className="text-blue-600 hover:text-blue-800 font-medium"
											>
												Contact Us
											</a>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Upcoming Milestones */}
						<Card className="border-gray-200">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-gray-900">
									<Clock className="h-5 w-5" />
									Upcoming Milestones
								</CardTitle>
							</CardHeader>
							<CardContent>
								{upcomingMilestones.length > 0 ? (
									<div className="space-y-3">
										{upcomingMilestones.map((milestone) => (
											<div key={milestone.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
												<h4 className="font-medium text-gray-900">{milestone.title}</h4>
												<p className="text-sm text-gray-600 mt-1">
													Due: {format(new Date(milestone.due_date!), 'MMM d, yyyy')}
												</p>
												<Badge className={milestoneStatusColors[milestone.status as keyof typeof milestoneStatusColors]}>
													{milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.replace('_', ' ').slice(1)}
												</Badge>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-6">
										<Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
										<p className="text-sm text-gray-500">No upcoming milestones</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Project Status */}
						<Card className="border-gray-200">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-gray-900">
									<AlertCircle className="h-5 w-5" />
									Project Status
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Overall Status</span>
										<Badge className={statusColors[project.status as keyof typeof statusColors]}>
											{project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Progress</span>
										<span className="font-medium text-gray-900">{stats?.completionPercentage || 0}%</span>
									</div>
									<Progress value={stats?.completionPercentage || 0} className="h-2" />
									<div className="text-xs text-gray-500 mt-2">
										Last updated: {format(new Date(project.updated_at), 'MMM d, yyyy')}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="bg-white border-t border-gray-200 mt-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="text-center text-sm text-gray-500">
						<p>This is a secure client portal. Please do not share this link with unauthorized parties.</p>
						<p className="mt-1">© 2025 FreelancerOS. All rights reserved.</p>
					</div>
				</div>
			</div>
		</div>
	);
}
