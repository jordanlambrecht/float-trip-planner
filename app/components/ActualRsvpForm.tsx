"use client"

import {
  FormEvent,
  useState,
  useTransition,
  Fragment,
  useEffect,
  useRef,
} from "react" // Added useEffect and useRef
import cn from "clsx"
import type {
  ActualRsvpFormData,
  ActualRsvpFormProps,
  RSVPStatus,
} from "@types"
import ConfirmationModal from "./ConfirmationModal"
import TagInput from "./TagInput"
import { ItemTooltip } from "./ItemTooltip"
import { submitActualRsvpAction, getPredefinedItemsAction } from "@actions" // Added getPredefinedItemsAction
import { VOLUNTEER_ROLES } from "../pollConfig"

// Define AdditionalPerson type
interface AdditionalPerson {
  id: string
  name: string
  phone: string
}

const RSVP_OPTIONS: {
  label: string
  value: RSVPStatus
  baseClass: string
  selectedClass: string
  textClass: string
}[] = [
  {
    label: "Coming",
    value: "yes",
    baseClass:
      "bg-teal-light hover:bg-teal border-teal-medium focus:outline-none focus:ring-2",
    selectedClass:
      "bg-teal-dark text-white ring-2 ring-teal-dark ring-offset-1",
    textClass: "text-teal-text",
  },
  {
    label: "Can't Make It",
    value: "no",
    baseClass: "bg-orange-light hover:bg-orange border-orange-medium",
    selectedClass:
      "bg-orange-dark text-white ring-2 ring-orange-dark ring-offset-1",
    textClass: "text-orange-text",
  },
]

const TOTAL_STEPS = 8 // Define total steps for the wizard (includes allergies, sharing step and confirmation)

