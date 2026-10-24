/**
 * The message catalogue.
 *
 * Every user-facing string lives here so that adding Malayalam, Tamil, Hindi, Kannada or
 * Telugu is a data task rather than a refactor (§37, docs/02 TD-9). The dictionary is a
 * plain typed object, which means a missing or misspelt key is a compile error rather
 * than a blank label discovered in production.
 */
export const en = {
  common: {
    back: 'Back',
    next: 'Next',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    close: 'Close',
    retry: 'Try again',
    contactClinic: 'Contact clinic',
    loading: 'Loading',
    viewAll: 'View all',
    today: 'Today',
    tomorrow: 'Tomorrow',
    signOut: 'Sign out',
  },
  nav: {
    home: 'Home',
    appointments: 'Appointments',
    records: 'Records',
    messages: 'Messages',
    profile: 'Profile',
  },
  home: {
    nextAppointment: 'Next appointment',
    noAppointmentTitle: 'Nothing scheduled yet',
    noAppointmentBody: 'Book your next consultation and it will appear here.',
    healthToday: 'Your health today',
    quickActions: 'Quick actions',
    careJourney: 'Your care journey',
    clinicUpdates: 'Clinic updates',
    viewAppointment: 'View appointment',
    getDirections: 'Get directions',
  },
  booking: {
    title: 'Book an appointment',
    chooseSpeciality: 'What do you need help with?',
    chooseDoctor: 'Choose a doctor',
    chooseDate: 'Pick a date',
    chooseTime: 'Pick a time',
    chooseType: 'How would you like to consult?',
    choosePatient: 'Who is this appointment for?',
    review: 'Review and confirm',
    confirmed: 'Appointment confirmed',
    noSlots: 'No slots available on this day',
    noSlotsBody: 'Try another date, or choose a different doctor.',
  },
  errors: {
    genericTitle: 'Something went wrong',
    appointmentsLoad: "We couldn't load your appointments.",
    recordsLoad: "We couldn't load your records.",
    homeLoad: "We couldn't load your home screen.",
  },
  emergency: {
    title: 'Emergency',
    subtitle: 'If this is a medical emergency, call now.',
    callAmbulance: 'Call emergency services',
    callClinic: 'Call the clinic',
    directions: 'Get directions',
    shareLocation: 'Share my location',
  },
  safety: {
    outOfRange:
      'This result is outside the displayed reference range. Please discuss it with your healthcare professional.',
    notADiagnosis: 'This is not a diagnosis.',
  },
} as const

export type Messages = typeof en
