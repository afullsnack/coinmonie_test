import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from './ui/credenza'
import { CameraComponent } from 'react-camera-component'
import type {
  CameraComponentHandles,
  CapturedMedia,
} from 'react-camera-component'
import { format } from 'date-fns'
import { Input } from './ui/input'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from './ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { useEffect, useReducer, useRef, useState } from 'react'
import type { ActionDispatch } from 'react'
import { CalendarIcon, CameraIcon, Info, Loader2 } from 'lucide-react'
import { Calendar } from './ui/calendar'
import { blobToBase64 } from '#/lib/blob-to-base64'
import { useMutation, useMutationState } from '@tanstack/react-query'
import { kycMutationOptions } from '#/lib/api-client'
import { saveKYCStatus } from '#/lib/my-kyc-status'

interface KYCModalProps {
  children?: React.ReactNode
  open: boolean
  onOpen: (open: boolean) => void
}

type FormField =
  | `FirstName`
  | `LastName`
  | `Phone`
  | `Email`
  | `DOB`
  | `Gender`
  | `Nationality`
  | `IDType`
  | `IDValue`
type TType = `update${FormField}`
interface FormAction {
  type: TType
  payload: any
}

interface FormState {
  firstName: string
  lastName: string
  dob: string
  phone: string
  email: string
  gender: 'male' | 'female' | null
  nationality: string
  idType: string
  idValue: string
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'updateFirstName':
      return { ...state, firstName: action.payload }
    case 'updateLastName':
      return { ...state, lastName: action.payload }
    case 'updatePhone':
      return { ...state, phone: action.payload }
    case 'updateNationality':
      return { ...state, nationality: action.payload }
    case 'updateEmail':
      return { ...state, email: action.payload }
    case 'updateDOB':
      return { ...state, dob: action.payload }
    case 'updateGender':
      return { ...state, gender: action.payload }
    case 'updateIDType':
      return { ...state, idType: action.payload }
    case 'updateIDValue':
      return { ...state, idValue: action.payload }
    default:
      throw new Error(`Unknown action used: ${action.type}`)
  }
}

