"use client";

import * as React from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  FileText,
  Filter,
  Loader2,
  Package,
  Receipt,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/features/auth";
import {
  ordersApi,
  OrderDetailModal,
  OrderShippingLabelModal,
  OrderTaxInvoiceModal,
  type Order,
  type OrderStatusFilter,
} from "@/features/orders";

export default function AdminOrdersPage() {
  const { tokens } = useAuth();
  const token = tokens?.access_token;

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(15);
  const [statusFilter, setStatusFilter] = React.useState<OrderStatusFilter>("all");
  const [search, setSearch] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Modal state
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [shippingLabelOrder, setShippingLabelOrder] = React.useState<Order | null>(null);
  const [taxInvoiceOrder, setTaxInvoiceOrder] = React.useState<Order | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setError(null);
    try {
      const res = await ordersApi.listOrders(token || undefined, {
        page,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setOrders(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      setError(err?.message || "Failed to retrieve orders.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, page, limit, statusFilter, search]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  // Compute live aggregates from loaded orders
  const grossRevenue = React.useMemo(() => {
    return orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  }, [orders]);

  const totalItemsCount = React.useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.items ? o.items.reduce((acc, i) => acc + i.quantity, 0) : 0), 0);
  }, [orders]);

  const averageOrderValue = orders.length > 0 ? grossRevenue / orders.length : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Customer Acquisitions & Orders"
        subtitle="Dedicated client acquisition registry: inspect storefront orders, payment verification, fulfillment addresses, and purchased fine jewellery pieces."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Orders
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border-[#E8E1D8]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
              Total Customer Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-[#B08D57]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#24211E] font-medium">{total}</div>
            <p className="text-[11px] text-[#716B64] mt-1">
              Storefront checkouts recorded in database
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E8E1D8]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
              Settled Volume (Page)
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#24211E] font-medium text-emerald-800">
              ${grossRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-[#716B64] mt-1">
              Simulated card &amp; luxury checkout collections
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E8E1D8]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
              Average Order Value
            </span>
            <CreditCard className="w-4 h-4 text-[#B08D57]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#24211E] font-medium">
              ${averageOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-[#716B64] mt-1">
              Average high-jewellery basket value
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E8E1D8]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
              Pieces Acquired
            </span>
            <Package className="w-4 h-4 text-[#B08D57]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#24211E] font-medium">
              {totalItemsCount} units
            </div>
            <p className="text-[11px] text-[#716B64] mt-1">
              Pieces claimed from vault inventory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white border border-[#E8E1D8] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716B64]" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order number, client name, or email..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "all", label: "All Orders" },
            { key: "paid", label: "Paid" },
            { key: "pending", label: "Pending" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setStatusFilter(item.key as OrderStatusFilter);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === item.key
                  ? "bg-[#24211E] text-white shadow-xs"
                  : "bg-[#FAF8F4] text-[#716B64] hover:text-[#24211E] border border-[#E8E1D8]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <Card className="bg-white border-[#E8E1D8] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <LoadingSpinner className="py-8" />
            <p className="text-xs text-[#716B64] mt-2">Loading customer order books...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-700 bg-red-50 text-xs">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No Client Orders Recorded"
              description={
                search
                  ? `No orders matching "${search}" were found.`
                  : "Clients have not placed any orders matching this criteria yet."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] border-t border-[#E8E1D8]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-[#FAF8F4] shadow-2xs">
                <tr className="border-b border-[#E8E1D8] bg-[#FAF8F4] text-[#716B64] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6 font-semibold">Order Reference</th>
                  <th className="py-3 px-6 font-semibold">Client Identity</th>
                  <th className="py-3 px-6 font-semibold">Acquired Pieces</th>
                  <th className="py-3 px-6 font-semibold">Payment Status</th>
                  <th className="py-3 px-6 font-semibold">Total Amount</th>
                  <th className="py-3 px-6 font-semibold">Placement Date</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE2]">
                {orders.map((order) => {
                  const isPaid = order.payment_status.toLowerCase() === "paid";
                  const itemsCount = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF8F4]/70 transition-colors">
                      {/* Order Number */}
                      <td className="py-4 px-6 font-mono font-medium text-[#24211E]">
                        <span className="text-[#B08D57] font-semibold">{order.order_number}</span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-sm text-[#24211E]">
                          {order.customer_name}
                        </div>
                        <div className="text-[11px] text-[#716B64]">{order.customer_email}</div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#24211E]">
                            {itemsCount} piece{itemsCount > 1 ? "s" : ""}
                          </span>
                          <span className="text-[10px] text-[#9E988F]">
                            ({order.items?.length || 0} line item{order.items?.length > 1 ? "s" : ""})
                          </span>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <p className="text-[10px] text-[#716B64] truncate max-w-[200px] mt-0.5">
                            {order.items[0].product_title}
                            {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                          </p>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase tracking-wider ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {order.payment_status}
                        </Badge>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6 font-mono text-sm font-bold text-[#24211E]">
                        ${Number(order.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-[#716B64]">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="h-8 gap-1 text-xs text-[#24211E] border-[#D4C9BA] hover:bg-[#FAF8F4]"
                            title="Inspect Order Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#B08D57]" />
                            <span>Inspect</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShippingLabelOrder(order)}
                            className="h-8 gap-1 text-xs text-[#24211E] border-[#D4C9BA] hover:bg-[#FAF8F4]"
                            title="Print Shipping Label with QR Code"
                          >
                            <Tag className="w-3.5 h-3.5 text-[#B08D57]" />
                            <span>Label</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTaxInvoiceOrder(order)}
                            className="h-8 gap-1 text-xs text-[#24211E] border-[#D4C9BA] hover:bg-[#FAF8F4]"
                            title="View & Print Official Tax Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#B08D57]" />
                            <span>Invoice</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="p-4 border-t border-[#E8E1D8]">
            <Pagination
              page={page}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOpenShippingLabel={(o) => setShippingLabelOrder(o)}
        onOpenTaxInvoice={(o) => setTaxInvoiceOrder(o)}
      />

      {/* Shipping Label Modal */}
      <OrderShippingLabelModal
        order={shippingLabelOrder}
        isOpen={!!shippingLabelOrder}
        onClose={() => setShippingLabelOrder(null)}
      />

      {/* Tax Invoice Modal */}
      <OrderTaxInvoiceModal
        order={taxInvoiceOrder}
        isOpen={!!taxInvoiceOrder}
        onClose={() => setTaxInvoiceOrder(null)}
      />
    </div>
  );
}
