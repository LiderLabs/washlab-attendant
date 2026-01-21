"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStationSession } from "@/hooks/useStationSession"
import { usePaginatedQuery, useMutation, useQuery } from "convex/react"
import { api } from "@devlider001/washlab-backend/api"
import { Id } from "@devlider001/washlab-backend/dataModel"
import {
  Search,
  Phone,
  Mail,
  AlertTriangle,
  Minus,
  Plus,
  Scale,
  Package,
  ShoppingBag,
  Trash2,
  MessageSquare,
  ArrowRight,
  Clock,
  User,
  Tag,
  CheckCircle,
  X,
  Droplets,
  Wind,
  History,
} from "lucide-react"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/washstation/LoadingSpinner"
import { EmptyState } from "@/components/washstation/EmptyState"
import { ActionVerification } from "@/components/washstation/ActionVerification"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function OnlineOrdersContent() {
  const router = useRouter()
  const { stationToken, isSessionValid } = useStationSession()

  const [selectedOrder, setSelectedOrder] = useState<{
    _id: Id<"orders">
    orderNumber: string
    customer?: { name?: string; phoneNumber?: string; email?: string }
    estimatedWeight?: number
    serviceType?: string
    isDelivery?: boolean
    notes?: string
    createdAt: number
    finalPrice?: number
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showRejectVerification, setShowRejectVerification] = useState(false)

  // Weight intake
  const [weight, setWeight] = useState(0)
  const [laundryBags, setLaundryBags] = useState(1)
  const [hangers, setHangers] = useState(0)
  const [bagCardNumber, setBagCardNumber] = useState("")
const [notes, setNotes] = useState(selectedOrder?.notes || "")

  // Service details
  const [detergent, setDetergent] = useState("standard")
  const [softener, setSoftener] = useState("none")

  // Fetch active bag numbers
  const activeBagNumbers =
    useQuery(
      api.stations.getActiveBagNumbers,
      stationToken ? { stationToken } : "skip"
    ) ?? []

  // Get pending online orders (pending_dropoff or pending status, online type only)
  const allOnlineOrdersResult = usePaginatedQuery(
    api.stations.getStationOrders,
    stationToken
      ? {
          stationToken,
          orderType: "online" as any,
        }
      : "skip",
    { initialNumItems: 50 }
  )

  // Filter for pending orders (both "pending" and "pending_dropoff" statuses)
  const pendingOrders = (allOnlineOrdersResult.results || []).filter(
    (order) => order.status === "pending_dropoff" || order.status === "pending"
  )
  const isLoadingOrders = allOnlineOrdersResult.status === "LoadingFirstPage"

  const checkInOrder = useMutation(api.stations.checkInOnlineOrder)
  const cancelOrder = useMutation(api.stations.cancelOnlineOrder)

  // Get branch info for pricing
  const branchInfo = useQuery(
    // @ts-ignore - getStationInfo exists but may not be in generated types yet
    api.stations.getStationInfo,
    stationToken ? { stationToken } : "skip"
  ) as { pricingPerKg: number; deliveryFee: number } | undefined

  useEffect(() => {
    // Auto-select first pending order
    if (pendingOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(pendingOrders[0])
    }
  }, [pendingOrders, selectedOrder])

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order)
    setWeight(0) // Reset weight - staff needs to weigh it
    setLaundryBags(1)
    setHangers(0)
    setBagCardNumber("")
  }

  const handleRejectClick = () => {
    if (selectedOrder) {
      setShowRejectVerification(true)
    }
  }

  const handleRejectConfirm = async (
    attendantId: Id<"attendants">,
    verificationId: Id<"biometricVerifications">
  ) => {
    if (!selectedOrder || !stationToken) {
      toast.error("Please select an order")
      return
    }

    try {
      await cancelOrder({
        stationToken,
        orderId: selectedOrder._id,
        verificationId,
        reason: "Order rejected by attendant",
      })

      toast.success("Order cancelled successfully")
      setShowRejectVerification(false)
      setSelectedOrder(null)
      setWeight(0)
      setLaundryBags(1)
      setHangers(0)
      setBagCardNumber("")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel order"
      )
    }
  }

  const handleContact = () => {
    if (selectedOrder?.customer?.phoneNumber) {
      const phone = selectedOrder.customer.phoneNumber.startsWith("0")
        ? `233${selectedOrder.customer.phoneNumber.slice(1)}`
        : selectedOrder.customer.phoneNumber
      window.open(`https://wa.me/${phone}`, "_blank")
    }
  }

  const handleConvertToActive = async () => {
    if (!selectedOrder || !stationToken) {
      toast.error("Please select an order")
      return
    }

    if (weight === 0 || weight < 0.1) {
      toast.error("Please enter a valid weight")
      return
    }

    if (!bagCardNumber) {
      toast.error("Please select a bag card number")
      return
    }

    // Check if bag number is already taken
    const takenNumbers = new Set(activeBagNumbers)
    if (takenNumbers.has(bagCardNumber)) {
      toast.error(
        `Bag number ${bagCardNumber} is already assigned to an active order`
      )
      return
    }

    try {
      await checkInOrder({
        stationToken,
        orderId: selectedOrder._id,
        actualWeight: weight,
        itemCount: laundryBags || 1,
        bagCardNumber: bagCardNumber,
        notes: undefined,
      })

      toast.success("Order checked in successfully")
      // Reset state
      setSelectedOrder(null)
      setWeight(0)
      setLaundryBags(1)
      setHangers(0)
      setBagCardNumber("")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to check in order"
      )
    }
  }

  const getTimeAgo = (timestamp: number) => {
    const diff = new Date().getTime() - timestamp
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  // Calculate totals
  const totalVolume = pendingOrders.reduce(
    (acc, o) => acc + (o.estimatedWeight || 5),
    0
  )
  const oldestOrder =
    pendingOrders.length > 0
      ? getTimeAgo(pendingOrders[pendingOrders.length - 1].createdAt)
      : "N/A"

  // Calculate estimated total using new pricing logic (8kg per load)
  const calculateEstimatedTotal = () => {
    if (!selectedOrder || weight <= 0) {
      return selectedOrder?.finalPrice || 0
    }

    // Service pricing per load
    const servicePricing: Record<string, number> = {
      wash_only: 25,
      wash_and_dry: 50,
      wash_and_fold: 50,
      dry_only: 25,
    }

    // Calculate number of loads (8kg per load, plus 1 minus 1 logic)
    const numberOfLoads = Math.ceil(weight / 8)

    // Get service type
    const serviceType = selectedOrder.serviceType || "wash_and_dry"
    const pricePerLoad = servicePricing[serviceType] || 50

    // Calculate base price
    let basePrice = numberOfLoads * pricePerLoad

    // Add whites separate fee if applicable (25 GHS for separate wash)
    if ((selectedOrder as any).whitesSeparate) {
      basePrice += 25
    }

    // Add delivery fee if applicable
    const deliveryFee =
      selectedOrder.isDelivery && branchInfo ? branchInfo.deliveryFee : 0

    return basePrice + deliveryFee
  }

  const estimatedTotal = calculateEstimatedTotal()

  // Get service name
  const getServiceName = (serviceType: string) => {
    const serviceMap: Record<string, string> = {
      wash_only: "Wash Only",
      wash_and_dry: "Wash & Fold",
      wash_and_fold: "Wash & Fold",
      dry_only: "Dry Only",
    }
    return serviceMap[serviceType] || serviceType.replace(/_/g, " & ")
  }

  // Generate available bag numbers (001-010, skipping taken ones, extending if needed)
  const takenNumbers = new Set(activeBagNumbers)
  const availableNumbers: string[] = []
  let num = 1
  while (availableNumbers.length < 10) {
    const bagNum = num.toString().padStart(3, "0")
    if (!takenNumbers.has(bagNum)) {
      availableNumbers.push(bagNum)
    }
    num++
  }

  const filteredOrders = pendingOrders.filter((order) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        order.orderNumber?.toLowerCase().includes(query) ||
        order.customer?.name?.toLowerCase().includes(query) ||
        order.customer?.phoneNumber?.includes(query)
      )
    }
    return true
  })

  if (!isSessionValid) {
    return <LoadingSpinner text='Verifying session...' />
  }

  return (
    <div className='flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden'>
      {/* Left - Queue */}
      <div className='w-full lg:w-72 border-r border-border bg-card overflow-y-auto flex-shrink-0 h-auto lg:h-auto'>
        <div className='p-4 border-b border-border flex-shrink-0'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='font-semibold text-foreground'>Intake Queue</h2>
            <span className='px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full'>
              {pendingOrders.length} Pending
            </span>
          </div>

          <div className='grid grid-cols-2 gap-3 sm:gap-4 text-sm'>
            <div>
              <p className='text-muted-foreground text-xs uppercase'>
                ESTIMATED VOLUME
              </p>
              <p className='text-lg sm:text-xl font-bold text-foreground'>
                {totalVolume.toFixed(1)} kg
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs uppercase'>
                OLDEST ORDER
              </p>
              <p className='text-lg sm:text-xl font-bold text-destructive'>
                ● {oldestOrder}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className='p-4 border-b border-border'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search orders...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 w-full'
            />
          </div>
        </div>

        {/* Order List */}
        <div className='flex-1 overflow-y-auto divide-y divide-border'>
          {isLoadingOrders ? (
            <div className='p-8 text-center text-muted-foreground'>
              <Package className='w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse' />
              <p className='text-sm'>Loading orders...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <button
                key={order._id}
                onClick={() => handleSelectOrder(order)}
                className={`w-full p-3 sm:p-4 text-left transition-colors ${
                  selectedOrder?._id === order._id
                    ? "bg-primary/10 border-l-4 border-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className='flex items-center justify-between mb-1'>
                  <span className='font-medium text-foreground text-sm sm:text-base truncate'>
                    {order.customer?.name || "Unknown"}
                  </span>
                  <span className='text-xs text-muted-foreground flex-shrink-0 ml-2'>
                    {getTimeAgo(order.createdAt)}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span className='text-primary'>#{order.orderNumber}</span>
                  <span>•</span>
                  <span className='truncate'>
                    {getServiceName(order.serviceType || "wash_and_fold")}
                  </span>
                  {order.isDelivery && (
                    <>
                      <span>•</span>
                      <span className='text-warning'>Delivery</span>
                    </>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className='p-8 text-center text-muted-foreground'>
              <Package className='w-12 h-12 mx-auto mb-3 opacity-50' />
              <p className='text-sm'>No pending orders</p>
            </div>
          )}
        </div>
      </div>

      {/* Center - Order Details */}
      {selectedOrder ? (
        <div className='flex-1 overflow-y-auto min-w-0 flex flex-col relative'>
          <div className='flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6'>
            {/* Customer Header */}
            <div className='flex flex-col gap-4 mb-4 sm:mb-6'>
              <div className='flex items-center gap-3 sm:gap-4'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0'>
                  <User className='w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <h2 className='text-base sm:text-lg md:text-xl font-bold text-foreground truncate'>
                      {selectedOrder.customer?.name || "Unknown"}
                    </h2>
                    <span className='px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full whitespace-nowrap'>
                      NEW CUSTOMER
                    </span>
                  </div>
                  <div className='flex items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap'>
                    <span className='flex items-center gap-1'>
                      <Phone className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                      <span className='truncate'>
                        {selectedOrder.customer?.phoneNumber || "N/A"}
                      </span>
                    </span>
                    {selectedOrder.customer?.email && (
                      <span className='flex items-center gap-1'>
                        <Mail className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                        <span className='truncate'>
                          {selectedOrder.customer.email}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className='flex items-center justify-between sm:justify-start sm:gap-4'>
                <div>
                  <p className='text-xs text-muted-foreground'>Order ID</p>
                  <p className='font-bold text-foreground text-sm sm:text-base'>
                    #{selectedOrder.orderNumber}
                  </p>
                </div>
                {bagCardNumber && (
                  <div className='text-right sm:text-left'>
                    <p className='text-xs text-muted-foreground'>Bag Card</p>
                    <p className='font-bold text-primary text-sm sm:text-base'>
                      #{bagCardNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
              {/* Weight Intake */}
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-semibold text-foreground flex items-center gap-2'>
                    <Scale className='w-5 h-5' />
                    Weight Intake
                  </h3>
                  <span className='text-sm text-muted-foreground'>
                    Customer Estimate:{" "}
                    <strong>
                      {selectedOrder.estimatedWeight?.toFixed(1) || "0.0"} kg
                    </strong>
                  </span>
                </div>

                <div className='bg-card border border-border rounded-xl p-4 sm:p-6 mb-4'>
                 <div className='text-center'>
                <Input
                type="number"
               step={0.1}
               min={0}
               value={weight}
               onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className='text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-center border-0 bg-transparent focus:ring-0'
              />
              <span className='text-lg sm:text-xl text-muted-foreground ml-2'>
              kg
              </span>
              </div>
                </div>

                <div className='flex flex-col sm:flex-row gap-2 justify-center'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setWeight((prev) => Math.max(0, prev + 0.5))}
                    className='w-full sm:w-auto'
                  >
                    +0.5 kg Bag Weight
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setWeight(0)}
                    className='w-full sm:w-auto'
                  >
                    Reset Scale
                  </Button>
                </div>
              </div>

              {/* Customer Instructions */}
              <div className='bg-warning/5 border border-warning/20 rounded-xl p-4'>
  <h3 className='font-semibold text-foreground flex items-center gap-2 mb-3'>
    <MessageSquare className='w-5 h-5 text-warning' />
    CUSTOMER INSTRUCTIONS
  </h3>
  <textarea
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder="Add or edit customer instructions..."
    className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-muted border-0 rounded-xl text-foreground placeholder:text-muted-foreground resize-none h-20 sm:h-24 text-sm sm:text-base'
  />
</div>

            </div>

            {/* Bag Card Number */}
            <div className='mt-6'>
              <Label className='block text-sm font-medium text-foreground mb-2'>
                Bag Card Number <span className='text-destructive'>*</span>
              </Label>
              <p className='text-xs text-muted-foreground mb-3'>
                Select the physical card placed inside the laundry bag. Customer
                gets the matching card.
              </p>
              <div className='grid grid-cols-5 gap-2'>
                {availableNumbers.map((card) => (
                  <button
                    key={card}
                    onClick={() => setBagCardNumber(card)}
                    className={`h-10 sm:h-12 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      bagCardNumber === card
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    #{card}
                  </button>
                ))}
              </div>
              {bagCardNumber && (
                <div className='mt-3 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-xl'>
                  <p className='text-sm text-green-700 dark:text-green-400 font-medium'>
                    ✓ Card #{bagCardNumber} selected - Give matching card to
                    customer
                  </p>
                </div>
              )}
            </div>

            {/* Items Verification */}
            <div className='mt-6'>
              <h3 className='font-semibold text-foreground flex items-center gap-2 mb-4'>
                <ShoppingBag className='w-5 h-5' />
                Items Verification
              </h3>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
              <div className="flex flex-col p-3 sm:p-4 bg-card border border-border rounded-xl">
  {/* Top: Label */}
  <div className="flex items-center gap-3 mb-2">
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
      <Package className="w-5 h-5 text-muted-foreground" />
    </div>
    <div className="min-w-0">
      <p className="font-medium text-foreground text-sm">Laundry Bags</p>
      <p className="text-xs text-muted-foreground truncate">Standard WashLab Bag</p>
    </div>
  </div>

  {/* Bottom: - [input] + */}
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => setLaundryBags(Math.max(0, laundryBags - 1))}
      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
    >
      <Minus className="w-4 h-4" />
    </button>

    <Input
      type="number"
      min={0}
      step={1}
      value={laundryBags}
      onChange={(e) => setLaundryBags(parseInt(e.target.value) || 0)}
      className="w-16 text-center font-semibold text-foreground border-0 bg-transparent focus:ring-0"
    />

    <button
      type="button"
      onClick={() => setLaundryBags(laundryBags + 1)}
      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
    >
      <Plus className="w-4 h-4" />
    </button>
  </div>
