"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth/auth-provider";
import { membersApi } from "../../../lib/api/members";
import { Member, ApiMeta } from "../../../lib/api/types";
import { PageHeader } from "../../../components/shared/page-header";
import { StatusBadge } from "../../../components/shared/status-badge";
import { ShieldCheck, ShieldAlert, UserX, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function MembersListPage() {
  const { token } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMembers = async (searchQuery: string, pageNum: number) => {
    if (!token) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await membersApi.list({ page: pageNum, limit: 10, search: searchQuery }, token);
      setMembers(res.data);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load members directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMembers(search, page);
    }
  }, [token, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMembers(search, 1);
  };

  const handleVerify = async (id: string) => {
    if (!token || !window.confirm("Are you sure you want to verify this member?")) return;
    setActionLoading(id);
    try {
      await membersApi.verify(id, token);
      await fetchMembers(search, page);
    } catch (err: any) {
      alert(err.message || "Failed to verify member.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id: string) => {
    if (!token || !window.confirm("Are you sure you want to suspend this member?")) return;
    setActionLoading(id);
    try {
      await membersApi.suspend(id, token);
      await fetchMembers(search, page);
    } catch (err: any) {
      alert(err.message || "Failed to suspend member.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Management"
        description="Verify, moderate and explore registered community members"
      />

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm font-medium text-red-800">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white py-12 text-center rounded-xl border border-gray-100 shadow-sm">
          <UserX className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No members found</h3>
          <p className="mt-1 text-sm text-gray-500">Try matching other query terms.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Membership ID</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {members.map((member) => (
                  <tr key={member.profileId} className="hover:bg-gray-50/55 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{member.fullName}</td>
                    <td className="px-6 py-4 text-gray-500">{member.email}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{member.membershipId || "—"}</td>
                    <td className="px-6 py-4 capitalize">{member.role}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {member.status !== "active" ? (
                        <button
                          onClick={() => handleVerify(member.profileId)}
                          disabled={actionLoading !== null}
                          className="inline-flex items-center text-xs font-semibold text-green-600 hover:text-green-500 disabled:opacity-50"
                          title="Verify Member"
                        >
                          <ShieldCheck className="h-4 w-4 mr-1" />
                          Verify
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(member.profileId)}
                          disabled={actionLoading !== null}
                          className="inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-500 disabled:opacity-50"
                          title="Suspend Member"
                        >
                          <ShieldAlert className="h-4 w-4 mr-1" />
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing Page <span className="font-medium">{page}</span> of{" "}
                    <span className="font-medium">{meta.totalPages}</span> (Total{" "}
                    <span className="font-medium">{meta.total}</span> records)
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage(page + 1)}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
