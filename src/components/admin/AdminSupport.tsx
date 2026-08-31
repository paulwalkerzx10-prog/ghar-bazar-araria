import React, { useEffect, useState } from 'react';
import { 
  Headphones, 
  Search, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  X,
  Send,
  User,
  ShoppingBag
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.ts';

interface AdminSupportProps {
  onRefresh: () => void;
}

const DEFAULT_TICKETS = [
  {
    id: 't1',
    customer_name: 'Rahul Sharma',
    phone: '+91 9876543210',
    order_id: 'ORD-8921',
    subject: 'Delayed Delivery',
    message: 'My order was supposed to arrive in 10 minutes, but it has been 25 minutes. Please update.',
    status: 'Open',
    priority: 'High',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    response: ''
  },
  {
    id: 't2',
    customer_name: 'Priya Patel',
    phone: '+91 9123456789',
    order_id: 'ORD-8904',
    subject: 'Missing Robusta Bananas',
    message: 'Received milk and eggs, but 1 kg Robusta Bananas item was missing from my bag.',
    status: 'In Progress',
    priority: 'Medium',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    response: 'Checking with delivery rider.'
  }
];

export default function AdminSupport({ onRefresh }: AdminSupportProps) {
  const [tickets, setTickets] = useState<any[]>(DEFAULT_TICKETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [responseInput, setResponseInput] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const snap = await getDocs(collection(db, 'tickets'));
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTickets(data);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string, response?: string) => {
    try {
      const updatePayload: any = { status, updated_at: new Date().toISOString() };
      if (response !== undefined) updatePayload.response = response;

      await updateDoc(doc(db, 'tickets', ticketId), updatePayload);
      
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status, ...(response !== undefined ? { response } : {}) } : t));
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev: any) => ({ ...prev, status, ...(response !== undefined ? { response } : {}) }));
      }
    } catch (err) {
      console.error("Failed ticket update:", err);
    }
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !responseInput.trim()) return;

    handleUpdateTicketStatus(selectedTicket.id, 'Resolved', responseInput.trim());
    setResponseInput('');
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = (t.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.order_id || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-200/90 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tickets by customer name, subject, order ID..."
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b803f]/30"
          />
        </div>

        <div className="flex items-center gap-1">
          {['all', 'Open', 'In Progress', 'Resolved', 'Closed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st 
                  ? 'bg-gray-900 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No support tickets found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-gray-200/80">
                  <th className="p-4">Customer & Order</th>
                  <th className="p-4">Subject & Issue</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <p className="font-extrabold text-gray-900">{ticket.customer_name}</p>
                      <p className="text-[11px] text-[#0b803f] font-bold">{ticket.order_id || 'General Support'}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-gray-900">{ticket.subject}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{ticket.message}</p>
                    </td>

                    <td className="p-4 font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        ticket.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ticket.priority || 'Medium'}
                      </span>
                    </td>

                    <td className="p-4">
                      <select
                        value={ticket.status || 'Open'}
                        onChange={e => handleUpdateTicketStatus(ticket.id, e.target.value)}
                        className="text-xs font-extrabold px-2 py-1 rounded-xl border bg-gray-50 cursor-pointer"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setSelectedTicket(ticket); setResponseInput(ticket.response || ''); }}
                        className="px-3 py-1.5 bg-[#0b803f] text-white rounded-xl font-extrabold text-xs"
                      >
                        Respond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ────────────── TICKET RESPONSE MODAL ────────────── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">{selectedTicket.subject}</h3>
                <p className="text-xs text-gray-500">Ticket from {selectedTicket.customer_name} ({selectedTicket.phone})</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2">
              <span className="font-bold text-gray-400 block uppercase tracking-wider text-[10px]">Customer Message</span>
              <p className="font-medium text-gray-800 leading-relaxed">{selectedTicket.message}</p>
            </div>

            {selectedTicket.response && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs space-y-1">
                <span className="font-bold text-emerald-800 block uppercase tracking-wider text-[10px]">Admin Resolution Note</span>
                <p className="font-semibold text-emerald-950">{selectedTicket.response}</p>
              </div>
            )}

            <form onSubmit={handleSendResponse} className="space-y-3 text-xs">
              <label className="block font-bold text-gray-700">Add Admin Response / Resolution Note</label>
              <textarea 
                rows={3}
                value={responseInput}
                onChange={e => setResponseInput(e.target.value)}
                placeholder="Type resolution message for customer..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0b803f]/30"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0b803f] text-white font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <Send size={14} /> Save & Resolve
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
