"use client"

export default function WordleSquare(props) {
  const base =
    "aspect-square m-2 p-1 flex flex-col items-center justify-center text-center hover:scale-105 rounded-sm"

  const bg = props.correct ? "bg-green-200" : "bg-gray-200"

  return (
    <div className={`${base} ${bg}`}>
      {props.text}
      {props.difference > 0 && <div>^</div>}
      {props.difference < 0 && <div>v</div>}
    </div>
  )
}