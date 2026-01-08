"use client"
import { useState, useRef, useEffect } from "react"
import WordleSquare from "./WordleSquare"
import Confetti from 'react-confetti'
import HoverPreview from "./Option"
import Result from "./Result"
import CountdownTimer from "./Timer"

export default function CardGuesser(props) {
    const [guesses, setGuesses] = useState([])
    const [currentSearchResult, setCurrentSearchResult] = useState(null)
    const [inputValue, setInputValue] = useState("")
    const [gaveUp, setGaveUp] = useState(false)
    const [difficulty, setDifficulty] = useState("")
    const listRef = useRef(null)
    const isFirstRender = useRef(true);

    
    useEffect(() =>{
        if (isFirstRender.current) {
            isFirstRender.current = false; 
            return; 
        }
        if (inputValue.length == 0) 
        {
            setCurrentSearchResult(null)
            return
        }


        fetch(
            "https://api.scryfall.com/cards/search?q=" +
            encodeURIComponent(inputValue + " game:paper" + " sort:edhrec")
        )
            .then(res => res.json())
            .then(json => {
                let result = json.data.filter((element) => {
                    //filter out already guessed cards
                   return guesses.every((e) => !(getCardProperty(e, "name") === getCardProperty(element, "name")))
                })
                setCurrentSearchResult(result.slice(0,6))
            })
            .catch(console.error)
      
        },[inputValue]
    )

    useEffect(()=> {
        listRef?.current?.lastElementChild?.scrollIntoView()
    }, [currentSearchResult])

    function compareRarity(a, b)
    {
        let rarities = {
            "common": 1,
            "uncommon" : 2,
            "rare" : 3,
            "mythic" : 4
        }
        return rarities[b] - rarities[a] 

    }

    //dfcs are evil...
    function getCardProperty(card, property)
    {
        if(Object.hasOwn(card, property))
        {
            return card[property]
        }else
        {
            if (Object.hasOwn(card, "card_faces"))
            {
                return card.card_faces[0][property]
            }
        }
     
    }

    //difficulty select
    if(difficulty.length == 0)
    {
        return (<div className="absolute flex top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white h-fit p-5 w-70 rounded-xl items-center flex-col justify-center">
            <div className="text-4xl">MTG Wordle</div>
            <div className="text-center">Try to guess the highly played commander card.</div>
            <div className="">Select Difficulty!</div>
            <button onClick={()=>setDifficulty("Normal")} className="bg-gray-300 hover:scale-105 rounded-xl p-3 m-2 w-50">Normal: No Timer</button>
            <button onClick={()=>setDifficulty("Hard")} className="bg-gray-300 hover:scale-105 rounded-xl p-3 m-2 w-50">Hard: 5 Minute Timer</button>
            <button onClick={()=>setDifficulty("SuperHard")} className="bg-gray-300 hover:scale-105 rounded-xl p-3 m-2 w-50">Super Hard: 1 Minute Timer</button>
        </div>)
    }
    else if (guesses[guesses.length - 1]?.name == props.card?.name)
    {//if solved
        return ( 
            <div className="flex h-dvh items-center flex-col justify-center">
                <Confetti
                width={window.width}
                height={window.height}
                />
                <Result src={getCardProperty(props.card, "image_uris").normal} >
                    <div className="text-center">You guessed the card in {guesses.length} attempt{guesses.length != 1 ? "s" : ""}!</div>
                    {guesses.map((e, i)=> (
                        <div className="text-center bg-gray-200 m-2 w-50 rounded-xl" key={i}>{e.name}</div>
                    ))}
                </Result>
            </div>
            
        )
    }else if (gaveUp)
    {
        return ( 
            <div className="flex h-dvh items-center flex-col justify-center">
                <Result src={getCardProperty(props.card, "image_uris").normal} >
                    <div>You gave up in {guesses.length} attempt{guesses.length != 1 ? "s" : ""}...</div>
                    {guesses.map((e, i)=> (
                        <div className="text-center bg-gray-200 m-2 w-50 rounded-xl" key={i}>{e.name}</div>
                    ))}
                </Result>
            </div>
            
        )
    }
    else
    {//game 
        return (
        <div className="flex items-center flex-col justify-center">
            {difficulty === "Hard" && <CountdownTimer style="bg-gray-300 text-center hover:scale-105 rounded-xl p-3 m-2 w-50" initialSeconds={300} onComplete={(secs) => setGaveUp(true)}/>}
            {difficulty === "SuperHard" && <CountdownTimer style="bg-gray-300 text-center hover:scale-105 rounded-xl p-3 m-2 w-50" initialSeconds={60} onComplete={(secs) => setGaveUp(true)}/>}
            <div ref={listRef} className="h-130 w-screen overflow-auto grid place-items-center [scrollbar-width:none]">
                {guesses?.map((element, index) => {
                    //color, cost, type, rarity, subtype, wildcard (type based info)
                    let vals = [false, false, false, false, false, false]
                    const greenBG = "bg-green-200"
                    const yellowBG = "bg-yellow-200"
                    const grayBG = "bg-gray-200"

                    function compareArrayProperties(a, b)
                    {
                        if (JSON.stringify(a) === JSON.stringify(b))
                        {
                            return greenBG
                        }else
                        {
                            let partialMatch = (a?.some(element => {
                                if (b?.includes(element))
                                {
                                    return true
                                }
                                return false
                            }))

                            if (partialMatch)
                            {
                                return yellowBG
                            }else
                            {
                                return grayBG
                            }
                            
                        }
                    }

                    function compareStringProperties(a, b)
                    {
                        if ( a === b)
                        {
                            return greenBG
                        }else
                        {   
                            // have to split in case that the guessed card has more types than the actual
                            let partialMatch = a?.split(" ").some((e) => {
                                if (b?.includes(e))
                                {
                                    return true
                                }
                                return false
                            })

                            if (partialMatch)
                            {
                                return yellowBG
                            }else
                            {
                                return grayBG
                            }
                            
                        }
                    }

                    //color
                    let ecolor = getCardProperty(element, "colors")
                    vals[0] = [compareArrayProperties(ecolor, getCardProperty(props.card, "colors")), ecolor.length == 0 ? "Colorless" : ecolor]

                    //cmc
                    let ecmc = getCardProperty(element, "cmc")
                    let pcmc = getCardProperty(props.card, "cmc")
                    vals[1] = [(JSON.stringify(ecmc) === JSON.stringify(pcmc) ? greenBG : grayBG), ecmc, pcmc - ecmc] 

                    //type
                    let etype = element.type_line.split("—")[0].trim()
                    let ptype = props.card.type_line.split("—")[0].trim()

                    vals[2] = [compareStringProperties(etype, ptype), etype]

                    //rarity
                    vals[3] = [(JSON.stringify(element.rarity) === JSON.stringify(props.card.rarity) ? greenBG : grayBG), element.rarity, compareRarity(element.rarity, props.card.rarity)]
                    
                    //subtype
                    let estype = element.type_line.split("—")[1]?.trim()
                    let pstype = props.card.type_line.split("—")[1]?.trim()

                    vals[4] = [compareStringProperties(estype, pstype), estype ? estype : "No Subtype"]
                    
                    if (vals[2][1].includes("Creature"))
                    {
                        vals[5] = [(element.power + "/" + element.toughness === props.card.power + "/" + props.card.toughness) ? greenBG : grayBG, (element.power + "/" + element.toughness)]
                    }else if (vals[2][1].includes("Artifact") || vals[2][1].includes("Land"))
                    {
                        if (Object.hasOwn(element, "produced_mana"))
                        {
                            vals[5] = [compareArrayProperties(element.produced_mana, props.card.produced_mana), "Produced Mana: " + element.produced_mana]
                        }else
                        {
                            vals[5] = [compareArrayProperties(element.produced_mana, props.card.produced_mana), "Does not produce mana"]
                        }
                        
                    }
                    else
                    {
                        vals[5] = [grayBG, "No Wildcard for this type"]
                    }
                    
                    
                    
                    
                    
                    return ( 
                        <div className="flex flex-row m-2 h-30" key={index}> 
                            <img src={getCardProperty(element, "image_uris").small} className="hover:scale-300"></img>
                            {vals.map((e, i) => (
                                <WordleSquare difference={e.length > 2 ? e[2] : 0} key={i} bg={e[0]} text={e[1]}/>
                            ))}
                        </div> 
                    )})}
            </div>
            <input
                id="field"
                className="bg-teal-50 h-2/5 h-15 p-3 xs:text-xl 2xl:text-2xl rounded-xl xs:w-2/3 w-1/2"
                onKeyDown={e => { if (e.key === "Enter") setInputValue(e.target.value)}}
                placeholder="Guess Any Magic Card..."
            />
            
            <div className="flex flex-wrap flex-row w-screen justify-center h-1/5">
            
                {inputValue.length > 0 && currentSearchResult?.length > 0 && currentSearchResult?.map((card, index) => 
                    (
                        <HoverPreview onClick={(e)=> {
                                setGuesses(prev => [...prev, card])
                                setCurrentSearchResult([])
                                setInputValue("")
                            }} 
                            key={index} 
                            imgSrc={getCardProperty(card, "image_uris").normal}>
                        </HoverPreview>
                    ))
                } 
            </div>

            <button onClick={() => setGaveUp(true)} className="fixed xs:bottom-5 xs:right-5 bottom-10 right-10 bg-white p-2 rounded-xl hover:scale-105 hover:bg-gray-400">Give Up :(</button>
        </div>
        )
    }
}
