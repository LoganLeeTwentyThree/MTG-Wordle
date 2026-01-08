"use client"

export default function Result( props ) {

  return (
    <div className="bg-white p-5 w-70 rounded-xl">
        <img src={props.src} className="aspect-5/7"></img>
        <div className="flex flex-col items-center justify-center">
            <div>{props.children}</div>
            <div className="bg-gray-300 hover:scale-105 rounded-xl p-3 m-2" onClick={() => window.location.reload()}>Go Again?</div>
        </div>
    </div>
  )
}