export function KYCModal({ open, onOpen, children }: KYCModalProps) {
  const [formState, dispatch] = useReducer(formReducer, {
    firstName: '',
    lastName: '',
    phone: '',
    nationality: '',
    email: '',
    dob: '',
    gender: null,
    idType: '',
    idValue: '',
  })
  const [camStatus, setCamStatus] = useState<PermissionStatus | null>(null)
  const [image, setImage] = useState<CapturedMedia | null>()
  const camRef = useRef<CameraComponentHandles>(null)

  const kyc = useMutation({
    ...kycMutationOptions,
    onSuccess(data) {
      if (data.success || data.data?.verdict.toLowerCase().includes('match')) {
        saveKYCStatus('verified')
        onOpen(false)
      }
    },
  })

  const handleCapture = async (media: CapturedMedia) => {
    setImage(media)

    if (camRef.current?.isStreaming) {
      camRef.current.stopStream()
    }
  }

  const handleSubmit = async (data: FormState) => {
    if (image) {
      const dataUrl = await blobToBase64(image.blob)
      console.log(`Form submission state:_`, { data, dataUrl })

      kyc.mutate({
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        email: data.email,
        phone: data.phone,
        gender: data.gender as 'male' | 'female',
        nationality: data.nationality,
        idType: data.idType as 'nin' | 'bvn' | 'passport' | 'drivers-license',
        idNumber: data.idValue,
        imageUrl: dataUrl,
      })
    }
  }

  const handleError = (error: Error) => {
    switch (error.name) {
      case 'NotAllowedError':
        alert('Camera permission denied')
        break
      case 'NotFoundError':
        alert('No camera found')
        break
      case 'NotReadableError':
        alert('Camera is already in use')
        break
      default:
        console.error('Camera error:', error)
    }
  }

  useEffect(() => {
    ;(async () => {
      if (!camStatus) {
        const status = await navigator.permissions.query({ name: 'camera' })
        if (status.state === 'denied') {
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          })
        }
        setCamStatus(status)
      }
    })()
  }, [])

  return (
    <Credenza open={open} onOpenChange={onOpen}>
      {children && <CredenzaTrigger asChild>{children}</CredenzaTrigger>}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Complete KYC to continue transaction.</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="">
            <Accordion
              type="single"
              collapsible
              defaultValue="step-1"
              disabled={kyc.isPending}
            >
              <AccordionItem value="step-1">
                <AccordionTrigger>
                  <p className="text-lg font-medium">Biodata</p>
                </AccordionTrigger>
                <AccordionContent>
                  {/* Fields for bio data input*/}
                  <BioForm data={formState} dispatch={dispatch} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="step-2">
                <AccordionTrigger>
                  <p className="text-lg font-medium">Liveness check</p>
                </AccordionTrigger>
                <AccordionContent>
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Info className="size-3" /> Make sure you're in a well lit
                    environment
                  </span>
                  <div className="w-full min-h-[400px] mt-2">
                    {!image ? (
                      <CameraComponent
                        ref={camRef}
                        onCapture={handleCapture}
                        onError={handleError}
                        imageQuality={0.95}
                        imageFormat="image/jpeg"
                      />
                    ) : (
                      <img src={image.url} />
                    )}
                    <div className="w-full flex items-center justify-between mt-6">
                      <Button
                        onClick={() => {
                          camRef.current?.captureImage()
                          camRef.current?.stopStream()
                        }}
                        disabled={kyc.isPending}
                      >
                        <CameraIcon />
                        Capture image
                      </Button>
                      <Button
                        onClick={() => {
                          camRef.current?.startStream()
                          setImage(null)
                        }}
                        disabled={kyc.isPending}
                      >
                        Reset
                      </Button>
                    </div>
                    {kyc.isPending && (
                      <div className="w-full flex items-center justify-center gap-3 mt-6">
                        <Loader2 className="animate-spin size-4" />
                        <span>
                          Verification in progress. Do not close modal!
                        </span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CredenzaBody>
        <CredenzaFooter>
          <Button
            variant="default"
            onClick={() => handleSubmit(formState)}
            disabled={!image || kyc.isPending}
          >
            Submit and verify
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}

interface BioFormProps {
  onSubmit?: (data: FormState) => void
  data: FormState
  dispatch: ActionDispatch<[action: FormAction]>
}
function BioForm({ data, dispatch }: BioFormProps) {
  return (
    <form>
      <FieldGroup>
        <FieldSet>
          <FieldDescription>Fill all required data.</FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor="first-name">First name</FieldLabel>
                <Input
                  id="first-name"
                  placeholder="John"
                  required
                  value={data.firstName}
                  onChange={(e) =>
                    dispatch({
                      type: 'updateFirstName',
                      payload: e.target.value,
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="last-name">Last name</FieldLabel>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  required
                  value={data.lastName}
                  onChange={(e) =>
                    dispatch({
                      type: 'updateLastName',
                      payload: e.target.value,
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="gender">Gender</FieldLabel>
                <Select
                  required
                  value={data.gender as string | undefined}
                  onValueChange={(value) =>
                    dispatch({ type: 'updateGender', payload: value })
                  }
                >
                  <SelectTrigger className="capitalize">
                    <SelectValue id="gender" placeholder="Choose gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {['male', 'female'].map((gender) => (
                      <SelectItem
                        key={gender}
                        value={gender}
                        className="capitalize"
                      >
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="nationality">Nationality</FieldLabel>
                <Input
                  id="nationality"
                  placeholder="Nigeria"
                  required
                  value={data.nationality}
                  onChange={(e) =>
                    dispatch({
                      type: 'updateNationality',
                      payload: e.target.value,
                    })
                  }
                />
              </Field>
              <Field className="col-span-2">
                <FieldLabel htmlFor="dob">Date of Birth</FieldLabel>
                <DOBPicker
                  pickedDate={data.dob}
                  onPick={(date) =>
                    dispatch({ type: 'updateDOB', payload: date })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number"
                  required
                  value={data.phone}
                  onChange={(e) =>
                    dispatch({ type: 'updatePhone', payload: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@coinmonie.com"
                  value={data.email}
                  onChange={(e) =>
                    dispatch({ type: 'updateEmail', payload: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="gov-id">Government ID Type</FieldLabel>
                <Select
                  required
                  value={data.idType}
                  onValueChange={(value) =>
                    dispatch({ type: 'updateIDType', payload: value })
                  }
                >
                  <SelectTrigger className="uppercase">
                    <SelectValue id="gov-id" placeholder="Choose ID" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {['nin', 'bvn', 'drivers-license', 'passport'].map(
                        (id) => (
                          <SelectItem key={id} value={id} className="uppercase">
                            {id.split('-').join(' ')}
                          </SelectItem>
                        ),
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="id-number">ID number</FieldLabel>
                <Input
                  id="id-number"
                  type="text"
                  placeholder="11223344556677"
                  required
                  value={data.idValue}
                  onChange={(e) =>
                    dispatch({ type: 'updateIDValue', payload: e.target.value })
                  }
                />
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </form>
  )
}

interface DOBPickerProps {
  onPick: (date: string) => void
  pickedDate: string | null
}
function DOBPicker({ onPick, pickedDate }: DOBPickerProps) {
  const [date, setDate] = useState<Date | undefined>(
    pickedDate ? new Date(pickedDate) : undefined,
  )
  const [open, setOpen] = useState<boolean>(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
          <CalendarIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            setDate(date)
            setOpen(false)
            onPick(date?.toLocaleDateString() || '')
          }}
          defaultMonth={date}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}
