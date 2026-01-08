import { React }  from 'react';
import Cards from './api/cards.json'
import CardGuesser from './components/CardGuesser';


export default function Home() {


  let id = Math.round(Math.random() * 355)

  return (
    
    <CardGuesser card={Cards.data[id]}/>
    
  );
}
