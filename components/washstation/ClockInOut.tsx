"use client"

import { useState, useEffect } from "react"
import { useStationAttendance } from "@/hooks/useStationAttendance"
import { useStationSession } from "@/hooks/useStationSession"
import { useStationClockIn } from "@/hooks/useStationClockIn"
import { useStationClockOut } from "@/hooks/useStationClockOut"
import { useQuery } from "convex/react"
import { api } from "@devlider001/washlab-backend/api"
import { Id } from "@devlider001/washlab-backend/dataModel"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Clock,
  LogIn,
  LogOut,
  User,
  Timer,
  Search,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { LoadingSpinner } from "./LoadingSpinner"
import { BiometricVerificationModal } from "./BiometricVerificationModal"
import { BiometricData } from "@/types"

export function ClockInOut() {
  const { stationToken } = useStationSession()
  const { attendances, isLoading: attendancesLoading } =
    useStationAttendance(stationToken)
  const {
    startClockIn,
    finishClockIn,
    isLoading: clockInLoading,
  } = useStationClockIn(stationToken)
  const {
    startClockOut,
    finishClockOut,
    isLoading: clockOutLoading,
  } = useStationClockOut(stationToken)

  // Get attendants for selection
  const attendants = useQuery(
    api.stations.getBranchAttendants,
    stationToken ? { stationToken } : "skip"
  ) as
    | Array<{
        _id: Id<"attendants">
        name: string
        email: string
        hasBiometric: boolean
        hasPin: boolean
        authenticationMethods: string[]
      }>
    | undefined

  const [selectedAttendantId, setSelectedAttendantId] = useState<
    Id<"attendants"> | ""
  >("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showClockInModal, setShowClockInModal] = useState(false)
  const [showClockOutModal, setShowClockOutModal] = useState(false)
  const [selectedAttendanceId, setSelectedAttendanceId] =
    useState<Id<"attendanceLogs"> | null>(null)
  const [showClockInForm, setShowClockInForm] = useState(false)

  // Filter attendants by search
  const filteredAttendants = attendants?.filter(
    (att) =>
      att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStartClockIn = async () => {
    if (!selectedAttendantId) return

    const result = await startClockIn(selectedAttendantId as Id<"attendants">)
    if (result) {
      setShowClockInModal(true)
    }
  }

  const handleClockInComplete = async (biometricData: BiometricData) => {
    if (!selectedAttendantId) return

    const success = await finishClockIn(
      selectedAttendantId as Id<"attendants">,
      biometricData
    )
    if (success) {
      setShowClockInModal(false)
      setSelectedAttendantId("")
      setSearchQuery("")
      setShowClockInForm(false)
    }
  }

  const handleStartClockOut = async (attendanceId: Id<"attendanceLogs">) => {
    setSelectedAttendanceId(attendanceId)
    const result = await startClockOut(attendanceId)
    if (result) {
      setShowClockOutModal(true)
    }
  }

  const handleClockOutComplete = async (biometricData: BiometricData) => {
    if (!selectedAttendanceId) return

    const success = await finishClockOut(selectedAttendanceId, biometricData)
    if (success) {
      setShowClockOutModal(false)
      setSelectedAttendanceId(null)
    }
  }

  if (attendancesLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <LoadingSpinner text='Loading attendance status...' />
        </CardContent>
      </Card>
    )
  }

  // Show clock-in form if explicitly requested or if there are no active attendances
  if (showClockInForm || !attendances || attendances.length === 0) {
    return (
      <>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <LogIn className='w-5 h-5' />
                  Clock In
                </CardTitle>
                <CardDescription>
                  Please select an attendant and verify identity to clock in
                </CardDescription>
              </div>
              {attendances && attendances.length > 0 && (
                <Button
                  onClick={() => setShowClockInForm(false)}
                  variant='ghost'
                  size='sm'
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {attendants && attendants.length > 0 ? (
              <>
                <div className='space-y-2'>
                  <Label>Select Attendant</Label>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                      placeholder='Search by name or email...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='pl-9'
                    />
                  </div>
                  <Select
                    value={selectedAttendantId}
                    onValueChange={(v) =>
                      setSelectedAttendantId(v as Id<"attendants">)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select attendant' />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAttendants && filteredAttendants.length > 0 ? (
                        filteredAttendants.map((attendant) => (
                          <SelectItem key={attendant._id} value={attendant._id}>
                            <div className='flex items-center justify-between w-full'>
                              <span>{attendant.name}</span>
                              {attendant.hasBiometric && (
                                <Badge variant='outline' className='ml-2'>
                                  Biometric
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className='p-2 text-sm text-muted-foreground'>
                          No attendants found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleStartClockIn}
                  disabled={!selectedAttendantId || clockInLoading}
                  className='w-full'
                  size='lg'
                >
                  {clockInLoading ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Starting...
                    </>
                  ) : (
                    <>
                      <LogIn className='w-4 h-4 mr-2' />
                      Clock In
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                <p>No attendants available for this branch</p>
              </div>
            )}
          </CardContent>
        </Card>

        <BiometricVerificationModal
          open={showClockInModal}
          onClose={() => {
            setShowClockInModal(false)
          }}
          onComplete={handleClockInComplete}
          title='Verify Identity to Clock In'
          description='Please verify your identity using face recognition'
          isLoading={clockInLoading}
        />
      </>
    )
  }

  // Show clock-out if there are active attendances
  if (attendances && attendances.length > 0) {
    return (
      <>
        <Card className='border-green-500'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='w-5 h-5 text-green-500' />
                  Clocked In
                </CardTitle>
                <CardDescription className='mt-1'>
                  {attendances.length === 1
                    ? `${attendances[0].attendant?.name} is clocked in`
                    : `${attendances.length} attendants are clocked in`}
                </CardDescription>
              </div>
              <Badge variant='default' className='bg-green-500'>
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {attendances.map((attendance) => {
              const timeAgo = formatDistanceToNow(
                new Date(attendance.clockInAt),
                {
                  addSuffix: false,
                }
              )

              return (
                <div
                  key={attendance._id}
                  className='p-4 border rounded-lg space-y-3'
                >
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <User className='w-4 h-4 text-muted-foreground' />
                        <span className='font-medium'>
                          {attendance.attendant?.name || "Unknown"}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Timer className='w-4 h-4' />
                        <span>Clocked in {timeAgo} ago</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartClockOut(attendance._id)}
                      disabled={clockOutLoading}
                      variant='destructive'
                      size='sm'
                    >
                      <LogOut className='w-4 h-4 mr-2' />
                      Clock Out
                    </Button>
                  </div>
                </div>
              )
            })}

            {/* Option to clock in another attendant */}
            <div className='pt-4 border-t'>
              <Button
                onClick={() => {
                  setShowClockInForm(true)
                  setSelectedAttendantId("")
                  setSearchQuery("")
                }}
                variant='outline'
                className='w-full'
              >
                <LogIn className='w-4 h-4 mr-2' />
                Clock In Another Attendant
              </Button>
            </div>
          </CardContent>
        </Card>

        <BiometricVerificationModal
          open={showClockOutModal}
          onClose={() => {
            setShowClockOutModal(false)
            setSelectedAttendanceId(null)
          }}
          onComplete={handleClockOutComplete}
          title='Verify Identity to Clock Out'
          description='Please verify your identity to clock out'
          isLoading={clockOutLoading}
        />
      </>
    )
  }
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <LogIn className='w-5 h-5' />
            Clock In
          </CardTitle>
          <CardDescription>
            Please select an attendant and verify identity to clock in
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {attendants && attendants.length > 0 ? (
            <>
              <div className='space-y-2'>
                <Label>Select Attendant</Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    placeholder='Search by name or email...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-9'
                  />
                </div>
                <Select
                  value={selectedAttendantId}
                  onValueChange={(v) =>
                    setSelectedAttendantId(v as Id<"attendants">)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select attendant' />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAttendants && filteredAttendants.length > 0 ? (
                      filteredAttendants.map((attendant) => (
                        <SelectItem key={attendant._id} value={attendant._id}>
                          <div className='flex items-center justify-between w-full'>
                            <span>{attendant.name}</span>
                            {attendant.hasBiometric && (
                              <Badge variant='outline' className='ml-2'>
                                Biometric
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className='p-2 text-sm text-muted-foreground'>
                        No attendants found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleStartClockIn}
                disabled={!selectedAttendantId || clockInLoading}
                className='w-full'
                size='lg'
              >
                {clockInLoading ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Starting...
                  </>
                ) : (
                  <>
                    <LogIn className='w-4 h-4 mr-2' />
                    Clock In
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              <p>No attendants available for this branch</p>
            </div>
          )}
        </CardContent>
      </Card>

      <BiometricVerificationModal
        open={showClockInModal}
        onClose={() => {
          setShowClockInModal(false)
        }}
        onComplete={handleClockInComplete}
        title='Verify Identity to Clock In'
        description='Please verify your identity using face recognition'
        isLoading={clockInLoading}
      />
    </>
  )
}
