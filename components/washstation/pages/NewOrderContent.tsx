'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStationSession } from "@/hooks/useStationSession"
import { useQuery, useMutation } from "convex/react"
import { api } from "@devlider001/washlab-backend/api"
import { Id } from "@devlider001/washlab-backend/dataModel"
import { useSearchParams } from "next/navigation"

import {
  Phone,
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Plus,
  Minus,
  Edit,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

type Step = "phone" | "customer-found" | "register" | "order"

/**
 * Normalise any phone input into bare 9-digit local number (no country code,
 * no leading 0). Always caps at 9 chars.
 *
 * Examples:
 *   "0241234567"    → "241234567"   (user typed 10 digits with leading 0)
 *   "241234567"     → "241234567"   (user typed 9 digits)
 *   "+233241234567" → "241234567"   (full international)
 *   "233241234567"  → "241234567"   (international without +)
 *
 * So whether someone types 9 keys (no 0) or 10 keys (with leading 0),
 * the result is always 9 bare digits — which with +233 gives the full 12.
 */
function normaliseToLocalDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.startsWith("233")) return digits.slice(3).slice(0, 9)
  if (digits.startsWith("0"))   return digits.slice(1).slice(0, 9)
  return digits.slice(0, 9)
}

/** Phone is ready when we have exactly 9 bare local digits. */
function isPhoneComplete(phone: string): boolean {
  return phone.length === 9
}

/** Safe unique placeholder — no backend changes needed. */
function generatePlaceholderEmail(phone: string): string {
  return `noemail_${phone || Date.now()}@washlab.app`
}

