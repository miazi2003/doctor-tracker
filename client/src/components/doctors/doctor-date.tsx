const doctorDateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

export function DoctorDate({ value }: { value: string }) {
  return (
    <time dateTime={value}>
      {doctorDateFormatter.format(new Date(value))}
    </time>
  )
}
