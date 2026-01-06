"use client"

export default function HoverPreview({ children, imgSrc, onClick }) {

  return (
    <button onClick={onClick} className="flex flex-col border align-middle border-indigo-600 text-xl m-2 p-3 bg-violet-50 hover:bg-violet-200 hover:scale-105 rounded-sm w-40"
    >

      {(
        <img
          src={imgSrc}
          className="aspect-5/7"
        />
      )}
      {children}
      
    </button>
  )
}