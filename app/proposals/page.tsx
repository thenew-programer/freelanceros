'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProposalForm } from '@/components/proposals/proposal-form';
import { ProposalTable } from '@/components/proposals/proposal-table';
import { ProposalDetail } from '@/components/proposals/proposal-detail';
import { getCurrentUser } from '@/lib/auth';
import { getProposals, deleteProposal } from '@/lib/proposals';
import { toast } from 'sonner';
import type { Proposal } from '@/lib/supabase';

export default function ProposalsPage() {
	const [proposals, setProposals] = useState<Proposal[]>([]);
	const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [showForm, setShowForm] = useState(false);
	const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
	const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);

	useEffect(() => {
		loadProposals();
	}, []);

	useEffect(() => {
		filterProposals();
	}, [proposals, searchTerm, statusFilter]);

	const loadProposals = async () => {
		try {
			const { user } = await getCurrentUser();
			if (!user) return;

			const { data, error } = await getProposals(user.id);
			if (error) {
				toast.error('Failed to load proposals');
				return;
			}

			setProposals(data || []);
		} catch (error) {
			toast.error('Failed to load proposals');
		} finally {
			setLoading(false);
		}
	};

	const filterProposals = () => {
		let filtered = proposals;

		// Filter by search term
		if (searchTerm) {
			filtered = filtered.filter(proposal =>
				proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				proposal.client_name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter(proposal => proposal.status === statusFilter);
		}

		setFilteredProposals(filtered);
	};

	const handleFormSuccess = () => {
		setShowForm(false);
		setEditingProposal(null);
		loadProposals();
	};

	const handleEdit = (proposal: Proposal) => {
		setEditingProposal(proposal);
		setShowForm(true);
	};

	const handleView = (proposal: Proposal) => {
		setViewingProposal(proposal);
	};

	const handleDelete = async (proposal: Proposal) => {
		if (!confirm('Are you sure you want to delete this proposal?')) return;

		try {
			const { error } = await deleteProposal(proposal.id);
			if (error) {
				toast.error(error.message);
				return;
			}
			toast.success('Proposal deleted successfully');
			setViewingProposal(null);
			loadProposals();
		} catch (error) {
			toast.error('Failed to delete proposal');
		}
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
						<h1 className="text-3xl font-bold text-black dark:text-white">Proposals</h1>
						<p className="text-gray-600 dark:text-gray-400">Manage your client proposals and track their status.</p>
					</div>
					<Button
						onClick={() => setShowForm(true)}
						className="bg-black text-white hover:bg-gray-800 border-transparent dark:bg-black dark:text-white dark:border-white dark:hover:bg-gray-900"
					>
						<Plus className="mr-2 h-4 w-4" />
						New Proposal
					</Button>
				</div>

				{/* Filters */}
				<div className="flex items-center gap-4">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search proposals..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-48 border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800">
							<Filter className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="approved">Approved</SelectItem>
							<SelectItem value="rejected">Rejected</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Proposals Table */}
				<ProposalTable
					proposals={filteredProposals}
					onEdit={handleEdit}
					onView={handleView}
					onRefresh={loadProposals}
				/>

				{/* Modals */}
				{showForm && (
					<ProposalForm
						proposal={editingProposal || undefined}
						onSuccess={handleFormSuccess}
						onCancel={() => {
							setShowForm(false);
							setEditingProposal(null);
						}}
					/>
				)}

				{viewingProposal && (
					<ProposalDetail
						proposal={viewingProposal}
						onClose={() => setViewingProposal(null)}
						onEdit={() => {
							setEditingProposal(viewingProposal);
							setViewingProposal(null);
							setShowForm(true);
						}}
						onDelete={() => handleDelete(viewingProposal)}
						onRefresh={loadProposals}
					/>
				)}
			</div>
		</DashboardLayout>
	);
}
