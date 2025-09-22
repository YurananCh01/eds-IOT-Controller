// Card.tsx
import React from 'react';
import "./Card.css";
type CardProps = {
  title: string;
  value: number;
  
};

const Card: React.FC<CardProps> = ({ title, value }) => {
  return (
    <div className='cards'>
 
        <p className='title'>{title}</p>
        <h1 className='value'>{value}</h1>
  
    
    </div>

  );
};

export default Card;