</div>


             <div className="flex flex-col p-3 sm:p-4 bg-card border border-border rounded-xl">
  {/* Top: Label */}
  <div className="flex items-center gap-3 mb-2">
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
      <Tag className="w-5 h-5 text-muted-foreground" />
    </div>
    <div className="min-w-0">
      <p className="font-medium text-foreground text-sm">Hangers</p>
      <p className="text-xs text-muted-foreground truncate">Customer Provided</p>
    </div>
  </div>

  {/* Bottom: - [input] + */}
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => setHangers(Math.max(0, hangers - 1))}
      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
    >
      <Minus className="w-4 h-4" />
    </button>

    <Input
      type="number"
      min={0}
      step={1}
      value={hangers}
      onChange={(e) => setHangers(parseInt(e.target.value) || 0)}
      className="w-16 text-center font-semibold text-foreground border-0 bg-transparent focus:ring-0"
    />

    <button
      type="button"
      onClick={() => setHangers(hangers + 1)}
      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
    >
      <Plus className="w-4 h-4" />
    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='fixed lg:sticky bottom-0 left-0 right-0 lg:left-auto lg:right-auto bg-card border-t border-border p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 z-50 shadow-lg lg:shadow-none'>
            <div className='flex gap-2 sm:gap-3'>
              <Button
                variant='outline'
                className='text-destructive border-destructive/30 flex-1 sm:flex-initial'
                onClick={handleRejectClick}
                size='sm'
              >
                <Trash2 className='w-4 h-4 sm:mr-2' />
                <span className='text-xs sm:text-sm'>Reject</span>
              </Button>
              <Button
                variant='outline'
                onClick={handleContact}
                size='sm'
                className='flex-1 sm:flex-initial'
              >
                <Phone className='w-4 h-4 sm:mr-2' />
                <span className='text-xs sm:text-sm'>Contact</span>
                <span className='sm:hidden'>Call</span>
              </Button>
            </div>
            <Button
              onClick={handleConvertToActive}
              className='bg-primary text-primary-foreground w-full sm:w-auto'
              disabled={weight === 0 || !bagCardNumber}
              size='sm'
            >
              <span className='text-xs sm:text-sm'>
                Convert to Active Order
              </span>
              <span className='lg:hidden'>Convert Order</span>
              <ArrowRight className='w-4 h-4 ml-2' />
            </Button>
          </div>
        </div>
      ) : (
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center text-muted-foreground'>
            <Package className='w-16 h-16 mx-auto mb-4 opacity-50' />
            <p className='text-lg'>Select an order from the queue</p>
            <p className='text-sm'>to start intake process</p>
          </div>
        </div>
      )}

      {/* Right - Service Details */}
      {selectedOrder && (
        <div className='w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 overflow-y-auto flex-shrink-0'>
          <h3 className='font-semibold text-foreground mb-4'>
            Service Details
          </h3>

          <div className='space-y-4'>
            <div>
              <Label className='text-xs text-muted-foreground uppercase mb-2 block'>
                SERVICE TYPE
              </Label>
              <Select
                value={selectedOrder.serviceType || "wash_and_fold"}
                onValueChange={() => {}}
                disabled
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='wash_and_fold'>
                    Wash & Fold (Standard)
                  </SelectItem>
                  <SelectItem value='wash_only'>Wash Only</SelectItem>
                  <SelectItem value='dry_only'>Dry Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-xs text-muted-foreground uppercase mb-2 block'>
                  DETERGENT
                </Label>
                <Select value={detergent} onValueChange={setDetergent}>
                  <SelectTrigger className='w-full text-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='standard'>Tide (Standard)</SelectItem>
                    <SelectItem value='sensitive'>Sensitive</SelectItem>
                    <SelectItem value='eco'>Eco-Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className='text-xs text-muted-foreground uppercase mb-2 block'>
                  SOFTENER
                </Label>
                <Select value={softener} onValueChange={setSoftener}>
                  <SelectTrigger className='w-full text-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>None</SelectItem>
                    <SelectItem value='standard'>Standard</SelectItem>
                    <SelectItem value='fresh'>Fresh Scent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='pt-4 border-t border-border'>
              <div className='flex justify-between text-sm mb-2'>
                <span className='text-muted-foreground'>
                  Base Price{" "}
                  {branchInfo
                    ? `(₵${branchInfo.pricingPerKg.toFixed(2)}/kg)`
                    : ""}
                </span>
                <span className='text-foreground'>
                  {branchInfo
                    ? `₵${(weight * branchInfo.pricingPerKg).toFixed(2)}`
                    : "N/A"}
                </span>
              </div>
              {selectedOrder.isDelivery && (
                <div className='flex justify-between text-sm mb-2'>
                  <span className='text-muted-foreground'>Delivery Fee</span>
                  <span className='text-foreground'>
                    {branchInfo
                      ? `₵${branchInfo.deliveryFee.toFixed(2)}`
                      : "N/A"}
                  </span>
                </div>
              )}
              <div className='flex justify-between pt-2 border-t border-border'>
                <span className='font-medium text-foreground'>
                  Estimated Total
                </span>
                <span className='text-xl font-bold text-green-600'>
                  ₵{estimatedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              variant='ghost'
              className='w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1'
              onClick={() =>
                router.push(`/washstation/orders/${selectedOrder._id}`)
              }
            >
              <Clock className='w-4 h-4' />
              View Order History
            </Button>
          </div>
        </div>
      )}

      {/* Reject Verification Modal */}
      <ActionVerification
        open={showRejectVerification}
        onCancel={() => setShowRejectVerification(false)}
        onVerified={handleRejectConfirm}
        actionType='cancel_order'
        orderId={selectedOrder?._id}
      />
    </div>
  )
}