// Phone number formatting helper
const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, "")

  if (numbers.length === 0) return ""
  if (numbers.length <= 3) return `(${numbers}`
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(
    6,
    10
  )}`
}

const ActualRsvpForm = ({
  onFormSubmitSuccess,
  rsvps = [],
}: ActualRsvpFormProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const formRef = useRef<HTMLDivElement>(null) // Ref for the form container
  const [formData, setFormData] = useState<ActualRsvpFormData>({
    name: "",
    phone: "",
    rsvp_status: null,
    items_bringing: [],
    volunteer_roles: [],
    merrit_reservoir: false,
    message: "",
    extra_items: [],
    needed_items: [],
    allergies: [],
    note: "",
  })

  const [additionalPeople, setAdditionalPeople] = useState<AdditionalPerson[]>(
    []
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false)
  const [dynamicPredefinedItems, setDynamicPredefinedItems] = useState<
    string[]
  >([])
  const [customExtraFields, setCustomExtraFields] = useState<string[]>([""])
  const [customNeededFields, setCustomNeededFields] = useState<string[]>([""])
  const [editingExtraField, setEditingExtraField] = useState<number | null>(
    null
  )
  const [editingNeededField, setEditingNeededField] = useState<number | null>(
    null
  )
  const [completedExtraFields, setCompletedExtraFields] = useState<Set<number>>(
    new Set()
  )
  const [completedNeededFields, setCompletedNeededFields] = useState<
    Set<number>
  >(new Set())
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  // Helper function to map storage keys to display text
  const getDisplayText = (item: string): string => {
    // No mapping needed - items are stored with their display text
    return item
  }

  // Helper function to format items list for display
  const formatItemsForDisplay = (items: string[]): string => {
    if (!items || items.length === 0) return ""
    return items.map(getDisplayText).join(", ")
  }

  // Helper function to scroll to the top of the form
  const scrollToFormTop = () => {
    console.log("scrollToFormTop called for step:", currentStep)
    if (formRef.current) {
      console.log("Scrolling to form top, element found:", !!formRef.current)
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    } else {
      console.log("formRef.current is null")
    }
  }

  // Helper function to get guest count and appropriate text
  const getGuestInfo = () => {
    const totalGuests = 1 + additionalPeople.length // 1 for main person + additional people
    const isPlural = totalGuests > 1
    return {
      count: totalGuests,
      isPlural,
      text: isPlural ? "buddies" : "buddy",
      youText: isPlural ? "y'all are" : "you're",
    }
  }

  // Handle custom extra field changes
  const handleCustomExtraFieldChange = (index: number, value: string) => {
    const newFields = [...customExtraFields]
    newFields[index] = value

    // Only add new field when user finishes typing (on blur) or when they press Enter
    // Don't add immediately on character input
    setCustomExtraFields(newFields)

    // Update form data with non-empty custom fields
    const nonEmptyFields = newFields.filter((field) => field.trim() !== "")
    const currentPredefined = (formData.extra_items || []).filter((item) =>
      [
        "Tent",
        "Sleeping Bag",
        "Chairs",
        "Room in my car for carpooling",
      ].includes(item)
    )
    setFormData({
      ...formData,
      extra_items: [...currentPredefined, ...nonEmptyFields],
    })
  }

  // Handle custom needed field changes
  const handleCustomNeededFieldChange = (index: number, value: string) => {
    const newFields = [...customNeededFields]
    newFields[index] = value

    // Only add new field when user finishes typing (on blur) or when they press Enter
    // Don't add immediately on character input
    setCustomNeededFields(newFields)

    // Update form data with non-empty custom fields
    const nonEmptyFields = newFields.filter((field) => field.trim() !== "")
    const currentPredefined = (formData.needed_items || []).filter((item) =>
      [
        "Tent",
        "Sleeping Bag",
        "Chairs",
        "A Ride",
        "River Shoes",
        "Inflatable Mattress",
      ].includes(item)
    )
    setFormData({
      ...formData,
      needed_items: [...currentPredefined, ...nonEmptyFields],
    })
  }

  // Handle when user finishes typing in a field
  const handleCustomExtraFieldComplete = (index: number) => {
    const newFields = [...customExtraFields]
    const fieldValue = newFields[index].trim()

    if (fieldValue !== "") {
      // Mark this field as completed
      setCompletedExtraFields((prev) => new Set([...prev, index]))

      // Add new empty field if this is the last field and has content
      if (index === newFields.length - 1) {
        newFields.push("")
        setCustomExtraFields(newFields)
      }
    }
  }

  const handleCustomNeededFieldComplete = (index: number) => {
    const newFields = [...customNeededFields]
    const fieldValue = newFields[index].trim()

    if (fieldValue !== "") {
      // Mark this field as completed
      setCompletedNeededFields((prev) => new Set([...prev, index]))

      // Add new empty field if this is the last field and has content
      if (index === newFields.length - 1) {
        newFields.push("")
        setCustomNeededFields(newFields)
      }
    }
  }

  // Remove a specific custom field
  const removeCustomExtraField = (index: number) => {
    const newFields = [...customExtraFields]
    newFields.splice(index, 1)

    // Update completed fields set (shift indices down for items after removed index)
    setCompletedExtraFields((prev) => {
      const newCompleted = new Set<number>()
      prev.forEach((completedIndex) => {
        if (completedIndex < index) {
          newCompleted.add(completedIndex)
        } else if (completedIndex > index) {
          newCompleted.add(completedIndex - 1)
        }
        // Skip the removed index
      })
      return newCompleted
    })

    // Ensure there's always at least one field, and it's empty
    if (
      newFields.length === 0 ||
      newFields[newFields.length - 1].trim() !== ""
    ) {
      newFields.push("")
    }

    setCustomExtraFields(newFields)

    // Update form data
    const nonEmptyFields = newFields.filter((field) => field.trim() !== "")
    const currentPredefined = (formData.extra_items || []).filter((item) =>
      [
        "Tent",
        "Sleeping Bag",
        "Chairs",
        "Room in my car for carpooling",
      ].includes(item)
    )
    setFormData({
      ...formData,
      extra_items: [...currentPredefined, ...nonEmptyFields],
    })
  }

  const removeCustomNeededField = (index: number) => {
    const newFields = [...customNeededFields]
    newFields.splice(index, 1)

    // Update completed fields set (shift indices down for items after removed index)
    setCompletedNeededFields((prev) => {
      const newCompleted = new Set<number>()
      prev.forEach((completedIndex) => {
        if (completedIndex < index) {
          newCompleted.add(completedIndex)
        } else if (completedIndex > index) {
          newCompleted.add(completedIndex - 1)
        }
        // Skip the removed index
      })
      return newCompleted
    })

    // Ensure there's always at least one field, and it's empty
    if (
      newFields.length === 0 ||
      newFields[newFields.length - 1].trim() !== ""
    ) {
      newFields.push("")
    }

    setCustomNeededFields(newFields)

    // Update form data
    const nonEmptyFields = newFields.filter((field) => field.trim() !== "")
    const currentPredefined = (formData.needed_items || []).filter((item) =>
      [
        "Tent",
        "Sleeping Bag",
        "Chairs",
        "A Ride",
        "River Shoes",
        "Inflatable Mattress",
      ].includes(item)
    )
    setFormData({
      ...formData,
      needed_items: [...currentPredefined, ...nonEmptyFields],
    })
  }

  useEffect(() => {
    const fetchItems = async () => {
      const items = await getPredefinedItemsAction()
      if (Array.isArray(items)) {
        // Use only database items, sorted alphabetically
        setDynamicPredefinedItems(items.sort())
      } else {
        // Fallback to empty array if there's an error fetching dynamic ones
        setDynamicPredefinedItems([])
        console.error("Error fetching predefined items:", items.error)
      }
    }
    fetchItems()
  }, [])

  // Handle "Can't Make It" submission when user reaches step 7
  useEffect(() => {
    if (currentStep === 7 && formData.rsvp_status === "no") {
      handleCannotMakeItSubmit()
    }
  }, [currentStep, formData.rsvp_status])

  const addPerson = () => {
    const newPerson: AdditionalPerson = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      name: "",
      phone: "",
    }
    setAdditionalPeople([...additionalPeople, newPerson])
    setSuccessMessage(null)
    setError(null)
  }

  const removePerson = (id: string) => {
    setAdditionalPeople(additionalPeople.filter((p) => p.id !== id))
  }

  const updatePersonName = (id: string, name: string) => {
    setAdditionalPeople(
      additionalPeople.map((p) => (p.id === id ? { ...p, name } : p))
    )
  }

  const updatePersonPhone = (id: string, phone: string) => {
    const formattedPhone = formatPhoneNumber(phone)
    setAdditionalPeople(
      additionalPeople.map((p) =>
        p.id === id ? { ...p, phone: formattedPhone } : p
      )
    )
  }

  const updateFormData = (field: keyof ActualRsvpFormData, value: any) => {
    if (field === "phone") {
      value = formatPhoneNumber(value)
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null) // Clear error on data change
  }

  const handleVolunteerRoleToggle = (role: string) => {
    setFormData((prev) => {
      const currentRoles = prev.volunteer_roles || []
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter((r) => r !== role)
        : [...currentRoles, role]
      return { ...prev, volunteer_roles: newRoles }
    })
    setError(null)
  }

  const handleAllergyToggle = (allergy: string) => {
    setFormData((prev) => {
      const currentAllergies = prev.allergies || []
      const newAllergies = currentAllergies.includes(allergy)
        ? currentAllergies.filter((a) => a !== allergy)
        : [...currentAllergies, allergy]
      return { ...prev, allergies: newAllergies }
    })
    setError(null)
  }

  const updateRSVPStatus = (rsvpValue: RSVPStatus) => {
    setFormData((prev) => ({
      ...prev,
      rsvp_status: prev.rsvp_status === rsvpValue ? null : rsvpValue,
    }))
    setError(null)
  }

  const requestClearAll = () => {
    setIsClearAllModalOpen(true)
  }

  const performClearAll = () => {
    setFormData({
      name: "",
      phone: "",
      rsvp_status: null,
      items_bringing: [],
      volunteer_roles: [],
      merrit_reservoir: false,
      message: "",
      extra_items: [],
      needed_items: [],
      allergies: [],
      note: "",
    })
    setAdditionalPeople([])
    setCustomExtraFields([""])
    setCustomNeededFields([""])
    setEditingExtraField(null)
    setEditingNeededField(null)
    setCompletedExtraFields(new Set())
    setCompletedNeededFields(new Set())
    setError(null)
    setSuccessMessage(null)
    setCurrentStep(1) // Reset to first step
    // Scroll to top when resetting form
    scrollToFormTop()
  }

  // Navigation functions
  const nextStep = () => {
    console.log(
      "nextStep called, current step:",
      currentStep,
      "going to:",
      currentStep + 1
    )
    setError(null) // Clear previous errors
    // Step 1 Validation
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError("Please enter your name.")
        return
      }
      if (!formData.rsvp_status) {
        setError("Please select an RSVP status.")
        return
      }

      // If they selected "Can't Make It", go to special step
      if (formData.rsvp_status === "no") {
        setCurrentStep(10) // Go to "Can't Make It" step (moved to step 10)
        // Scroll to top of form when going to Can't Make It step
        scrollToFormTop()
        return
      }
    }
    // Additional People Validation (on step 1)
    if (currentStep === 1) {
      for (const person of additionalPeople) {
        if (person.name.trim() === "") {
          setError(
            "Please fill in names for all additional people or remove empty entries before proceeding."
          )
          return
        }
      }
    }

    // Step 2 Phone Number Validation (only if RSVP is "yes")
    if (currentStep === 2 && formData.rsvp_status === "yes") {
      if (!formData.phone?.trim()) {
        setError("Please enter your phone number.")
        return
      }
      // Validate phone number length (should be 14 characters: (555) 123-4567)
      if (formData.phone.length !== 14) {
        setError("Please enter a complete phone number.")
        return
      }
      for (const person of additionalPeople) {
        if (!person.phone.trim()) {
          setError(
            `Please enter a phone number for ${
              person.name || "additional guest"
            }.`
          )
          return
        }
        if (person.phone.length !== 14) {
          setError(
            `Please enter a complete phone number for ${
              person.name || "additional guest"
            }.`
          )
          return
        }
      }
    }
    if (currentStep < TOTAL_STEPS) {
      console.log("Setting step from", currentStep, "to", currentStep + 1)
      setCurrentStep(currentStep + 1)
      // Scroll to top of form on mobile when advancing to next step
      scrollToFormTop()
    }
  }

  // Handle "Can't Make It" early submission
  const handleCannotMakeItSubmit = async () => {
    setError(null)
    setSuccessMessage(null)

    startTransition(async () => {
      try {
        const result = await submitActualRsvpAction(formData)
        if (result.success) {
          // Don't show success message for "Can't Make It" - step 6 handles display
          if (onFormSubmitSuccess) {
            onFormSubmitSuccess()
          }
        } else {
          setError(result.error || "Failed to submit RSVP.")
        }
      } catch (err) {
        setError("An unexpected error occurred.")
        console.error("Cannot make it submission error:", err)
      }
    })
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
      // Scroll to top of form when going to previous step
      scrollToFormTop()
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Final validation before submitting
    if (
      currentStep !== TOTAL_STEPS &&
      currentStep !== 10 &&
      currentStep !== 11
    ) {
      // This function should only be callable from the last step's button or the "Can't Make It" step
      console.warn("handleSubmit called from incorrect step:", currentStep)
      return
    }

    if (!formData.name.trim()) {
      setError("Please enter your name.")
      setCurrentStep(1)
      return
    }
    if (!formData.rsvp_status) {
      setError("Please select an RSVP status.")
      setCurrentStep(1)
      return
    }
    if (formData.rsvp_status === "yes" && !formData.phone?.trim()) {
      setError("Please enter your phone number.")
      setCurrentStep(2)
      return
    }
    if (
      formData.rsvp_status === "yes" &&
      formData.phone &&
      formData.phone.length !== 14
    ) {
      setError("Please enter a complete phone number.")
      setCurrentStep(2)
      return
    }
    for (const person of additionalPeople) {
      if (person.name.trim() === "") {
        setError(
          "Please fill in names for all additional people or remove empty entries."
        )
        setCurrentStep(1)
        return
      }
      if (formData.rsvp_status === "yes" && !person.phone.trim()) {
        setError(
          `Please enter a phone number for ${
            person.name || "additional guest"
          }.`
        )
        setCurrentStep(2)
        return
      }
      if (formData.rsvp_status === "yes" && person.phone.length !== 14) {
        setError(
          `Please enter a complete phone number for ${
            person.name || "additional guest"
          }.`
        )
        setCurrentStep(2)
        return
      }
    }

    startTransition(async () => {
      try {
        const result = await submitActualRsvpAction(formData)
        if (result.success) {
          // Use the groupId returned from the first submission for additional people
          const groupId = result.groupId

          if (additionalPeople.length > 0 && groupId) {
            for (const person of additionalPeople) {
              const additionalPersonData: ActualRsvpFormData = {
                name: person.name,
                phone: person.phone,
                rsvp_status: formData.rsvp_status,
                items_bringing: [], // Assuming additional guests don't bring items
                volunteer_roles: [], // Assuming additional guests don't volunteer
                merrit_reservoir: formData.merrit_reservoir,
                message: "",
                note: `Additional guest for ${formData.name}`,
              }
              const additionalResult = await submitActualRsvpAction(
                additionalPersonData,
                groupId // Pass the group ID to link this person to the main submission
              )
              if (!additionalResult.success) {
                console.warn(
                  `Failed to submit RSVP for additional person ${person.name}: ${additionalResult.error}`
                )
                setError(
                  (prevError) =>
                    (prevError ? prevError + "; " : "") +
                    `Failed to submit for ${person.name}: ${additionalResult.error}`
                )
              }
            }
          }
          setSuccessMessage(result.message || "RSVP submitted successfully!")
          // Go to appropriate confirmation step based on current step and RSVP status
          if (currentStep === 10 || formData.rsvp_status === "no") {
            setCurrentStep(11) // Go to decline confirmation step
          } else {
            setCurrentStep(9) // Go to success confirmation for accepted RSVPs
          }
          // Scroll to top to show confirmation message
          scrollToFormTop()
          if (onFormSubmitSuccess) {
            onFormSubmitSuccess()
          }
        } else {
          setError(result.error || "Failed to submit RSVP.")
        }
      } catch (err) {
        setError("An unexpected error occurred.")
        console.error("Submission error:", err)
      }
    })
  }

  // Helper to render current step\'s content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Name and RSVP Status
        return (
          <Fragment>
            {/* Name Input */}
            <div>
              <label
                htmlFor='name'
                className='mb-2 block text-lg font-semibold text-gray-textdark'
              >
                Your Name
              </label>
              <div className='flex items-center'>
                <input
                  type='text'
                  id='name'
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className='focus:outline-none w-full p-2.5 font-mono text-base border border-text-dm rounded-md focus:ring-1 focus:ring-pink-dark focus:border-pink-dark'
                  placeholder='Jean-Luc Picard'
                />
                <div className='ml-3 w-8 h-8 flex-shrink-0'></div>
              </div>
            </div>

            {/* Additional People List */}
            <div className='space-y-6 mt-6'>
              {additionalPeople.map((person, index) => {
                const placeholders = [
                  "Geordi La Forge",
                  "William Riker",
                  "Worf",
                  "Dr. Beverly Crusher",
                ]
                return (
                  <div key={person.id} className='flex items-center'>
                    <input
                      type='text'
                      value={person.name}
                      onChange={(e) =>
                        updatePersonName(person.id, e.target.value)
                      }
                      placeholder={
                        placeholders[index] || `Guest ${index + 1} Name`
                      }
                      className='focus:outline-none w-full p-2.5 font-mono text-base border border-text-dm rounded-md focus:ring-1 focus:ring-pink-dark focus:border-pink-dark'
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type='button'
                      onClick={() => removePerson(person.id)}
                      className='ml-3 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors flex-shrink-0'
                      aria-label='Remove person'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-5 h-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Add Another Person Button */}
            <div className='mt-4'>
              <button
                type='button'
                onClick={addPerson}
                disabled={additionalPeople.length >= 4}
                className='w-full font-mono uppercase text-xs sm:text-sm tracking-wider py-2.5 px-4 border border-gray text-gray-textdark bg-gray-cardbg/80 hover:bg-gray-pagebg hover:border-gray-textlight rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                + Add Another Person{" "}
                {additionalPeople.length >= 4 ? "(Max 5 Total)" : ""}
              </button>
            </div>

            {/* RSVP Status */}
            <div className='mt-8'>
              <h3 className='mb-3 text-lg font-semibold text-gray-textdark'>
                Are {additionalPeople.length > 0 ? "y'all" : "you"} coming?
              </h3>
              <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                {RSVP_OPTIONS.map((option) => {
                  const isSelected = formData.rsvp_status === option.value
                  return (
                    <button
                      key={option.value}
                      type='button'
                      onClick={() => updateRSVPStatus(option.value)}
                      className={cn(
                        "w-full p-2.5 font-mono text-xs sm:text-sm rounded-md border text-center transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1",
                        isSelected ? option.selectedClass : option.baseClass,
                        !isSelected && option.textClass
                      )}
                      title={option.label}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </Fragment>
        )
      case 2: // Phone Numbers (conditional)
        return (
          <Fragment>
            {formData.rsvp_status === "yes" ? (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-textdark'>
                  Phone Number{getGuestInfo().isPlural ? "s" : ""}
                </h3>

                {/* Main person phone */}
                <div>
                  <label
                    htmlFor='phone'
                    className='mb-2 block text-sm font-medium text-gray-textdark'
                  >
                    Your Phone Number
                  </label>
                  <input
                    type='tel'
                    id='phone'
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    className='focus:outline-none w-full p-2.5 font-mono text-base border border-text-dm rounded-md focus:ring-1 focus:ring-pink-dark focus:border-pink-dark'
                    placeholder='(555) 123-4567'
                    maxLength={14}
                  />
                </div>

                {/* Additional people phone numbers */}
                {additionalPeople.map((person, index) => (
                  <div key={person.id}>
                    <label
                      htmlFor={`phone_${person.id}`}
                      className='mb-2 block text-sm font-medium text-gray-textdark'
                    >
                      {person.name || `Guest #${index + 1}`}'s Phone Number
                    </label>
                    <input
                      type='tel'
                      id={`phone_${person.id}`}
                      value={person.phone}
                      onChange={(e) =>
                        updatePersonPhone(person.id, e.target.value)
                      }
                      className='focus:outline-none w-full p-2.5 font-mono text-base border border-text-dm rounded-md focus:ring-1 focus:ring-pink-dark focus:border-pink-dark'
                      placeholder='(555) 123-4567'
                      maxLength={14}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <p className='text-lg text-gray-textlight'>
                  Since you're not coming, we'll skip the phone number step.
                </p>
              </div>
            )}
          </Fragment>
        )
      case 3: // Items Bringing
        return (
          <Fragment>
            <div>
              <label
                htmlFor='items_bringing'
                className='mb-2 block text-lg font-semibold text-gray-textdark'
              >
                (Optional) What{" "}
                {getGuestInfo().isPlural ? "are y'all" : "are you"} bringing?
              </label>
              <p className='mb-3 text-sm text-gray-textlight'>
                Communal things so David doesn't overpack
              </p>
              <div className='rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-750'>
                <TagInput
                  tags={formData.items_bringing || []}
                  onTagsChange={(newTags) =>
                    setFormData({ ...formData, items_bringing: newTags })
                  }
                  placeholder='Type and press Enter to add items...'
                  predefinedTags={dynamicPredefinedItems} // Use combined list
                />
              </div>
            </div>
          </Fragment>
        )
      case 4: // I have extra / I need
        return (
          <Fragment>
            <div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start'>
                {/* Left Column - I Have Extra */}
                <div>
                  <label className='mb-3 block text-lg font-semibold text-gray-textdark'>
                    I have extra if anyone needs it
                  </label>
                  <div className='space-y-3'>
                    {[
                      "Tent",
                      "Sleeping Bag",
                      "Chairs",
                      "Room in my car for carpooling",
                      "River Shoes",
                      "Inflatable Mattress",
                    ].map((item) => {
                      const isSelected = (formData.extra_items || []).includes(
                        item
                      )
                      return (
                        <ItemTooltip
                          key={`have_${item}`}
                          item={item}
                          rsvps={rsvps}
                          type='extra'
                          isSelected={isSelected}
                          activeTooltip={activeTooltip}
                          onTooltipChange={setActiveTooltip}
                        >
                          <div
                            className={`flex items-center space-x-3 p-3 rounded-md border-2 transition-colors cursor-pointer ${
                              isSelected
                                ? "border-teal-dark bg-teal-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => {
                              const currentItems = formData.extra_items || []
                              const currentNeeds = formData.needed_items || []
                              const customExtras = customExtraFields.filter(
                                (field) => field.trim() !== ""
                              )
                              const customNeeds = customNeededFields.filter(
                                (field) => field.trim() !== ""
                              )

                              const predefinedExtras = currentItems.filter(
                                (i) =>
                                  [
                                    "Tent",
                                    "Sleeping Bag",
                                    "Chairs",
                                    "Room in my car for carpooling",
                                    "River Shoes",
                                    "Inflatable Mattress",
                                  ].includes(i)
                              )
                              const predefinedNeeds = currentNeeds.filter((i) =>
                                [
                                  "Tent",
                                  "Sleeping Bag",
                                  "Chairs",
                                  "A Ride",
                                  "River Shoes",
                                  "Inflatable Mattress",
                                ].includes(i)
                              )

                              const newPredefinedExtras = isSelected
                                ? predefinedExtras.filter((i) => i !== item)
                                : [...predefinedExtras, item]

                              // Remove from needed items if adding to extra items (handle ride mutual exclusion)
                              let newPredefinedNeeds = predefinedNeeds
                              if (!isSelected) {
                                // Adding to extra items, so remove conflicting needed items
                                if (item === "Room in my car for carpooling") {
                                  // Remove "A Ride" from needed items
                                  newPredefinedNeeds = predefinedNeeds.filter(
                                    (i) => i !== "A Ride"
                                  )
                                } else {
                                  // For other items, remove the same item from needed items
                                  newPredefinedNeeds = predefinedNeeds.filter(
                                    (i) => i !== item
                                  )
                                }
                              }

                              setFormData({
                                ...formData,
                                extra_items: [
                                  ...newPredefinedExtras,
                                  ...customExtras,
                                ],
                                needed_items: [
                                  ...newPredefinedNeeds,
                                  ...customNeeds,
                                ],
                              })
                            }}
                          >
                            <div className='relative'>
                              <input
                                type='checkbox'
                                checked={isSelected}
                                onChange={() => {}} // Handled by parent div onClick
                                className='sr-only'
                              />
                              <div
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer ${
                                  isSelected
                                    ? "bg-teal-dark border-teal-dark"
                                    : "border-gray-300 bg-white hover:border-gray-400"
                                }`}
                              >
                                {isSelected && (
                                  <span className='text-white text-sm'>✓</span>
                                )}
                              </div>
                            </div>
                            <span className='text-sm font-mono text-gray-textdark cursor-pointer select-none'>
                              {item}
                            </span>
                          </div>
                        </ItemTooltip>
                      )
                    })}

                    {/* Custom extra items fields */}
                    <div className='mt-4 space-y-3'>
                      {customExtraFields.map((field, index) => {
                        const hasContent = field.trim() !== ""
                        const isCompleted =
                          completedExtraFields.has(index) && hasContent
                        const isEditing = editingExtraField === index
                        const isLastField =
                          index === customExtraFields.length - 1
                        const hasMultipleFields = customExtraFields.length > 1
                        const showRemoveButton =
                          hasMultipleFields && !isLastField && isCompleted

                        return (
                          <div key={`custom_extra_${index}`}>
                            {isCompleted && !isEditing ? (
                              // Show as styled checkbox when it's completed and not editing
                              <div
                                className={`flex items-center space-x-3 p-3 rounded-md border-2 transition-colors cursor-pointer border-teal-dark bg-teal-50 group hover:bg-teal-100`}
                                onClick={() => {
                                  setEditingExtraField(index)
                                  // Remove from completed set when editing
                                  setCompletedExtraFields((prev) => {
                                    const newCompleted = new Set(prev)
                                    newCompleted.delete(index)
                                    return newCompleted
                                  })
                                }}
                              >
                                <div className='relative'>
                                  <div
                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center bg-teal-dark border-teal-dark`}
                                  >
                                    <span className='text-white text-sm'>
                                      ✓
                                    </span>
                                  </div>
                                </div>
                                <span className='text-sm font-mono text-gray-textdark flex-1'>
                                  {field}
                                </span>
                                <div className='flex items-center space-x-2'>
                                  {/* Edit icon - shows on hover */}
                                  <svg
                                    className='w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                    />
                                  </svg>
                                  {showRemoveButton && (
                                    <button
                                      type='button'
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeCustomExtraField(index)
                                      }}
                                      className='text-red-500 hover:text-red-700 p-1 text-lg font-bold'
                                      title='Remove this field'
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              // Show as input field when not completed or editing
                              <div className='flex items-center space-x-3 p-3 rounded-md border-2 border-gray-300'>
                                <input
                                  type='text'
                                  value={field}
                                  onChange={(e) =>
                                    handleCustomExtraFieldChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  onBlur={() => {
                                    setEditingExtraField(null)
                                    handleCustomExtraFieldComplete(index)
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.currentTarget.blur()
                                    }
                                  }}
                                  placeholder='Add custom item...'
                                  className='flex-1 border-0 focus:outline-none focus:ring-0 text-base font-mono bg-transparent'
                                  autoFocus={isEditing}
                                />
                                {showRemoveButton && (
                                  <button
                                    type='button'
                                    onClick={() =>
                                      removeCustomExtraField(index)
                                    }
                                    className='text-red-500 hover:text-red-700 p-1 text-lg font-bold'
                                    title='Remove this field'
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column - I Need */}
                <div>
                  <label className='mb-3 block text-lg font-semibold text-gray-textdark'>
                    If anyone has extra, I need
                  </label>
                  <div className='space-y-3'>
                    {[
                      "Tent",
                      "Sleeping Bag",
                      "Chairs",
                      "A Ride",
                      "River Shoes",
                      "Inflatable Mattress",
                    ].map((item, index) => {
                      // Use the display text directly for needed_items
                      const storageKey = item
                      const isSelected = (formData.needed_items || []).includes(
                        storageKey
                      )
                      return (
                        <ItemTooltip
                          key={`need_${item}`}
                          item={item}
                          rsvps={rsvps}
                          type='need'
                          isSelected={isSelected}
                          activeTooltip={activeTooltip}
                          onTooltipChange={setActiveTooltip}
                        >
                          <div
                            className={`flex items-center space-x-3 p-3 rounded-md border-2 transition-colors cursor-pointer ${
                              isSelected
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => {
                              const currentNeeds = formData.needed_items || []
                              const currentItems = formData.extra_items || []
                              const customExtras = customExtraFields.filter(
                                (field) => field.trim() !== ""
                              )
                              const customNeeds = customNeededFields.filter(
                                (field) => field.trim() !== ""
                              )

                              const predefinedExtras = currentItems.filter(
                                (i) =>
                                  [
                                    "Tent",
                                    "Sleeping Bag",
                                    "Chairs",
                                    "Room in my car for carpooling",
                                    "River Shoes",
                                    "Inflatable Mattress",
                                  ].includes(i)
                              )
                              const predefinedNeeds = currentNeeds.filter((i) =>
                                [
                                  "Tent",
                                  "Sleeping Bag",
                                  "Chairs",
                                  "A Ride",
                                  "River Shoes",
                                  "Inflatable Mattress",
                                ].includes(i)
                              )

                              const newPredefinedNeeds = isSelected
                                ? predefinedNeeds.filter(
                                    (i) => i !== storageKey
                                  )
                                : [...predefinedNeeds, storageKey]

                              // Remove from extra items if adding to needed items (handle ride mutual exclusion)
                              let newPredefinedExtras = predefinedExtras
                              if (!isSelected) {
                                // Adding to needed items, so remove conflicting extra items
                                if (storageKey === "A Ride") {
                                  // Remove "Room in my car for carpooling" from extra items
                                  newPredefinedExtras = predefinedExtras.filter(
                                    (i) => i !== "Room in my car for carpooling"
                                  )
                                } else {
                                  // For other items, remove the same item from extra items
                                  newPredefinedExtras = predefinedExtras.filter(
                                    (i) => i !== storageKey
                                  )
                                }
                              }

                              setFormData({
                                ...formData,
                                needed_items: [
                                  ...newPredefinedNeeds,
                                  ...customNeeds,
                                ],
                                extra_items: [
                                  ...newPredefinedExtras,
                                  ...customExtras,
                                ],
                              })
                            }}
                          >
                            <div className='relative'>
                              <input
                                type='checkbox'
                                checked={isSelected}
                                onChange={() => {}} // Handled by parent div onClick
                                className='sr-only'
                              />
                              <div
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer ${
                                  isSelected
                                    ? "bg-red-500 border-red-500"
                                    : "border-gray-300 bg-white hover:border-gray-400"
                                }`}
                              >
                                {isSelected && (
                                  <span className='text-white text-sm'>✓</span>
                                )}
                              </div>
                            </div>
                            <span className='text-sm font-mono text-gray-textdark cursor-pointer select-none'>
                              {item}
                            </span>
                          </div>
                        </ItemTooltip>
                      )
                    })}

                    {/* Custom needed items fields */}
                    <div className='mt-4 space-y-3'>
                      {customNeededFields.map((field, index) => {
                        const hasContent = field.trim() !== ""
                        const isCompleted =
                          completedNeededFields.has(index) && hasContent
                        const isEditing = editingNeededField === index
                        const isLastField =
                          index === customNeededFields.length - 1
                        const hasMultipleFields = customNeededFields.length > 1
                        const showRemoveButton =
                          hasMultipleFields && !isLastField && isCompleted

                        return (
                          <div key={`custom_needed_${index}`}>
                            {isCompleted && !isEditing ? (
                              // Show as styled checkbox when it's completed and not editing
                              <div
                                className={`flex items-center space-x-3 p-3 rounded-md border-2 transition-colors cursor-pointer border-red-500 bg-red-50 group hover:bg-red-100`}
                                onClick={() => {
                                  setEditingNeededField(index)
                                  // Remove from completed set when editing
                                  setCompletedNeededFields((prev) => {
                                    const newCompleted = new Set(prev)
                                    newCompleted.delete(index)
                                    return newCompleted
                                  })
                                }}
                              >
                                <div className='relative'>
                                  <div
                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center bg-red-500 border-red-500`}
                                  >
                                    <span className='text-white text-sm'>
                                      ✓
                                    </span>
                                  </div>
                                </div>
                                <span className='text-sm font-mono text-gray-textdark flex-1'>
                                  {field}
                                </span>
                                <div className='flex items-center space-x-2'>
                                  {/* Edit icon - shows on hover */}
                                  <svg
                                    className='w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                    />
                                  </svg>
                                  {showRemoveButton && (
                                    <button
                                      type='button'
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeCustomNeededField(index)
                                      }}
                                      className='text-red-500 hover:text-red-700 p-1 text-lg font-bold'
                                      title='Remove this field'
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              // Show as input field when not completed or editing
                              <div className='flex items-center space-x-3 p-3 rounded-md border-2 border-gray-300'>
                                <input
                                  type='text'
                                  value={field}
                                  onChange={(e) =>
                                    handleCustomNeededFieldChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  onBlur={() => {
                                    setEditingNeededField(null)
                                    handleCustomNeededFieldComplete(index)
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.currentTarget.blur()
                                    }
                                  }}
                                  placeholder='Add custom item...'
                                  className='flex-1 border-0 focus:outline-none focus:ring-0 text-base font-mono bg-transparent'
                                  autoFocus={isEditing}
                                />
                                {showRemoveButton && (
                                  <button
                                    type='button'
                                    onClick={() =>
                                      removeCustomNeededField(index)
                                    }
                                    className='text-red-500 hover:text-red-700 p-1 text-lg font-bold'
                                    title='Remove this field'
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        )
      case 5: // Allergies & Dietary Restrictions
        return (
          <Fragment>
            <div>
              <label className='mb-3 block text-lg font-semibold text-gray-textdark'>
                These things will physically/spiritually kill me
              </label>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {[
                  { name: "Eggs", emoji: "🥚" },
                  { name: "Nuts", emoji: "🥜" },
                  { name: "I'm Vegan", emoji: "🌱" },
                  { name: "Eating Fish Freaks Me Out", emoji: "🐟" },
                  { name: "I'm Vegetarian", emoji: "🥬" },
                  { name: "I'm GF", emoji: "🌾" },
                  { name: "Soy", emoji: "🫘" },
                  { name: "Latex?", emoji: "🧤" },
                  { name: "Milk", emoji: "🥛" },
                  { name: "Sesame", emoji: "🪢" },
                  { name: "Something Else", emoji: "🤷‍♀️" },
                ].map((allergy) => {
                  const isSelected = (formData.allergies || []).includes(
                    allergy.name
                  )
                  return (
                    <div
                      key={allergy.name}
                      className={`flex items-center space-x-3 p-3 rounded-md border-2 transition-colors cursor-pointer ${
                        isSelected
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => handleAllergyToggle(allergy.name)}
                    >
                      <div className='relative'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => {}} // Handled by parent div onClick
                          className='sr-only'
                        />
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "bg-red-500 border-red-500"
                              : "border-gray-300 bg-white hover:border-gray-400"
                          }`}
                        >
                          {isSelected && (
                            <span className='text-white text-sm'>✓</span>
                          )}
                        </div>
                      </div>
                      <span className='text-sm font-mono text-gray-textdark cursor-pointer select-none flex items-center'>
                        <span className='mr-2'>{allergy.emoji}</span>
                        {allergy.name}
                      </span>
                    </div>
                  )
                })}

                {/* Untoggable Republicans checkbox */}
                <div className='flex items-center space-x-3 p-3 rounded-md border-2 border-red-500 bg-red-50'>
                  <div className='relative'>
                    <div className='w-6 h-6 rounded border-2 flex items-center justify-center bg-red-500 border-red-500'>
                      <span className='text-white text-sm'>✓</span>
                    </div>
                  </div>
                  <span className='text-sm font-mono text-gray-textdark select-none flex items-center'>
                    <span className='mr-2'>🤡</span>
                    3.5 More Years of This Bullshit
                  </span>
                </div>
              </div>

              <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
                <p className='text-sm text-yellow-800'>
                  <strong>Note:</strong> Text Jordan details @ 402-957-3995
                </p>
              </div>
            </div>
          </Fragment>
        )
      case 6: // Volunteer Roles
        return (
          <Fragment>
            <div>
              <label className='mb-3 block text-lg font-semibold text-gray-textdark'>
                (Optional) I'm Down To...
              </label>
              <div className='space-y-4'>
                {VOLUNTEER_ROLES.map((role) => {
                  const isSelected = (formData.volunteer_roles || []).includes(
                    role
                  )
                  return (
                    <div
                      key={role}
                      className={`flex items-center space-x-4 p-4 rounded-md border-2 transition-colors cursor-pointer ${
                        isSelected
                          ? "border-teal-dark bg-teal-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => handleVolunteerRoleToggle(role)}
                    >
                      <div className='relative'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => {}} // Handled by parent div onClick
                          className='sr-only'
                        />
                        <div
                          className={`w-8 h-8 rounded border-2 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "bg-teal-dark border-teal-dark"
                              : "border-gray-300 bg-white hover:border-gray-400"
                          }`}
                        >
                          {isSelected && (
                            <span className='text-white text-lg'>✓</span>
                          )}
                        </div>
                      </div>
                      <span className='text-lg font-mono text-gray-textdark cursor-pointer select-none'>
                        {role}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Fragment>
        )
      case 7: // Merrit Reservoir Interest & Final Review
        return (
          <Fragment>
            <div>
              <label className='mb-3 block text-lg font-semibold text-gray-textdark'>
                Merrit Reservoir Day Trip
              </label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div
                  className={`flex items-center space-x-4 p-6 rounded-md border-2 transition-colors cursor-pointer ${
                    formData.merrit_reservoir === true
                      ? "border-teal-dark bg-teal-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => updateFormData("merrit_reservoir", true)}
                >
                  <div className='relative'>
                    <input
                      type='radio'
                      id='merrit_yes'
                      name='merrit_reservoir'
                      checked={formData.merrit_reservoir === true}
                      onChange={() => updateFormData("merrit_reservoir", true)}
                      className='sr-only'
                    />
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                        formData.merrit_reservoir === true
                          ? "bg-teal-dark border-teal-dark"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      {formData.merrit_reservoir === true && (
                        <div className='w-3 h-3 rounded-full bg-white'></div>
                      )}
                    </div>
                  </div>
                  <label className='text-lg font-mono text-gray-textdark cursor-pointer select-none'>
                    {getGuestInfo().isPlural ? "We're" : "I'm"} coming to Merrit
                    Reservoir on Thursday
                  </label>
                </div>

                <div
                  className={`flex items-center space-x-4 p-6 rounded-md border-2 transition-colors cursor-pointer ${
                    formData.merrit_reservoir === false
                      ? "border-teal-dark bg-teal-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => updateFormData("merrit_reservoir", false)}
                >
                  <div className='relative'>
                    <input
                      type='radio'
                      id='merrit_no'
                      name='merrit_reservoir'
                      checked={formData.merrit_reservoir === false}
                      onChange={() => updateFormData("merrit_reservoir", false)}
                      className='sr-only'
                    />
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                        formData.merrit_reservoir === false
                          ? "bg-teal-dark border-teal-dark"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      {formData.merrit_reservoir === false && (
                        <div className='w-3 h-3 rounded-full bg-white'></div>
                      )}
                    </div>
                  </div>
                  <label className='text-lg font-mono text-gray-textdark cursor-pointer select-none'>
                    {getGuestInfo().isPlural ? "We're" : "I'm"} just coming for
                    the float trip
                  </label>
                </div>
              </div>
            </div>

            {/* <div className='mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-750'>
              <h3 className='mb-3 text-xl font-semibold text-gray-textdark'>
                Review Your RSVP
              </h3>
              <div className='space-y-2 text-gray-textdark'>
                <p>
                  <strong>Name:</strong> {formData.name || "Not specified"}
                </p>
                <p>
                  <strong>Phone:</strong> {formData.phone || "Not specified"}
                </p>
                <p>
                  <strong>RSVP Status:</strong>{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      formData.rsvp_status === "yes"
                        ? "text-teal-dark"
                        : formData.rsvp_status === "no"
                        ? "text-orange-dark"
                        : ""
                    )}
                  >
                    {formData.rsvp_status
                      ? RSVP_OPTIONS.find(
                          (opt) => opt.value === formData.rsvp_status
                        )?.label
                      : "Not selected"}
                  </span>
                </p>
                <p>
                  <strong>Bringing:</strong>{" "}
                  {formData.items_bringing && formData.items_bringing.length > 0
                    ? formData.items_bringing.join(", ")
                    : "Nothing specified"}
                </p>
                <p>
                  <strong>Extra Items Available:</strong>{" "}
                  {formData.extra_items && formData.extra_items.length > 0
                    ? formatItemsForDisplay(formData.extra_items)
                    : "None specified"}
                </p>
                <p>
                  <strong>Items Needed:</strong>{" "}
                  {formData.needed_items && formData.needed_items.length > 0
                    ? formatItemsForDisplay(formData.needed_items)
                    : "None specified"}
                </p>
                <p>
                  <strong>Volunteering for:</strong>{" "}
                  {formData.volunteer_roles &&
                  formData.volunteer_roles.length > 0
                    ? formData.volunteer_roles.join(", ")
                    : "No roles selected"}
                </p>
                <p>
                  <strong>Merrit Reservoir Day Trip:</strong>{" "}
                  {formData.merrit_reservoir === true
                    ? "Yes, I'm coming to Merrit Reservoir on Thursday"
                    : "No, I'm just coming for the float trip"}
                </p>
                {additionalPeople.length > 0 && (
                  <div>
                    <strong>Additional People:</strong>
                    <ul className='list-disc pl-5'>
                      {additionalPeople.map((p) => (
                        <li key={p.id}>
                          {p.name}
                          {p.phone ? ` (${p.phone})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {formData.message && (
                  <p>
                    <strong>Message:</strong> {formData.message}
                  </p>
                )}
              </div>
            </div> */}
          </Fragment>
        )
      case 8: // Sharing step (moved Can't Make It to step 10 for "no" status)
        return (
          <Fragment>
            <div>
              <label
                htmlFor='message'
                className='mb-2 block text-lg font-semibold text-gray-textdark'
              >
                Anything you'd like to share with the class?
              </label>
              <textarea
                id='message'
                value={formData.message}
                onChange={(e) => updateFormData("message", e.target.value)}
                rows={4}
                className='w-full focus:outline-none p-2.5 font-mono text-base border border-text-dm rounded-md focus:ring-1 focus:ring-pink-dark focus:border-pink-dark'
                placeholder='Looking forward to floating with everyone and not drowning! 🚣‍♀️'
              />
            </div>
          </Fragment>
        )
      case 9: // Confirmation step
        return (
          <Fragment>
            <div className='text-center py-8'>
              <div className='mb-6'>
                <h2 className='text-center text-2xl font-bold text-gray-textdark mb-4'>
                  🎉 RSVP Submitted Successfully 🎉
                </h2>
                <p className='text-lg text-gray-textdark mb-4'>Siiiick.</p>
                <p className='text-gray-textlight mb-6'>
                  You'll receive more details as we get closer to the trip date.
                </p>
              </div>

              <div className='bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6'>
                <p className='text-sm text-teal-700 mb-2'>
                  <strong>Add it to your calendar</strong>
                </p>
                <a
                  href={
                    formData.merrit_reservoir
                      ? "/niobrara-trip-merrit.ics"
                      : "/niobrara-trip.ics"
                  }
                  className='text-teal-600 hover:text-teal-800 underline font-medium'
                  download
                >
                  📅 Download Calendar Event
                </a>
              </div>

              <div className='mt-8'>
                <button
                  type='button'
                  onClick={() => {
                    // Reset form and start over
                    performClearAll()
                  }}
                  className='text-sm text-gray-textlight hover:text-gray-textdark transition-colors'
                >
                  ← Submit another RSVP
                </button>
              </div>
            </div>
          </Fragment>
        )
      case 10: // Can't Make It step (moved from case 7)
        return (
          <Fragment>
            <div className='text-center py-8'>
              <div className='mb-6'>
                <h2 className='text-2xl font-bold text-gray-textdark mb-4 text-center'>
                  Ah, bummer! 😔
                </h2>
                <p className='text-lg text-gray-textdark mb-4'>
                  Sorry you can't make it. We'll miss you.
                </p>
              </div>

              {/* Comment field for declined RSVPs */}
              <div className='mb-6 text-left'>
                <label
                  htmlFor='decline_message'
                  className='text-center mb-2 block text-lg font-semibold text-gray-textdark'
                >
                  Anything you'd like to share with the class before you go?
                </label>
                <textarea
                  id='decline_message'
                  value={formData.message}
                  onChange={(e) => updateFormData("message", e.target.value)}
                  rows={4}
                  className='w-full focus:outline-none p-2.5 font-mono text-base border border-text-dm rounded-md focus:ring-1 focus:ring-pink-dark focus:border-pink-dark'
                  placeholder={`Hope you all have a great time and don't drown! 🌊`}
                />
              </div>

              {/* Submit button for declined RSVPs */}
              <div className='mb-6'>
                <button
                  type='submit'
                  disabled={isPending}
                  className='w-full font-mono uppercase text-xs sm:text-sm tracking-wider py-2.5 px-6 bg-orange-dark text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-dark focus:ring-offset-2 disabled:opacity-60 sm:w-auto'
                >
                  {isPending ? "Submitting..." : "Submit Response"}
                </button>
              </div>

              <div className='mt-8'>
                <button
                  type='button'
                  onClick={() => {
                    setCurrentStep(1)
                    setFormData((prev) => ({ ...prev, rsvp_status: null }))
                    setError(null)
                    setSuccessMessage(null)
                    // Scroll to top when returning to start
                    scrollToFormTop()
                  }}
                  className='text-sm text-gray-textlight hover:text-gray-textdark transition-colors'
                >
                  ← I changed my mind
                </button>
              </div>
            </div>
          </Fragment>
        )
      case 11: // Decline confirmation step
        return (
          <Fragment>
            <div className='text-center py-8'>
              <div className='mb-6'>
                <h2 className='text-2xl font-bold text-gray-textdark mb-4 text-center'>
                  Thanks for letting us know! 📝
                </h2>
                <p className='text-lg text-gray-textdark mb-4'>
                  We appreciate you taking the time to respond. We'll miss you
                  on the trip!
                </p>
                {formData.message && (
                  <div className='bg-gray-50 border-l-4 border-orange-dark p-4 mb-4'>
                    <p className='text-sm text-gray-textdark font-medium mb-1'>
                      Your message:
                    </p>
                    <p className='text-gray-textdark italic'>
                      "{formData.message}"
                    </p>
                  </div>
                )}
              </div>

              <div className='mt-8'>
                <button
                  type='button'
                  onClick={() => {
                    // Reset form and start over
                    performClearAll()
                  }}
                  className='text-sm text-gray-textlight hover:text-gray-textdark transition-colors'
                >
                  ← Submit another RSVP
                </button>
              </div>
            </div>
          </Fragment>
        )
      default:
        return <div>End of Form. Ready to submit?</div> // Fallback, should ideally not be reached if TOTAL_STEPS is correct
    }
  }

  return (
    // Use a key on the form that changes with currentStep to help React re-render if needed,
    // or manage focus manually. For now, let's rely on state changes.
    <div
      ref={formRef}
      className='w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg'
    >
      <form onSubmit={handleSubmit} className='space-y-8 p-4 sm:p-8'>
        <div className='mb-4'>
          <h2 className='text-2xl font-bold text-center text-gray-textdark'>
            Niobrara River Trip RSVP
          </h2>
          {currentStep !== 8 &&
            currentStep !== 9 &&
            currentStep !== 10 && // Hide step counter for "Confirmation" step and "Can't Make It" step
            currentStep !== 11 && ( // Hide step counter for decline confirmation step
              <>
                <p className='text-center text-gray-textlight'>
                  Step {currentStep} of {TOTAL_STEPS}
                </p>
                <div className='mt-3 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                  <div
                    className='h-2.5 rounded-full bg-teal transition-all duration-300 ease-in-out'
                    style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                  ></div>
                </div>
              </>
            )}
        </div>

        <div className='min-h-[250px]'>{renderStepContent()}</div>

        {/* Error and Success Messages (centralized) */}
        {/* Ensure these are not inside a conditionally rendered Fragment that might unmount them */}
        {error &&
          !successMessage && ( // Only show error if no success message
            <div
              className='mt-4 rounded-md border border-red-300 bg-red-50 p-4 text-red-700'
              role='alert'
            >
              <p className='font-semibold'>Error:</p>
              <p>{error}</p>
            </div>
          )}

        {/* Navigation Buttons */}
        {!successMessage && ( // Hide navigation if success message is shown
          <div className='mt-8 flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0'>
            {currentStep === 9 || currentStep === 10 || currentStep === 11 ? (
              // Special case for "Confirmation" step and "Can't Make It" step - no navigation buttons
              <div></div>
            ) : (
              <>
                <button
                  type='button'
                  onClick={prevStep}
                  disabled={isPending || currentStep === 1}
                  className={cn(
                    "font-mono uppercase text-xs sm:text-sm tracking-wider py-2.5 px-4 border border-gray text-gray-textdark bg-gray-cardbg hover:bg-gray-pagebg hover:border-gray-textlight rounded-md transition-colors disabled:opacity-60",
                    currentStep === 1 && "invisible" // Hide Previous on first step
                  )}
                >
                  Previous
                </button>

                {currentStep < 8 && (
                  <button
                    type='button'
                    onClick={nextStep}
                    disabled={isPending}
                    className='font-mono uppercase text-xs sm:text-sm tracking-wider py-2.5 px-6 bg-pink-dark text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-2 disabled:opacity-60'
                  >
                    Next
                  </button>
                )}
                {currentStep === 8 && (
                  <button
                    type='submit'
                    disabled={isPending}
                    className='w-full font-mono uppercase text-xs sm:text-sm tracking-wider py-2.5 px-6 bg-pink-dark text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-2 disabled:opacity-60 sm:w-auto'
                  >
                    {isPending ? "Submitting..." : "Submit RSVP"}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {!successMessage &&
          currentStep !== 8 &&
          currentStep !== 9 &&
          currentStep !== 10 && // Hide clear button if success message is shown or on Confirmation step or Can't Make It step
          currentStep !== 11 && ( // Hide clear button for decline confirmation step
            <div className='mt-6 text-center'>
              <button
                type='button'
                onClick={requestClearAll}
                disabled={isPending}
                className='text-sm text-gray-textlight hover:text-red-500 disabled:opacity-50'
              >
                Clear All and Restart
              </button>
            </div>
          )}

        <ConfirmationModal
          isOpen={isClearAllModalOpen}
          onClose={() => setIsClearAllModalOpen(false)}
          onConfirm={() => {
            performClearAll()
            setIsClearAllModalOpen(false)
          }}
          title='Clear Form Data?'
          message="Are you sure you want to clear all the information you've entered and restart the RSVP process? This action cannot be undone."
          confirmText='Yes, Clear All'
          cancelText='No, Keep Editing'
        />
      </form>
    </div>
  )
}

export default ActualRsvpForm
