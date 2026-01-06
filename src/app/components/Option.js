"use client"

export default function HoverPreview({ children, imgSrc, onClick }) {

  return (
    <button onClick={onClick} className="flex flex-col border align-middle border-indigo-600 text-xl m-2 p-3 bg-violet-50 hover:bg-violet-200 hover:scale-105 rounded-sm w-60 h-fit"
    >

      {(
        <img
          src={imgSrc}
          className="h-70"
        />
      )}
      {children}
      
    </button>
  )
}