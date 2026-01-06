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

    function getCardImageURL(card)
    {
        return card.layout === "normal" ? card.image_uris.normal : card.card_faces[0].image_uris.normal
    }

    return (
    <div className="flex h-screen items-center flex-col justify-center">
        <div className="h-3/5 w-full flex flex-col items-center justify-end">
            {guesses?.map((element, index) => {
                console.log(props.card.name)
                //color, cost, type, rarity, subtype, wildcard (type based info)
                let vals = [false, false, false, false, false, false]

                vals[0] = [(JSON.stringify(element.colors) === JSON.stringify(props.card.colors)), element.colors.length == 0 ? "Colorless" : element.colors]
                vals[1] = [(JSON.stringify(element.cmc) === JSON.stringify(props.card.cmc)), element.cmc, props.card.cmc - element.cmc] 
                vals[2] = [(element.type_line.split("—")[0].trim() == props.card.type_line.split("—")[0].trim()), element.type_line.split("—")[0]] 
                vals[3] = [(JSON.stringify(element.rarity) === JSON.stringify(props.card.rarity)), element.rarity, compareRarity(element.rarity, props.card.rarity)]
                vals[4] = [(element.type_line.split("—")[1] == props.card.type_line.split("—")[1]), element.type_line.split("—")[1] ? element.type_line.split("—")[1] : "No Subtype" ] 
                
                if (vals[2][0]) //correct type guessed, activate wildcard
                {
                    if (vals[2][1].includes("Land"))
                    {
                        vals[5] = [(JSON.stringify(element.produced_mana) === JSON.stringify(props.card.produced_mana)), "Produced Mana: " + element.produced_mana]
                    }else if (vals[2][1].includes("Creature"))
                    {
                        vals[5] = [(element.power + "\\" + element.toughness === props.card.power + "\\" + props.card.toughness), (element.power + "\\" + element.toughness)]
                    }else
                    {
                        vals[5] = [false, "No Wildcard"]
                    }
                }else
                {
                    vals[5] = [false, "Incorrect Type"]
                }
                
                
                
                
                return ( 
                    <div className="flex flex-row m-2 h-30" key={index}> 
                        <img src={element.image_uris.small} className="hover:scale-300"></img>
                        {vals.map((e, i) => (
                            <WordleSquare difference={e.length > 2 ? e[2] : 0} key={i} correct={e[0]} text={e[1]}/>
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
                                    src={getCardImageURL(props.card)}
                                    className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none select-none"
                                ></img>
                            }
                        </div>
                    </div> 
                )})}
            <input
                id="field"
                className="bg-teal-50 size-full h-15 p-3 text-3xl rounded-xl w-4xl"
                value={inputValue}
                onChange={e => handleChange(e.target.value)}
                placeholder="Guess..."
            />
        </div>
        
        <div className="flex flex-wrap flex-row w-screen justify-center h-2/5">
        
            {currentSearchResult?.map((card, index) => 
            (
                <HoverPreview onClick={(e)=>setGuesses(prev => [...prev, card])} key={index} imgSrc={getCardImageURL(card)}>
                </HoverPreview>
            ))}
        </div>

    </div>
    )
}
