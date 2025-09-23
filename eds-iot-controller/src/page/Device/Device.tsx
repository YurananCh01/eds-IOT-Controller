// DashboardAdmin.tsx
import { useState } from "react";
import AEDModal from "../../component/Device/AEDModal";
import TimerTable from "../../component/Device/TimerTable";
import "./Device.css";

type Option = {
  label: string;
  value: string;
};

export default function DashboardAdmin() {

  const options: Option[] = [
    { label: 'Siam Discovery', value: 'option1' },
    { label: 'Siam Paragon', value: 'option2' },
    { label: 'Siam Square', value: 'option3' },
  ];


  const [selectedOption, setSelectedOption] = useState<string>(options[0].value);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };



  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="selector-container">
            <select id="dropdown" value={selectedOption} onChange={handleChange}>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
        </div>
              <AEDModal/>
       
       
      </div>
      
        <TimerTable/>


    </>
  );
}
