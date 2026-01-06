"use client"
import { useState, useMemo, useEffect } from "react"
import WordleSquare from "./WordleSquare"
import Confetti from 'react-confetti'
import debounce from "debounce"
import HoverPreview from "./Option"

export default function CardGuesser(props) {
    const [guesses, setGuesses] = useState([])
    const [currentSearchResult, setCurrentSearchResult] = useState(null)
    const [inputValue, setInputValue] = useState("")

    
    const debouncedFetch = useMemo(
    () =>
        debounce((value) => {
        if (value.length == 0) 
        {
            setInputValue(value)
            setCurrentSearchResult(null)
            return
        }
        fetch(
            "https://api.scryfall.com/cards/search?q=" +
            encodeURIComponent(value + " game:paper" + " sort:edhrec")
        )
            .then(res => res.json())
            .then(json => setCurrentSearchResult(json.data.slice(0,6)))
            .then(console.log(currentSearchResult))
            .catch(console.error)
        }, 1000),
    []
    )

    function handleChange(value) {
        setInputValue(value)
        debouncedFetch(value)
    }

    useEffect(() => {
        return () => debouncedFetch.clear()
    }, [debouncedFetch])


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

    function getCardImageURLArray(card)
    {
        return card.layout === "normal" ? card.image_uris : card.card_faces[0].image_uris
    }

    

    return (
    <div className="flex h-full items-center flex-col justify-center">
        <div className="h-75 w-5xl overflow-auto grid place-items-center [scrollbar-width:none]">
            {guesses?.map((element, index) => {
                console.log(props.card.name)
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
                vals[0] = [compareArrayProperties(element.colors, props.card.colors), element.colors.length == 0 ? "Colorless" : element.colors]

                //cmc
                vals[1] = [(JSON.stringify(element.cmc) === JSON.stringify(props.card.cmc) ? greenBG : grayBG), element.cmc, props.card.cmc - element.cmc] 

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
                    vals[5] = [(element.power + "\\" + element.toughness === props.card.power + "\\" + props.card.toughness) ? greenBG : grayBG, (element.power + "\\" + element.toughness)]
                }else if (vals[2][1].includes("Artifact") || vals[2][1].includes("Land"))
                {
                    let text = element.produced_mana ? element.produced_mana : "None"
                    if (element.produced_mana)
                    {
                        vals[5] = [compareArrayProperties(element.produced_mana, props.card.produced_mana), "Produced Mana: " + text]
                    }
                    
                }
                else
                {
                    vals[5] = [grayBG, "No Wildcard for this type"]
                }
                
                
                
                
                
                return ( 
                    <div className="flex flex-row m-2 h-30" key={index}> 
                        <img src={getCardImageURLArray(element).small} className="hover:scale-300"></img>
                        {vals.map((e, i) => (
                            <WordleSquare difference={e.length > 2 ? e[2] : 0} key={i} bg={e[0]} text={e[1]}/>
                        ))}
                        <div>
                            {
                                guesses[guesses.length - 1].name == props.card.name && <Confetti
                                    width={window.width}
                                    height={window.height}
                                />
                            }
                            {
                                guesses[guesses.length - 1].name == props.card.name && <img
                                    src={getCardImageURLArray(props.card).normal}
                                    className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none select-none"
                                ></img>
                            }
                        </div>
                    </div> 
                )})}
        </div>
        <input
                id="field"
                className="bg-teal-50 h-2/5 h-15 p-3 text-3xl rounded-xl w-4xl"
                value={inputValue}
                onChange={e => handleChange(e.target.value)}
                placeholder="Guess..."
            />
        
        <div className="flex flex-wrap flex-row w-screen justify-center h-1/5">
        
            {currentSearchResult?.map((card, index) => 
            (
                <HoverPreview onClick={(e)=>setGuesses(prev => [...prev, card])} key={index} imgSrc={getCardImageURLArray(card).normal}>
                </HoverPreview>
            ))}
        </div>

    </div>
    )
}