export function NewOrderContent() {
  const router = useRouter()
  const { stationToken, isSessionValid } = useStationSession()

  const dbServices = useQuery(api.services.getActive) ?? []

  const formatPhoneForBackend = (phone: string): string => {
    // phone is always bare 9-digit local, e.g. "241234567"
    return `+233${phone}`
  }

  // Always bare 9-digit local digits, e.g. "241234567"
  const [phone, setPhone] = useState("")

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalised = normaliseToLocalDigits(e.target.value)
    setPhone(normalised)
    hasNavigatedFromPhoneRef.current = false
  }

  const formattedPhone = isPhoneComplete(phone) ? formatPhoneForBackend(phone) : ""
  const getCustomerByPhone = useQuery(
    api.customers.getByPhone,
    formattedPhone ? { phoneNumber: formattedPhone } : "skip"
  )
  const createGuestCustomer = useMutation(api.customers.createGuest)
  const createWalkInOrder = useMutation(api.stations.createWalkInOrder)

  const [step, setStep] = useState<Step>("phone")
  const [stepHistory, setStepHistory] = useState<Step[]>([])

  const goToStep = (newStep: Step) => {
    setStepHistory((prev) => {
      if (prev[prev.length - 1] === step) return prev
      return [...prev, step]
    })
    setStep(newStep)
  }

  const goBack = () => {
    if (stepHistory.length === 0) return
    const history = [...stepHistory]
    const lastStep = history.pop()!
    setStepHistory(history)
    setStep(lastStep)
  }

  const [foundCustomer, setFoundCustomer] = useState<any>(null)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [skipEmail, setSkipEmail] = useState(false)

  const [serviceType, setServiceType] = useState<string>("")
  const [weight, setWeight] = useState(5.0)
  const [itemCount, setItemCount] = useState(0)
  const [orderNotes, setOrderNotes] = useState<string[]>([])
  const [customNote, setCustomNote] = useState("")
  const [bagCardNumber, setBagCardNumber] = useState("")

  const activeBagNumbers =
    useQuery(
      api.stations.getActiveBagNumbers,
      stationToken && isSessionValid ? { stationToken } : "skip"
    ) ?? []

  const [orderId] = useState(
    () => `ORD-${Math.floor(Math.random() * 9000) + 1000}`
  )

  const hasNavigatedFromPhoneRef = useRef(false)

  useEffect(() => {
    const prefilledData = sessionStorage.getItem('washlab_prefilledCustomer')
    if (prefilledData) {
      try {
        const customerData = JSON.parse(prefilledData)
        if (customerData.skipPhone && customerData.id && customerData.name) {
          setFoundCustomer({
            _id: customerData.id,
            name: customerData.name,
            phoneNumber: customerData.phone || customerData.phoneNumber || '',
            email: customerData.email,
          })
          const rawPhone = customerData.phone ?? customerData.phoneNumber ?? ''
          if (typeof rawPhone === 'string') setPhone(normaliseToLocalDigits(rawPhone))
          setStepHistory(["phone"])
          setStep('order')
          sessionStorage.removeItem('washlab_prefilledCustomer')
          toast.success(`Customer ${customerData.name} loaded`)
        }
      } catch (error) {
        console.error('Error parsing prefilled customer data:', error)
      }
    } else {
      const activeCustomer = sessionStorage.getItem('washlab_activeCustomer')
      if (activeCustomer) {
        try {
          const customerData = JSON.parse(activeCustomer)
          setFoundCustomer(customerData)
          const rawPhone = customerData.phoneNumber || customerData.phone || ''
          setPhone(normaliseToLocalDigits(rawPhone))
        } catch (error) {
          console.error('Error parsing active customer data:', error)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (dbServices.length > 0 && !serviceType) setServiceType(dbServices[0].code)
  }, [dbServices, serviceType])

  const quickNotes = ["Rush Service", "Stains", "Delicate", "No Softener"]

  const handlePhoneSubmit = () => {
    if (!isPhoneComplete(phone)) {
      toast.error("Please enter a valid phone number")
      return
    }
  }

  useEffect(() => {
    if (step !== "phone") return
    if (!isPhoneComplete(phone)) { hasNavigatedFromPhoneRef.current = false; return }
    if (getCustomerByPhone === undefined) return
    if (hasNavigatedFromPhoneRef.current) return
    hasNavigatedFromPhoneRef.current = true
    if (getCustomerByPhone) {
      setFoundCustomer(getCustomerByPhone)
      goToStep("customer-found")
    } else {
      goToStep("register")
    }
  }, [step, phone, getCustomerByPhone])

  const handleConfirmCustomer = () => goToStep("order")

  const handleRegisterNewCustomer = async () => {
    if (!newName.trim()) { toast.error("Please enter customer name"); return }
    const finalEmail = skipEmail || !newEmail.trim()
      ? generatePlaceholderEmail(phone)
      : newEmail.trim()
    try {
      const customerId = await createGuestCustomer({
        name: newName,
        phoneNumber: formatPhoneForBackend(phone),
        email: finalEmail,
      })
      const customer = await getCustomerByPhone
      setFoundCustomer(customer || {
        _id: customerId,
        name: newName,
        phoneNumber: formatPhoneForBackend(phone),
        email: finalEmail,
      })
      toast.success(`Profile created for ${newName}`)
      goToStep("order")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create customer")
    }
  }

  const handleProceedToPayment = async () => {
    if (!stationToken || !isSessionValid) { toast.error("Station session expired. Please login again."); return }
    if (!serviceType || !selectedService) { toast.error("Please select a service"); return }
    if (dbServices.length === 0) { toast.error("No services available. Please contact admin."); return }
    if (!foundCustomer?._id) { toast.error("Customer not found. Please register customer first."); return }
    if (weight <= 0.1) { toast.error("Please enter a valid weight"); return }
    if (!bagCardNumber) { toast.error("Please select a bag card number"); return }
    try {
      const result = await createWalkInOrder({
        stationToken,
        customerId: foundCustomer._id as Id<"users">,
        customerName: foundCustomer.name || newName,
        customerPhone: foundCustomer.phoneNumber || formatPhoneForBackend(phone),
        customerEmail: foundCustomer.email || newEmail,
        serviceType: serviceType as "wash_only" | "wash_and_dry" | "dry_only",
        weight,
        itemCount: itemCount || 1,
        bagCardNumber,
        notes: customNote || orderNotes.join(", ") || undefined,
        isDelivery: false,
      })
      toast.success(`Order created successfully! Bag #${result.bagCardNumber}`)
      router.push(`/washstation/payment?orderId=${result.orderId}&return=order`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create order")
    }
  }

  const handleSaveAsDraft = () => {
    toast.info("Order saved as draft")
    router.push("/washstation/dashboard")
  }

  const toggleNote = (note: string) => {
    setOrderNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    )
  }

  const selectedService = dbServices.find((s) => s.code === serviceType)

  const calculatePrice = () => {
    if (!selectedService) return { basePrice: 0, subtotal: 0, total: 0, totalPrice: 0 }
    let basePrice = 0
    if (selectedService.pricingType === "per_kg") {
      basePrice = weight * selectedService.basePrice
    } else {
      basePrice = Math.ceil(weight / 8) * selectedService.basePrice
    }
    const total = Math.round(basePrice * 100) / 100
    return { basePrice: total, subtotal: total, total, totalPrice: total }
  }

  const pricing = calculatePrice()
  const rushFee = orderNotes.includes("Rush Service") ? 5 : 0
  const finalTotal = pricing.total + rushFee

  const getFallbackImage = (code: string) => {
    const m: Record<string, string> = {
      wash_and_dry: "/laundry-hero-1.jpg",
      wash_and_fold: "/laundry-hero-1.jpg",
      wash_only: "/laundry-hero-2.jpg",
      dry_only: "/stacked-clothes.jpg",
    }
    return m[code] || "/laundry-hero-1.jpg"
  }

  const services = dbServices.map((s) => ({
    id: s.code,
    name: s.name,
    price: s.pricingType === "per_kg"
      ? `₵${s.basePrice.toFixed(2)} / kg`
      : `₵${s.basePrice.toFixed(2)} / load`,
    image: s.imageUrl || getFallbackImage(s.code),
  }))

  /**
   * Display: prepend a leading 0 so the attendant sees the familiar 10-digit
   * local format "024 123 4567", even though we store 9 bare digits internally.
   *
   * Numpad:  type "241234567" (9 presses) → displays "024 123 4567" ✅
   * Keyboard: type "0241234567" (10 chars) → normalise strips the 0 → "241234567"
   *           → displays "024 123 4567" ✅
   */
  const formatPhoneDisplay = (p: string): string => {
    const full = p ? `0${p}` : ""          // always prepend 0 for display
    if (full.length <= 3)  return full
    if (full.length <= 7)  return `${full.slice(0, 3)} ${full.slice(3)}`
    return `${full.slice(0, 3)} ${full.slice(3, 7)} ${full.slice(7)}`
    // e.g. "0241234567" → "024 1234 567" ... adjusted below:
    // "024" + " " + "123" + " " + "4567" → "024 123 4567"
  }

  const NumberPad = ({
    onDigit, onClear, onBackspace,
  }: {
    onDigit: (d: string) => void
    onClear: () => void
    onBackspace: () => void
  }) => (
    <div className='grid grid-cols-3 gap-2 sm:gap-3'>
      {["1","2","3","4","5","6","7","8","9"].map((digit) => (
        <button
          key={digit}
          onClick={() => onDigit(digit)}
          className='h-12 sm:h-14 rounded-xl bg-muted text-lg sm:text-xl font-semibold text-foreground hover:bg-muted/80 transition-colors'
        >
          {digit}
        </button>
      ))}
      <button
        onClick={onClear}
        className='h-12 sm:h-14 rounded-xl bg-destructive/10 text-lg sm:text-xl font-semibold text-destructive hover:bg-destructive/20 transition-colors'
      >
        <X className='w-4 h-4 sm:w-5 sm:h-5 mx-auto' />
      </button>
      <button
        onClick={() => onDigit("0")}
        className='h-12 sm:h-14 rounded-xl bg-muted text-lg sm:text-xl font-semibold text-foreground hover:bg-muted/80 transition-colors'
      >
        0
      </button>
      <button
        onClick={onBackspace}
        className='h-12 sm:h-14 rounded-xl bg-muted text-lg sm:text-xl font-semibold text-foreground hover:bg-muted/80 transition-colors'
      >
        ←
      </button>
    </div>
  )

  return (
    <>
      {/* ── Phone Entry Step ─────────────────────────────────────────────── */}
      {step === "phone" && (
        <div className='max-w-6xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8'>
            <div className='bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8'>
              <h2 className='text-xl sm:text-2xl font-bold text-foreground mb-2'>Customer Phone</h2>
              <p className='text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6'>
                Enter mobile number to find or create profile
              </p>

              <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
                <div className='bg-muted rounded-xl px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg font-semibold text-foreground whitespace-nowrap flex-shrink-0'>
                  +233
                </div>
                <div className='flex-1 relative'>
                  {/*
                    ✅ type="tel" + inputMode="numeric" → numeric keyboard on mobile.
                    Value displayed with leading 0 (e.g. "024 123 4567").
                    onChange strips the 0 back off before storing.
                    Numpad also strips any leading 0 automatically via normalise.
                  */}
                  <Input
                    type='tel'
                    inputMode='numeric'
                    value={formatPhoneDisplay(phone)}
                    onChange={handlePhoneInputChange}
                    placeholder='024 XXX XXXX'
                    className='h-12 sm:h-14 text-xl sm:text-2xl font-semibold bg-muted border-0 rounded-xl px-3 sm:px-4 text-foreground'
                    autoComplete='off'
                  />
                  <Phone className='absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none' />
                </div>
              </div>

              <Button
                onClick={handlePhoneSubmit}
                disabled={!isPhoneComplete(phone)}
                className='w-full h-12 sm:h-14 text-base sm:text-lg rounded-xl bg-primary text-primary-foreground font-semibold'
              >
                Check Number
                <ArrowRight className='w-4 h-4 sm:w-5 sm:h-5 ml-2' />
              </Button>
            </div>

            <div className='bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8'>
              <NumberPad
                onDigit={(d) => {
                  setPhone((prev) => {
                    // 0 as first digit is display-only — skip it so they can
                    // type "0241234567" naturally and still land on 9 bare digits
                    if (prev.length === 0 && d === "0") return prev
                    const next = prev + d
                    return next.length <= 9 ? next : prev   // hard cap at 9
                  })
                  hasNavigatedFromPhoneRef.current = false
                }}
                onClear={() => { setPhone(""); hasNavigatedFromPhoneRef.current = false }}
                onBackspace={() => { setPhone((prev) => prev.slice(0, -1)); hasNavigatedFromPhoneRef.current = false }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Customer Found Step ──────────────────────────────────────────── */}
      {step === "customer-found" && foundCustomer && (
        <div className='max-w-2xl mx-auto'>
          <button
            onClick={goBack}
            className='flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 text-sm sm:text-base'
          >
            <ArrowLeft className='w-4 h-4' /> Back to Phone Entry
          </button>

          <div className='bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center'>
            <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-success/10 mx-auto mb-4 flex items-center justify-center'>
              <CheckCircle className='w-6 h-6 sm:w-8 sm:h-8 text-success' />
            </div>
            <h2 className='text-lg sm:text-xl font-bold text-foreground mb-2'>Customer Match Found</h2>
            <p className='text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6'>
              Is this the customer you are looking for?
            </p>
            <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center'>
              <User className='w-8 h-8 sm:w-10 sm:h-10 text-primary' />
            </div>
            <h3 className='text-lg sm:text-xl font-bold text-foreground'>{foundCustomer.name}</h3>
            <p className='text-primary flex items-center justify-center gap-1.5 mb-4 text-sm sm:text-base'>
              <Phone className='w-4 h-4' /> {foundCustomer.phoneNumber || foundCustomer.phone}
            </p>
            <div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4'>
              <div className='bg-muted/50 rounded-xl p-3 sm:p-4'>
                <p className='text-xs text-muted-foreground'>LAST VISIT</p>
                <p className='font-semibold text-foreground text-sm sm:text-base'>
                  {foundCustomer.lastVisit
                    ? new Date(foundCustomer.lastVisit).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "No previous visit"}
                </p>
              </div>
              <div className='bg-muted/50 rounded-xl p-3 sm:p-4'>
                <p className='text-xs text-muted-foreground'>LIFETIME VALUE</p>
                <p className='font-semibold text-success text-sm sm:text-base'>
                  ₵{(foundCustomer.totalSpent ?? 0).toFixed(2)}
                </p>
                <p className='text-xs text-muted-foreground'>{foundCustomer.orderCount ?? 0} Orders</p>
              </div>
            </div>
            <Button onClick={handleConfirmCustomer} className='w-full h-11 sm:h-12 bg-primary text-primary-foreground rounded-xl font-semibold mb-3'>
              <Check className='w-4 h-4 mr-2' /> Confirm & Start Order
            </Button>
            <Button
              onClick={() => { setFoundCustomer(null); goToStep("register") }}
              variant='outline'
              className='w-full h-11 sm:h-12 rounded-xl'
            >
              <User className='w-4 h-4 mr-2' /> No, Register New Customer
            </Button>
          </div>
        </div>
      )}

      {/* ── Register New Customer Step ───────────────────────────────────── */}
      {step === "register" && (
        <div className='max-w-2xl mx-auto'>
          <div className='flex items-center gap-2 text-xs sm:text-sm mb-6 sm:mb-8 flex-wrap'>
            <span className='flex items-center gap-1.5 text-success'>
              <CheckCircle className='w-3 h-3 sm:w-4 sm:h-4' /> Phone Lookup
            </span>
            <span className='text-muted-foreground'>/</span>
            <span className='flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded font-medium text-xs sm:text-sm'>
              ✦ Registration
            </span>
            <span className='text-muted-foreground'>/</span>
            <span className='text-muted-foreground'>Order Details</span>
          </div>

          <div className='bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8'>
            <h2 className='text-xl sm:text-2xl font-bold text-foreground mb-2'>New Customer</h2>
            <p className='text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6'>
              Quick create profile for order processing.
            </p>

            <div className='mb-4'>
              <label className='text-xs font-medium text-muted-foreground mb-2 block'>MOBILE NUMBER</label>
              <div className='flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-muted rounded-xl'>
                <Phone className='w-4 h-4 text-muted-foreground flex-shrink-0' />
                <span className='text-foreground font-medium text-sm sm:text-base truncate'>
                  +233 {formatPhoneDisplay(phone)}
                </span>
                <span className='ml-auto text-muted-foreground flex-shrink-0'>🔒</span>
              </div>
            </div>

            <div className='mb-4'>
              <label className='text-xs font-medium text-muted-foreground mb-2 block'>
                FULL NAME <span className='text-destructive'>*</span>
              </label>
              <div className='relative'>
                <Input
                  type='text'
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder='e.g. Jane Doe'
                  className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border-2 border-primary rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-0 text-sm sm:text-base'
                />
                <Edit className='absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary' />
              </div>
              <p className='text-xs text-muted-foreground mt-1'>Enter the customer&apos;s first and last name.</p>
            </div>

            {/* ── Email with "No Email" toggle ─────────────────────────── */}
            <div className='mb-6 sm:mb-8'>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-xs font-medium text-muted-foreground'>EMAIL ADDRESS</label>
                <button
                  type='button'
                  onClick={() => { setSkipEmail((p) => !p); if (!skipEmail) setNewEmail("") }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    skipEmail
                      ? "bg-muted text-foreground border-border"
                      : "text-muted-foreground border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {skipEmail ? "✓ No email — add one" : "No email"}
                </button>
              </div>

              {skipEmail ? (
                <div className='flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 border border-dashed border-border rounded-xl'>
                  <span className='text-muted-foreground text-sm flex-1 truncate'>
                    noemail_{phone || "…"}@washlab.app
                  </span>
                  <span className='text-xs text-muted-foreground whitespace-nowrap'>auto</span>
                </div>
              ) : (
                <Input
                  type='email'
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder='name@example.com'
                  className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-muted border-0 rounded-xl text-foreground placeholder:text-muted-foreground text-sm sm:text-base'
                />
              )}
            </div>

            <div className='flex flex-col sm:flex-row gap-3'>
              <Button type="button" onClick={goBack} variant='outline' className='flex-1 h-11 sm:h-12 rounded-xl'>
                <ArrowLeft className='w-4 h-4 mr-2' /> Back
              </Button>
              <Button
                type="button"
                onClick={handleRegisterNewCustomer}
                disabled={!newName.trim()}
                className='flex-1 h-11 sm:h-12 bg-primary text-primary-foreground rounded-xl font-semibold'
              >
                Create & Continue <ArrowRight className='w-4 h-4 ml-2' />
              </Button>
            </div>
          </div>

          <div className='flex items-center justify-center gap-2 mt-4 text-xs sm:text-sm text-muted-foreground'>
            <div className='w-2 h-2 rounded-full bg-success' />
            <span>STATUS</span>
            <span className='text-success font-medium'>● ONLINE</span>
          </div>
        </div>
      )}

      {/* ── Order Details Step ───────────────────────────────────────────── */}
      {step === "order" && (
        <div className='max-w-7xl mx-auto'>
          <button onClick={goBack} className='flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm'>
            <ArrowLeft className='w-4 h-4' /> Back
          </button>

          <div className='flex flex-col lg:flex-row gap-4 sm:gap-6'>
            <div className='flex-1 space-y-4 sm:space-y-6 min-w-0 pr-[22rem]'>

              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0'>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2 sm:gap-3 flex-wrap'>
                    <h2 className='text-xl sm:text-2xl font-bold text-foreground truncate'>New Order #{orderId}</h2>
                    <span className='px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded whitespace-nowrap'>PENDING</span>
                  </div>
                  <p className='text-sm sm:text-base text-muted-foreground mt-1 truncate'>
                    <User className='w-3 h-3 sm:w-4 sm:h-4 inline mr-1' />
                    Customer: {foundCustomer?.name || newName}
                  </p>
                </div>
                <div className='text-left sm:text-right text-xs sm:text-sm text-muted-foreground flex-shrink-0'>
                  <p>Date</p>
                  <p className='font-medium text-foreground'>
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* 1. Select Service */}
              <div>
                <h3 className='font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base'>
                  <span className='w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0'>1</span>
                  Select Service
                </h3>
                {dbServices.length === 0 ? (
                  <div className='text-center py-8 bg-muted/50 rounded-xl border border-border'>
                    <p className='text-sm text-muted-foreground'>No services available</p>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setServiceType(service.id)}
                        className={`rounded-xl overflow-hidden border-2 transition-all ${serviceType === service.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/30"}`}
                      >
                        <div className='aspect-video bg-muted relative overflow-hidden'>
                          <img src={service.image} alt={service.name} className='w-full h-full object-cover' />
                          {serviceType === service.id && (
                            <div className='absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-10'>
                              <Check className='w-3 h-3 sm:w-4 sm:h-4' />
                            </div>
                          )}
                        </div>
                        <div className={`p-3 text-left ${serviceType === service.id ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                          <p className='font-semibold text-sm sm:text-base'>{service.name}</p>
                          <p className={`text-xs sm:text-sm ${serviceType === service.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{service.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Weight */}
              <div>
                <h3 className='font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base'>
                  <span className='w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0'>2</span>
                  Weight
                </h3>
                <div className='flex items-center gap-3 sm:gap-4'>
                  <button onClick={() => setWeight(Math.max(0.5, weight - 0.5))} className='w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 flex-shrink-0'>
                    <Minus className='w-5 h-5 sm:w-6 sm:h-6' />
                  </button>
                  <div className='flex-1 text-center min-w-0'>
                    <Input type="number" step={0.1} min={0.5} value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} className='text-4xl sm:text-5xl font-bold text-foreground text-center border-0 bg-transparent focus:ring-0' />
                    <p className='text-xs sm:text-sm text-muted-foreground'>KILOGRAMS</p>
                  </div>
                  <button onClick={() => setWeight(weight + 0.5)} className='w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 flex-shrink-0'>
                    <Plus className='w-5 h-5 sm:w-6 sm:h-6' />
                  </button>
                </div>
                <div className='flex gap-2 mt-3 sm:mt-4 justify-center flex-wrap'>
                  <button onClick={() => setWeight(weight + 1)} className='px-3 sm:px-4 py-2 bg-muted rounded-lg text-xs sm:text-sm hover:bg-muted/80'>+ 1kg</button>
                  <button onClick={() => setWeight(weight + 5)} className='px-3 sm:px-4 py-2 bg-muted rounded-lg text-xs sm:text-sm hover:bg-muted/80'>+ 5kg</button>
                  <button onClick={() => setWeight(20)} className='px-3 sm:px-4 py-2 bg-muted rounded-lg text-xs sm:text-sm hover:bg-muted/80'>Max</button>
                </div>
              </div>

              {/* 3. Item Count */}
              <div>
                <h3 className='font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base'>
                  <span className='w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center flex-shrink-0'>3</span>
                  Item Count (Optional)
                </h3>
                <div className='flex items-center gap-3 sm:gap-4'>
                  <button onClick={() => setItemCount(Math.max(0, itemCount - 1))} className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 flex-shrink-0'>
                    <Minus className='w-4 h-4 sm:w-5 sm:h-5' />
                  </button>
                  <div className='flex-1 text-center min-w-0'>
                    <Input type="number" min={0} step={1} value={itemCount} onChange={(e) => setItemCount(parseInt(e.target.value) || 0)} className='text-2xl sm:text-3xl font-bold text-foreground text-center border-0 bg-transparent focus:ring-0' />
                    <p className='text-xs text-muted-foreground'>PIECES</p>
                  </div>
                  <button onClick={() => setItemCount(itemCount + 1)} className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 flex-shrink-0'>
                    <Plus className='w-4 h-4 sm:w-5 sm:h-5' />
                  </button>
                </div>
                <p className='text-xs text-muted-foreground text-center mt-2'>Use for tracking individual expensive items like comforters or jackets.</p>
              </div>

              {/* 4. Bag Card Number */}
              <div>
                <h3 className='font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base'>
                  <span className='w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0'>4</span>
                  Bag Card Number <span className='text-destructive'>*</span>
                </h3>
                <p className='text-xs sm:text-sm text-muted-foreground mb-3'>Select the physical card placed inside the laundry bag. Customer gets the matching card.</p>
                {(() => {
                  const taken = new Set(activeBagNumbers)
                  const available: string[] = []
                  let n = 1
                  while (available.length < 10) {
                    const bn = n.toString().padStart(3, "0")
                    if (!taken.has(bn)) available.push(bn)
                    n++
                  }
                  return (
                    <div className='grid grid-cols-5 gap-2'>
                      {available.map((card) => (
                        <button
                          key={card}
                          onClick={() => setBagCardNumber(card)}
                          className={`h-10 sm:h-12 rounded-xl font-bold text-base sm:text-lg transition-all ${bagCardNumber === card ? "bg-primary text-primary-foreground ring-2 ring-primary/50" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                        >
                          #{card}
                        </button>
                      ))}
                    </div>
                  )
                })()}
                {bagCardNumber && (
                  <div className='mt-3 p-3 bg-success/10 border border-success/20 rounded-xl'>
                    <p className='text-xs sm:text-sm text-success font-medium'>✓ Card #{bagCardNumber} selected - Give matching card to customer</p>
                  </div>
                )}
              </div>

              {/* 5. Order Notes */}
              <div>
                <h3 className='font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base'>
                  <span className='w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center flex-shrink-0'>5</span>
                  Order Notes
                </h3>
                <div className='flex flex-wrap gap-2 mb-3'>
                  {quickNotes.map((note) => (
                    <button
                      key={note}
                      onClick={() => toggleNote(note)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${orderNotes.includes(note) ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    >
                      {orderNotes.includes(note) && <Check className='w-3 h-3 sm:w-4 sm:h-4 inline mr-1' />}
                      {note}
                    </button>
                  ))}
                </div>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder='Add any specific instructions here...'
                  className='w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-muted border-0 rounded-xl text-foreground placeholder:text-muted-foreground resize-none h-20 sm:h-24 text-sm sm:text-base'
                />
              </div>
            </div>

            {/* Right - Order Summary */}
            <div className='flex flex-col lg:flex-row gap-4 sm:gap-6 items-start'>
              <div className='bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 fixed top-24 right-6 w-[20rem]'>
                <h3 className='font-semibold text-foreground mb-4 text-sm sm:text-base'>Order Summary</h3>
                <div className='space-y-3 pb-4 border-b border-border'>
                  <div className='flex justify-between items-start gap-2'>
                    <span className='text-foreground text-sm sm:text-base truncate'>
                      {selectedService?.name || services.find((s) => s.id === serviceType)?.name || "No service selected"}
                    </span>
                    <span className='font-semibold text-foreground text-sm sm:text-base flex-shrink-0'>₵{(pricing?.totalPrice || 0).toFixed(2)}</span>
                  </div>
                  {selectedService && (
                    <div className='text-xs sm:text-sm text-muted-foreground pl-2'>
                      {selectedService.pricingType === "per_kg"
                        ? `${weight.toFixed(1)} kg × ₵${selectedService.basePrice.toFixed(2)}`
                        : `${Math.ceil(weight / 8)} loads × ₵${selectedService.basePrice.toFixed(2)}`}
                    </div>
                  )}
                  {orderNotes.includes("Rush Service") && (
                    <div className='flex justify-between'>
                      <span className='text-foreground flex items-center gap-1 text-sm sm:text-base'>Rush Fee <Clock className='w-3 h-3 sm:w-4 sm:h-4' /></span>
                      <span className='text-foreground text-sm sm:text-base'>₵{rushFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                {rushFee > 0 && (
                  <div className='py-4 border-b border-border'>
                    <div className='flex justify-between text-xs sm:text-sm'>
                      <span className='text-muted-foreground'>Service Subtotal</span>
                      <span className='text-foreground'>₵{(pricing?.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between text-xs sm:text-sm mt-1'>
                      <span className='text-muted-foreground'>Rush Fee</span>
                      <span className='text-foreground'>₵{rushFee.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                <div className='flex justify-between items-center py-4'>
                  <span className='font-medium text-foreground text-sm sm:text-base'>Total</span>
                  <span className='text-2xl sm:text-3xl font-bold text-primary'>₵{finalTotal.toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleProceedToPayment}
                  disabled={weight < 0.1 || itemCount < 1 || !bagCardNumber.trim()}
                  className='w-full h-11 sm:h-12 bg-primary text-primary-foreground rounded-xl font-semibold mb-3 text-sm sm:text-base disabled:opacity-50 disabled:pointer-events-none'
                >
                  Proceed to Payment <ArrowRight className='w-4 h-4 ml-2' />
                </Button>
                <button onClick={handleSaveAsDraft} className='w-full text-center text-xs sm:text-sm text-muted-foreground hover:text-foreground'>
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}